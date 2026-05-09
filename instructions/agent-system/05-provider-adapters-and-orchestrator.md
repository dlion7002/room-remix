# 05 - Provider Adapters And Orchestrator

## Step 1 - Create `src/lib/ai/provider.ts`

What this file does: defines the contract every AI provider must satisfy.

Why it is needed: during the event you may receive Gemini credits, OpenAI access, CopilotKit hooks, or another provider. This interface lets you swap implementations without rewriting the app flow.

## State Lifecycle

What this table does: shows how each orchestrator step changes persistent state.

Why it is needed: Room Remix is impressive because it has typed memory and checkpoints, not because it sends a single prompt.

| Step | Tool boundary | Persistent effect |
| --- | --- | --- |
| Upload | `room.capture` | Creates `Project`, `RoomPhoto`, and an interaction event. |
| Analyze | `room.analyze` + `room.build_state` | Creates first `RoomState` version and marks it active. |
| Confirm | `room.patch_state` | Creates a new `RoomState` version with user-confirmed locks. |
| Plan | `design.generate_plan` | Creates a new `RoomState` version with preferences, plan, and patches. |
| Preview | `preview.generate` + `preview.validate_fidelity` | Creates `Preview`, `FidelityReport`, and marks the preview active. |
| Feedback | `preview.user_fidelity_feedback` | Updates preview/report feedback and optionally accepts the project. |

Create `room-remix/src/lib/ai/provider.ts`:

```ts
import type {
  DesignCatalogItem,
  DesignPlan,
  DesignPreferences,
  FidelityReport,
  PreviewResult,
  RawRoomAnalysis,
  RoomStateSnapshot,
} from "@/lib/types/room-remix";

export interface AnalyzeRoomInput {
  projectId: string;
  imageUrl: string;
}

export interface GenerateDesignPlanInput {
  projectId: string;
  roomState: RoomStateSnapshot;
  preferences: DesignPreferences;
  catalogOptions: DesignCatalogItem[];
}

export interface GeneratePreviewInput {
  projectId: string;
  roomState: RoomStateSnapshot;
  prompt: string;
}

export interface ValidateFidelityInput {
  projectId: string;
  originalImageUrl: string;
  generatedImageUrl: string;
  roomState: RoomStateSnapshot;
}

export interface RoomAiProvider {
  name: string;
  analyzeRoom(input: AnalyzeRoomInput): Promise<RawRoomAnalysis>;
  generateDesignPlan(input: GenerateDesignPlanInput): Promise<DesignPlan>;
  generatePreview(input: GeneratePreviewInput): Promise<PreviewResult>;
  validateFidelity(input: ValidateFidelityInput): Promise<FidelityReport>;
}
```

Copy checkpoint:

```text
Expected path: src/lib/ai/provider.ts
Expected compile status: all provider methods return typed Room Remix data, not unstructured strings.
```

## Step 2 - Create `src/lib/ai/mock-provider.ts`

What this file does: implements the provider contract with deterministic mock results.

Why it is needed: the whole workflow can run before real AI APIs are available.

Create `room-remix/src/lib/ai/mock-provider.ts`:

```ts
import {
  sampleDesignPlan,
  sampleFidelityReport,
  samplePreview,
  sampleRawRoomAnalysis,
} from "@/lib/mock/sample-room-state";
import type { RoomAiProvider } from "@/lib/ai/provider";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockRoomAiProvider: RoomAiProvider = {
  name: "mock",

  async analyzeRoom() {
    await wait(350);
    return sampleRawRoomAnalysis;
  },

  async generateDesignPlan({ preferences }) {
    await wait(350);

    return {
      ...sampleDesignPlan,
      rationale: `${sampleDesignPlan.rationale} Selected style: ${preferences.style}. Budget: ${preferences.budget}.`,
    };
  },

  async generatePreview({ prompt }) {
    await wait(350);

    return {
      ...samplePreview,
      promptSummary: prompt,
      generationProvider: "mock",
    };
  },

  async validateFidelity() {
    await wait(250);
    return sampleFidelityReport;
  },
};
```

Copy checkpoint:

```text
Expected path: src/lib/ai/mock-provider.ts
Expected behavior: every method returns deterministic mock data after a short delay.
```

## Step 3 - Create `src/lib/ai/index.ts`

What this file does: chooses the active AI provider.

Why it is needed: environment-based selection keeps mock mode and real provider mode behind the same interface.

Create `room-remix/src/lib/ai/index.ts`:

```ts
import { mockRoomAiProvider } from "@/lib/ai/mock-provider";
import type { RoomAiProvider } from "@/lib/ai/provider";

export function getRoomAiProvider(): RoomAiProvider {
  const providerName = process.env.ROOM_REMIX_AI_PROVIDER ?? "mock";

  if (providerName === "mock") {
    return mockRoomAiProvider;
  }

  throw new Error(`Unknown ROOM_REMIX_AI_PROVIDER: ${providerName}`);
}
```

Copy checkpoint:

```text
Expected path: src/lib/ai/index.ts
Expected behavior: ROOM_REMIX_AI_PROVIDER="mock" resolves to mockRoomAiProvider.
```

## Step 4 - Create `src/lib/orchestrator/tools.ts`

What this file does: holds deterministic tool-style functions used by the orchestrator.

Why it is needed: the project should feel like an agent with tools, not a pile of prompts. These functions are the stable boundaries.

Create `room-remix/src/lib/orchestrator/tools.ts`:

```ts
import { sampleRoomState } from "@/lib/mock/sample-room-state";
import type {
  DesignPatch,
  RawRoomAnalysis,
  RoomStateSnapshot,
} from "@/lib/types/room-remix";

export function buildRoomStateFromAnalysis(
  analysis: RawRoomAnalysis,
): RoomStateSnapshot {
  return {
    ...sampleRoomState,
    roomShell: {
      ...sampleRoomState.roomShell,
      roomType: analysis.detectedRoomType,
      visibleConstraints: analysis.visibleConstraints,
    },
    objects: analysis.extractedObjects,
    source: "mock",
  };
}

export function buildPreviewPrompt(roomState: RoomStateSnapshot) {
  const lockedObjects = roomState.objects.filter((object) => object.lockedStatus !== "editable");
  const patchMap = new Map<string, DesignPatch>();

  for (const patch of roomState.designPlan?.designPatches ?? []) {
    patchMap.set(patch.id, patch);
  }

  for (const patch of roomState.patches) {
    patchMap.set(patch.id, patch);
  }

  const proposedPatches = [...patchMap.values()].filter(
    (patch) => patch.status !== "rejected",
  );

  const preserveLines = lockedObjects.map((object) => {
    return `- Preserve ${object.label} at ${object.gridPosition}: ${object.description}`;
  });

  const applyLines = proposedPatches.map(formatPatchForPrompt);

  return [
    "Use the uploaded room photo as the base image.",
    "",
    "Preserve:",
    "- Same camera angle and room proportions.",
    "- Same architectural shell, windows, walls, and floor structure.",
    ...preserveLines,
    "",
    "Apply:",
    ...applyLines,
    "",
    "Do not:",
    "- Move locked objects.",
    "- Remove windows or large furniture.",
    "- Change the camera angle.",
    "- Invent large architectural changes.",
  ].join("\n");
}

function formatPatchForPrompt(patch: DesignPatch) {
  return `- ${patch.operation} ${patch.targetObjectOrArea} at ${patch.targetGridPosition}: ${patch.reason}`;
}

export function mergeRoomStatePatch(
  current: RoomStateSnapshot,
  next: RoomStateSnapshot,
): RoomStateSnapshot {
  return {
    ...current,
    ...next,
    version: current.version + 1,
    source: "user_patch",
    createdAt: new Date().toISOString(),
  };
}
```

Copy checkpoint:

```text
Expected path: src/lib/orchestrator/tools.ts
Expected behavior: preview prompts include locked objects and accepted/proposed patches without duplicating patch lines.
```

## Step 5 - Create `src/lib/orchestrator/room-remix-orchestrator.ts`

What this file does: coordinates database persistence, provider calls, state versioning, preview generation, and fidelity feedback.

Why it is needed: the UI should call simple workflow actions while the orchestrator keeps the room-state lifecycle consistent.

Create `room-remix/src/lib/orchestrator/room-remix-orchestrator.ts`:

```ts
import { Prisma, type RoomState as RoomStateRecord } from "@/generated/prisma/client";
import { getGenericCatalogOptions } from "@/lib/catalog/design-catalog";
import { db } from "@/lib/db";
import { getRoomAiProvider } from "@/lib/ai";
import {
  buildPreviewPrompt,
  buildRoomStateFromAnalysis,
  mergeRoomStatePatch,
} from "@/lib/orchestrator/tools";
import type {
  DesignPreferences,
  FidelityStatus,
  RoomStateSnapshot,
} from "@/lib/types/room-remix";

const asJson = <T>(value: T) => value as Prisma.InputJsonValue;
const asNullableJson = <T>(value: T | null | undefined) =>
  value === null || value === undefined
    ? Prisma.JsonNull
    : (value as Prisma.InputJsonValue);

export async function captureRoomProject(input: {
  title: string;
  imageUrl: string;
  width?: number | null;
  height?: number | null;
}) {
  return db.project.create({
    data: {
      title: input.title,
      status: "draft",
      photos: {
        create: {
          originalImageUrl: input.imageUrl,
          width: input.width ?? null,
          height: input.height ?? null,
          isSourceOfTruth: true,
        },
      },
      interactionEvents: {
        create: {
          type: "room.capture",
          inputSummary: "User created a project with a source room photo.",
          outputSummary: "Project and source photo were saved.",
          payload: asJson({ imageUrl: input.imageUrl }),
        },
      },
    },
    include: {
      photos: true,
    },
  });
}

export async function analyzeProjectRoom(projectId: string) {
  const provider = getRoomAiProvider();
  const photo = await getSourcePhoto(projectId);
  const analysis = await provider.analyzeRoom({
    projectId,
    imageUrl: photo.originalImageUrl,
  });

  const nextVersion = await getNextRoomStateVersion(projectId);
  const roomState = {
    ...buildRoomStateFromAnalysis(analysis),
    projectId,
    version: nextVersion,
  };

  const savedRoomState = await db.roomState.create({
    data: serializeRoomState(projectId, roomState),
  });

  await db.project.update({
    where: { id: projectId },
    data: {
      status: "analyzed",
      activeRoomStateId: savedRoomState.id,
      interactionEvents: {
        create: {
          type: "room.analyze",
          inputSummary: "Analyzed source room photo.",
          outputSummary: analysis.summary,
          payload: asJson({ analysis }),
        },
      },
    },
  });

  return {
    analysis,
    roomState: toRoomStateSnapshot(savedRoomState),
  };
}

export async function patchProjectRoomState(input: {
  projectId: string;
  roomState: RoomStateSnapshot;
  eventSummary: string;
}) {
  const current = await getActiveRoomState(input.projectId);
  const next = mergeRoomStatePatch(current, input.roomState);

  const savedRoomState = await db.roomState.create({
    data: serializeRoomState(input.projectId, next),
  });

  await db.project.update({
    where: { id: input.projectId },
    data: {
      status: "confirmed",
      activeRoomStateId: savedRoomState.id,
      interactionEvents: {
        create: {
          type: "room.patch_state",
          inputSummary: input.eventSummary,
          outputSummary: `Created Room State version ${next.version}.`,
          payload: asJson({ roomState: next }),
        },
      },
    },
  });

  return toRoomStateSnapshot(savedRoomState);
}

export async function generatePlanForProject(input: {
  projectId: string;
  preferences: DesignPreferences;
}) {
  const provider = getRoomAiProvider();
  const current = await getActiveRoomState(input.projectId);
  const catalogOptions = getGenericCatalogOptions({
    style: input.preferences.style,
    budget: input.preferences.budget,
    constraints: input.preferences.constraints,
  });

  const designPlan = await provider.generateDesignPlan({
    projectId: input.projectId,
    roomState: current,
    preferences: input.preferences,
    catalogOptions,
  });

  const next: RoomStateSnapshot = {
    ...current,
    version: current.version + 1,
    preferences: input.preferences,
    designPlan,
    patches: designPlan.designPatches,
    source: "user_patch",
    createdAt: new Date().toISOString(),
  };

  const savedRoomState = await db.roomState.create({
    data: serializeRoomState(input.projectId, next),
  });

  await db.project.update({
    where: { id: input.projectId },
    data: {
      status: "planned",
      activeRoomStateId: savedRoomState.id,
      interactionEvents: {
        create: {
          type: "design.generate_plan",
          inputSummary: `${input.preferences.style} / ${input.preferences.budget} / ${input.preferences.goal}`,
          outputSummary: "Generated design board and design patches.",
          payload: asJson({ preferences: input.preferences, designPlan }),
        },
      },
    },
  });

  return toRoomStateSnapshot(savedRoomState);
}

export async function generatePreviewForProject(projectId: string) {
  const provider = getRoomAiProvider();
  const photo = await getSourcePhoto(projectId);
  const roomState = await getActiveRoomState(projectId);
  const roomStateId = assertPersistedRoomStateId(roomState);
  const prompt = buildPreviewPrompt(roomState);

  const previewResult = await provider.generatePreview({
    projectId,
    roomState,
    prompt,
  });

  const preview = await db.preview.create({
    data: {
      projectId,
      roomStateId,
      generatedImageUrl: previewResult.generatedImageUrl,
      promptSummary: previewResult.promptSummary,
      generationProvider: previewResult.generationProvider,
    },
  });

  const fidelityReport = await provider.validateFidelity({
    projectId,
    originalImageUrl: photo.originalImageUrl,
    generatedImageUrl: preview.generatedImageUrl,
    roomState,
  });

  const savedReport = await db.fidelityReport.create({
    data: {
      previewId: preview.id,
      systemScore: fidelityReport.systemScore,
      windowPreserved: fidelityReport.windowPreserved,
      cameraAnglePreserved: fidelityReport.cameraAnglePreserved,
      bedPositionPreserved: fidelityReport.bedPositionPreserved,
      deskPositionPreserved: fidelityReport.deskPositionPreserved,
      lockedObjectsPreserved: fidelityReport.lockedObjectsPreserved,
      styleApplied: fidelityReport.styleApplied,
      unexpectedChanges: asJson(fidelityReport.unexpectedChanges),
      recommendedAction: fidelityReport.recommendedAction,
      userFeedback: asNullableJson(fidelityReport.userFeedback),
    },
  });

  await db.project.update({
    where: { id: projectId },
    data: {
      status: "previewed",
      activePreviewId: preview.id,
      interactionEvents: {
        create: {
          type: "preview.generate",
          inputSummary: "Generated preview from original image and active Room State.",
          outputSummary: `Fidelity score: ${fidelityReport.systemScore}`,
          payload: asJson({ prompt, previewId: preview.id }),
        },
      },
    },
  });

  return {
    preview,
    fidelityReport: savedReport,
  };
}

export async function recordFidelityFeedback(input: {
  projectId: string;
  previewId: string;
  status: FidelityStatus;
  notes?: string;
  changedElements: string[];
}) {
  await db.preview.update({
    where: { id: input.previewId },
    data: { userFidelityStatus: input.status },
  });

  const report = await db.fidelityReport.update({
    where: { previewId: input.previewId },
    data: {
      userFeedback: asJson({
        status: input.status,
        notes: input.notes,
        changedElements: input.changedElements,
      }),
    },
  });

  await db.project.update({
    where: { id: input.projectId },
    data: {
      status: input.status === "faithful" ? "accepted" : "previewed",
      interactionEvents: {
        create: {
          type: "preview.user_fidelity_feedback",
          inputSummary: input.status,
          outputSummary: input.notes ?? "No extra notes.",
          payload: asJson(input),
        },
      },
    },
  });

  return report;
}

async function getSourcePhoto(projectId: string) {
  const photo = await db.roomPhoto.findFirst({
    where: {
      projectId,
      isSourceOfTruth: true,
    },
    orderBy: {
      uploadedAt: "desc",
    },
  });

  if (!photo) {
    throw new Error(`Project ${projectId} does not have a source photo.`);
  }

  return photo;
}

function assertPersistedRoomStateId(roomState: RoomStateSnapshot) {
  if (!roomState.id) {
    throw new Error("Cannot generate a preview without a persisted Room State id.");
  }

  return roomState.id;
}

async function getActiveRoomState(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
  });

  if (!project?.activeRoomStateId) {
    throw new Error(`Project ${projectId} does not have an active Room State.`);
  }

  const record = await db.roomState.findUnique({
    where: { id: project.activeRoomStateId },
  });

  if (!record) {
    throw new Error(`Active Room State ${project.activeRoomStateId} was not found.`);
  }

  return toRoomStateSnapshot(record);
}

async function getNextRoomStateVersion(projectId: string) {
  const latest = await db.roomState.findFirst({
    where: { projectId },
    orderBy: { version: "desc" },
  });

  return latest ? latest.version + 1 : 1;
}

function serializeRoomState(projectId: string, roomState: RoomStateSnapshot) {
  return {
    projectId,
    version: roomState.version,
    roomShell: asJson(roomState.roomShell),
    camera: asJson(roomState.camera),
    grid: asJson(roomState.grid),
    objects: asJson(roomState.objects),
    relations: asJson(roomState.relations),
    editContract: asJson(roomState.editContract),
    preferences: asNullableJson(roomState.preferences),
    designPlan: asNullableJson(roomState.designPlan),
    patches: asJson(roomState.patches),
    source: roomState.source,
  };
}

function toRoomStateSnapshot(record: RoomStateRecord): RoomStateSnapshot {
  return {
    id: record.id,
    projectId: record.projectId,
    version: record.version,
    roomShell: record.roomShell as RoomStateSnapshot["roomShell"],
    camera: record.camera as RoomStateSnapshot["camera"],
    grid: record.grid as RoomStateSnapshot["grid"],
    objects: record.objects as RoomStateSnapshot["objects"],
    relations: record.relations as RoomStateSnapshot["relations"],
    editContract: record.editContract as RoomStateSnapshot["editContract"],
    preferences: record.preferences as RoomStateSnapshot["preferences"],
    designPlan: record.designPlan as RoomStateSnapshot["designPlan"],
    patches: record.patches as RoomStateSnapshot["patches"],
    source: record.source as RoomStateSnapshot["source"],
    createdAt: record.createdAt.toISOString(),
  };
}
```

Copy checkpoint:

```text
Expected path: src/lib/orchestrator/room-remix-orchestrator.ts
Expected compile status: Prisma is imported as a runtime value because Prisma.JsonNull is used.
Expected database behavior: previews always reference a real persisted RoomState id.
```

## Checkpoint

What this does: checks the provider and orchestrator imports.

Why it is needed: API routes will call these functions next, so this layer should be clean first.

```powershell
npm run lint
```
