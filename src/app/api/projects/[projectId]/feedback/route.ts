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

