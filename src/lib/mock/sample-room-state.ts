import type {
  DesignPlan,
  FidelityReport,
  PreviewResult,
  RawRoomAnalysis,
  RoomGrid,
  RoomStateSnapshot,
} from "@/lib/types/room-remix";

const gridCells = Array.from({ length: 16 }, (_, index) => {
  const row = Math.floor(index / 4);
  const column = index % 4;
  const rowLabel = String.fromCharCode(65 + row);

  return {
    id: `${rowLabel}${column + 1}`,
    row,
    column,
    label: `${rowLabel}${column + 1}`,
  };
});

export const sampleGrid: RoomGrid = {
  rows: 4,
  columns: 4,
  cells: gridCells,
};

export const sampleRoomState: RoomStateSnapshot = {
  version: 1,
  source: "mock",
  roomShell: {
    roomType: "bedroom workspace",
    architecture: ["left wall window", "rectangular room", "plain back wall"],
    visibleConstraints: [
      "bed must stay in place",
      "desk area is tight",
      "rental-friendly wall changes",
    ],
    lighting: "soft natural daylight from the left side",
    dominantColors: ["white", "warm wood", "charcoal", "muted beige"],
    surfaces: {
      walls: "plain white painted walls",
      floor: "medium warm wood floor",
      ceiling: "flat white ceiling",
    },
  },
  camera: {
    angle: "front-left corner looking toward bed and desk",
    distance: "medium wide shot",
    height: "standing eye level",
    notes: "The preview should preserve the same camera angle and room proportions.",
  },
  grid: sampleGrid,
  objects: [
    {
      id: "window-left",
      type: "window",
      label: "Left window",
      description: "A rectangular window on the left wall bringing natural light.",
      gridPosition: "A1-B1",
      approximateSize: "large",
      color: "white frame",
      material: "glass",
      confidence: 0.94,
      lockedStatus: "locked",
      confirmationStatus: "ai_detected",
    },
    {
      id: "bed-main",
      type: "bed",
      label: "Main bed",
      description: "Bed against the back wall with editable textiles.",
      gridPosition: "B2-C3",
      approximateSize: "queen",
      color: "neutral bedding",
      material: "fabric and wood",
      confidence: 0.91,
      lockedStatus: "soft_locked",
      confirmationStatus: "ai_detected",
    },
    {
      id: "desk-right",
      type: "desk",
      label: "Right desk",
      description: "Compact desk and chair on the right side of the room.",
      gridPosition: "C4-D4",
      approximateSize: "small",
      color: "dark desk surface",
      material: "wood or laminate",
      confidence: 0.86,
      lockedStatus: "soft_locked",
      confirmationStatus: "ai_detected",
    },
    {
      id: "wall-above-bed",
      type: "wall_decor",
      label: "Wall area above bed",
      description: "Open wall area suitable for art, mirror, shelf, or textile decor.",
      gridPosition: "A2-A3",
      approximateSize: "medium",
      confidence: 0.78,
      lockedStatus: "editable",
      confirmationStatus: "ai_detected",
    },
    {
      id: "floor-center",
      type: "rug",
      label: "Center floor area",
      description: "Open floor area where a rug could soften the room.",
      gridPosition: "C2-D3",
      approximateSize: "medium",
      confidence: 0.72,
      lockedStatus: "editable",
      confirmationStatus: "ai_detected",
    },
  ],
  relations: [
    {
      subjectObjectId: "window-left",
      relationType: "left_of",
      targetObjectId: "bed-main",
      confidence: 0.9,
    },
    {
      subjectObjectId: "desk-right",
      relationType: "right_of",
      targetObjectId: "bed-main",
      confidence: 0.86,
    },
    {
      subjectObjectId: "wall-above-bed",
      relationType: "above",
      targetObjectId: "bed-main",
      confidence: 0.82,
    },
    {
      subjectObjectId: "floor-center",
      relationType: "in_front_of",
      targetObjectId: "bed-main",
      confidence: 0.74,
    },
  ],
  editContract: [
    {
      objectId: "window-left",
      identityLock: true,
      positionLock: true,
      appearanceLock: true,
      softLock: false,
      editableFields: [],
      reason: "Architectural element and visual source-of-truth anchor.",
      confirmedByUser: false,
    },
    {
      objectId: "bed-main",
      identityLock: true,
      positionLock: true,
      appearanceLock: false,
      softLock: true,
      editableFields: ["bedding", "pillows", "throw blanket", "color palette"],
      reason: "Large furniture should stay in place, but textiles can change.",
      confirmedByUser: false,
    },
    {
      objectId: "desk-right",
      identityLock: true,
      positionLock: true,
      appearanceLock: false,
      softLock: true,
      editableFields: ["lamp", "desk plant", "organizer", "surrounding lighting"],
      reason: "Desk placement should remain stable for fidelity.",
      confirmedByUser: false,
    },
    {
      objectId: "wall-above-bed",
      identityLock: false,
      positionLock: false,
      appearanceLock: false,
      softLock: false,
      editableFields: ["art", "mirror", "shelf", "textile hanging"],
      reason: "Empty wall area is a high-impact design zone.",
      confirmedByUser: false,
    },
  ],
  preferences: {
    style: "Warm Modern",
    budget: "Medium",
    goal: "More cozy",
    constraints: ["Keep existing furniture", "Rental-friendly"],
    freeformNotes: "Make it feel warmer without moving the bed or desk.",
  },
  patches: [],
};

export const sampleRawRoomAnalysis: RawRoomAnalysis = {
  summary:
    "Detected a bedroom workspace with a left-side window, main bed, right-side desk, and open wall area above the bed.",
  detectedRoomType: "bedroom workspace",
  confidence: 0.88,
  extractedObjects: sampleRoomState.objects,
  visibleConstraints: sampleRoomState.roomShell.visibleConstraints,
  suggestedQuestions: [
    "Should the left window stay exactly as shown?",
    "Should the bed stay in its current position?",
    "Is the desk on the right side of the room?",
    "Can we add decor above the bed?",
  ],
};

export const sampleDesignPlan: DesignPlan = {
  palette: [
    { name: "Warm White", hex: "#F7F2EA", role: "wall and bedding base" },
    { name: "Soft Clay", hex: "#C9855A", role: "accent textiles" },
    { name: "Muted Olive", hex: "#6F7A55", role: "plant and decor accent" },
    { name: "Matte Black", hex: "#252525", role: "lamp and desk accents" },
  ],
  lightingPlan: [
    "Add a warm floor lamp near D3 without blocking the desk path.",
    "Use a small desk lamp to make the workspace feel intentional.",
    "Keep the natural left-window daylight visible and unchanged.",
  ],
  furnitureOrDecorSuggestions: [
    "Add a low-pile neutral rug in C2-D3.",
    "Add two framed abstract prints above the bed in A2-A3.",
    "Use linen bedding with a soft clay throw blanket.",
    "Add a small desk plant near the right desk area.",
  ],
  layoutSuggestions: [
    "Preserve bed and desk positions.",
    "Keep the window clear.",
    "Use decor and textiles for change instead of moving furniture.",
  ],
  stepByStepActionPlan: [
    "Confirm locked window, bed, and desk positions.",
    "Select warm modern palette.",
    "Apply textile and wall decor patches.",
    "Generate preview from the original photo and current Room State.",
    "Validate fidelity before accepting the preview.",
  ],
  rationale:
    "The room can feel warmer and more cohesive without changing the core layout by focusing on lighting, textiles, wall decor, and a rug.",
  designPatches: [
    {
      id: "patch-rug-c2-d3",
      operation: "add",
      targetObjectOrArea: "floor-center",
      targetGridPosition: "C2-D3",
      reason: "A rug softens the floor and visually anchors the bed area.",
      status: "proposed",
    },
    {
      id: "patch-wall-art-a2-a3",
      operation: "add",
      targetObjectOrArea: "wall-above-bed",
      targetGridPosition: "A2-A3",
      reason: "Wall art adds personality without changing architecture.",
      status: "proposed",
    },
    {
      id: "patch-preserve-window",
      operation: "preserve",
      targetObjectOrArea: "window-left",
      targetGridPosition: "A1-B1",
      reason: "The window is locked and should remain unchanged.",
      status: "proposed",
    },
  ],
};

export const samplePreview: PreviewResult = {
  generatedImageUrl: "/preview-placeholder.svg",
  promptSummary:
    "Preserve camera angle, window, bed, and desk. Apply warm modern palette, neutral rug, linen bedding, wall art, and warm lighting.",
  generationProvider: "mock",
};

export const sampleFidelityReport: FidelityReport = {
  systemScore: 0.86,
  windowPreserved: true,
  cameraAnglePreserved: true,
  bedPositionPreserved: true,
  deskPositionPreserved: true,
  lockedObjectsPreserved: true,
  styleApplied: true,
  unexpectedChanges: ["Mock preview cannot verify pixel-level fidelity."],
  recommendedAction:
    "Ask the user for fidelity confirmation, then keep or regenerate with stronger constraints.",
};

