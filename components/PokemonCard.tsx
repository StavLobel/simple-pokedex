"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  fetchPokemonData,
  fetchTypeData,
  fetchAbilityData,
  getEnglishFlavorText,
  formatDexNumber,
  type PokemonData,
  type TypeData,
  type AbilityData,
} from "@/lib/pokeapi";
import {
  calculateEffectiveness,
  getWeaknesses,
  getResistances,
  getImmunities,
  type TypeMultiplier,
} from "@/lib/typeEffectiveness";
import type { PokemonTypeName } from "@/lib/constants";
import TypeBadge from "./TypeBadge";
import WeaknessGrid from "./WeaknessGrid";
import AbilityModal from "./AbilityModal";

interface PokemonCardProps {
  pokemonName: string;
}

interface AbilityInfo {
  name: string;
  isHidden: boolean;
  description: string;
}

export default function PokemonCard({ pokemonName }: PokemonCardProps) {
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [weaknesses, setWeaknesses] = useState<TypeMultiplier[]>([]);
  const [resistances, setResistances] = useState<TypeMultiplier[]>([]);
  const [immunities, setImmunities] = useState<TypeMultiplier[]>([]);
  const [abilities, setAbilities] = useState<AbilityInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAbility, setModalAbility] = useState<AbilityInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function loadData() {
      try {
        const pData = await fetchPokemonData(pokemonName);
        if (cancelled) return;
        setPokemon(pData);

        const typePromises = pData.types.map((t) => fetchTypeData(t.type.url));
        const typesData: TypeData[] = await Promise.all(typePromises);
        if (cancelled) return;

        const effectiveness = calculateEffectiveness(typesData);
        setWeaknesses(getWeaknesses(effectiveness));
        setResistances(getResistances(effectiveness));
        setImmunities(getImmunities(effectiveness));

        const abilityPromises = pData.abilities.map(async (a) => {
          const aData: AbilityData = await fetchAbilityData(a.ability.url);
          return {
            name: a.ability.name,
            isHidden: a.is_hidden,
            description: getEnglishFlavorText(aData),
          };
        });
        const abilitiesData = await Promise.all(abilityPromises);
        if (cancelled) return;
        setAbilities(abilitiesData);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [pokemonName]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white/80" />
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="rounded-xl bg-red-500/10 p-6 text-center text-red-400">
        <p className="font-semibold">Failed to load Pokémon data</p>
        <p className="mt-1 text-sm opacity-80">{error}</p>
      </div>
    );
  }

  const artworkUrl = pokemon.sprites.other["official-artwork"].front_default;

  return (
    <>
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left column — Artwork */}
        <div className="flex items-start justify-center">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6">
            {artworkUrl ? (
              <Image
                src={artworkUrl}
                alt={pokemon.name}
                width={400}
                height={400}
                className="h-auto w-full"
                priority
              />
            ) : (
              <div className="flex aspect-square items-center justify-center text-muted">
                No image
              </div>
            )}
          </div>
        </div>

        {/* Right column — Stats */}
        <div className="space-y-6">
          <div>
            <p className="font-mono text-sm text-muted">
              {formatDexNumber(pokemon.id)}
            </p>
            <h2 className="text-3xl font-bold capitalize text-foreground">
              {pokemon.name}
            </h2>
          </div>

          {/* Types */}
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">
              Type
            </h3>
            <div className="flex gap-2">
              {pokemon.types.map((t) => (
                <TypeBadge key={t.type.name} type={t.type.name as PokemonTypeName} />
              ))}
            </div>
          </div>

          {/* Abilities */}
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">
              Abilities
            </h3>
            <div className="flex flex-wrap gap-2">
              {abilities.map((a) => (
                <button
                  key={a.name}
                  onClick={() => setModalAbility(a)}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-sm capitalize text-foreground transition hover:bg-white/10"
                >
                  {a.name.replace("-", " ")}
                  {a.isHidden && (
                    <span className="ml-1 text-[10px] uppercase text-muted">
                      (Hidden)
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Weaknesses / Resistances */}
          <WeaknessGrid
            weaknesses={weaknesses}
            resistances={resistances}
            immunities={immunities}
          />
        </div>
      </div>

      {modalAbility && (
        <AbilityModal
          abilityName={modalAbility.name}
          description={modalAbility.description}
          onClose={() => setModalAbility(null)}
        />
      )}
    </>
  );
}
