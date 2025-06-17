"use server";

import { cookies } from "next/headers";

// In-memory store for users (this would be a database in production)
const users = new Map<string, { email: string; password: string }>();

// Session store (this would be Redis or a database in production)
const sessions = new Map<string, { username: string; email?: string; expires: number }>();

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function checkUserExists(username: string): Promise<boolean> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return users.has(username);
}

export async function loginUser(
  username: string,
  password: string,
): Promise<{ success: boolean; sessionId?: string; user?: { username: string; email: string } }> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const user = users.get(username);

  if (!user || user.password !== password) {
    return { success: false };
  }

  // Create session
  const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const sessionData = {
    username,
    email: user.email,
    expires: Date.now() + SESSION_DURATION,
  };

  sessions.set(sessionId, sessionData);

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set("auth-session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
  });

  return {
    success: true,
    sessionId,
    user: { username, email: user.email },
  };
}

export async function registerUser(
  username: string,
  email: string,
  password: string,
): Promise<{ success: boolean; sessionId?: string; user?: { username: string; email: string } }> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (users.has(username)) {
    return { success: false }; // User already exists
  }

  // Store user
  users.set(username, { email, password });

  // Create session
  const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const sessionData = {
    username,
    email,
    expires: Date.now() + SESSION_DURATION,
  };

  sessions.set(sessionId, sessionData);

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set("auth-session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
  });

  return {
    success: true,
    sessionId,
    user: { username, email },
  };
}

export async function createAnonymousSession(
  username: string,
): Promise<{ sessionId: string; user: { username: string } }> {
  // Create session without email
  const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const sessionData = {
    username,
    expires: Date.now() + SESSION_DURATION,
  };

  sessions.set(sessionId, sessionData);

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set("auth-session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
  });

  return {
    sessionId,
    user: { username },
  };
}

export async function getCurrentUser(): Promise<{ username: string; email?: string } | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("auth-session")?.value;

  if (!sessionId) {
    return null;
  }

  const session = sessions.get(sessionId);

  if (!session || session.expires < Date.now()) {
    // Session expired, clean up
    if (session) {
      sessions.delete(sessionId);
    }
    cookieStore.delete("auth-session");
    return null;
  }

  return {
    username: session.username,
    email: session.email,
  };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("auth-session")?.value;

  if (sessionId) {
    sessions.delete(sessionId);
    cookieStore.delete("auth-session");
  }
}
