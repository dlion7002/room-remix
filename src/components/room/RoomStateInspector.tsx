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
      <p className="text-sm text-zinc-600">
        Canonical structured memory used by the agent.
      </p>
      <pre className="mt-4 max-h-[480px] overflow-auto rounded-md bg-zinc-950 p-4 text-xs text-zinc-50">
        {JSON.stringify(roomState, null, 2)}
      </pre>
    </section>
  );
}

