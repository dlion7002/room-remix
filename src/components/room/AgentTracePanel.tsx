export interface TraceEvent {
  type: string;
  summary: string;
  createdAt: string;
}

interface AgentTracePanelProps {
  events: TraceEvent[];
}

export function AgentTracePanel({ events }: AgentTracePanelProps) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-950">Agent trace</h2>
      <p className="text-sm text-zinc-600">Visible tool-style workflow steps.</p>
      <div className="mt-4 space-y-2">
        {events.length === 0 ? (
          <p className="text-sm text-zinc-500">Events will appear as you use the app.</p>
        ) : null}
        {events.map((event, index) => (
          <div
            key={`${event.type}-${index}`}
            className="rounded-md border border-zinc-200 p-3"
          >
            <p className="text-sm font-semibold text-zinc-950">{event.type}</p>
            <p className="text-sm text-zinc-600">{event.summary}</p>
            <p className="mt-1 text-xs text-zinc-400">{event.createdAt}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

