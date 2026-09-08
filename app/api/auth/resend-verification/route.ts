import { sendEmailVerification } from "@/lib/email";
import { generateToken, hashToken } from "@/lib/token";
import { db } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { email } = body;

  //   Validate the email
  if (!email || typeof email !== "string") {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid or missing email",
      },
      { status: 400 },
    );
  }

  const user = await db.orm.public.User.first({ email });

  //   Check if the user exists
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "User not found",
      },
      { status: 404 },
    );
  }

  //   Check if the user's email is already verified
  if (user.isVerified) {
    return NextResponse.json(
      {
        success: false,
        message: "Email is already verified",
      },
      { status: 400 },
    );
  }

  const verificationToken = generateToken();

  const tokenHash = hashToken(verificationToken);

  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes from now

  //   delete any existing verification tokens for the user
  await db.orm.public.EmailVerificationToken.where({
    userId: user.id,
  }).delete();

  //   create a new verification token for the user
  await db.orm.public.EmailVerificationToken.create({
    tokenHash,
    userId: user.id,
    expiresAt,
  });

  //   Send the verification email
  try {
    await sendEmailVerification(user.email, user.name, verificationToken);
  } catch (error) {
    console.error("Error sending verification email:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send verification email",
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: "Verification email resent successfully",
    },
    { status: 200 },
  );
}
