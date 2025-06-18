"use server";

import { cookies } from "next/headers";
import type { User } from "@/lib/auth-context";
import { hashPassword, verifyPassword, SESSION_COOKIE, SESSION_DURATION } from "@/auth/utils";
import {
  findUserByUsername,
  findUserWithPassword,
  createUser,
  createSession,
  findSessionUser,
  deleteSession,
} from "@/auth/queries";

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
  country_code?: string,
): Promise<{ success: boolean; user?: User }> {
  try {
    const { hash, salt } = await hashPassword(password);

    const user = await createUser(username, email, hash, salt, country_code);
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
