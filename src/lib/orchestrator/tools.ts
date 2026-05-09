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
  const lockedObjects = roomState.objects.filter(
    (object) => object.lockedStatus !== "editable",
  );
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
    id: undefined,
    projectId: current.projectId,
    version: current.version + 1,
    source: "user_patch",
    createdAt: new Date().toISOString(),
  };
}

