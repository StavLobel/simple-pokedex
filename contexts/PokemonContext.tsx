"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { fetchAllPokemon, type PokemonListEntry } from "@/lib/pokeapi";
import { FRLG_POKEMON_IDS, extractIdFromUrl } from "@/lib/frlg-pokemon";

export interface PokemonEntry {
  name: string;
  url: string;
  id: number;
}

interface PokemonContextValue {
  allPokemon: PokemonEntry[];
  loading: boolean;
  error: string | null;
}

const PokemonContext = createContext<PokemonContextValue>({
  allPokemon: [],
  loading: true,
  error: null,
});

export function PokemonProvider({ children }: { children: ReactNode }) {
  const [allPokemon, setAllPokemon] = useState<PokemonEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllPokemon()
      .then((list) => {
        const frlgPokemon = list
          .map((p) => ({ ...p, id: extractIdFromUrl(p.url) }))
          .filter((p) => FRLG_POKEMON_IDS.has(p.id))
          .sort((a, b) => a.id - b.id);
        setAllPokemon(frlgPokemon);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PokemonContext.Provider value={{ allPokemon, loading, error }}>
      {children}
    </PokemonContext.Provider>
  );
}

export function usePokemonList() {
  return useContext(PokemonContext);
}
