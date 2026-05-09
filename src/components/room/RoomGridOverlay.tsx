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
      <p className="text-sm text-zinc-600">
        A simple position map used for confirmation and prompts.
      </p>

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
              <div
                key={cell.id}
                className="border border-white/70 bg-zinc-950/5 p-1 text-xs font-semibold text-white drop-shadow"
              >
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
                    <p
                      key={object.id}
                      className="rounded bg-zinc-100 px-1.5 py-1 text-xs text-zinc-800"
                    >
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

