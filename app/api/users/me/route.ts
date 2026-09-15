import { verifyAccessToken } from "@/lib/jwt";
import { db } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;

  if (!accessToken) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Not authenticated",
      }),
      { status: 401 },
    );
  }

  let payload;

  try {
    payload = verifyAccessToken(accessToken);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid or expired access token",
      },
      { status: 401 },
    );
  }

  const user = await db.orm.public.User.first({ id: Number(payload.userId) });

  if (!user) {
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
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        image: user.image,
        role: user.role,
        isVerified: user.isVerified,
      },
    },
    { status: 200 },
  );
}
