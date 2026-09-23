import { z } from "zod";

// Validation schema for user registration
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must be less than 50 characters long"),

  username: z
    .string()
    .min(2, "Username must be at least 2 characters long")
    .max(30, "Username must be less than 30 characters long")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),

  email: z.string().email("Please enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password must be less than 100 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
});

// Validation schema for user login
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// Validation schema for changing password
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),

    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long")
      .max(100, "New password must be less than 100 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),

    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New password and confirm new password must match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Validation schema for forgot password
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// Validation schema for reset password
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),

    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long")
      .max(100, "New password must be less than 100 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),

    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New password and confirm new password must match",
    path: ["confirmNewPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
