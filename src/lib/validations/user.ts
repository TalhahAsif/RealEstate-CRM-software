import { z } from "zod";
import { USER_ROLES } from "@/constants";

export const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(7, "Enter a valid phone number").optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(USER_ROLES),
  avatar: z.string().url("Enter a valid URL").optional(),
  isActive: z.boolean().default(true),
});

export type UserInput = z.infer<typeof userSchema>;
