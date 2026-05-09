"use client";

import { useState } from "react";
import { AgentTracePanel, type TraceEvent } from "@/components/room/AgentTracePanel";
import { DesignBoard } from "@/components/room/DesignBoard";
import { DesignPreferencesPanel } from "@/components/room/DesignPreferencesPanel";
import { DetectedObjectsConfirmation } from "@/components/room/DetectedObjectsConfirmation";
import { ElementRefinementPanel } from "@/components/room/ElementRefinementPanel";
import { FidelityReportCard } from "@/components/room/FidelityReportCard";
import { PreviewPanel } from "@/components/room/PreviewPanel";
import { RoomAnalysisPanel } from "@/components/room/RoomAnalysisPanel";
import { RoomGridOverlay } from "@/components/room/RoomGridOverlay";
import { RoomStateInspector } from "@/components/room/RoomStateInspector";
import { RoomUploadCard } from "@/components/room/RoomUploadCard";
import type {
  DesignPreferences,
  FidelityReport,
  FidelityStatus,
  PreviewResult,
  RawRoomAnalysis,
  RoomStateSnapshot,
} from "@/lib/types/room-remix";

interface AnalyzeRoomResponse {
  analysis: RawRoomAnalysis;
  roomState: RoomStateSnapshot;
}

interface RoomStateResponse {
  roomState: RoomStateSnapshot;
}

interface PreviewResponse {
  preview: PreviewResult & { id: string };
  fidelityReport: FidelityReport;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const text = await response.text();
  let data: unknown = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const fallback = `Request failed with status ${response.status}.`;
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error?: unknown }).error ?? fallback)
        : fallback;

    throw new Error(message);
  }

  return data as T;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export function RoomRemixWorkbench() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [analysis, setAnalysis] = useState<RawRoomAnalysis | undefined>();
  const [roomState, setRoomState] = useState<RoomStateSnapshot | undefined>();
  const [preview, setPreview] = useState<PreviewResult & { id: string }>();
  const [fidelityReport, setFidelityReport] = useState<FidelityReport>();
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function pushEvent(type: string, summary: string) {
    setEvents((current) => [
      {
        type,
        summary,
        createdAt: new Date().toLocaleTimeString(),
      },
      ...current,
    ]);
  }

  async function analyzeRoom() {
    if (!projectId) return;
    setLoadingStep("analyze");
    setError(null);

    try {
      const data = await requestJson<AnalyzeRoomResponse>(
        `/api/projects/${projectId}/analyze`,
        { method: "POST" },
      );

      setAnalysis(data.analysis);
      setRoomState(data.roomState);
      pushEvent("room.analyze", "Created the first structured Room State.");
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoadingStep(null);
    }
  }

  async function saveRoomState(summary = "User confirmed Room State.") {
    if (!projectId || !roomState) return;
    setLoadingStep("state");
    setError(null);

    try {
      const data = await requestJson<RoomStateResponse>(
        `/api/projects/${projectId}/state`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomState,
            eventSummary: summary,
          }),
        },
      );

      setRoomState(data.roomState);
      pushEvent("room.patch_state", summary);
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoadingStep(null);
    }
  }

  async function generatePlan(preferences: DesignPreferences) {
    if (!projectId) return;
    setLoadingStep("plan");
    setError(null);

    try {
      const data = await requestJson<RoomStateResponse>(
        `/api/projects/${projectId}/plan`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(preferences),
        },
      );

      setRoomState(data.roomState);
      pushEvent("design.generate_plan", "Generated design board and atomic patches.");
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoadingStep(null);
    }
  }

  async function generatePreview() {
    if (!projectId) return;
    setLoadingStep("preview");
    setError(null);

    try {
      const data = await requestJson<PreviewResponse>(
        `/api/projects/${projectId}/preview`,
        { method: "POST" },
      );

      setPreview(data.preview);
      setFidelityReport({
        ...data.fidelityReport,
        unexpectedChanges: data.fidelityReport.unexpectedChanges ?? [],
      });
      pushEvent("preview.generate", "Generated preview and fidelity report.");
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoadingStep(null);
    }
  }

  async function sendFeedback(status: FidelityStatus) {
    if (!projectId || !preview) return;
    setError(null);

    try {
      await requestJson(`/api/projects/${projectId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          previewId: preview.id,
          status,
          changedElements: [],
        }),
      });

      pushEvent("preview.user_fidelity_feedback", `User marked preview as ${status}.`);
    } catch (caught) {
      setError(getErrorMessage(caught));
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Verifiable Room-State Interior Design Agent
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-normal text-zinc-950">
            Room Remix
          </h1>
        </header>

        {error ? (
          <div
            role="alert"
            className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-5">
            <RoomUploadCard
              onProjectReady={({ projectId: nextProjectId, imageUrl: nextImageUrl }) => {
                setProjectId(nextProjectId);
                setImageUrl(nextImageUrl);
                setAnalysis(undefined);
                setRoomState(undefined);
                setPreview(undefined);
                setFidelityReport(undefined);
                setError(null);
                pushEvent("room.capture", "Saved project and source image.");
              }}
            />
            <RoomAnalysisPanel
              analysis={analysis}
              onAnalyze={() => void analyzeRoom()}
              disabled={!projectId}
              isLoading={loadingStep === "analyze"}
            />
            <RoomGridOverlay imageUrl={imageUrl} roomState={roomState} />
            <DetectedObjectsConfirmation
              roomState={roomState}
              onChange={setRoomState}
              onSave={() => void saveRoomState("User confirmed detected elements and locks.")}
            />
            <DesignPreferencesPanel
              disabled={!roomState || loadingStep === "plan"}
              onGenerate={(preferences) => void generatePlan(preferences)}
            />
          </div>

          <div className="space-y-5">
            <DesignBoard plan={roomState?.designPlan} />
            <ElementRefinementPanel
              roomState={roomState}
              onChange={setRoomState}
              onSave={() => void saveRoomState("User refined design patches.")}
            />
            <PreviewPanel
              preview={preview}
              disabled={!roomState?.designPlan}
              isLoading={loadingStep === "preview"}
              onGenerate={() => void generatePreview()}
            />
            <FidelityReportCard
              report={fidelityReport}
              previewId={preview?.id}
              onFeedback={(status) => void sendFeedback(status)}
            />
            <AgentTracePanel events={events} />
            <RoomStateInspector roomState={roomState} />
          </div>
        </div>
      </div>
    </main>
  );
}

