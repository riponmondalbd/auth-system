import { setAuthCookies } from "@/lib/cookie";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@/lib/jwt";
import { hashToken } from "@/lib/token";
import { db } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // Check if the refresh token is present in the request cookies
  if (!refreshToken) {
    return NextResponse.json(
      {
        success: false,
        message: "Refresh token not found",
      },
      { status: 401 },
    );
  }

  // Verify the refresh token and extract the payload
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid refresh token",
      },
      { status: 401 },
    );
  }

  // Check if the refresh token exists in the database and is not revoked or expired
  const tokenHash = hashToken(refreshToken);

  const storedToken = await db.orm.public.RefreshToken.first({
    tokenHash,
  });

  // If the stored token is not found, revoked, or expired, return an error response
  if (!storedToken) {
    return NextResponse.json(
      {
        success: false,
        message: "Refresh token not found in database",
      },
      { status: 401 },
    );
  }

  // Check if the stored token is revoked or expired
  if (storedToken.revoked) {
    return NextResponse.json(
      {
        success: false,
        message: "Refresh token has been revoked",
      },
      { status: 401 },
    );
  }

  // Check if the stored token is expired
  if (new Date(storedToken.expiresAt) < new Date()) {
    return NextResponse.json(
      {
        success: false,
        message: "Refresh token has expired",
      },
      { status: 401 },
    );
  }

  // Generate a new access token and refresh token
  const accessToken = generateAccessToken({
    userId: payload.userId,
    role: payload.role,
  });

  // Generate a new refresh token and store it in the database, while revoking the old one
  const newRefreshToken = generateRefreshToken({
    userId: payload.userId,
    role: payload.role,
  });

  // Hash the new refresh token and set its expiration date
  const newRefreshTokenHash = hashToken(newRefreshToken);

  // Set the new refresh token's expiration date to 7 days from now
  const newRefreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Use a transaction to revoke the old refresh
  await db.transaction(async (tx) => {
    await tx.orm.public.RefreshToken.where({ id: storedToken.id }).update({
      revoked: true,
    });

    // Create a new refresh token record in the database with the new hash and expiration date
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
  return response;
}
