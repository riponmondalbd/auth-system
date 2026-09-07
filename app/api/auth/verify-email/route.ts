import { hashToken } from "@/lib/token";
import { db } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { token } = body;

  if (!token || typeof token !== "string") {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid or missing token",
      },
      { status: 400 },
    );
  }

  const tokenHash = hashToken(token);

  const verificationToken = await db.orm.public.EmailVerificationToken.first({
    tokenHash,
  });

  if (!verificationToken) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid or expired token",
      },
      { status: 400 },
    );
  }

  // Check if the token has expired
  if (new Date(verificationToken.expiresAt) < new Date()) {
    return NextResponse.json(
      {
        success: false,
        message: "Token has expired",
      },
      { status: 400 },
    );
  }

  //   Update the user's isVerified field to true
  await db.orm.public.User.where({ id: verificationToken.userId }).update({
    isVerified: true,
  });

  //   Delete the used verification token from the database
  await db.orm.public.EmailVerificationToken.where({
    id: verificationToken.id,
  }).delete();

  return NextResponse.json(
    {
      success: true,
      message: "Email verified successfully",
    },
    { status: 200 },
  );
}
