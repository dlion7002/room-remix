import { z } from "zod";

export const designStyleSchema = z.enum([
  "Minimal",
  "Japandi",
  "Industrial",
  "Bohemian",
  "Warm Modern",
]);

export const budgetTierSchema = z.enum(["Low", "Medium", "High"]);

export const designGoalSchema = z.enum([
  "More cozy",
  "More productive",
  "More elegant",
  "More spacious",
]);

export const designConstraintSchema = z.enum([
  "Keep existing furniture",
  "Rental-friendly",
  "No drilling",
  "Pet-safe",
]);

export const createProjectSchema = z.object({
  title: z.string().min(1).max(80),
  imageUrl: z.string().min(1),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
});

export const designPreferencesSchema = z.object({
  style: designStyleSchema,
  budget: budgetTierSchema,
  goal: designGoalSchema,
  constraints: z.array(designConstraintSchema),
  freeformNotes: z.string().max(500).optional(),
});

export const patchRoomStateSchema = z.object({
  roomState: z.record(z.string(), z.unknown()),
  eventSummary: z.string().max(240).default("User patched room state"),
});

export const fidelityFeedbackSchema = z.object({
  previewId: z.string().min(1),
  status: z.enum([
    "faithful",
    "mostly_faithful",
    "not_faithful",
    "needs_manual_review",
  ]),
  notes: z.string().max(500).optional(),
  changedElements: z.array(z.string()).default([]),
});

