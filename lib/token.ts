import crypto from "crypto";

// Generate a random token
export function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Hash a token using SHA-256
export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
