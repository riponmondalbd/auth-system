import { getCurrentUser } from "./auth";
import { AuthError } from "./auth-error";

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthError("Authentication required", 401);
  }

  return user;
}
