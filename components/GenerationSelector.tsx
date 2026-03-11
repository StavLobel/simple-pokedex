"use client";

import { useMemo } from "react";
import { useGeneration } from "@/contexts/GenerationContext";
import {
  GENERATION_ORDER,
  GENERATION_LABELS,
  generationIndex,
  type GenerationName,
} from "@/lib/constants";

export interface GenerationSelectorProps {
  minGeneration?: GenerationName;
}

export default function GenerationSelector({ minGeneration }: GenerationSelectorProps) {
  const { generation, setGeneration } = useGeneration();

  const availableGenerations = useMemo(() => {
    if (!minGeneration) return [...GENERATION_ORDER];
    const minIdx = generationIndex(minGeneration);
    return GENERATION_ORDER.filter((_, i) => i >= minIdx);
  }, [minGeneration]);

  return (
    <select
      data-testid="generation-selector"
      value={generation}
      onChange={(e) => setGeneration(e.target.value as GenerationName)}
      className="mx-auto mt-4 block w-full max-w-md cursor-pointer rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-foreground backdrop-blur transition hover:border-white/30 focus:border-white/40 focus:outline-none"
    >
      {availableGenerations.map((gen) => (
        <option key={gen} value={gen} className="bg-[#1a1a2e] text-foreground">
          {GENERATION_LABELS[gen]}
        </option>
      ))}
    </select>
  );
}
