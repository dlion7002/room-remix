import type { FidelityReport, FidelityStatus } from "@/lib/types/room-remix";

interface FidelityReportCardProps {
  report?: FidelityReport;
  previewId?: string;
  onFeedback: (status: FidelityStatus) => void;
}

export function FidelityReportCard({
  report,
  previewId,
  onFeedback,
}: FidelityReportCardProps) {
  if (!report || !previewId) {
    return null;
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-950">Fidelity report</h2>
      <p className="text-sm text-zinc-600">System check before user confirmation.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Metric label="Score" value={`${Math.round(report.systemScore * 100)}%`} />
        <Metric
          label="Locked objects"
          value={report.lockedObjectsPreserved ? "Preserved" : "Changed"}
        />
        <Metric label="Style" value={report.styleApplied ? "Applied" : "Weak"} />
      </div>

      <div className="mt-4 grid gap-2 text-sm text-zinc-700 sm:grid-cols-2">
        <Check label="Window preserved" value={report.windowPreserved} />
        <Check label="Camera preserved" value={report.cameraAnglePreserved} />
        <Check label="Bed position preserved" value={report.bedPositionPreserved} />
        <Check label="Desk position preserved" value={report.deskPositionPreserved} />
      </div>

      <p className="mt-4 text-sm text-zinc-800">{report.recommendedAction}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onFeedback("faithful")}
          className="rounded-md bg-emerald-700 px-3 py-2 text-sm text-white"
        >
          Yes, faithful
        </button>
        <button
          type="button"
          onClick={() => onFeedback("mostly_faithful")}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        >
          Mostly faithful
        </button>
        <button
          type="button"
          onClick={() => onFeedback("not_faithful")}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        >
          Regenerate stronger
        </button>
        <button
          type="button"
          onClick={() => onFeedback("needs_manual_review")}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        >
          Mark changes
        </button>
      </div>
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

function Check({ label, value }: { label: string; value: boolean }) {
  return (
    <p className="rounded-md bg-zinc-50 px-3 py-2">
      {value ? "Pass" : "Review"} - {label}
    </p>
  );
}

