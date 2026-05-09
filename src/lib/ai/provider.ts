import type {
  DesignCatalogItem,
  DesignPlan,
  DesignPreferences,
  FidelityReport,
  PreviewResult,
  RawRoomAnalysis,
  RoomStateSnapshot,
} from "@/lib/types/room-remix";

export interface AnalyzeRoomInput {
  projectId: string;
  imageUrl: string;
}

export interface GenerateDesignPlanInput {
  projectId: string;
  roomState: RoomStateSnapshot;
  preferences: DesignPreferences;
  catalogOptions: DesignCatalogItem[];
}

export interface GeneratePreviewInput {
  projectId: string;
  roomState: RoomStateSnapshot;
  prompt: string;
}

export interface ValidateFidelityInput {
  projectId: string;
  originalImageUrl: string;
  generatedImageUrl: string;
  roomState: RoomStateSnapshot;
}

export interface RoomAiProvider {
  name: string;
  analyzeRoom(input: AnalyzeRoomInput): Promise<RawRoomAnalysis>;
  generateDesignPlan(input: GenerateDesignPlanInput): Promise<DesignPlan>;
  generatePreview(input: GeneratePreviewInput): Promise<PreviewResult>;
  validateFidelity(input: ValidateFidelityInput): Promise<FidelityReport>;
}

