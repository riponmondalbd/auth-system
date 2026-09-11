import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

// Hashes a password using bcrypt with a specified number of salt rounds.
export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Compares a plaintext password with a hashed password to check if they match.
export async function comparePassword(
  password: string,
  hashedPassword: string,
) {
  return bcrypt.compare(password, hashedPassword);
}
