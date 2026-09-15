import { setAuthCookies } from "@/lib/cookie";
import { generateAccessToken, verifyAccessToken } from "@/lib/jwt";
import { hashToken } from "@/lib/token";
import { db } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      {
        success: false,
        message: "Refresh token not found",
      },
      { status: 401 },
    );
  }

  let payload;

  try {
    payload = verifyAccessToken(refreshToken);
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid refresh token",
      },
      { status: 401 },
    );
  }

  const tokenHash = hashToken(refreshToken);

  const storedToken = await db.orm.public.RefreshToken.first({
    tokenHash,
  });

  if (!storedToken) {
    return NextResponse.json(
      {
        success: false,
        message: "Refresh token not found in database",
      },
      { status: 401 },
    );
  }

  if (storedToken.revoked) {
    return NextResponse.json(
      {
        success: false,
        message: "Refresh token has been revoked",
      },
      { status: 401 },
    );
  }

  if (new Date(storedToken.expiresAt) < new Date()) {
    return NextResponse.json(
      {
        success: false,
        message: "Refresh token has expired",
      },
      { status: 401 },
    );
  }

  const accessToken = generateAccessToken({
    userId: payload.userId,
    role: payload.role,
  });

  const newRefreshToken = generateAccessToken({
    userId: payload.userId,
    role: payload.role,
  });

  const newRefreshTokenHash = hashToken(newRefreshToken);

  const newRefreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.transaction(async (tx) => {
    await tx.orm.public.RefreshToken.where({ id: storedToken.id }).update({
      revoked: true,
    });

    await tx.orm.public.RefreshToken.create({
      tokenHash: newRefreshTokenHash,
      userId: Number(payload.userId),
      expiresAt: newRefreshTokenExpiry.toISOString(),
    });
  });

  const response = NextResponse.json(
    {
      success: true,
      message: "Access token refreshed successfully",
    },
    { status: 200 },
  );

  setAuthCookies(response, accessToken, newRefreshToken);
}
