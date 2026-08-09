/** Sign-in and change-password payloads. */

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(255),
  password: z.string().max(200),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().max(200),
  newPassword: z
    .string()
    .min(12, "Use at least 12 characters.")
    .max(200, "That password is too long."),
});
