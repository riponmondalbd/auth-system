import cloudinary from "@/lib/cloudinary";
import { requireAuth } from "@/lib/require-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAuth();

    const timestamp = Math.floor(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: "auth-system/profile-images",
      },
      process.env.CLOUDINARY_API_SECRET!,
    );

    return NextResponse.json(
      {
        success: true,
        timestamp,
        signature,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder: "auth-system/profile-images",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Cloudinary signature error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Authentication required",
      },
      { status: 401 },
    );
  }
}
