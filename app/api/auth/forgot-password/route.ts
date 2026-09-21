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

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now

    await db.orm.public.PasswordResetToken.where({
      userId: user.id,
    }).delete();

    await db.orm.public.PasswordResetToken.create({
      tokenHash,
      userId: user.id,
      expiresAt,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Password reset token create successfully",
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
