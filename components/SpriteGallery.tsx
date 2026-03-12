"use client";

import { useState, useMemo } from "react";
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
          });
        }
      }
    }
    return result;
  }, [sprites]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  if (options.length === 0) return null;

  const current = options[selectedIndex] ?? options[0];

  return (
    <div
      className="mt-10 rounded-2xl border border-foreground/10 bg-surface p-6 text-center"
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
          className="flex flex-col items-center gap-4"
          data-testid="sprite-gallery-sprite-container"
        >
          <div className="flex h-32 w-32 items-center justify-center">
            <Image
              src={current.url}
              alt={`${current.label} sprite`}
              width={96}
              height={96}
              className="image-rendering-pixelated h-auto w-24"
              unoptimized
              data-testid="sprite-gallery-image"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
