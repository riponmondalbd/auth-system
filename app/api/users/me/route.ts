import { verifyAccessToken } from "@/lib/jwt";
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
}
