import {
  sampleDesignPlan,
  sampleFidelityReport,
  samplePreview,
  sampleRawRoomAnalysis,
} from "@/lib/mock/sample-room-state";
import type { RoomAiProvider } from "@/lib/ai/provider";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockRoomAiProvider: RoomAiProvider = {
  name: "mock",

  async analyzeRoom() {
    await wait(250);
    return sampleRawRoomAnalysis;
  },

  async generateDesignPlan({ preferences }) {
    await wait(250);

    return {
      ...sampleDesignPlan,
      rationale: `${sampleDesignPlan.rationale} Selected style: ${preferences.style}. Budget: ${preferences.budget}.`,
    };
  },

  async generatePreview({ prompt }) {
    await wait(250);

    return {
      ...samplePreview,
      promptSummary: prompt,
      generationProvider: "mock",
    };
  },

  async validateFidelity() {
    await wait(200);
    return sampleFidelityReport;
  },
};

