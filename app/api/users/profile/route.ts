import { AuthError } from "@/lib/auth-error";
import { requireAuth } from "@/lib/require-auth";
import { db } from "@/prisma/db";
import { updateProfileSchema } from "@/validations/profile.schema";
import { NextResponse } from "next/server";

// get the current user's profile information
export async function GET() {
  try {
    const user = await requireAuth();

    return NextResponse.json(
      {
        success: true,
        user,
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

    console.error("Profile API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}

// update the current user's profile information
export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json();

    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { name, username, image, imagePublicId } = result.data;

    if (
      name === undefined &&
      username === undefined &&
      image === undefined &&
      imagePublicId === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one field must be provided",
        },
        { status: 400 },
      );
    }

    if (username && username !== user.username) {
      const existingUser = await db.orm.public.User.first({ username });

      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json(
          {
            success: false,
            message: "Username is already taken",
          },
          { status: 400 },
        );
      }
    }

    const updatedUser = await db.orm.public.User.where({ id: user.id }).update({
      ...(name !== undefined && { name }),
      ...(username !== undefined && { username }),
      ...(image !== undefined && { image }),
      ...(imagePublicId !== undefined && { imagePublicId }),
    });

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          username: updatedUser.username,
          email: updatedUser.email,
          image: updatedUser.image,
          role: updatedUser.role,
          isVerified: updatedUser.isVerified,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
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

    console.error("Profile API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
