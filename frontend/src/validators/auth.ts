import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().min(1, { message: "Email is required" }).email(),
    username: z
      .string()
      .min(1, { message: "username is required" })
      .min(3, { message: "Your username should not be that short!" }),
    password: z
      .string()
      .min(1, { message: "password is required" })
      .min(6, { message: "password must be more than 6 characters" })
      .max(100),
    confirmPassword: z
      .string()
      .min(1, { message: "confirmPassword is required" })
      .max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }).email(),
  password: z.string().min(1, { message: "Password is required" }).max(100),
});
