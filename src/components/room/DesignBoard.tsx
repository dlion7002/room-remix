import type { DesignPlan } from "@/lib/types/room-remix";

interface DesignBoardProps {
  plan?: DesignPlan;
}

export function DesignBoard({ plan }: DesignBoardProps) {
  if (!plan) {
    return null;
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-950">Design board</h2>
      <p className="text-sm text-zinc-600">{plan.rationale}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {plan.palette.map((color) => (
          <div key={color.hex} className="rounded-md border border-zinc-200 p-3">
            <div className="h-10 rounded" style={{ backgroundColor: color.hex }} />
            <p className="mt-2 text-sm font-semibold text-zinc-950">{color.name}</p>
            <p className="text-xs text-zinc-500">{color.role}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <ListBlock title="Lighting" items={plan.lightingPlan} />
        <ListBlock title="Decor" items={plan.furnitureOrDecorSuggestions} />
        <ListBlock title="Action plan" items={plan.stepByStepActionPlan} />
      </div>
    </section>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-zinc-200 p-3">
      <h3 className="text-sm font-semibold text-zinc-950">{title}</h3>
      <ul className="mt-2 space-y-1 text-sm text-zinc-700">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}

