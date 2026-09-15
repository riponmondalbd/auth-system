import { AuthError } from "@/lib/auth-error";
import { requireRole } from "@/lib/require-role";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await requireRole("ADMIN");

    return NextResponse.json(
      {
        success: true,
        message: "Admin access granted",
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
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

    console.error("Admin Users API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
