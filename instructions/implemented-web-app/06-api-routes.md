# 06 - API Routes

## Step 1 - Create `src/app/api/uploads/route.ts`

What this file does: accepts a room photo upload and stores it under `public/uploads`.

Why it is needed: the original uploaded image is the visual source of truth for the Room Remix workflow.

Create `room-remix/src/app/api/uploads/route.ts`:

```ts
import { NextResponse } from "next/server";
import { saveLocalUpload } from "@/lib/storage/local";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Upload must include a file field." }, { status: 400 });
    }

    const upload = await saveLocalUpload(file);
    return NextResponse.json(upload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 },
    );
  }
}
```

Copy checkpoint:

```text
Expected path: src/app/api/uploads/route.ts
Expected behavior: multipart file uploads return a local /uploads/... URL.
```

## Step 2 - Create `src/app/api/projects/route.ts`

What this file does: creates a project record and attaches the uploaded image URL as the source photo.

Why it is needed: every room workflow needs a project container for photos, states, previews, reports, and events.

Create `room-remix/src/app/api/projects/route.ts`:

```ts
import { NextResponse } from "next/server";
import { captureRoomProject } from "@/lib/orchestrator/room-remix-orchestrator";
import { createProjectSchema } from "@/lib/types/schemas";

export async function POST(request: Request) {
  try {
    const body = createProjectSchema.parse(await request.json());
    const project = await captureRoomProject(body);

    return NextResponse.json({ project });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Project creation failed." },
      { status: 400 },
    );
  }
}
```

Copy checkpoint:

```text
Expected path: src/app/api/projects/route.ts
Expected database effect: creates Project, RoomPhoto, and room.capture InteractionEvent.
```

## Step 3 - Create `src/app/api/projects/[projectId]/analyze/route.ts`

What this file does: runs room analysis and creates the first persisted Room State version.

Why it is needed: the app should turn the photo into structured state before making design suggestions.

Create `room-remix/src/app/api/projects/[projectId]/analyze/route.ts`:

```ts
import { NextResponse } from "next/server";
import { analyzeProjectRoom } from "@/lib/orchestrator/room-remix-orchestrator";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    const result = await analyzeProjectRoom(projectId);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Room analysis failed." },
      { status: 400 },
    );
  }
}
```

Copy checkpoint:

```text
Expected path: src/app/api/projects/[projectId]/analyze/route.ts
Expected database effect: creates the first RoomState version and marks it active.
```

## Step 4 - Create `src/app/api/projects/[projectId]/state/route.ts`

What this file does: saves a user-corrected Room State as a new version.

Why it is needed: confirmations and refinements should patch the canonical state instead of getting lost in UI-only memory.

Create `room-remix/src/app/api/projects/[projectId]/state/route.ts`:

```ts
import { NextResponse } from "next/server";
import { patchProjectRoomState } from "@/lib/orchestrator/room-remix-orchestrator";
import { patchRoomStateSchema } from "@/lib/types/schemas";
import type { RoomStateSnapshot } from "@/lib/types/room-remix";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    const body = patchRoomStateSchema.parse(await request.json());
    const roomState = await patchProjectRoomState({
      projectId,
      roomState: body.roomState as RoomStateSnapshot,
      eventSummary: body.eventSummary,
    });

    return NextResponse.json({ roomState });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Room State patch failed." },
      { status: 400 },
    );
  }
}
```

Copy checkpoint:

```text
Expected path: src/app/api/projects/[projectId]/state/route.ts
Expected database effect: creates a new RoomState version after user confirmation or patch refinement.
```

## Step 5 - Create `src/app/api/projects/[projectId]/plan/route.ts`

What this file does: generates a design board and atomic design patches from the active Room State.

Why it is needed: the design plan should be grounded in state, preferences, grid positions, and locks.

Create `room-remix/src/app/api/projects/[projectId]/plan/route.ts`:

```ts
import { NextResponse } from "next/server";
import { generatePlanForProject } from "@/lib/orchestrator/room-remix-orchestrator";
import { designPreferencesSchema } from "@/lib/types/schemas";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    const preferences = designPreferencesSchema.parse(await request.json());
    const roomState = await generatePlanForProject({ projectId, preferences });

    return NextResponse.json({ roomState });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Design planning failed." },
      { status: 400 },
    );
  }
}
```

Copy checkpoint:

```text
Expected path: src/app/api/projects/[projectId]/plan/route.ts
Expected database effect: creates a new RoomState version with preferences, designPlan, and patches.
```

## Step 6 - Create `src/app/api/projects/[projectId]/preview/route.ts`

What this file does: generates a preview and immediately validates fidelity.

Why it is needed: the preview should never be shown without the system also checking whether locked room elements stayed faithful.

Create `room-remix/src/app/api/projects/[projectId]/preview/route.ts`:

```ts
import { NextResponse } from "next/server";
import { generatePreviewForProject } from "@/lib/orchestrator/room-remix-orchestrator";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    const result = await generatePreviewForProject(projectId);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Preview generation failed." },
      { status: 400 },
    );
  }
}
```

Copy checkpoint:

```text
Expected path: src/app/api/projects/[projectId]/preview/route.ts
Expected database effect: creates Preview and FidelityReport in the same workflow step.
```

## Step 7 - Create `src/app/api/projects/[projectId]/feedback/route.ts`

What this file does: records the user's fidelity judgment for a preview.

Why it is needed: user validation is part of the verifiable agent story. The system checks fidelity, then the human confirms or corrects it.

Create `room-remix/src/app/api/projects/[projectId]/feedback/route.ts`:

```ts
import { NextResponse } from "next/server";
import { recordFidelityFeedback } from "@/lib/orchestrator/room-remix-orchestrator";
import { fidelityFeedbackSchema } from "@/lib/types/schemas";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    const body = fidelityFeedbackSchema.parse(await request.json());
    const report = await recordFidelityFeedback({
      projectId,
      previewId: body.previewId,
      status: body.status,
      notes: body.notes,
      changedElements: body.changedElements,
    });

    return NextResponse.json({ report });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Fidelity feedback failed." },
      { status: 400 },
    );
  }
}
```

Copy checkpoint:

```text
Expected path: src/app/api/projects/[projectId]/feedback/route.ts
Expected database effect: updates Preview.userFidelityStatus and FidelityReport.userFeedback.
```

## Next.js Version Note

What this note does: helps you fix a route context type mismatch if your installed Next.js version differs.

Why it is needed: Next.js changed dynamic route params to async in newer releases.

If TypeScript complains about `params: Promise<{ projectId: string }>`, replace each route context with this older form:

```ts
interface RouteContext {
  params: { projectId: string };
}

const { projectId } = context.params;
```

## Checkpoint

What this does: verifies that the API route files can import the orchestrator and schemas.

Why it is needed: the UI will call these routes next.

```powershell
npm run lint
```
