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
    const result = await generatePlanForProject({ projectId, preferences });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Design planning failed." },
      { status: 400 },
    );
  }
}
