# 04 - Mock Data And Generic Catalog

## Step 1 - Create `src/lib/mock/sample-room-state.ts`

What this file does: provides a complete fake room analysis, Room State, design plan, preview, and fidelity report.

Why it is needed: the app must be demoable before Gemini, OpenAI, CopilotKit, AG-UI, or A2UI integrations are available.

Create `room-remix/src/lib/mock/sample-room-state.ts`:

```ts
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
    visibleConstraints: ["bed must stay in place", "desk area is tight", "rental-friendly wall changes"],
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
```

Copy checkpoint:

```text
Expected path: src/lib/mock/sample-room-state.ts
Expected compile status: mock analysis, Room State, design plan, preview, and fidelity report satisfy the shared TypeScript types.
Expected learning check: this file is the contract real AI providers must eventually match.
```

## Step 2 - Create `src/lib/catalog/design-catalog.ts`

What this file does: defines generic design archetypes and a filter helper.

Why it is needed: the skeleton should avoid real product APIs and still let the agent recommend structured items.

Create `room-remix/src/lib/catalog/design-catalog.ts`:

```ts
import type {
  BudgetTier,
  DesignCatalogItem,
  DesignConstraint,
  DesignGoal,
  DesignStyle,
} from "@/lib/types/room-remix";

export const designCatalog: DesignCatalogItem[] = [
  {
    id: "lamp-paper-floor",
    name: "Paper Floor Lamp",
    category: "lamp",
    compatibleStyles: ["Japandi", "Minimal", "Warm Modern"],
    priceTier: "Medium",
    materials: ["paper shade", "wood base"],
    visualEffect: "soft diffuse glow",
    placementSuggestions: ["D3", "near reading corner", "beside bed path"],
    constraintsCompatibility: ["Rental-friendly", "No drilling"],
  },
  {
    id: "lamp-black-arc",
    name: "Black Arc Lamp",
    category: "lamp",
    compatibleStyles: ["Industrial", "Warm Modern", "Minimal"],
    priceTier: "High",
    materials: ["metal", "matte black finish"],
    visualEffect: "graphic statement lighting",
    placementSuggestions: ["D3", "beside desk", "over rug zone"],
    constraintsCompatibility: ["Rental-friendly"],
  },
  {
    id: "rug-jute-neutral",
    name: "Jute Neutral Rug",
    category: "rug",
    compatibleStyles: ["Japandi", "Bohemian", "Warm Modern"],
    priceTier: "Medium",
    materials: ["jute", "natural fibers"],
    visualEffect: "adds warmth and texture",
    placementSuggestions: ["C2-D3", "under front half of bed"],
    constraintsCompatibility: ["Pet-safe", "Rental-friendly"],
  },
  {
    id: "rug-geometric-low-pile",
    name: "Geometric Low-Pile Rug",
    category: "rug",
    compatibleStyles: ["Industrial", "Minimal", "Warm Modern"],
    priceTier: "Low",
    materials: ["synthetic low-pile fibers"],
    visualEffect: "adds structure without visual clutter",
    placementSuggestions: ["C2-D3", "desk-side floor zone"],
    constraintsCompatibility: ["Pet-safe", "Rental-friendly"],
  },
  {
    id: "decor-framed-abstract",
    name: "Framed Abstract Art",
    category: "wall_decor",
    compatibleStyles: ["Minimal", "Warm Modern", "Industrial"],
    priceTier: "Medium",
    materials: ["paper print", "wood frame"],
    visualEffect: "creates focal point above furniture",
    placementSuggestions: ["A2-A3", "above bed", "above desk"],
    constraintsCompatibility: ["Rental-friendly"],
  },
  {
    id: "decor-round-mirror",
    name: "Round Mirror",
    category: "wall_decor",
    compatibleStyles: ["Japandi", "Warm Modern", "Bohemian"],
    priceTier: "High",
    materials: ["glass", "thin metal or wood frame"],
    visualEffect: "reflects light and opens the room",
    placementSuggestions: ["A2-A3", "above bed if mounting is allowed"],
    constraintsCompatibility: ["Rental-friendly"],
  },
  {
    id: "plant-tall-floor",
    name: "Tall Floor Plant",
    category: "plant",
    compatibleStyles: ["Bohemian", "Japandi", "Warm Modern"],
    priceTier: "Medium",
    materials: ["ceramic planter", "green foliage"],
    visualEffect: "adds height and organic shape",
    placementSuggestions: ["D3", "near window", "empty corner"],
    constraintsCompatibility: ["Rental-friendly"],
  },
  {
    id: "textile-linen-bedding",
    name: "Linen Bedding",
    category: "textile",
    compatibleStyles: ["Minimal", "Japandi", "Warm Modern"],
    priceTier: "Medium",
    materials: ["linen", "cotton"],
    visualEffect: "softens the bed and adds relaxed texture",
    placementSuggestions: ["B2-C3", "main bed"],
    constraintsCompatibility: ["Keep existing furniture", "Rental-friendly"],
  },
];

export interface CatalogFilter {
  style?: DesignStyle;
  budget?: BudgetTier;
  goal?: DesignGoal;
  constraints?: DesignConstraint[];
  category?: DesignCatalogItem["category"];
}

export function getGenericCatalogOptions(filter: CatalogFilter = {}) {
  return designCatalog.filter((item) => {
    const matchesStyle = filter.style ? item.compatibleStyles.includes(filter.style) : true;
    const matchesBudget = filter.budget ? priceAllowed(item.priceTier, filter.budget) : true;
    const matchesCategory = filter.category ? item.category === filter.category : true;
    const matchesConstraints = filter.constraints?.length
      ? filter.constraints.every((constraint) =>
          item.constraintsCompatibility.includes(constraint),
        )
      : true;

    return matchesStyle && matchesBudget && matchesCategory && matchesConstraints;
  });
}

function priceAllowed(itemTier: BudgetTier, selectedBudget: BudgetTier) {
  const rank: Record<BudgetTier, number> = {
    Low: 1,
    Medium: 2,
    High: 3,
  };

  return rank[itemTier] <= rank[selectedBudget];
}
```

Copy checkpoint:

```text
Expected path: src/lib/catalog/design-catalog.ts
Expected behavior: catalog filtering works by style, budget, constraints, and category without real product APIs.
```

## Step 3 - Create `public/preview-placeholder.svg`

What this file does: gives the mock preview panel an image-like placeholder.

Why it is needed: the preview workflow can be shown before real image generation is connected.

Create `room-remix/public/preview-placeholder.svg`:

```xml
<svg width="1200" height="800" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="800" fill="#F7F2EA"/>
  <rect x="80" y="80" width="1040" height="640" rx="20" fill="#FFFFFF" stroke="#252525" stroke-width="6"/>
  <rect x="135" y="135" width="210" height="185" rx="12" fill="#DDE7EA" stroke="#252525" stroke-width="4"/>
  <rect x="430" y="350" width="390" height="220" rx="18" fill="#D8C4A6" stroke="#252525" stroke-width="4"/>
  <rect x="465" y="305" width="330" height="70" rx="14" fill="#F2E6D8" stroke="#252525" stroke-width="4"/>
  <rect x="835" y="415" width="170" height="95" rx="10" fill="#3A302A" stroke="#252525" stroke-width="4"/>
  <circle cx="950" cy="335" r="42" fill="#C9855A" stroke="#252525" stroke-width="4"/>
  <rect x="320" y="610" width="550" height="52" rx="26" fill="#BCA88E" stroke="#252525" stroke-width="4"/>
  <text x="600" y="745" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" fill="#252525">Mock Room Remix Preview</text>
</svg>
```

Copy checkpoint:

```text
Expected path: public/preview-placeholder.svg
Expected browser behavior: /preview-placeholder.svg opens directly in the browser.
```

## Checkpoint

What this does: verifies that mock files and catalog code compile.

Why it is needed: provider and UI files will import these exports next.

```powershell
npm run lint
```
