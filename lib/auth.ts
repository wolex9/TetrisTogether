"use server";

import { cookies } from "next/headers";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import { sql } from "@/lib/db";
import type { User } from "@/lib/auth-types";

const scryptAsync = promisify(scrypt);

export interface Session {
  token: string;
  userId: number;
  expiresAt: Date;
}

// Constants
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_COOKIE = "session_token";

// Password utilities
async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return { hash: hash.toString("hex"), salt };
}

async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const hashedPassword = (await scryptAsync(password, salt, 64)) as Buffer;
  return hashedPassword.toString("hex") === hash;
}

// Database operations
async function createUser(username: string, email: string, password: string): Promise<User> {
  const { hash, salt } = await hashPassword(password);

  const [user] = (await sql`
    INSERT INTO users (username, email, password_hash, salt)
    VALUES (${username}, ${email}, ${hash}, ${salt})
    RETURNING id, username, email
  `) as [User];

  return user;
}

async function findUserByUsername(username: string): Promise<User | null> {
  const [user] = (await sql`
    SELECT id, username, email
    FROM users
    WHERE username = ${username}
  `) as [User?];

  return user || null;
}

async function findUserWithPassword(
  username: string,
): Promise<{ user: User; passwordHash: string; salt: string } | null> {
  const [result] = await sql`
    SELECT id, username, email, password_hash, salt
    FROM users
    WHERE username = ${username}
  `;

  if (!result) return null;

  return {
    user: { id: result.id, username: result.username, email: result.email },
    passwordHash: result.password_hash,
    salt: result.salt,
  };
}

async function createSession(userId: number): Promise<string> {
  const token = randomBytes(64).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await sql`
    INSERT INTO user_sessions (token, user_id, expires_at, last_used_at)
    VALUES (${token}, ${userId}, ${expiresAt}, NOW())
  `;

  return token;
}

async function findSessionUser(token: string): Promise<User | null> {
  const [result] = (await sql`
    SELECT u.id, u.username, u.email
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

async function deleteSession(token: string): Promise<void> {
  await sql`DELETE FROM user_sessions WHERE token = ${token}`;
}

// Public API
export async function checkUserExists(username: string): Promise<boolean> {
  const user = await findUserByUsername(username);
  return !!user;
}

export async function loginUser(username: string, password: string): Promise<{ success: boolean; user?: User }> {
  const result = await findUserWithPassword(username);

  if (!result) {
    return { success: false };
  }

  const isValid = await verifyPassword(password, result.passwordHash, result.salt);
  if (!isValid) {
    return { success: false };
  }

  const sessionToken = await createSession(result.user.id);

  // Set session cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
  });

  return { success: true, user: result.user };
}

export async function registerUser(
  username: string,
  email: string,
  password: string,
): Promise<{ success: boolean; user?: User }> {
  try {
    const user = await createUser(username, email, password);
    const sessionToken = await createSession(user.id);

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION / 1000,
    });

    return { success: true, user };
  } catch (error: unknown) {
    // Handle unique constraint violations
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      return { success: false };
    }
    throw error;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionToken) {
    return null;
  }

  return findSessionUser(sessionToken);
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionToken) {
    await deleteSession(sessionToken);
    cookieStore.delete(SESSION_COOKIE);
  }
}
