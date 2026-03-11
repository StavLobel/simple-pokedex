"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchAllPokemon } from "@/lib/pokeapi";
import { extractIdFromUrl } from "@/lib/frlg-pokemon";
import { useGeneration } from "@/contexts/GenerationContext";
import { GENERATION_MAX_ID } from "@/lib/constants";

export interface PokemonEntry {
  name: string;
  url: string;
  id: number;
}

interface PokemonContextValue {
  allPokemon: PokemonEntry[];
  masterList: PokemonEntry[];
  loading: boolean;
  error: string | null;
}

const PokemonContext = createContext<PokemonContextValue>({
  allPokemon: [],
  masterList: [],
  loading: true,
  error: null,
});

export function PokemonProvider({ children }: { children: ReactNode }) {
  const [masterList, setMasterList] = useState<PokemonEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { generation } = useGeneration();

  useEffect(() => {
    fetchAllPokemon()
      .then((list) => {
        const withIds = list
          .map((p) => ({ ...p, id: extractIdFromUrl(p.url) }))
          .sort((a, b) => a.id - b.id);
        setMasterList(withIds);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const allPokemon = useMemo(() => {
    const maxId = GENERATION_MAX_ID[generation];
    return masterList.filter((p) => p.id <= maxId);
  }, [masterList, generation]);

  return (
    <PokemonContext.Provider value={{ allPokemon, masterList, loading, error }}>
      {children}
    </PokemonContext.Provider>
  );
}

export function usePokemonList() {
  return useContext(PokemonContext);
}
