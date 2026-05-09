# 03 - Domain Types

## Step 1 - Create `src/lib/types/room-remix.ts`

What this file does: defines the TypeScript vocabulary for the whole app.

Why it is needed: Room Remix works because the room is converted into structured state. These types make that structure explicit and keep the UI, API, mocks, and providers aligned.

Create `room-remix/src/lib/types/room-remix.ts`:

```ts
export type ProjectStatus =
  | "draft"
  | "analyzed"
  | "confirmed"
  | "planned"
  | "previewed"
  | "accepted";

export type DesignStyle =
  | "Minimal"
  | "Japandi"
  | "Industrial"
  | "Bohemian"
  | "Warm Modern";

export type BudgetTier = "Low" | "Medium" | "High";

export type DesignGoal =
  | "More cozy"
  | "More productive"
  | "More elegant"
  | "More spacious";

export type DesignConstraint =
  | "Keep existing furniture"
  | "Rental-friendly"
  | "No drilling"
  | "Pet-safe";

export type RoomObjectType =
  | "window"
  | "bed"
  | "desk"
  | "chair"
  | "lamp"
  | "rug"
  | "plant"
  | "wall_decor"
  | "shelf"
  | "floor"
  | "wall"
  | "unknown";

export type LockLevel = "locked" | "soft_locked" | "editable";

export type ConfirmationStatus =
  | "ai_detected"
  | "user_confirmed"
  | "user_corrected"
  | "rejected";

export type RelationType =
  | "left_of"
  | "right_of"
  | "in_front_of"
  | "behind"
  | "above"
  | "under"
  | "attached_to_wall"
  | "centered_under"
  | "adjacent_to";

export type PatchStatus = "proposed" | "accepted" | "rejected" | "applied";

export type FidelityStatus =
  | "faithful"
  | "mostly_faithful"
  | "not_faithful"
  | "needs_manual_review";

export interface RoomShell {
  roomType: string;
  architecture: string[];
  visibleConstraints: string[];
  lighting: string;
  dominantColors: string[];
  surfaces: {
    walls: string;
    floor: string;
    ceiling?: string;
  };
}

export interface CameraState {
  angle: string;
  distance: string;
  height: string;
  notes: string;
}

export interface GridCell {
  id: string;
  row: number;
  column: number;
  label: string;
}

export interface RoomGrid {
  rows: number;
  columns: number;
  cells: GridCell[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RoomObject {
  id: string;
  type: RoomObjectType;
  label: string;
  description: string;
  gridPosition: string;
  approximateSize: string;
  color?: string;
  material?: string;
  confidence: number;
  lockedStatus: LockLevel;
  confirmationStatus: ConfirmationStatus;
  evidenceCropUrl?: string;
  bbox?: BoundingBox;
}

export interface RoomRelation {
  subjectObjectId: string;
  relationType: RelationType;
  targetObjectId: string;
  confidence: number;
}

export interface EditContractItem {
  objectId: string;
  identityLock: boolean;
  positionLock: boolean;
  appearanceLock: boolean;
  softLock: boolean;
  editableFields: string[];
  reason: string;
  confirmedByUser: boolean;
}

export interface DesignPreferences {
  style: DesignStyle;
  budget: BudgetTier;
  goal: DesignGoal;
  constraints: DesignConstraint[];
  freeformNotes?: string;
}

export interface PaletteColor {
  name: string;
  hex: string;
  role: string;
}

export interface DesignPatch {
  id: string;
  operation: "add" | "modify" | "preserve" | "remove" | "move";
  targetObjectOrArea: string;
  targetGridPosition: string;
  reason: string;
  status: PatchStatus;
}

export interface DesignPlan {
  palette: PaletteColor[];
  lightingPlan: string[];
  furnitureOrDecorSuggestions: string[];
  layoutSuggestions: string[];
  stepByStepActionPlan: string[];
  rationale: string;
  designPatches: DesignPatch[];
}

export interface RoomStateSnapshot {
  id?: string;
  projectId?: string;
  version: number;
  roomShell: RoomShell;
  camera: CameraState;
  grid: RoomGrid;
  objects: RoomObject[];
  relations: RoomRelation[];
  editContract: EditContractItem[];
  preferences?: DesignPreferences;
  designPlan?: DesignPlan;
  patches: DesignPatch[];
  source: "mock" | "vision_provider" | "user_patch" | "migration";
  createdAt?: string;
}

export interface RawRoomAnalysis {
  summary: string;
  detectedRoomType: string;
  confidence: number;
  extractedObjects: RoomObject[];
  visibleConstraints: string[];
  suggestedQuestions: string[];
}

export interface PreviewResult {
  id?: string;
  projectId?: string;
  roomStateId?: string;
  generatedImageUrl: string;
  promptSummary: string;
  generationProvider: string;
  createdAt?: string;
  userFidelityStatus?: FidelityStatus;
}

export interface FidelityReport {
  id?: string;
  previewId?: string;
  systemScore: number;
  windowPreserved: boolean;
  cameraAnglePreserved: boolean;
  bedPositionPreserved: boolean;
  deskPositionPreserved: boolean;
  lockedObjectsPreserved: boolean;
  styleApplied: boolean;
  unexpectedChanges: string[];
  recommendedAction: string;
  userFeedback?: {
    status: FidelityStatus;
    notes?: string;
    changedElements?: string[];
  };
}

export interface InteractionEventView {
  id: string;
  type: string;
  inputSummary: string;
  outputSummary: string;
  createdAt: string;
}

export interface DesignCatalogItem {
  id: string;
  name: string;
  category: "lamp" | "rug" | "wall_decor" | "plant" | "textile";
  compatibleStyles: DesignStyle[];
  priceTier: BudgetTier;
  materials: string[];
  visualEffect: string;
  placementSuggestions: string[];
  constraintsCompatibility: DesignConstraint[];
}
```

Copy checkpoint:

```text
Expected path: src/lib/types/room-remix.ts
Expected compile status: all Room Remix domain names are exported from one file.
Expected learning check: you can explain RoomStateSnapshot, DesignPatch, PreviewResult, and FidelityReport before moving on.
```

## Step 2 - Create `src/lib/types/schemas.ts`

What this file does: defines runtime validation for incoming API payloads.

Why it is needed: TypeScript helps at build time, but API routes receive unknown JSON at runtime. Zod gives safer boundaries.

Create `room-remix/src/lib/types/schemas.ts`:

```ts
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
```

Copy checkpoint:

```text
Expected path: src/lib/types/schemas.ts
Expected compile status: zod imports resolve.
Expected behavior: API payloads for project creation, preferences, state patches, and fidelity feedback have runtime validation.
```

## Checkpoint

What this does: checks that the TypeScript compiler understands your new type files.

Why it is needed: catching type errors now avoids confusing API and UI errors later.

```powershell
npm run lint
```
