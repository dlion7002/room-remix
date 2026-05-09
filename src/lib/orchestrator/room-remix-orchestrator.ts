import { Prisma, type RoomState as RoomStateRecord } from "@/generated/prisma/client";
import { getRoomAiProvider } from "@/lib/ai";
import { getGenericCatalogOptions } from "@/lib/catalog/design-catalog";
import { db } from "@/lib/db";
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
    id: undefined,
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

function optionalJson<T>(value: unknown): T | undefined {
  return value === null ? undefined : (value as T);
}

function fromJson<T>(value: unknown): T {
  return value as T;
}

function toRoomStateSnapshot(record: RoomStateRecord): RoomStateSnapshot {
  return {
    id: record.id,
    projectId: record.projectId,
    version: record.version,
    roomShell: fromJson<RoomStateSnapshot["roomShell"]>(record.roomShell),
    camera: fromJson<RoomStateSnapshot["camera"]>(record.camera),
    grid: fromJson<RoomStateSnapshot["grid"]>(record.grid),
    objects: fromJson<RoomStateSnapshot["objects"]>(record.objects),
    relations: fromJson<RoomStateSnapshot["relations"]>(record.relations),
    editContract: fromJson<RoomStateSnapshot["editContract"]>(record.editContract),
    preferences: optionalJson<RoomStateSnapshot["preferences"]>(record.preferences),
    designPlan: optionalJson<RoomStateSnapshot["designPlan"]>(record.designPlan),
    patches: fromJson<RoomStateSnapshot["patches"]>(record.patches),
    source: record.source as RoomStateSnapshot["source"],
    createdAt: record.createdAt.toISOString(),
  };
}
