import crypto from "crypto";

const SALT = process.env.PASSWORD_SALT || "sk-studio-salt-change-in-prod";

// Hash password using PBKDF2 (built-in Node.js crypto)
export function hashPassword(password: string): string {
  return crypto
    .pbkdf2Sync(password, SALT, 100000, 64, "sha512")
    .toString("hex");
}

// Verify password
export function verifyPassword(password: string, hash: string): boolean {
  const computedHash = hashPassword(password);
  // Constant time comparison to prevent timing attacks
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash));
}
