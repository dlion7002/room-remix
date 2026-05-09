# 07 - UI Components

## Step 1 - Create `src/components/room/RoomUploadCard.tsx`

What this file does: lets the user upload a room photo or start from a mock source image.

Why it is needed: every Room Remix project begins with a source-of-truth room image.

Create `room-remix/src/components/room/RoomUploadCard.tsx`:

```tsx
"use client";

import { useState } from "react";
import { ImageUp, Loader2, Sparkles } from "lucide-react";

interface RoomUploadCardProps {
  onProjectReady: (input: { projectId: string; imageUrl: string }) => void;
}

export function RoomUploadCard({ onProjectReady }: RoomUploadCardProps) {
  const [title, setTitle] = useState("Warm modern bedroom remix");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createProject(useMockImage = false) {
    setIsLoading(true);
    setError(null);

    try {
      let imageUrl = "/preview-placeholder.svg";

      if (!file && !useMockImage) {
        throw new Error("Choose a room photo or use the mock room.");
      }

      if (file && !useMockImage) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await fetch("/api/uploads", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Image upload failed.");
        }

        const upload = (await uploadResponse.json()) as { url: string };
        imageUrl = upload.url;
      }

      const projectResponse = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, imageUrl }),
      });

      if (!projectResponse.ok) {
        throw new Error("Project creation failed.");
      }

      const data = await projectResponse.json();
      onProjectReady({ projectId: data.project.id, imageUrl });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-900 text-white">
          <ImageUp size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">Source room</h2>
          <p className="text-sm text-zinc-600">Upload the image the agent must preserve.</p>
        </div>
      </div>

      <label className="block text-sm font-medium text-zinc-700">Project title</label>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
      />

      <label className="mt-4 block text-sm font-medium text-zinc-700">Room photo</label>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        className="mt-1 w-full rounded-md border border-dashed border-zinc-300 p-3 text-sm"
      />

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void createProject(false)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : <ImageUp size={16} />}
          Create from upload
        </button>
        <button
          type="button"
          onClick={() => void createProject(true)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-60"
        >
          <Sparkles size={16} />
          Use mock room
        </button>
      </div>
    </section>
  );
}
```

## Step 2 - Create `src/components/room/RoomAnalysisPanel.tsx`

What this file does: shows the mock or real vision analysis summary.

Why it is needed: judges should see that the system extracts structured visual facts before making design suggestions.

Create `room-remix/src/components/room/RoomAnalysisPanel.tsx`:

```tsx
import type { RawRoomAnalysis } from "@/lib/types/room-remix";

interface RoomAnalysisPanelProps {
  analysis?: RawRoomAnalysis;
  onAnalyze: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function RoomAnalysisPanel({
  analysis,
  onAnalyze,
  disabled,
  isLoading,
}: RoomAnalysisPanelProps) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">Room analysis</h2>
          <p className="text-sm text-zinc-600">Visual facts extracted from the source image.</p>
        </div>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={disabled || isLoading}
          className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isLoading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {analysis ? (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-zinc-800">{analysis.summary}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Room type" value={analysis.detectedRoomType} />
            <Metric label="Confidence" value={`${Math.round(analysis.confidence * 100)}%`} />
            <Metric label="Objects" value={String(analysis.extractedObjects.length)} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Targeted confirmation questions</h3>
            <ul className="mt-2 space-y-1 text-sm text-zinc-700">
              {analysis.suggestedQuestions.map((question) => (
                <li key={question}>- {question}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">Create a project, then run analysis.</p>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-200 p-3">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-950">{value}</p>
    </div>
  );
}
```

## Step 3 - Create `src/components/room/RoomGridOverlay.tsx`

What this file does: visualizes the simple grid and maps detected objects into cells.

Why it is needed: grid positions make the state visible and help constrain preview generation.

Create `room-remix/src/components/room/RoomGridOverlay.tsx`:

```tsx
import Image from "next/image";
import type { RoomStateSnapshot } from "@/lib/types/room-remix";

interface RoomGridOverlayProps {
  imageUrl?: string;
  roomState?: RoomStateSnapshot;
}

export function RoomGridOverlay({ imageUrl, roomState }: RoomGridOverlayProps) {
  const cells = roomState?.grid.cells ?? [];

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-950">Grid map</h2>
      <p className="text-sm text-zinc-600">A simple position map used for confirmation and prompts.</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Source room"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              unoptimized
            />
          ) : null}
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
            {cells.map((cell) => (
              <div key={cell.id} className="border border-white/70 bg-zinc-950/5 p-1 text-xs font-semibold text-white drop-shadow">
                {cell.label}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1">
          {cells.map((cell) => (
            <div key={cell.id} className="min-h-20 rounded-md border border-zinc-200 p-2">
              <p className="text-xs font-semibold text-zinc-500">{cell.label}</p>
              <div className="mt-1 space-y-1">
                {roomState?.objects
                  .filter((object) => object.gridPosition.includes(cell.label))
                  .map((object) => (
                    <p key={object.id} className="rounded bg-zinc-100 px-1.5 py-1 text-xs text-zinc-800">
                      {object.label}
                    </p>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Copy checkpoint:

```text
Expected path: src/components/room/RoomGridOverlay.tsx
Expected compile status: no Next.js no-img-element lint warning because the component uses next/image.
```

## Step 4 - Create `src/components/room/DetectedObjectsConfirmation.tsx`

What this file does: lets the user confirm objects and lock behavior.

Why it is needed: human correction is the bridge between unreliable vision output and a trustworthy Room State.

Create `room-remix/src/components/room/DetectedObjectsConfirmation.tsx`:

```tsx
import type { LockLevel, RoomStateSnapshot } from "@/lib/types/room-remix";

interface DetectedObjectsConfirmationProps {
  roomState?: RoomStateSnapshot;
  onChange: (roomState: RoomStateSnapshot) => void;
  onSave: () => void;
}

export function DetectedObjectsConfirmation({
  roomState,
  onChange,
  onSave,
}: DetectedObjectsConfirmationProps) {
  if (!roomState) {
    return null;
  }

  function updateObject(objectId: string, lockedStatus: LockLevel) {
    if (!roomState) return;

    onChange({
      ...roomState,
      objects: roomState.objects.map((object) =>
        object.id === objectId
          ? {
              ...object,
              lockedStatus,
              confirmationStatus: "user_confirmed",
            }
          : object,
      ),
      editContract: roomState.editContract.map((contract) =>
        contract.objectId === objectId
          ? {
              ...contract,
              identityLock: lockedStatus !== "editable",
              positionLock: lockedStatus !== "editable",
              appearanceLock: lockedStatus === "locked",
              softLock: lockedStatus === "soft_locked",
              confirmedByUser: true,
            }
          : contract,
      ),
    });
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">Detected elements</h2>
          <p className="text-sm text-zinc-600">Confirm what must stay fixed and what can change.</p>
        </div>
        <button
          type="button"
          onClick={onSave}
          className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white"
        >
          Save state
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {roomState.objects.map((object) => (
          <div key={object.id} className="rounded-md border border-zinc-200 p-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-zinc-950">{object.label}</p>
                <p className="text-sm text-zinc-600">{object.description}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {object.gridPosition} - {Math.round(object.confidence * 100)}% confidence
                </p>
              </div>
              <select
                value={object.lockedStatus}
                onChange={(event) => updateObject(object.id, event.target.value as LockLevel)}
                className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
              >
                <option value="locked">Locked</option>
                <option value="soft_locked">Soft locked</option>
                <option value="editable">Editable</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

## Step 5 - Create `src/components/room/DesignPreferencesPanel.tsx`

What this file does: captures style, budget, goal, constraints, and notes.

Why it is needed: the design plan must be generated from user intent plus Room State, not from the room photo alone.

Create `room-remix/src/components/room/DesignPreferencesPanel.tsx`:

```tsx
"use client";

import { useState } from "react";
import type {
  BudgetTier,
  DesignConstraint,
  DesignGoal,
  DesignPreferences,
  DesignStyle,
} from "@/lib/types/room-remix";

const styles: DesignStyle[] = ["Minimal", "Japandi", "Industrial", "Bohemian", "Warm Modern"];
const budgets: BudgetTier[] = ["Low", "Medium", "High"];
const goals: DesignGoal[] = ["More cozy", "More productive", "More elegant", "More spacious"];
const constraints: DesignConstraint[] = [
  "Keep existing furniture",
  "Rental-friendly",
  "No drilling",
  "Pet-safe",
];

interface DesignPreferencesPanelProps {
  disabled?: boolean;
  onGenerate: (preferences: DesignPreferences) => void;
}

export function DesignPreferencesPanel({ disabled, onGenerate }: DesignPreferencesPanelProps) {
  const [style, setStyle] = useState<DesignStyle>("Warm Modern");
  const [budget, setBudget] = useState<BudgetTier>("Medium");
  const [goal, setGoal] = useState<DesignGoal>("More cozy");
  const [selectedConstraints, setSelectedConstraints] = useState<DesignConstraint[]>([
    "Keep existing furniture",
    "Rental-friendly",
  ]);
  const [freeformNotes, setFreeformNotes] = useState("");

  function toggleConstraint(constraint: DesignConstraint) {
    setSelectedConstraints((current) =>
      current.includes(constraint)
        ? current.filter((item) => item !== constraint)
        : [...current, constraint],
    );
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-950">Design preferences</h2>
      <p className="text-sm text-zinc-600">Controls that steer the design plan.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Select label="Style" value={style} options={styles} onChange={(value) => setStyle(value as DesignStyle)} />
        <Select label="Budget" value={budget} options={budgets} onChange={(value) => setBudget(value as BudgetTier)} />
        <Select label="Goal" value={goal} options={goals} onChange={(value) => setGoal(value as DesignGoal)} />
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-zinc-700">Constraints</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {constraints.map((constraint) => (
            <button
              key={constraint}
              type="button"
              onClick={() => toggleConstraint(constraint)}
              className={
                selectedConstraints.includes(constraint)
                  ? "rounded-md bg-zinc-950 px-3 py-1.5 text-sm text-white"
                  : "rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-800"
              }
            >
              {constraint}
            </button>
          ))}
        </div>
      </div>

      <label className="mt-4 block text-sm font-medium text-zinc-700">Notes</label>
      <textarea
        value={freeformNotes}
        onChange={(event) => setFreeformNotes(event.target.value)}
        rows={3}
        className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        placeholder="Example: make it warmer but keep the desk functional"
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          onGenerate({
            style,
            budget,
            goal,
            constraints: selectedConstraints,
            freeformNotes,
          })
        }
        className="mt-4 rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        Generate design board
      </button>
    </section>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-zinc-700">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
```

## Step 6 - Create `src/components/room/DesignBoard.tsx`

What this file does: renders the generated palette, plan, and patch list.

Why it is needed: the design board is the generative UI output, not just a chat response.

Create `room-remix/src/components/room/DesignBoard.tsx`:

```tsx
import type { DesignPlan } from "@/lib/types/room-remix";

interface DesignBoardProps {
  plan?: DesignPlan;
}

export function DesignBoard({ plan }: DesignBoardProps) {
  if (!plan) {
    return null;
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-950">Design board</h2>
      <p className="text-sm text-zinc-600">{plan.rationale}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {plan.palette.map((color) => (
          <div key={color.hex} className="rounded-md border border-zinc-200 p-3">
            <div className="h-10 rounded" style={{ backgroundColor: color.hex }} />
            <p className="mt-2 text-sm font-semibold text-zinc-950">{color.name}</p>
            <p className="text-xs text-zinc-500">{color.role}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <ListBlock title="Lighting" items={plan.lightingPlan} />
        <ListBlock title="Decor" items={plan.furnitureOrDecorSuggestions} />
        <ListBlock title="Action plan" items={plan.stepByStepActionPlan} />
      </div>
    </section>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-zinc-200 p-3">
      <h3 className="text-sm font-semibold text-zinc-950">{title}</h3>
      <ul className="mt-2 space-y-1 text-sm text-zinc-700">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Step 7 - Create `src/components/room/ElementRefinementPanel.tsx`

What this file does: lets the user accept or reject proposed design patches.

Why it is needed: refinements should update atomic changes instead of regenerating the whole plan from scratch.

Create `room-remix/src/components/room/ElementRefinementPanel.tsx`:

```tsx
import type { PatchStatus, RoomStateSnapshot } from "@/lib/types/room-remix";

interface ElementRefinementPanelProps {
  roomState?: RoomStateSnapshot;
  onChange: (roomState: RoomStateSnapshot) => void;
  onSave: () => void;
}

export function ElementRefinementPanel({
  roomState,
  onChange,
  onSave,
}: ElementRefinementPanelProps) {
  const patches = roomState?.designPlan?.designPatches ?? [];

  if (!roomState || patches.length === 0) {
    return null;
  }

  function setPatchStatus(patchId: string, status: PatchStatus) {
    if (!roomState?.designPlan) return;

    const nextPatches = roomState.designPlan.designPatches.map((patch) =>
      patch.id === patchId ? { ...patch, status } : patch,
    );

    onChange({
      ...roomState,
      designPlan: {
        ...roomState.designPlan,
        designPatches: nextPatches,
      },
      patches: nextPatches,
    });
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">Refinement patches</h2>
          <p className="text-sm text-zinc-600">Accept or reject specific intended changes.</p>
        </div>
        <button
          type="button"
          onClick={onSave}
          className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white"
        >
          Save patches
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {patches.map((patch) => (
          <div key={patch.id} className="rounded-md border border-zinc-200 p-3">
            <p className="font-medium text-zinc-950">
              {patch.operation} - {patch.targetObjectOrArea}
            </p>
            <p className="text-sm text-zinc-600">{patch.reason}</p>
            <p className="mt-1 text-xs text-zinc-500">Grid: {patch.targetGridPosition}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setPatchStatus(patch.id, "accepted")}
                className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm text-white"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => setPatchStatus(patch.id, "rejected")}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-800"
              >
                Reject
              </button>
              <span className="self-center text-xs uppercase tracking-wide text-zinc-500">
                {patch.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

## Step 8 - Create `src/components/room/PreviewPanel.tsx`

What this file does: shows the generated preview image and prompt summary.

Why it is needed: preview generation must be an intentional action, not an automatic side effect.

Create `room-remix/src/components/room/PreviewPanel.tsx`:

```tsx
import Image from "next/image";

interface PreviewPanelProps {
  preview?: {
    id: string;
    generatedImageUrl: string;
    promptSummary: string;
    generationProvider: string;
  };
  disabled?: boolean;
  isLoading?: boolean;
  onGenerate: () => void;
}

export function PreviewPanel({ preview, disabled, isLoading, onGenerate }: PreviewPanelProps) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">Preview</h2>
          <p className="text-sm text-zinc-600">Generated only from the active Room State.</p>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={disabled || isLoading}
          className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isLoading ? "Generating..." : "Generate preview"}
        </button>
      </div>

      {preview ? (
        <div className="mt-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
            <Image
              src={preview.generatedImageUrl}
              alt="Generated room preview"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              unoptimized
            />
          </div>
          <p className="mt-3 text-xs uppercase tracking-wide text-zinc-500">
            Provider: {preview.generationProvider}
          </p>
          <p className="mt-2 whitespace-pre-wrap rounded-md bg-zinc-50 p-3 text-sm text-zinc-700">
            {preview.promptSummary}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">Generate a design plan first, then request a preview.</p>
      )}
    </section>
  );
}
```

## Step 9 - Create `src/components/room/FidelityReportCard.tsx`

What this file does: shows validation results and asks the user whether the preview stayed faithful.

Why it is needed: fidelity validation is the core differentiator of the project.

Create `room-remix/src/components/room/FidelityReportCard.tsx`:

```tsx
import type { FidelityReport, FidelityStatus } from "@/lib/types/room-remix";

interface FidelityReportCardProps {
  report?: FidelityReport;
  previewId?: string;
  onFeedback: (status: FidelityStatus) => void;
}

export function FidelityReportCard({
  report,
  previewId,
  onFeedback,
}: FidelityReportCardProps) {
  if (!report || !previewId) {
    return null;
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-950">Fidelity report</h2>
      <p className="text-sm text-zinc-600">System check before user confirmation.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Metric label="Score" value={`${Math.round(report.systemScore * 100)}%`} />
        <Metric label="Locked objects" value={report.lockedObjectsPreserved ? "Preserved" : "Changed"} />
        <Metric label="Style" value={report.styleApplied ? "Applied" : "Weak"} />
      </div>

      <div className="mt-4 grid gap-2 text-sm text-zinc-700 sm:grid-cols-2">
        <Check label="Window preserved" value={report.windowPreserved} />
        <Check label="Camera preserved" value={report.cameraAnglePreserved} />
        <Check label="Bed position preserved" value={report.bedPositionPreserved} />
        <Check label="Desk position preserved" value={report.deskPositionPreserved} />
      </div>

      <p className="mt-4 text-sm text-zinc-800">{report.recommendedAction}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => onFeedback("faithful")} className="rounded-md bg-emerald-700 px-3 py-2 text-sm text-white">
          Yes, faithful
        </button>
        <button onClick={() => onFeedback("mostly_faithful")} className="rounded-md border border-zinc-300 px-3 py-2 text-sm">
          Mostly faithful
        </button>
        <button onClick={() => onFeedback("not_faithful")} className="rounded-md border border-zinc-300 px-3 py-2 text-sm">
          Regenerate stronger
        </button>
        <button onClick={() => onFeedback("needs_manual_review")} className="rounded-md border border-zinc-300 px-3 py-2 text-sm">
          Mark changes
        </button>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-200 p-3">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

function Check({ label, value }: { label: string; value: boolean }) {
  return (
    <p className="rounded-md bg-zinc-50 px-3 py-2">
      {value ? "Pass" : "Review"} - {label}
    </p>
  );
}
```

## Step 10 - Create `src/components/room/RoomStateInspector.tsx`

What this file does: renders the current Room State as readable JSON.

Why it is needed: this makes the typed-state architecture visible during demos and interviews.

Create `room-remix/src/components/room/RoomStateInspector.tsx`:

```tsx
import type { RoomStateSnapshot } from "@/lib/types/room-remix";

interface RoomStateInspectorProps {
  roomState?: RoomStateSnapshot;
}

export function RoomStateInspector({ roomState }: RoomStateInspectorProps) {
  if (!roomState) {
    return null;
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-950">Room State inspector</h2>
      <p className="text-sm text-zinc-600">Canonical structured memory used by the agent.</p>
      <pre className="mt-4 max-h-[480px] overflow-auto rounded-md bg-zinc-950 p-4 text-xs text-zinc-50">
        {JSON.stringify(roomState, null, 2)}
      </pre>
    </section>
  );
}
```

## Step 11 - Create `src/components/room/AgentTracePanel.tsx`

What this file does: shows local workflow events.

Why it is needed: the demo can explain the agent's tool sequence without exposing hidden chain-of-thought.

Create `room-remix/src/components/room/AgentTracePanel.tsx`:

```tsx
export interface TraceEvent {
  type: string;
  summary: string;
  createdAt: string;
}

interface AgentTracePanelProps {
  events: TraceEvent[];
}

export function AgentTracePanel({ events }: AgentTracePanelProps) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-950">Agent trace</h2>
      <p className="text-sm text-zinc-600">Visible tool-style workflow steps.</p>
      <div className="mt-4 space-y-2">
        {events.map((event, index) => (
          <div key={`${event.type}-${index}`} className="rounded-md border border-zinc-200 p-3">
            <p className="text-sm font-semibold text-zinc-950">{event.type}</p>
            <p className="text-sm text-zinc-600">{event.summary}</p>
            <p className="mt-1 text-xs text-zinc-400">{event.createdAt}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

## Step 12 - Create `src/components/room/RoomRemixWorkbench.tsx`

What this file does: connects all panels into one end-to-end workflow.

Why it is needed: this is the first screen of the app and the main hackathon demo surface.

This component includes a local `requestJson` helper.

What that helper does: checks HTTP status, safely parses JSON, and throws readable API errors.

Why it is needed: failed API calls should show a visible error and always clear the loading state.

Create `room-remix/src/components/room/RoomRemixWorkbench.tsx`:

```tsx
"use client";

import { useState } from "react";
import { AgentTracePanel, type TraceEvent } from "@/components/room/AgentTracePanel";
import { DesignBoard } from "@/components/room/DesignBoard";
import { DesignPreferencesPanel } from "@/components/room/DesignPreferencesPanel";
import { DetectedObjectsConfirmation } from "@/components/room/DetectedObjectsConfirmation";
import { ElementRefinementPanel } from "@/components/room/ElementRefinementPanel";
import { FidelityReportCard } from "@/components/room/FidelityReportCard";
import { PreviewPanel } from "@/components/room/PreviewPanel";
import { RoomAnalysisPanel } from "@/components/room/RoomAnalysisPanel";
import { RoomGridOverlay } from "@/components/room/RoomGridOverlay";
import { RoomStateInspector } from "@/components/room/RoomStateInspector";
import { RoomUploadCard } from "@/components/room/RoomUploadCard";
import type {
  DesignPreferences,
  FidelityReport,
  FidelityStatus,
  PreviewResult,
  RawRoomAnalysis,
  RoomStateSnapshot,
} from "@/lib/types/room-remix";

interface AnalyzeRoomResponse {
  analysis: RawRoomAnalysis;
  roomState: RoomStateSnapshot;
}

interface RoomStateResponse {
  roomState: RoomStateSnapshot;
}

interface PreviewResponse {
  preview: PreviewResult & { id: string };
  fidelityReport: FidelityReport;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const text = await response.text();
  let data: unknown = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const fallback = `Request failed with status ${response.status}.`;
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error?: unknown }).error ?? fallback)
        : fallback;

    throw new Error(message);
  }

  return data as T;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export function RoomRemixWorkbench() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [analysis, setAnalysis] = useState<RawRoomAnalysis | undefined>();
  const [roomState, setRoomState] = useState<RoomStateSnapshot | undefined>();
  const [preview, setPreview] = useState<PreviewResult & { id: string }>();
  const [fidelityReport, setFidelityReport] = useState<FidelityReport>();
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function pushEvent(type: string, summary: string) {
    setEvents((current) => [
      {
        type,
        summary,
        createdAt: new Date().toLocaleTimeString(),
      },
      ...current,
    ]);
  }

  async function analyzeRoom() {
    if (!projectId) return;
    setLoadingStep("analyze");
    setError(null);

    try {
      const data = await requestJson<AnalyzeRoomResponse>(
        `/api/projects/${projectId}/analyze`,
        { method: "POST" },
      );

      setAnalysis(data.analysis);
      setRoomState(data.roomState);
      pushEvent("room.analyze", "Created the first structured Room State.");
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoadingStep(null);
    }
  }

  async function saveRoomState(summary = "User confirmed Room State.") {
    if (!projectId || !roomState) return;
    setLoadingStep("state");
    setError(null);

    try {
      const data = await requestJson<RoomStateResponse>(
        `/api/projects/${projectId}/state`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomState,
            eventSummary: summary,
          }),
        },
      );

      setRoomState(data.roomState);
      pushEvent("room.patch_state", summary);
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoadingStep(null);
    }
  }

  async function generatePlan(preferences: DesignPreferences) {
    if (!projectId) return;
    setLoadingStep("plan");
    setError(null);

    try {
      const data = await requestJson<RoomStateResponse>(
        `/api/projects/${projectId}/plan`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(preferences),
        },
      );

      setRoomState(data.roomState);
      pushEvent("design.generate_plan", "Generated design board and atomic patches.");
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoadingStep(null);
    }
  }

  async function generatePreview() {
    if (!projectId) return;
    setLoadingStep("preview");
    setError(null);

    try {
      const data = await requestJson<PreviewResponse>(
        `/api/projects/${projectId}/preview`,
        { method: "POST" },
      );

      setPreview(data.preview);
      setFidelityReport({
        ...data.fidelityReport,
        unexpectedChanges: data.fidelityReport.unexpectedChanges ?? [],
      });
      pushEvent("preview.generate", "Generated preview and fidelity report.");
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoadingStep(null);
    }
  }

  async function sendFeedback(status: FidelityStatus) {
    if (!projectId || !preview) return;
    setError(null);

    try {
      await requestJson(`/api/projects/${projectId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          previewId: preview.id,
          status,
          changedElements: [],
        }),
      });

      pushEvent("preview.user_fidelity_feedback", `User marked preview as ${status}.`);
    } catch (caught) {
      setError(getErrorMessage(caught));
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Verifiable Room-State Interior Design Agent
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-normal text-zinc-950">
            Room Remix
          </h1>
        </header>

        {error ? (
          <div role="alert" className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-5">
            <RoomUploadCard
              onProjectReady={({ projectId: nextProjectId, imageUrl: nextImageUrl }) => {
                setProjectId(nextProjectId);
                setImageUrl(nextImageUrl);
                setAnalysis(undefined);
                setRoomState(undefined);
                setPreview(undefined);
                setFidelityReport(undefined);
                setError(null);
                pushEvent("room.capture", "Saved project and source image.");
              }}
            />
            <RoomAnalysisPanel
              analysis={analysis}
              onAnalyze={() => void analyzeRoom()}
              disabled={!projectId}
              isLoading={loadingStep === "analyze"}
            />
            <RoomGridOverlay imageUrl={imageUrl} roomState={roomState} />
            <DetectedObjectsConfirmation
              roomState={roomState}
              onChange={setRoomState}
              onSave={() => void saveRoomState("User confirmed detected elements and locks.")}
            />
            <DesignPreferencesPanel
              disabled={!roomState || loadingStep === "plan"}
              onGenerate={(preferences) => void generatePlan(preferences)}
            />
          </div>

          <div className="space-y-5">
            <DesignBoard plan={roomState?.designPlan} />
            <ElementRefinementPanel
              roomState={roomState}
              onChange={setRoomState}
              onSave={() => void saveRoomState("User refined design patches.")}
            />
            <PreviewPanel
              preview={preview}
              disabled={!roomState?.designPlan}
              isLoading={loadingStep === "preview"}
              onGenerate={() => void generatePreview()}
            />
            <FidelityReportCard
              report={fidelityReport}
              previewId={preview?.id}
              onFeedback={(status) => void sendFeedback(status)}
            />
            <AgentTracePanel events={events} />
            <RoomStateInspector roomState={roomState} />
          </div>
        </div>
      </div>
    </main>
  );
}
```

Copy checkpoint:

```text
Expected path: src/components/room/RoomRemixWorkbench.tsx
Expected compile status: requestJson is local to this file and all API calls use it.
Expected failure behavior: failed API responses show the red alert and loadingStep returns to null.
```

## Checkpoint

What this does: catches missing imports or component typing issues.

Why it is needed: the next instruction wires these components into the actual page.

```powershell
npm run lint
```
