import { db } from "@/prisma/db";
import { registerSchema } from "@/validations/auth.schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const result = registerSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { success: false, errors: result.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { name, username, email, password } = result.data;

  const existingEmail = await db.orm.public.User.first({ email });

  if (existingEmail) {
    return NextResponse.json(
      { success: false, message: "Email already exists" },
      { status: 409 },
    );
  }

  const existingUsername = await db.orm.public.User.first({ username });

  if (existingUsername) {
    return NextResponse.json(
      { success: false, message: "Username already exists" },
      { status: 409 },
    );
  }

  return NextResponse.json({ success: true, message: "Validation successful" });
}
