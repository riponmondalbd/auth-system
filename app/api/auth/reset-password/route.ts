import { hashPassword } from "@/lib/password";
import { hashToken } from "@/lib/token";
import { db } from "@/prisma/db";
import { resetPasswordSchema } from "@/validations/auth.schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { token, newPassword } = result.data;

    const tokenHash = hashToken(token);

    const resetToken = await db.orm.public.PasswordResetToken.first({
      tokenHash,
    });

    if (!resetToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        { status: 400 },
      );
    }

    if (resetToken.used) {
      return NextResponse.json(
        {
          success: false,
          message: "Token already used",
        },
        { status: 400 },
      );
    }

    if (new Date(resetToken.expiresAt) < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: "Token expired",
        },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    await db.transaction(async (tx) => {
      await tx.orm.public.User.where({ id: resetToken.userId }).update({
        password: hashedPassword,
      });
      await tx.orm.public.PasswordResetToken.where({
        id: resetToken.id,
      }).update({
        used: true,
      });

      await tx.orm.public.RefreshToken.where({
        userId: resetToken.userId,
      }).update({ revoked: true });
    });

    return NextResponse.json(
      {
        success: true,
        message: "Password reset successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in reset password route:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
