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
      className="mx-auto mt-4 block w-full max-w-md cursor-pointer rounded-lg border border-foreground/15 bg-white px-4 py-2.5 text-sm text-foreground transition hover:border-foreground/30 focus:border-foreground/40 focus:outline-none"
    >
      {availableGenerations.map((gen) => (
        <option key={gen} value={gen} className="bg-white text-foreground">
          {GENERATION_LABELS[gen]}
        </option>
      ))}
    </select>
  );
}
