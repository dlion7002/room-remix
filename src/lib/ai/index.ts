import { mockRoomAiProvider } from "@/lib/ai/mock-provider";
import type { RoomAiProvider } from "@/lib/ai/provider";

export function getRoomAiProvider(): RoomAiProvider {
  const providerName = process.env.ROOM_REMIX_AI_PROVIDER ?? "mock";

  if (providerName === "mock") {
    return mockRoomAiProvider;
  }

  throw new Error(`Unknown ROOM_REMIX_AI_PROVIDER: ${providerName}`);
}

