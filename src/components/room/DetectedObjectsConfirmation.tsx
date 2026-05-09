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
          <p className="text-sm text-zinc-600">
            Confirm what must stay fixed and what can change.
          </p>
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
                onChange={(event) =>
                  updateObject(object.id, event.target.value as LockLevel)
                }
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

