import { sql } from "@/lib/db";
import type { User } from "@/lib/auth-context";
import { generateSessionToken, SESSION_DURATION } from "@/auth/utils";

export async function createUser(
  username: string,
  email: string,
  passwordHash: string,
  salt: string,
  country_code?: string,
): Promise<User> {
  const [user] = (await sql`
    INSERT INTO users (username, email, password_hash, salt, country_code)
    VALUES (${username}, ${email}, ${passwordHash}, ${salt}, ${country_code || null})
    RETURNING id, username, country_code
  `) as [User];

  return user;
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const [user] = (await sql`
    SELECT id, username, country_code
    FROM users
    WHERE username = ${username}
  `) as [User?];

  return user || null;
}

export async function findUserWithPassword(
  username: string,
): Promise<{ user: User; passwordHash: string; salt: string } | null> {
  const [result] = await sql`
    SELECT id, username, country_code, password_hash, salt
    FROM users
    WHERE username = ${username}
  `;

  if (!result) return null;

  return {
    user: { id: result.id, username: result.username, country_code: result.country_code },
    passwordHash: result.password_hash,
    salt: result.salt,
  };
}

export async function createSession(userId: number): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await sql`
    INSERT INTO user_sessions (token, user_id, expires_at, last_used_at)
    VALUES (${token}, ${userId}, ${expiresAt}, NOW())
  `;

  return token;
}

export async function findSessionUser(token: string): Promise<User | null> {
  const [result] = (await sql`
    SELECT u.id, u.username, u.country_code
    FROM user_sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `) as [User?];

  if (result) {
    // Update last used
    await sql`
      UPDATE user_sessions
      SET last_used_at = NOW()
      WHERE token = ${token}
    `;
  }

  return result || null;
}

export async function deleteSession(token: string): Promise<void> {
  await sql`DELETE FROM user_sessions WHERE token = ${token}`;
}
