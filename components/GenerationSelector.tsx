"use client";

import { useGeneration } from "@/contexts/GenerationContext";
import { GENERATION_ORDER, GENERATION_LABELS, type GenerationName } from "@/lib/constants";

export default function GenerationSelector() {
  const { generation, setGeneration } = useGeneration();

  return (
    <select
      data-testid="generation-selector"
      value={generation}
      onChange={(e) => setGeneration(e.target.value as GenerationName)}
      className="mx-auto mt-4 block w-full max-w-md cursor-pointer rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-foreground backdrop-blur transition hover:border-white/30 focus:border-white/40 focus:outline-none"
    >
      {GENERATION_ORDER.map((gen) => (
        <option key={gen} value={gen} className="bg-[#1a1a2e] text-foreground">
          {GENERATION_LABELS[gen]}
        </option>
      ))}
    </select>
  );
}
