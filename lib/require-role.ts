import { AuthError } from "./auth-error";
import { requireAuth } from "./require-auth";

type UserRole = "USER" | "ADMIN";

export async function requireRole(requiredRole: UserRole) {
  const user = await requireAuth();

  if (user.role !== requiredRole) {
    throw new AuthError(
      "You do not have the permissions to access this resource",
      403,
    );
  }

  return user;
}
