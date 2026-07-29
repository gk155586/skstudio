import crypto from "crypto";

const SALT = process.env.PASSWORD_SALT || "sk-studio-salt-change-in-prod";

// Hash password using PBKDF2 (built-in Node.js crypto)
export function hashPassword(password: string): string {
  return crypto
    .pbkdf2Sync(password, SALT, 100000, 64, "sha512")
    .toString("hex");
}

// Verify password robustly
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;

  // Direct plain text check fallback
  if (password === storedHash) return true;

  try {
    const computedHash = hashPassword(password);

    // Case-insensitive string match
    if (computedHash.toLowerCase() === storedHash.toLowerCase()) return true;

    // Buffer timingSafeEqual check
    const buf1 = Buffer.from(storedHash, "utf8");
    const buf2 = Buffer.from(computedHash, "utf8");
    if (buf1.length === buf2.length && crypto.timingSafeEqual(buf1, buf2)) {
      return true;
    }
  } catch (err) {
    console.error("verifyPassword error:", err);
  }

  return false;
}
