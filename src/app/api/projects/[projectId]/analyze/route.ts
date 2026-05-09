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

