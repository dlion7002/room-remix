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
          <p className="text-sm text-zinc-600">
            Accept or reject specific intended changes.
          </p>
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
            <p className="mt-1 text-xs text-zinc-500">
              Grid: {patch.targetGridPosition}
            </p>
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

