import { db } from "@/prisma/db";
import { loginSchema } from "@/validations/auth.schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const result = loginSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { email, password } = result.data;

  const user = await db.orm.public.User.first({ email });

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid email or password",
      },
      { status: 401 },
    );
  }
}
