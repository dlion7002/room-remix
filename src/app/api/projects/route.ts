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

