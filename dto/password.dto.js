import z from "zod";

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters long");

export const changePasswordDTO = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "New password and confirm password must match",
  });

export const forgotPasswordDTO = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordDTO = z
  .object({
    email: z.string().email("Invalid email address"),
    token: z.string().trim().min(20, "Reset token is required"),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Password and confirm password must match",
  });
