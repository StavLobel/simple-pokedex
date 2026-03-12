"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  fetchSpeciesData,
  fetchEvolutionChain,
  fetchItemData,
  type EvolutionDetail,
} from "@/lib/pokeapi";
import {
  flattenChain,
  formatEvolutionMethod,
  isAvailableInGeneration,
  getEvolutionSpriteUrl,
  collectItemNames,
  type EvolutionStage,
} from "@/lib/evolution-utils";
import type { GenerationName } from "@/lib/constants";

interface EvolutionChainProps {
  pokemonName: string;
  pokemonId: number;
  generation: GenerationName;
}

export default function EvolutionChain({
  pokemonName,
  pokemonId,
  generation,
}: EvolutionChainProps) {
  const [tree, setTree] = useState<EvolutionStage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [itemSprites, setItemSprites] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    async function load() {
      try {
        const species = await fetchSpeciesData(pokemonName);
        if (cancelled) return;
        const chain = await fetchEvolutionChain(species.evolution_chain.url);
        if (cancelled) return;
        const root = flattenChain(chain.chain);
        setTree(root);

        const itemNames = collectItemNames(root);
        if (itemNames.length > 0) {
          const entries = await Promise.all(
            itemNames.map(async (name) => {
              try {
                const item = await fetchItemData(name);
                return [name, item.sprites.default] as const;
              } catch {
                return [name, null] as const;
              }
            }),
          );
          if (!cancelled) {
            const sprites: Record<string, string> = {};
            for (const [name, url] of entries) {
              if (url) sprites[name] = url;
            }
            setItemSprites(sprites);
          }
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [pokemonName]);

  if (loading) {
    return (
      <div className="mt-8" data-testid="evolution-chain">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
          Evolution Chain
        </h3>
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground/80" />
        </div>
      </div>
    );
  }

  if (error || !tree) return null;

  const isSingleStage = tree.evolvesTo.length === 0;

  return (
    <div className="mt-8 overflow-x-auto text-center" data-testid="evolution-chain">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
        Evolution Chain
      </h3>

      {isSingleStage ? (
        <p className="text-sm text-muted" data-testid="no-evolution">
          Does not evolve.
        </p>
      ) : (
        <div className="inline-flex items-center gap-2">
          <StageRow
            stage={tree}
            generation={generation}
            currentPokemonId={pokemonId}
            itemSprites={itemSprites}
            isRoot
          />
        </div>
      )}
    </div>
  );
}

function StageRow({
  stage,
  generation,
  currentPokemonId,
  itemSprites,
  isRoot,
}: {
  stage: EvolutionStage;
  generation: GenerationName;
  currentPokemonId: number;
  itemSprites: Record<string, string>;
  isRoot?: boolean;
}) {
  const available = isAvailableInGeneration(stage.id, generation);
  const isCurrent = stage.id === currentPokemonId;

  return (
    <div className="flex items-center gap-2">
      {!isRoot && stage.evolutionDetails.length > 0 && (
        <EvolutionArrow
          details={stage.evolutionDetails}
          generation={generation}
          itemSprites={itemSprites}
        />
      )}
      <StageSprite stage={stage} available={available} isCurrent={isCurrent} />

      {stage.evolvesTo.length > 0 && (
        <div className={stage.evolvesTo.length === 1 ? "flex items-center" : "flex flex-col gap-2"}>
          {stage.evolvesTo.map((child) => (
            <StageRow
              key={child.id}
              stage={child}
              generation={generation}
              currentPokemonId={currentPokemonId}
              itemSprites={itemSprites}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StageSprite({
  stage,
  available,
  isCurrent,
}: {
  stage: EvolutionStage;
  available: boolean;
  isCurrent: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 flex-col items-center gap-1 ${!available ? "opacity-30" : ""}`}
      data-testid={`evo-stage-${stage.name}`}
    >
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full ${
          isCurrent ? "ring-2 ring-foreground/40 bg-foreground/5" : "bg-foreground/5"
        }`}
      >
        <Image
          src={getEvolutionSpriteUrl(stage.id)}
          alt={stage.name}
          width={48}
          height={48}
          className="h-12 w-12 image-rendering-pixelated"
          unoptimized
        />
      </div>
      <span
        className={`text-xs capitalize ${isCurrent ? "font-bold text-foreground" : "text-muted"}`}
      >
        {stage.name}
      </span>
    </div>
  );
}

function getItemNameFromDetails(details: EvolutionDetail[]): string | null {
  for (const d of details) {
    if (d.trigger?.name === "use-item" && d.item) return d.item.name;
    if (d.trigger?.name === "trade" && d.held_item) return d.held_item.name;
  }
  return null;
}

function EvolutionArrow({
  details,
  generation,
  itemSprites,
}: {
  details: EvolutionDetail[];
  generation: GenerationName;
  itemSprites: Record<string, string>;
}) {
  const method = formatEvolutionMethod(details, generation);
  const itemName = getItemNameFromDetails(details);
  const itemSpriteUrl = itemName ? itemSprites[itemName] : undefined;

  return (
    <div className="flex shrink-0 flex-col items-center gap-0.5 px-1" data-testid="evo-arrow">
      <span className="text-lg text-muted">→</span>
      {itemSpriteUrl && (
        <Image
          src={itemSpriteUrl}
          alt={itemName!}
          width={16}
          height={16}
          className="h-4 w-4 image-rendering-pixelated"
          unoptimized
          data-testid="evo-item-icon"
        />
      )}
      {method && (
        <span className="max-w-24 text-center text-[10px] leading-tight text-muted">{method}</span>
      )}
    </div>
  );
}
