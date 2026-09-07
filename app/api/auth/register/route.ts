import { db } from "@/prisma/db";
import { registerSchema } from "@/validations/auth.schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate the request body against the registerSchema
  const result = registerSchema.safeParse(body);

  // If validation fails, return a 400 response with the validation errors
  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { name, username, email, password } = result.data;

  // Check if the email already exists in the database
  const existingEmail = await db.orm.public.User.first({ email });

  if (existingEmail) {
    return NextResponse.json(
      {
        success: false,
        message: "Email already exists",
      },
      { status: 400 },
    );
  }

  // Check if the username already exists in the database
  const existingUsername = await db.orm.public.User.first({ username });

  if (existingUsername) {
    return NextResponse.json(
      {
        success: false,
        message: "Username already exists",
      },
      { status: 400 },
    );
  }
}
