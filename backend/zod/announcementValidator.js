import { z } from "zod";

// URL validator
const urlSchema = z.object({
  heading: z.string().trim().optional(),
  url: z
    .string()
    .url("Invalid URL format")
    .regex(/^https?:\/\/.+/, "URL must start with http:// or https://"),
});

// Dynamic meta fields
const metaSchema = z.object({
  key: z.string().trim().min(1, "Meta key is required"),
  value: z.string().min(1, "Meta value is required"),
});

// Main announcement validator
export const announcementSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(150, "Title is too long"),
  content: z.string().trim().min(5, "Content is too short").max(5000, "Content is too long"),
  category: z.enum(["notice", "update", "job", "form"], "Invalid category"),
  urls: z.array(urlSchema).optional(),
  meta: z.array(metaSchema).optional(),
  createdBy: z.string().optional(), // ObjectId as string
  isActive: z.boolean().optional(),
});
