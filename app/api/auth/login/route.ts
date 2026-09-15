import { setAuthCookies } from "@/lib/cookie";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { comparePassword } from "@/lib/password";
import { hashToken } from "@/lib/token";
import { db } from "@/prisma/db";
import { loginSchema } from "@/validations/auth.schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const result = loginSchema.safeParse(body);

  // If the validation fails, return a 400 Bad Request response with the validation errors
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

  // Find the user by email in the database
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

  // Compare the provided password with the hashed password stored in the database
  const isPasswordValid = await comparePassword(password, user.password);

  // If the password is invalid, return a 401 Unauthorized response
  if (!isPasswordValid) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid email or password",
      },
      { status: 401 },
    );
  }

  //  Check if the user's email is verified before allowing login
  if (!user.isVerified) {
    return NextResponse.json(
      {
        success: false,
        message: "Please verify your email before logging in",
      },
      { status: 403 },
    );
  }

  // Generate access and refresh tokens for the authenticated user
  const accessToken = generateAccessToken({
    userId: String(user.id),
    role: user.role,
  });

  // Generate a new refresh token for the authenticated user
  const refreshToken = generateRefreshToken({
    userId: String(user.id),
    role: user.role,
  });

  // Hash the refresh token and store it in the database with an expiration date
  const refreshTokenHash = hashToken(refreshToken);

  // Set the refresh token's expiration date to 7 days from now
  const refreshTokenExpiry = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  ).toISOString(); // 7 days from now

  // Store the hashed refresh token in the database with the associated user ID and expiration date
  await db.orm.public.RefreshToken.create({
    tokenHash: refreshTokenHash,
    userId: user.id,
    expiresAt: refreshTokenExpiry,
  });

  // Return a successful response with the user data and set the authentication cookies
  const response = NextResponse.json(
    {
      success: true,
      message: "Logged in successfully",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        image: user.image,
      },
    },
    { status: 200 },
  );

  setAuthCookies(response, accessToken, refreshToken);
  return response;
}
