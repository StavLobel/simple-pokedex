"use client";

import { useState } from "react";
import { GenerationProvider } from "@/contexts/GenerationContext";
import { PokemonProvider } from "@/contexts/PokemonContext";
import GenerationSelector from "@/components/GenerationSelector";
import SearchBar from "@/components/SearchBar";
import PokemonCard from "@/components/PokemonCard";

function PokeSearchContent() {
  const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null);

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-foreground">PokéSearch</h1>
        <p className="mt-2 text-muted">
          Search Pokémon to view generation-accurate sprites, types, abilities, stats, and
          weaknesses.
        </p>
        <GenerationSelector />
      </header>

      <SearchBar onSelect={setSelectedPokemon} />

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
