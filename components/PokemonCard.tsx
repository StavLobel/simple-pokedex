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
import { TYPES_BY_GENERATION, type PokemonTypeName } from "@/lib/constants";
import {
  resolveTypesForGeneration,
  resolveAbilitiesForGeneration,
  resolveStatsForGeneration,
  resolveDamageRelationsForGeneration,
  getSpriteForGeneration,
} from "@/lib/generation-resolver";
import { useGeneration } from "@/contexts/GenerationContext";
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

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Atk",
  defense: "Def",
  "special-attack": "Sp.Atk",
  "special-defense": "Sp.Def",
  speed: "Speed",
  special: "Special",
};

const STAT_COLORS: Record<string, string> = {
  hp: "bg-red-500",
  attack: "bg-orange-500",
  defense: "bg-yellow-500",
  "special-attack": "bg-blue-500",
  "special-defense": "bg-green-500",
  speed: "bg-pink-500",
  special: "bg-purple-500",
};

export default function PokemonCard({ pokemonName }: PokemonCardProps) {
  const { generation } = useGeneration();
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [resolvedStats, setResolvedStats] = useState<PokemonData["stats"]>([]);
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

        pData.types = resolveTypesForGeneration(pData.types, pData.past_types, generation);
        pData.abilities = resolveAbilitiesForGeneration(
          pData.abilities,
          pData.past_abilities,
          generation,
        );
        const stats = resolveStatsForGeneration(pData.stats, pData.past_stats, generation);

        setPokemon(pData);
        setResolvedStats(stats);

        const typePromises = pData.types.map((t) => fetchTypeData(t.type.url));
        const typesData: TypeData[] = await Promise.all(typePromises);
        if (cancelled) return;

        const resolvedTypesData = typesData.map((td) => ({
          ...td,
          damage_relations: resolveDamageRelationsForGeneration(
            td.damage_relations,
            td.past_damage_relations,
            generation,
          ),
        }));

        const availableTypes = new Set(TYPES_BY_GENERATION[generation]);
        const effectiveness = calculateEffectiveness(resolvedTypesData).filter((e) =>
          availableTypes.has(e.type),
        );
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
  }, [pokemonName, generation]);

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

  const sprite = getSpriteForGeneration(pokemon.sprites, generation);

  return (
    <>
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left column — Sprite */}
        <div className="flex items-start justify-center">
          <div
            className="flex aspect-square w-full max-w-sm items-center justify-center rounded-2xl bg-transparent"
            style={{
              backgroundImage: "url(/pokeball.png)",
              backgroundSize: "85%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {sprite.url ? (
              <Image
                src={sprite.url}
                alt={pokemon.name}
                width={sprite.isPixelArt ? 96 : 400}
                height={sprite.isPixelArt ? 96 : 400}
                className={
                  sprite.isPixelArt
                    ? "relative z-10 h-auto w-48 image-rendering-pixelated drop-shadow-lg"
                    : "relative z-10 h-auto w-full drop-shadow-lg"
                }
                unoptimized={sprite.isPixelArt}
                priority
              />
            ) : (
              <div className="flex items-center justify-center text-muted">No image</div>
            )}
          </div>
        </div>

        {/* Right column — Details */}
        <div className="space-y-6">
          <div>
            <p className="font-mono text-sm text-muted">{formatDexNumber(pokemon.id)}</p>
            <h2 className="text-3xl font-bold capitalize text-foreground">{pokemon.name}</h2>
          </div>

          {/* Types */}
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">Type</h3>
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
                    <span className="ml-1 text-[10px] uppercase text-muted">(Hidden)</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Base Stats */}
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">
              Base Stats
            </h3>
            <div className="space-y-2" data-testid="stats-section">
              {resolvedStats.map((s) => {
                const label = STAT_LABELS[s.stat.name] ?? s.stat.name;
                const color = STAT_COLORS[s.stat.name] ?? "bg-gray-500";
                const pct = Math.min((s.base_stat / 255) * 100, 100);
                return (
                  <div key={s.stat.name} className="flex items-center gap-3">
                    <span className="w-14 text-right text-xs font-medium text-muted">{label}</span>
                    <span className="w-8 text-right font-mono text-sm text-foreground">
                      {s.base_stat}
                    </span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full ${color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weaknesses / Resistances */}
          <WeaknessGrid weaknesses={weaknesses} resistances={resistances} immunities={immunities} />
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
