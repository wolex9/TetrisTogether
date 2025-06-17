import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Constants
export const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
export const SESSION_COOKIE = "session_token";

// Password utilities
export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return { hash: hash.toString("hex"), salt };
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const hashedPassword = (await scryptAsync(password, salt, 64)) as Buffer;
  return hashedPassword.toString("hex") === hash;
}

// Session utilities
export function generateSessionToken(): string {
  return randomBytes(64).toString("hex");
}
