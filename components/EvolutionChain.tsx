"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { fetchSpeciesData, fetchEvolutionChain, type EvolutionDetail } from "@/lib/pokeapi";
import {
  flattenChain,
  formatEvolutionMethod,
  isAvailableInGeneration,
  getEvolutionSpriteUrl,
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
        setTree(flattenChain(chain.chain));
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
    <div className="mt-8" data-testid="evolution-chain">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
        Evolution Chain
      </h3>

      {isSingleStage ? (
        <p className="text-sm text-muted" data-testid="no-evolution">
          Does not evolve.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <ChainNode stage={tree} generation={generation} currentPokemonId={pokemonId} isRoot />
        </div>
      )}
    </div>
  );
}

function ChainNode({
  stage,
  generation,
  currentPokemonId,
  isRoot,
}: {
  stage: EvolutionStage;
  generation: GenerationName;
  currentPokemonId: number;
  isRoot?: boolean;
}) {
  const available = isAvailableInGeneration(stage.id, generation);
  const isCurrent = stage.id === currentPokemonId;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {!isRoot && stage.evolutionDetails.length > 0 && (
          <EvolutionArrow details={stage.evolutionDetails} generation={generation} />
        )}
        <StageSprite stage={stage} available={available} isCurrent={isCurrent} />
      </div>

      {stage.evolvesTo.length > 0 && (
        <div className={`flex flex-col gap-3 ${stage.evolvesTo.length > 1 ? "pl-6" : "pl-0"}`}>
          {stage.evolvesTo.map((child) => (
            <div key={child.id} className="flex items-center gap-2">
              <EvolutionArrow details={child.evolutionDetails} generation={generation} />
              <StageSprite
                stage={child}
                available={isAvailableInGeneration(child.id, generation)}
                isCurrent={child.id === currentPokemonId}
              />
              {child.evolvesTo.length > 0 && (
                <div className="flex flex-col gap-2">
                  {child.evolvesTo.map((grandchild) => (
                    <div key={grandchild.id} className="flex items-center gap-2">
                      <EvolutionArrow
                        details={grandchild.evolutionDetails}
                        generation={generation}
                      />
                      <StageSprite
                        stage={grandchild}
                        available={isAvailableInGeneration(grandchild.id, generation)}
                        isCurrent={grandchild.id === currentPokemonId}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
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
      className={`flex flex-col items-center gap-1 ${!available ? "opacity-30" : ""}`}
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

function EvolutionArrow({
  details,
  generation,
}: {
  details: EvolutionDetail[];
  generation: GenerationName;
}) {
  const method = formatEvolutionMethod(details, generation);
  return (
    <div className="flex flex-col items-center gap-0.5 px-1" data-testid="evo-arrow">
      <span className="text-lg text-muted">→</span>
      {method && (
        <span className="max-w-24 text-center text-[10px] leading-tight text-muted">{method}</span>
      )}
    </div>
  );
}
