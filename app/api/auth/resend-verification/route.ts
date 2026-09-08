import { db } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { email } = body;

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

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "User not found",
      },
      { status: 404 },
    );
  }
}
