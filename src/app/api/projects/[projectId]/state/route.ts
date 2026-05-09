import { NextResponse } from "next/server";
import { patchProjectRoomState } from "@/lib/orchestrator/room-remix-orchestrator";
import type { RoomStateSnapshot } from "@/lib/types/room-remix";
import { patchRoomStateSchema } from "@/lib/types/schemas";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    const body = patchRoomStateSchema.parse(await request.json());
    const roomState = await patchProjectRoomState({
      projectId,
      roomState: body.roomState as unknown as RoomStateSnapshot,
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
