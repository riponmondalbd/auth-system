import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { comparePassword } from "@/lib/password";
import { hashToken } from "@/lib/token";
import { db } from "@/prisma/db";
import { loginSchema } from "@/validations/auth.schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const result = loginSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { email, password } = result.data;

  const user = await db.orm.public.User.first({ email });

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid email or password",
      },
      { status: 401 },
    );
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid email or password",
      },
      { status: 401 },
    );
  }

  if (!user.isVerified) {
    return NextResponse.json(
      {
        success: false,
        message: "Please verify your email before logging in",
      },
      { status: 403 },
    );
  }

  const accessToken = generateAccessToken({
    userId: String(user.id),
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: String(user.id),
    role: user.role,
  });

  const refreshTokenHash = hashToken(refreshToken);

  const refreshTokenExpiry = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  ).toISOString(); // 7 days from now

  await db.orm.public.RefreshToken.create({
    tokenHash: refreshTokenHash,
    userId: user.id,
    expiresAt: refreshTokenExpiry,
  });
}
