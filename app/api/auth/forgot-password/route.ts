import { sendPasswordResetEmail } from "@/lib/email";
import { generateToken, hashToken } from "@/lib/token";
import { db } from "@/prisma/db";
import { forgotPasswordSchema } from "@/validations/auth.schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email } = result.data;

    const user = await db.orm.public.User.first({ email });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    const resetToken = generateToken();

    const tokenHash = hashToken(resetToken);

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes from now

    await db.orm.public.PasswordResetToken.where({
      userId: user.id,
    }).delete();

    await db.orm.public.PasswordResetToken.create({
      tokenHash,
      userId: user.id,
      expiresAt,
    });

    try {
      await sendPasswordResetEmail(user.email, user.username, resetToken);
    } catch (error) {
      console.error("Error sending password reset email:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Failed to send password reset email",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Password reset email sent successfully",
        resetToken,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in forgot password route:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
