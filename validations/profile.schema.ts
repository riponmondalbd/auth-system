import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .optional(),

  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscore",
    )
    .optional(),

  image: z.string().url("Image must be a valid URL").optional(),

  imagePublicId: z.string().min(1, "Image public ID is required").optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
