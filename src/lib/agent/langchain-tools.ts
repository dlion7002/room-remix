import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getGenericCatalogOptions } from "@/lib/catalog/design-catalog";
import {
  buildPreviewPrompt,
  buildRoomStateFromAnalysis,
} from "@/lib/orchestrator/tools";
import type {
  DesignPreferences,
  RawRoomAnalysis,
  RoomStateSnapshot,
} from "@/lib/types/room-remix";

export const buildRoomStateTool = tool(
  async ({ analysis, projectId, version }) => {
    return {
      ...buildRoomStateFromAnalysis(analysis),
      projectId,
      version,
    };
  },
  {
    name: "build_room_state",
    description:
      "Convert a provider room-photo analysis into the canonical Room State snapshot.",
    schema: z.object({
      analysis: z.custom<RawRoomAnalysis>(),
      projectId: z.string().min(1),
      version: z.number().int().positive(),
    }),
  },
);

export const selectCatalogOptionsTool = tool(
  async ({ preferences }) => {
    return getGenericCatalogOptions({
      style: preferences.style,
      budget: preferences.budget,
      constraints: preferences.constraints,
    });
  },
  {
    name: "select_catalog_options",
    description:
      "Select deterministic catalog options that match the user's design preferences.",
    schema: z.object({
      preferences: z.custom<DesignPreferences>(),
    }),
  },
);

export const buildPreviewPromptTool = tool(
  async ({ roomState }) => {
    return buildPreviewPrompt(roomState);
  },
  {
    name: "build_preview_prompt",
    description:
      "Build the constrained image-generation prompt from locked Room State objects and accepted design patches.",
    schema: z.object({
      roomState: z.custom<RoomStateSnapshot>(),
    }),
  },
);
