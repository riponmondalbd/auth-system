import { sendEmailVerification } from "@/lib/email";
import { hashPassword } from "@/lib/password";
import { generateToken, hashToken } from "@/lib/token";
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

  const hashedPassword = await hashPassword(password);

  // Use a transaction to create the user and the email verification token
  const transactionResult = await db.transaction(async (tx) => {
    const user = await tx.orm.public.User.create({
      name,
      username,
      email,
      password: hashedPassword,
    });

    const verificationToken = generateToken();

    const tokenHash = hashToken(verificationToken);

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes from now

    await tx.orm.public.EmailVerificationToken.create({
      tokenHash,
      userId: user.id,
      expiresAt,
    });

    return { user, verificationToken };
  });

  await sendEmailVerification(email, name, transactionResult.verificationToken);

  return NextResponse.json(
    {
      success: true,
      message: "User created successfully",
      user: {
        id: transactionResult.user.id,
        name: transactionResult.user.name,
        username: transactionResult.user.username,
        email: transactionResult.user.email,
        role: transactionResult.user.role,
        isVerified: transactionResult.user.isVerified,
      },
    },
    { status: 201 },
  );
}
