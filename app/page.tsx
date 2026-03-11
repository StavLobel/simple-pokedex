"use client";

import { useState } from "react";
import { PokemonProvider } from "@/contexts/PokemonContext";
import SearchBar from "@/components/SearchBar";
import PokemonCard from "@/components/PokemonCard";

function PokeSearchContent() {
  const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null);

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-foreground">PokéSearch</h1>
        <p className="mt-2 text-muted">
          FireRed & LeafGreen edition — search Pokémon to view their GBA sprites, types, abilities,
          and weaknesses.
        </p>
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
    <PokemonProvider>
      <PokeSearchContent />
    </PokemonProvider>
  );
}
