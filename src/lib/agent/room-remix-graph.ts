import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import {
  buildPreviewPromptTool,
  buildRoomStateTool,
  selectCatalogOptionsTool,
} from "@/lib/agent/langchain-tools";
import type { RoomAiProvider } from "@/lib/ai/provider";
import type {
  AgentTraceEvent,
  DesignCatalogItem,
  DesignPlan,
  DesignPreferences,
  FidelityReport,
  PreviewResult,
  RawRoomAnalysis,
  RoomStateSnapshot,
} from "@/lib/types/room-remix";

function trace(type: string, summary: string): AgentTraceEvent[] {
  return [
    {
      type,
      summary,
      createdAt: new Date().toISOString(),
    },
  ];
}

const traceAnnotation = Annotation<AgentTraceEvent[], AgentTraceEvent[]>({
  reducer: (left, right) => left.concat(right),
  default: () => [],
});

const AnalysisGraphState = Annotation.Root({
  projectId: Annotation<string>(),
  imageUrl: Annotation<string>(),
  provider: Annotation<RoomAiProvider>(),
  version: Annotation<number>(),
  analysis: Annotation<RawRoomAnalysis | undefined>(),
  roomState: Annotation<RoomStateSnapshot | undefined>(),
  agentTrace: traceAnnotation,
});

const analysisGraph = new StateGraph(AnalysisGraphState)
  .addNode("analyze_room", async (state: typeof AnalysisGraphState.State) => {
    const analysis = await state.provider.analyzeRoom({
      projectId: state.projectId,
      imageUrl: state.imageUrl,
    });

    return {
      analysis,
      agentTrace: trace(
        "langgraph.analyze_room",
        `Provider ${state.provider.name} analyzed the source room photo.`,
      ),
    };
  })
  .addNode("build_room_state", async (state: typeof AnalysisGraphState.State) => {
    if (!state.analysis) {
      throw new Error("Cannot build Room State before room analysis completes.");
    }

    const roomState = (await buildRoomStateTool.invoke({
      analysis: state.analysis,
      projectId: state.projectId,
      version: state.version,
    })) as RoomStateSnapshot;

    return {
      roomState,
      agentTrace: trace(
        "langchain.build_room_state",
        `Built canonical Room State version ${roomState.version}.`,
      ),
    };
  })
  .addEdge(START, "analyze_room")
  .addEdge("analyze_room", "build_room_state")
  .addEdge("build_room_state", END)
  .compile();

export async function runRoomAnalysisGraph(input: {
  projectId: string;
  imageUrl: string;
  provider: RoomAiProvider;
  version: number;
}) {
  const result = await analysisGraph.invoke({
    ...input,
    agentTrace: [],
  });

  if (!result.analysis || !result.roomState) {
    throw new Error("Room analysis graph completed without required outputs.");
  }

  return {
    analysis: result.analysis,
    roomState: result.roomState,
    agentTrace: result.agentTrace,
  };
}

const DesignGraphState = Annotation.Root({
  projectId: Annotation<string>(),
  provider: Annotation<RoomAiProvider>(),
  currentRoomState: Annotation<RoomStateSnapshot>(),
  preferences: Annotation<DesignPreferences>(),
  catalogOptions: Annotation<DesignCatalogItem[] | undefined>(),
  designPlan: Annotation<DesignPlan | undefined>(),
  nextRoomState: Annotation<RoomStateSnapshot | undefined>(),
  agentTrace: traceAnnotation,
});

const designGraph = new StateGraph(DesignGraphState)
  .addNode("select_catalog_options", async (state: typeof DesignGraphState.State) => {
    const catalogOptions = (await selectCatalogOptionsTool.invoke({
      preferences: state.preferences,
    })) as DesignCatalogItem[];

    return {
      catalogOptions,
      agentTrace: trace(
        "langchain.select_catalog_options",
        `Selected ${catalogOptions.length} catalog options for ${state.preferences.style}.`,
      ),
    };
  })
  .addNode("generate_design_plan", async (state: typeof DesignGraphState.State) => {
    if (!state.catalogOptions) {
      throw new Error("Cannot generate a design plan without catalog options.");
    }

    const designPlan = await state.provider.generateDesignPlan({
      projectId: state.projectId,
      roomState: state.currentRoomState,
      preferences: state.preferences,
      catalogOptions: state.catalogOptions,
    });

    return {
      designPlan,
      agentTrace: trace(
        "langgraph.generate_design_plan",
        `Provider ${state.provider.name} generated ${designPlan.designPatches.length} design patches.`,
      ),
    };
  })
  .addNode("compose_next_room_state", async (state: typeof DesignGraphState.State) => {
    if (!state.designPlan) {
      throw new Error("Cannot compose next Room State without a design plan.");
    }

    const nextRoomState: RoomStateSnapshot = {
      ...state.currentRoomState,
      id: undefined,
      version: state.currentRoomState.version + 1,
      preferences: state.preferences,
      designPlan: state.designPlan,
      patches: state.designPlan.designPatches,
      source: "user_patch",
      createdAt: new Date().toISOString(),
    };

    return {
      nextRoomState,
      agentTrace: trace(
        "langgraph.compose_next_room_state",
        `Composed Room State version ${nextRoomState.version} with plan and patches.`,
      ),
    };
  })
  .addEdge(START, "select_catalog_options")
  .addEdge("select_catalog_options", "generate_design_plan")
  .addEdge("generate_design_plan", "compose_next_room_state")
  .addEdge("compose_next_room_state", END)
  .compile();

export async function runDesignPlanGraph(input: {
  projectId: string;
  provider: RoomAiProvider;
  currentRoomState: RoomStateSnapshot;
  preferences: DesignPreferences;
}) {
  const result = await designGraph.invoke({
    ...input,
    agentTrace: [],
  });

  if (!result.nextRoomState || !result.designPlan) {
    throw new Error("Design graph completed without required outputs.");
  }

  return {
    roomState: result.nextRoomState,
    designPlan: result.designPlan,
    agentTrace: result.agentTrace,
  };
}

const PreviewGraphState = Annotation.Root({
  projectId: Annotation<string>(),
  provider: Annotation<RoomAiProvider>(),
  originalImageUrl: Annotation<string>(),
  roomState: Annotation<RoomStateSnapshot>(),
  prompt: Annotation<string | undefined>(),
  previewResult: Annotation<PreviewResult | undefined>(),
  fidelityReport: Annotation<FidelityReport | undefined>(),
  agentTrace: traceAnnotation,
});

const previewGraph = new StateGraph(PreviewGraphState)
  .addNode("build_preview_prompt", async (state: typeof PreviewGraphState.State) => {
    const prompt = (await buildPreviewPromptTool.invoke({
      roomState: state.roomState,
    })) as string;

    return {
      prompt,
      agentTrace: trace(
        "langchain.build_preview_prompt",
        "Built constrained preview prompt from active Room State.",
      ),
    };
  })
  .addNode("generate_preview", async (state: typeof PreviewGraphState.State) => {
    if (!state.prompt) {
      throw new Error("Cannot generate preview without a preview prompt.");
    }

    const previewResult = await state.provider.generatePreview({
      projectId: state.projectId,
      roomState: state.roomState,
      prompt: state.prompt,
    });

    return {
      previewResult,
      agentTrace: trace(
        "langgraph.generate_preview",
        `Provider ${state.provider.name} generated a preview image.`,
      ),
    };
  })
  .addNode("validate_fidelity", async (state: typeof PreviewGraphState.State) => {
    if (!state.previewResult) {
      throw new Error("Cannot validate fidelity before preview generation.");
    }

    const fidelityReport = await state.provider.validateFidelity({
      projectId: state.projectId,
      originalImageUrl: state.originalImageUrl,
      generatedImageUrl: state.previewResult.generatedImageUrl,
      roomState: state.roomState,
    });

    return {
      fidelityReport,
      agentTrace: trace(
        "langgraph.validate_fidelity",
        `Validated preview fidelity with score ${fidelityReport.systemScore}.`,
      ),
    };
  })
  .addEdge(START, "build_preview_prompt")
  .addEdge("build_preview_prompt", "generate_preview")
  .addEdge("generate_preview", "validate_fidelity")
  .addEdge("validate_fidelity", END)
  .compile();

export async function runPreviewGraph(input: {
  projectId: string;
  provider: RoomAiProvider;
  originalImageUrl: string;
  roomState: RoomStateSnapshot;
}) {
  const result = await previewGraph.invoke({
    ...input,
    agentTrace: [],
  });

  if (!result.prompt || !result.previewResult || !result.fidelityReport) {
    throw new Error("Preview graph completed without required outputs.");
  }

  return {
    prompt: result.prompt,
    previewResult: result.previewResult,
    fidelityReport: result.fidelityReport,
    agentTrace: result.agentTrace,
  };
}
