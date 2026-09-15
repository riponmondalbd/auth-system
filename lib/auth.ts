import { db } from "@/prisma/db";
import { cookies } from "next/headers";
import { verifyAccessToken } from "./jwt";

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return null;
  }

  let payload;

  try {
    payload = verifyAccessToken(accessToken);
  } catch (error) {
    return null;
  }

  const user = await db.orm.public.User.first({ id: Number(payload.userId) });

  if (!user) {
    return null;
  }

  return user;
}
