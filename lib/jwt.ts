import { AuthTokenPayload } from "@/types/auth";
import jwt, { type SignOptions } from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

const ACCESS_TOKEN_EXPIRES_IN = process.env
  .ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"];
const REFRESH_TOKEN_EXPIRES_IN = process.env
  .REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"];

export function generateAccessToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as AuthTokenPayload;
}
