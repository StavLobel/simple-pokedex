"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { fetchAllPokemon, type PokemonListEntry } from "@/lib/pokeapi";

interface PokemonContextValue {
  allPokemon: PokemonListEntry[];
  loading: boolean;
  error: string | null;
}

const PokemonContext = createContext<PokemonContextValue>({
  allPokemon: [],
  loading: true,
  error: null,
});

export function PokemonProvider({ children }: { children: ReactNode }) {
  const [allPokemon, setAllPokemon] = useState<PokemonListEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllPokemon()
      .then(setAllPokemon)
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
