"use client";

import { useState } from "react";
import type {
  BudgetTier,
  DesignConstraint,
  DesignGoal,
  DesignPreferences,
  DesignStyle,
} from "@/lib/types/room-remix";

const styles: DesignStyle[] = [
  "Minimal",
  "Japandi",
  "Industrial",
  "Bohemian",
  "Warm Modern",
];
const budgets: BudgetTier[] = ["Low", "Medium", "High"];
const goals: DesignGoal[] = [
  "More cozy",
  "More productive",
  "More elegant",
  "More spacious",
];
const constraints: DesignConstraint[] = [
  "Keep existing furniture",
  "Rental-friendly",
  "No drilling",
  "Pet-safe",
];

interface DesignPreferencesPanelProps {
  disabled?: boolean;
  onGenerate: (preferences: DesignPreferences) => void;
}

export function DesignPreferencesPanel({
  disabled,
  onGenerate,
}: DesignPreferencesPanelProps) {
  const [style, setStyle] = useState<DesignStyle>("Warm Modern");
  const [budget, setBudget] = useState<BudgetTier>("Medium");
  const [goal, setGoal] = useState<DesignGoal>("More cozy");
  const [selectedConstraints, setSelectedConstraints] = useState<DesignConstraint[]>([
    "Keep existing furniture",
    "Rental-friendly",
  ]);
  const [freeformNotes, setFreeformNotes] = useState("");

  function toggleConstraint(constraint: DesignConstraint) {
    setSelectedConstraints((current) =>
      current.includes(constraint)
        ? current.filter((item) => item !== constraint)
        : [...current, constraint],
    );
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-950">Design preferences</h2>
      <p className="text-sm text-zinc-600">Controls that steer the design plan.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Select
          label="Style"
          value={style}
          options={styles}
          onChange={(value) => setStyle(value as DesignStyle)}
        />
        <Select
          label="Budget"
          value={budget}
          options={budgets}
          onChange={(value) => setBudget(value as BudgetTier)}
        />
        <Select
          label="Goal"
          value={goal}
          options={goals}
          onChange={(value) => setGoal(value as DesignGoal)}
        />
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-zinc-700">Constraints</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {constraints.map((constraint) => (
            <button
              key={constraint}
              type="button"
              onClick={() => toggleConstraint(constraint)}
              className={
                selectedConstraints.includes(constraint)
                  ? "rounded-md bg-zinc-950 px-3 py-1.5 text-sm text-white"
                  : "rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-800"
              }
            >
              {constraint}
            </button>
          ))}
        </div>
      </div>

      <label className="mt-4 block text-sm font-medium text-zinc-700">
        Notes
        <textarea
          value={freeformNotes}
          onChange={(event) => setFreeformNotes(event.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          placeholder="Example: make it warmer but keep the desk functional"
        />
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          onGenerate({
            style,
            budget,
            goal,
            constraints: selectedConstraints,
            freeformNotes,
          })
        }
        className="mt-4 rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        Generate design board
      </button>
    </section>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-zinc-700">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

