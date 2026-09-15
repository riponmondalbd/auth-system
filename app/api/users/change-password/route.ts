import { AuthError } from "@/lib/auth-error";
import { comparePassword, hashPassword } from "@/lib/password";
import { requireAuth } from "@/lib/require-auth";
import { db } from "@/prisma/db";
import { changePasswordSchema } from "@/validations/auth.schema";
import { NextResponse } from "next/server";

// change the current user's password
export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json();

    const result = changePasswordSchema.safeParse(body);

    // If the validation fails, return a 400 Bad Request response with the validation errors
    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: result.error.flatten().fieldErrors,
        }),
        { status: 400 },
      );
    }

    const { currentPassword, newPassword } = result.data;

    // Check if the current password is correct by comparing it with the hashed password stored in the database
    const passwordIsValid = await comparePassword(
      currentPassword,
      await getUserPassword(user.id),
    );

    if (!passwordIsValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password is incorrect",
        },
        { status: 401 },
      );
    }

    // Check if the new password is different from the current password
    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "New password must be different from current password",
        },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    // Update the user's password in the database
    await db.transaction(async (tx) => {
      await tx.orm.public.User.where({ id: user.id }).update({
        password: hashedPassword,
      });

      await tx.orm.public.RefreshToken.where({ userId: user.id }).update({
        revoked: true,
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "Password changed successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.statusCode },
      );
    }
    console.error("Change password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}

// Helper function to get the user's current hashed password from the database
async function getUserPassword(userId: number) {
  const user = await db.orm.public.User.first({
    id: userId,
  });

  if (!user) {
    throw new AuthError("User not found", 404);
  }
  return user.password;
}
