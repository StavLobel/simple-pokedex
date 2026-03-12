"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  fetchPokemonData,
  fetchTypeData,
  fetchAbilityData,
  fetchSpeciesData,
  getEnglishFlavorText,
  formatDexNumber,
  type PokemonData,
  type TypeData,
  type AbilityData,
  type SpeciesVariety,
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
} from "@/lib/generation-resolver";
import { useGeneration } from "@/contexts/GenerationContext";
import { getAvailableVariants, hasRegionalVariants, type VariantOption } from "@/lib/variant-utils";
import TypeBadge from "./TypeBadge";
import WeaknessGrid from "./WeaknessGrid";
import AbilityModal from "./AbilityModal";
import SpriteGallery from "./SpriteGallery";
import EvolutionChain from "./EvolutionChain";
import GenerationSelector from "./GenerationSelector";
import type { GenerationName } from "@/lib/constants";

interface PokemonCardProps {
  pokemonName: string;
  minGeneration?: GenerationName;
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

export default function PokemonCard({ pokemonName, minGeneration }: PokemonCardProps) {
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

  const [varieties, setVarieties] = useState<SpeciesVariety[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<string>(pokemonName);
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);

  // Fetch species data to discover variants
  useEffect(() => {
    let cancelled = false;

    async function loadSpecies() {
      try {
        const species = await fetchSpeciesData(pokemonName);
        if (cancelled) return;
        setVarieties(species.varieties);
      } catch {
        if (!cancelled) setVarieties([]);
      }
    }

    setSelectedVariant(pokemonName);
    loadSpecies();
    return () => {
      cancelled = true;
    };
  }, [pokemonName]);

  // Update available variant options when generation or varieties change
  useEffect(() => {
    if (varieties.length <= 1 || !hasRegionalVariants(varieties, pokemonName)) {
      setVariantOptions([]);
      return;
    }

    const options = getAvailableVariants(varieties, pokemonName, generation);
    setVariantOptions(options);

    // Reset to standard if current variant is no longer available
    if (!options.some((o) => o.name === selectedVariant)) {
      const defaultOpt = options.find((o) => o.isDefault);
      setSelectedVariant(defaultOpt?.name ?? pokemonName);
    }
  }, [varieties, generation, pokemonName, selectedVariant]);

  // Fetch pokemon data for the selected variant
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function loadData() {
      try {
        const pData = await fetchPokemonData(selectedVariant);
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
  }, [selectedVariant, generation]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-foreground/20 border-t-foreground/80" />
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

  const normalSprite = pokemon.sprites.front_default;
  const shinySprite = pokemon.sprites.front_shiny;

  return (
    <>
      <div className="space-y-6 text-center">
        {/* Name & Type */}
        <div>
          <p className="font-mono text-sm text-muted">{formatDexNumber(pokemon.id)}</p>
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-3xl font-bold capitalize text-foreground">{pokemon.name}</h2>
            {variantOptions.length > 1 && (
              <select
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className="rounded-lg border border-foreground/15 bg-background px-2 py-1 text-sm text-foreground"
                data-testid="variant-selector"
              >
                {variantOptions.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">Type</h3>
          <div className="flex justify-center gap-2">
            {pokemon.types.map((t) => (
              <TypeBadge key={t.type.name} type={t.type.name as PokemonTypeName} />
            ))}
          </div>
        </div>

        {/* Sprites */}
        <div className="flex items-start justify-center" data-testid="main-sprite-container">
          <div className="flex max-w-md flex-row items-center justify-center gap-6">
            {normalSprite ? (
              <div className="flex flex-col items-center gap-1">
                <div
                  className="flex aspect-square w-36 items-center justify-center rounded-2xl bg-transparent sm:w-44"
                  style={{
                    backgroundImage: "url(/pokeball.png)",
                    backgroundSize: "85%",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  <Image
                    src={normalSprite}
                    alt={pokemon.name}
                    width={400}
                    height={400}
                    className="relative z-10 h-auto w-full drop-shadow-lg"
                    priority
                    data-testid="normal-sprite"
                  />
                </div>
                <span className="text-xs text-muted" data-testid="normal-sprite-label">
                  Normal
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center text-muted">No image</div>
            )}
            {shinySprite && (
              <div className="flex flex-col items-center gap-1">
                <div
                  className="flex aspect-square w-36 items-center justify-center rounded-2xl bg-transparent sm:w-44"
                  style={{
                    backgroundImage: "url(/pokeball.png)",
                    backgroundSize: "85%",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  <Image
                    src={shinySprite}
                    alt={`${pokemon.name} shiny`}
                    width={400}
                    height={400}
                    className="relative z-10 h-auto w-full drop-shadow-lg"
                    priority
                    data-testid="shiny-sprite"
                  />
                </div>
                <span className="text-xs text-muted" data-testid="shiny-sprite-label">
                  Shiny
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Generation Selector */}
        <GenerationSelector minGeneration={minGeneration} compact />

        {/* Abilities */}
        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">
            Abilities
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {abilities.map((a) => (
              <button
                key={a.name}
                onClick={() => setModalAbility(a)}
                className="rounded-lg border border-foreground/15 px-3 py-1.5 text-sm capitalize text-foreground transition hover:bg-foreground/10"
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
          <div className="mx-auto max-w-md space-y-2" data-testid="stats-section">
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
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-foreground/10">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weaknesses / Resistances */}
        <WeaknessGrid weaknesses={weaknesses} resistances={resistances} immunities={immunities} />
      </div>

      <EvolutionChain pokemonName={pokemonName} pokemonId={pokemon.id} generation={generation} />

      <SpriteGallery sprites={pokemon.sprites} />

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
