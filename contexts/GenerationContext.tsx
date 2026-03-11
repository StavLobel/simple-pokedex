"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { DEFAULT_GENERATION, type GenerationName } from "@/lib/constants";

interface GenerationContextValue {
  generation: GenerationName;
  setGeneration: (gen: GenerationName) => void;
}

const GenerationContext = createContext<GenerationContextValue>({
  generation: DEFAULT_GENERATION,
  setGeneration: () => {},
});

export function GenerationProvider({ children }: { children: ReactNode }) {
  const [generation, setGeneration] = useState<GenerationName>(DEFAULT_GENERATION);

  return (
    <GenerationContext.Provider value={{ generation, setGeneration }}>
      {children}
    </GenerationContext.Provider>
  );
}

export function useGeneration() {
  return useContext(GenerationContext);
}
