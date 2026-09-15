import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      {
        success: false,
        message: "Refresh token not found",
      },
      { status: 401 },
    );
  }
}
