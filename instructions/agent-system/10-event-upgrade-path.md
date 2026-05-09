# 10 - Event Upgrade Path

## Upgrade Principle

What this section does: defines how to add real event tools without breaking the mock demo.

Why it is needed: hackathon APIs may arrive late. The safest strategy is to keep mock mode working while adding real providers behind adapter boundaries.

Never delete the mock provider. Add real providers next to it.

```text
src/lib/ai/mock-provider.ts
src/lib/ai/gemini-provider.ts
src/lib/ai/openai-provider.ts
src/lib/ai/event-provider.ts
```

## Step 1 - Create `src/lib/ai/prompts.ts`

What this file does: stores stable system instructions for analysis, planning, preview generation, and validation.

Why it is needed: prompts should be reusable and versionable instead of hidden inside route handlers.

Create `room-remix/src/lib/ai/prompts.ts`:

```ts
export const ROOM_ANALYSIS_SYSTEM_PROMPT = `
You analyze a room photo for Room Remix, a verifiable room-state interior design agent.

Extract only visible facts. Return structured information about room type, camera angle,
architectural elements, fixed furniture, editable areas, confidence, grid placement,
relations, and confirmation questions.

Do not produce a design plan yet.
`;

export const DESIGN_PLAN_SYSTEM_PROMPT = `
You generate a design plan from a canonical Room State.

Use the existing room layout, grid positions, relation graph, edit contract,
user preferences, and generic catalog options. Propose atomic design patches.

Do not invent real product availability or prices.
Do not move locked objects.
`;

export const PREVIEW_GENERATION_SYSTEM_PROMPT = `
Generate or edit a preview from the original room image and current Room State.

Preserve locked architecture, camera angle, room layout, fixed objects, and all
do-not-change rules. Apply only accepted design patches and selected style choices.
`;

export const FIDELITY_VALIDATION_SYSTEM_PROMPT = `
Compare the original room image and generated preview.

Evaluate whether the camera angle, locked objects, window, bed position, desk position,
architecture, and selected style were preserved or applied. Return structured results.
`;
```

Copy checkpoint:

```text
Expected path: src/lib/ai/prompts.ts
Expected behavior: prompts are reusable constants, not hidden inside API routes.
```

## Step 2 - Create A Real Provider File When APIs Are Available

What this file does: gives you a safe place to connect Gemini, OpenAI, Anthropic, or the event-provided API.

Why it is needed: real models should return the same types as the mock provider so the app flow does not change.

Create `room-remix/src/lib/ai/event-provider.ts` when you know the event API:

```ts
import type { RoomAiProvider } from "@/lib/ai/provider";
import {
  sampleDesignPlan,
  sampleFidelityReport,
  samplePreview,
  sampleRawRoomAnalysis,
} from "@/lib/mock/sample-room-state";

export const eventRoomAiProvider: RoomAiProvider = {
  name: "event",

  async analyzeRoom(input) {
    console.info("Replace with real vision call", input.imageUrl);
    return sampleRawRoomAnalysis;
  },

  async generateDesignPlan(input) {
    console.info("Replace with real planning call", input.preferences);
    return sampleDesignPlan;
  },

  async generatePreview(input) {
    console.info("Replace with real image generation call", input.prompt);
    return samplePreview;
  },

  async validateFidelity(input) {
    console.info("Replace with real vision comparison call", {
      originalImageUrl: input.originalImageUrl,
      generatedImageUrl: input.generatedImageUrl,
    });
    return sampleFidelityReport;
  },
};
```

Copy checkpoint:

```text
Expected path: src/lib/ai/event-provider.ts
Expected behavior: this provider compiles as a stub before real APIs are connected.
```

This starts as a pass-through provider. Replace one method at a time as real APIs become available.

## Step 3 - Update `src/lib/ai/index.ts`

What this change does: lets the app use either mock mode or event mode through an environment variable.

Why it is needed: you can switch providers without touching UI, API, or database code.

Replace `room-remix/src/lib/ai/index.ts`:

```ts
import { eventRoomAiProvider } from "@/lib/ai/event-provider";
import { mockRoomAiProvider } from "@/lib/ai/mock-provider";
import type { RoomAiProvider } from "@/lib/ai/provider";

export function getRoomAiProvider(): RoomAiProvider {
  const providerName = process.env.ROOM_REMIX_AI_PROVIDER ?? "mock";

  if (providerName === "mock") {
    return mockRoomAiProvider;
  }

  if (providerName === "event") {
    return eventRoomAiProvider;
  }

  throw new Error(`Unknown ROOM_REMIX_AI_PROVIDER: ${providerName}`);
}
```

Copy checkpoint:

```text
Expected path: src/lib/ai/index.ts
Expected behavior: ROOM_REMIX_AI_PROVIDER can switch between "mock" and "event".
```

Then update `.env.local`:

```env
ROOM_REMIX_AI_PROVIDER="event"
```

Switch back anytime:

```env
ROOM_REMIX_AI_PROVIDER="mock"
```

## Step 4 - Create `src/lib/generative-ui/component-registry.ts`

What this file does: defines the UI components the agent is allowed to drive or fill.

Why it is needed: A2UI, AG-UI, CopilotKit, and MCP Apps all benefit from a stable component vocabulary.

Create the folder:

```powershell
New-Item -ItemType Directory -Force src/lib/generative-ui
```

Create `room-remix/src/lib/generative-ui/component-registry.ts`:

```ts
export const roomRemixComponentRegistry = [
  {
    id: "room.upload",
    component: "RoomUploadCard",
    purpose: "Capture source room image and create project.",
  },
  {
    id: "room.analysis",
    component: "RoomAnalysisPanel",
    purpose: "Show extracted room facts and confirmation questions.",
  },
  {
    id: "room.grid",
    component: "RoomGridOverlay",
    purpose: "Show object positions and grid references.",
  },
  {
    id: "room.confirmation",
    component: "DetectedObjectsConfirmation",
    purpose: "Let the user confirm locks and editable elements.",
  },
  {
    id: "design.preferences",
    component: "DesignPreferencesPanel",
    purpose: "Collect style, budget, goal, constraints, and notes.",
  },
  {
    id: "design.board",
    component: "DesignBoard",
    purpose: "Render generated palette, plan, rationale, and patches.",
  },
  {
    id: "design.refinement",
    component: "ElementRefinementPanel",
    purpose: "Accept or reject atomic design patches.",
  },
  {
    id: "preview.panel",
    component: "PreviewPanel",
    purpose: "Show generated preview and prompt summary.",
  },
  {
    id: "preview.fidelity",
    component: "FidelityReportCard",
    purpose: "Show validation and collect user fidelity feedback.",
  },
  {
    id: "state.inspector",
    component: "RoomStateInspector",
    purpose: "Expose the canonical Room State for demo value.",
  },
  {
    id: "agent.trace",
    component: "AgentTracePanel",
    purpose: "Show tool sequence and orchestration events.",
  },
] as const;
```

Copy checkpoint:

```text
Expected path: src/lib/generative-ui/component-registry.ts
Expected behavior: event protocols have a stable list of UI components they can drive or fill.
```

## Step 5 - Add CopilotKit, AG-UI, A2UI, Or MCP Only After The Core Flow Works

What this step does: keeps event-specific integration scoped.

Why it is needed: the project should not become blocked by protocol setup before the product flow works.

Use this order:

```text
1. Keep mock workflow working.
2. Add event provider behind RoomAiProvider.
3. Add component registry.
4. Wire CopilotKit, AG-UI, A2UI, or MCP to call existing API routes.
5. Let the protocol choose or fill components from the registry.
6. Keep the Room State as the canonical source of truth.
```

## Step 6 - Real Vision Analysis Upgrade

What this upgrade does: replaces `analyzeRoom` in `event-provider.ts`.

Why it is needed: this is the first high-value real AI feature because it turns the photo into Room State.

Target output:

```ts
{
  summary: "Detected a bedroom workspace...",
  detectedRoomType: "bedroom workspace",
  confidence: 0.88,
  extractedObjects: [
    {
      id: "window-left",
      type: "window",
      label: "Left window",
      description: "A rectangular window on the left wall.",
      gridPosition: "A1-B1",
      approximateSize: "large",
      confidence: 0.94,
      lockedStatus: "locked",
      confirmationStatus: "ai_detected"
    }
  ],
  visibleConstraints: ["bed must stay in place"],
  suggestedQuestions: ["Should the bed stay in its current position?"]
}
```

## Step 7 - Real Preview Upgrade

What this upgrade does: replaces `generatePreview` in `event-provider.ts`.

Why it is needed: this is the most visual hackathon payoff, but it should still be constrained by Room State.

The method should receive:

```text
original image URL
Room State
locked objects
grid positions
accepted patches
preview prompt
do-not-change rules
```

The method should return:

```ts
{
  generatedImageUrl: "/uploads/generated-preview.png",
  promptSummary: "Preserve camera angle, window, bed, and desk...",
  generationProvider: "event"
}
```

## Step 8 - Real Fidelity Upgrade

What this upgrade does: replaces `validateFidelity` in `event-provider.ts`.

Why it is needed: this protects the project from looking like a fragile image-generation wrapper.

Target output:

```ts
{
  systemScore: 0.84,
  windowPreserved: true,
  cameraAnglePreserved: true,
  bedPositionPreserved: true,
  deskPositionPreserved: false,
  lockedObjectsPreserved: false,
  styleApplied: true,
  unexpectedChanges: ["Desk shifted closer to the bed."],
  recommendedAction: "Regenerate with stronger desk position constraints."
}
```

## Event-Day Priority List

What this list does: gives you a survival order when time is short.

Why it is needed: the goal is a working, explainable demo, not a perfect interior design platform.

1. Keep the mock flow running.
2. Connect real vision analysis if possible.
3. Connect real preview generation if possible.
4. Connect real fidelity validation if possible.
5. Add CopilotKit, AG-UI, A2UI, or MCP protocol UI.
6. Polish the visual layout only after the flow is reliable.

## What To Avoid

Do not spend early event time on:

- real shopping APIs;
- full 3D reconstruction;
- AR previews;
- drag-and-drop floor planning;
- multiple autonomous agents;
- unlimited image regeneration;
- pixel-perfect styling before the workflow works.

## Known Limitations

What this section does: names what the skeleton does not prove yet.

Why it is needed: clear limitations make the demo more credible and help you explain upgrade priorities.

- Mock preview images do not validate real visual fidelity.
- Local uploads are not production-grade storage.
- The event provider is intentionally a stub until event APIs are known.
- Real product search is intentionally out of scope for the skeleton.
- Mock mode should remain available as a fallback after real providers are added.
