import { AuthTokenPayload } from "@/types/auth";
import jwt, { type SignOptions } from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

const ACCESS_TOKEN_EXPIRES_IN = process.env
  .ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"];
const REFRESH_TOKEN_EXPIRES_IN = process.env
  .REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"];

//   Generate a JWT access token
export function generateAccessToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

// Verify a JWT access token
export function verifyAccessToken(token: string): AuthTokenPayload {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as AuthTokenPayload;
}

//  Generate a JWT refresh token
export function generateRefreshToken(payload: AuthTokenPayload) {
  return jwt.sign(
    { ...payload, jti: crypto.randomUUID() },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    },
  );
}

// Verify a JWT refresh token
export function verifyRefreshToken(token: string): AuthTokenPayload {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as AuthTokenPayload;
}
