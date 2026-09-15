import { AuthError } from "@/lib/auth-error";
import { requireAuth } from "@/lib/require-auth";
import { NextResponse } from "next/server";

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
