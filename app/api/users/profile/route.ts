import { AuthError } from "@/lib/auth-error";
import cloudinary from "@/lib/cloudinary";
import { requireAuth } from "@/lib/require-auth";
import { db } from "@/prisma/db";
import { updateProfileSchema } from "@/validations/profile.schema";
import { NextResponse } from "next/server";

// Get the current user's profile information
export async function GET() {
  try {
    const user = await requireAuth();

    const currentUser = await db.orm.public.User.first({
      id: user.id,
    });

    if (!currentUser) {
      throw new AuthError("User not found", 404);
    }

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

// Update the current user's profile information
export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();

    // Get the current database user
    // We need imagePublicId to delete the old Cloudinary image.
    const currentUser = await db.orm.public.User.first({
      id: user.id,
    });

    if (!currentUser) {
      throw new AuthError("User not found", 404);
    }

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

    // At least one field must be provided
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

    // Check username uniqueness
    if (username && username !== user.username) {
      const existingUser = await db.orm.public.User.first({
        username,
      });

      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json(
          {
            success: false,
            message: "Username is already taken",
          },
          { status: 409 },
        );
      }
    }

    // Update user in database
    const updatedUser = await db.orm.public.User.where({ id: user.id }).update({
      ...(name !== undefined && { name }),
      ...(username !== undefined && { username }),
      ...(image !== undefined && { image }),
      ...(imagePublicId !== undefined && {
        imagePublicId,
      }),
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

    // Delete old Cloudinary image
    // Only when a new image was uploaded.
    if (
      image !== undefined &&
      currentUser.imagePublicId &&
      currentUser.imagePublicId !== imagePublicId
    ) {
      try {
        await cloudinary.uploader.destroy(currentUser.imagePublicId);
      } catch (error) {
        console.error("Failed to delete old Cloudinary image:", error);
      }
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
