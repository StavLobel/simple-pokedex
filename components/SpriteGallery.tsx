"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import {
  GENERATION_ORDER,
  GENERATION_SPRITE_KEYS,
  GAME_DISPLAY_NAMES,
  GENERATION_SHORT_LABELS,
  type GenerationName,
} from "@/lib/constants";
import type { PokemonData } from "@/lib/pokeapi";

interface SpriteGalleryProps {
  sprites: PokemonData["sprites"];
}

interface SpriteOption {
  generation: GenerationName;
  gameKey: string;
  label: string;
  url: string;
  shinyUrl: string | null;
}

export default function SpriteGallery({ sprites }: SpriteGalleryProps) {
  const options = useMemo(() => {
    const result: SpriteOption[] = [];
    for (const gen of GENERATION_ORDER) {
      const genSprites = sprites.versions?.[gen];
      if (!genSprites) continue;
      for (const gameKey of GENERATION_SPRITE_KEYS[gen]) {
        const gameData = genSprites[gameKey];
        const url = gameData?.front_default;
        if (url) {
          const gameName = GAME_DISPLAY_NAMES[gameKey] ?? gameKey;
          result.push({
            generation: gen,
            gameKey,
            label: `${GENERATION_SHORT_LABELS[gen]} — ${gameName}`,
            url,
            shinyUrl: gameData?.front_shiny ?? null,
          });
        }
      }
    }
    return result;
  }, [sprites]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHoldingShiny, setIsHoldingShiny] = useState(false);

  const handlePointerDown = useCallback(() => setIsHoldingShiny(true), []);
  const handlePointerUp = useCallback(() => setIsHoldingShiny(false), []);

  if (options.length === 0) return null;

  const current = options[selectedIndex] ?? options[0];
  const hasShiny = !!current.shinyUrl;
  const displayUrl = isHoldingShiny && hasShiny ? current.shinyUrl! : current.url;

  return (
    <div
      className="mt-10 rounded-2xl border border-foreground/10 bg-surface p-6"
      data-testid="sprite-gallery"
    >
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
        Generation Sprites
      </h3>

      <div className="flex flex-col items-center gap-4">
        <select
          value={selectedIndex}
          onChange={(e) => setSelectedIndex(Number(e.target.value))}
          className="w-full max-w-xs rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground"
          data-testid="sprite-gallery-select"
        >
          {options.map((opt, i) => (
            <option key={`${opt.generation}-${opt.gameKey}`} value={i}>
              {opt.label}
            </option>
          ))}
        </select>

        <div
          className={`flex h-32 w-32 items-center justify-center${hasShiny ? " cursor-pointer select-none" : ""}`}
          onPointerDown={hasShiny ? handlePointerDown : undefined}
          onPointerUp={hasShiny ? handlePointerUp : undefined}
          onPointerLeave={hasShiny ? handlePointerUp : undefined}
          onPointerCancel={hasShiny ? handlePointerUp : undefined}
          data-testid="sprite-gallery-sprite-container"
        >
          <Image
            src={displayUrl}
            alt={`${current.label} sprite`}
            width={96}
            height={96}
            className={`image-rendering-pixelated h-auto w-24${
              isHoldingShiny && hasShiny ? " animate-pulse brightness-110" : ""
            }`}
            unoptimized
            data-testid="sprite-gallery-image"
          />
        </div>

        {hasShiny && <p className="text-xs text-muted">Hold sprite to view shiny</p>}
        {!hasShiny && current.generation === "generation-i" && (
          <p className="text-xs text-muted">Shiny sprites not available in Gen I</p>
        )}
      </div>
    </div>
  );
}
