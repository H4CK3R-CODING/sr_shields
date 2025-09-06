import { z } from "zod";

export const userAuth = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  course: z.string().min(2, "Course is required"),
  college: z.string().min(2, "College is required"),
  session: z.string().min(2, "Session is required"),
  phone_number: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be 10 digits"),
  role: z.enum(["user", "admin"]).optional(),
});
