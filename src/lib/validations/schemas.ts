import { z } from "zod";

export const competitorSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(30, "Username too long")
    .regex(/^[a-zA-Z0-9._]+$/, "Invalid Instagram username"),
});

export const reportRequestSchema = z.object({
  forceRefresh: z.boolean().optional().default(false),
});

export const contentIdeasSchema = z.object({
  category: z
    .enum(["all", "reels", "carousels", "stories"])
    .optional()
    .default("all"),
  count: z.number().min(1).max(10).optional().default(5),
});
