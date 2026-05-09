import type { RawRoomAnalysis } from "@/lib/types/room-remix";

interface RoomAnalysisPanelProps {
  analysis?: RawRoomAnalysis;
  onAnalyze: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function RoomAnalysisPanel({
  analysis,
  onAnalyze,
  disabled,
  isLoading,
}: RoomAnalysisPanelProps) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">Room analysis</h2>
          <p className="text-sm text-zinc-600">
            Visual facts extracted from the source image.
          </p>
        </div>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={disabled || isLoading}
          className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isLoading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {analysis ? (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-zinc-800">{analysis.summary}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Room type" value={analysis.detectedRoomType} />
            <Metric label="Confidence" value={`${Math.round(analysis.confidence * 100)}%`} />
            <Metric label="Objects" value={String(analysis.extractedObjects.length)} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">
              Targeted confirmation questions
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-zinc-700">
              {analysis.suggestedQuestions.map((question) => (
                <li key={question}>- {question}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">
          Create a project, then run analysis.
        </p>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-200 p-3">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

