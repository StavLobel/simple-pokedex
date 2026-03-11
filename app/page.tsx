"use client";

import { useCallback, useState } from "react";
import { GenerationProvider, useGeneration } from "@/contexts/GenerationContext";
import { PokemonProvider, usePokemonList } from "@/contexts/PokemonContext";
import { getGenerationForId, generationIndex, type GenerationName } from "@/lib/constants";
import GenerationSelector from "@/components/GenerationSelector";
import SearchBar from "@/components/SearchBar";
import PokemonCard from "@/components/PokemonCard";

function PokeSearchContent() {
  const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null);
  const [minGeneration, setMinGeneration] = useState<GenerationName | undefined>(undefined);
  const { masterList } = usePokemonList();
  const { generation, setGeneration } = useGeneration();

  const handleSelect = useCallback(
    (name: string) => {
      setSelectedPokemon(name);
      const entry = masterList.find((p) => p.name === name);
      if (entry) {
        const pokemonGen = getGenerationForId(entry.id);
        setMinGeneration(pokemonGen);
        if (generationIndex(generation) < generationIndex(pokemonGen)) {
          setGeneration(pokemonGen);
        }
      }
    },
    [masterList, generation, setGeneration],
  );

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-foreground">PokéSearch</h1>
        <p className="mt-2 text-muted">
          Search Pokémon to view generation-accurate sprites, types, abilities, stats, and
          weaknesses.
        </p>
        <GenerationSelector minGeneration={minGeneration} />
      </header>

      <SearchBar onSelect={handleSelect} />

      {selectedPokemon && (
        <div className="mx-auto mt-10 max-w-3xl">
          <PokemonCard key={selectedPokemon} pokemonName={selectedPokemon} />
        </div>
      )}
    </main>
  );
}

export default function Home() {
  return (
    <GenerationProvider>
      <PokemonProvider>
        <PokeSearchContent />
      </PokemonProvider>
    </GenerationProvider>
  );
}
