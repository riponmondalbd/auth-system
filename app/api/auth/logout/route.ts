import { clearAuthCookies } from "@/lib/cookie";
import { hashToken } from "@/lib/token";
import { db } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const response = NextResponse.json(
    {
      success: true,
      message: "Logged out successfully",
    },
    { status: 200 },
  );

  if (!refreshToken) {
    clearAuthCookies(response);
    return response;
  }

  const tokenHash = hashToken(refreshToken);

  const storedToken = await db.orm.public.RefreshToken.first({ tokenHash });

  if (storedToken && !storedToken.revoked) {
    await db.orm.public.RefreshToken.where({ id: storedToken.id }).update({
      revoked: true,
    });
  }

  clearAuthCookies(response);
  return response;
}
