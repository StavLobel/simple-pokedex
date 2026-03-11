import { GENERATION_ORDER, GENERATION_SPRITE_KEYS, type GenerationName } from "./constants";
import type { PokemonData, TypeDamageRelations } from "./pokeapi";

function genIndex(name: string): number {
  return GENERATION_ORDER.indexOf(name as GenerationName);
}

/**
 * Resolve types for a target generation using past_types.
 * past_types entries provide the complete type list (not a diff) and the
 * generation field marks the last generation those types were active.
 */
export function resolveTypesForGeneration(
  currentTypes: PokemonData["types"],
  pastTypes: PokemonData["past_types"],
  target: GenerationName,
): PokemonData["types"] {
  const targetIdx = genIndex(target);
  if (targetIdx === -1 || pastTypes.length === 0) return currentTypes;

  let best: PokemonData["past_types"][0] | null = null;

  for (const entry of pastTypes) {
    const entryIdx = genIndex(entry.generation.name);
    if (entryIdx >= targetIdx) {
      if (!best || entryIdx < genIndex(best.generation.name)) {
        best = entry;
      }
    }
  }

  return best ? best.types : currentTypes;
}

/**
 * Resolve abilities for a target generation using past_abilities.
 * Each entry lists only changed slots (diff). ability: null means the slot
 * didn't exist yet. Entries whose generation >= target are applicable.
 * For a given slot, the earliest applicable entry wins.
 */
export function resolveAbilitiesForGeneration(
  currentAbilities: PokemonData["abilities"],
  pastAbilities: PokemonData["past_abilities"],
  target: GenerationName,
): PokemonData["abilities"] {
  const targetIdx = genIndex(target);
  if (targetIdx === -1 || pastAbilities.length === 0) return currentAbilities;

  const slotOverrides = new Map<number, PokemonData["past_abilities"][0]["abilities"][0]>();

  for (const entry of pastAbilities) {
    const entryIdx = genIndex(entry.generation.name);
    if (entryIdx >= targetIdx) {
      for (const a of entry.abilities) {
        if (!slotOverrides.has(a.slot)) {
          slotOverrides.set(a.slot, a);
        }
      }
    }
  }

  if (slotOverrides.size === 0) return currentAbilities;

  return currentAbilities
    .map((a) => {
      const override = slotOverrides.get(a.slot);
      if (!override) return a;
      if (override.ability === null) return null;
      return { ...a, ability: override.ability, is_hidden: override.is_hidden };
    })
    .filter((a): a is NonNullable<typeof a> => a !== null);
}

/**
 * Resolve base stats for a target generation using past_stats.
 * Each entry lists only changed stats (diff by stat name).
 * For a given stat, the earliest applicable entry wins.
 */
export function resolveStatsForGeneration(
  currentStats: PokemonData["stats"],
  pastStats: PokemonData["past_stats"],
  target: GenerationName,
): PokemonData["stats"] {
  const targetIdx = genIndex(target);
  if (targetIdx === -1 || pastStats.length === 0) return currentStats;

  const statOverrides = new Map<string, PokemonData["past_stats"][0]["stats"][0]>();

  for (const entry of pastStats) {
    const entryIdx = genIndex(entry.generation.name);
    if (entryIdx >= targetIdx) {
      for (const s of entry.stats) {
        if (!statOverrides.has(s.stat.name)) {
          statOverrides.set(s.stat.name, s);
        }
      }
    }
  }

  if (statOverrides.size === 0) return currentStats;

  return currentStats.map((s) => {
    const override = statOverrides.get(s.stat.name);
    if (!override) return s;
    return { ...s, base_stat: override.base_stat, effort: override.effort };
  });
}

/**
 * Resolve damage relations for a target generation using past_damage_relations.
 * Find the first entry whose generation >= target, use its full damage_relations.
 */
export function resolveDamageRelationsForGeneration(
  currentDR: TypeDamageRelations,
  pastDR: { damage_relations: TypeDamageRelations; generation: { name: string; url: string } }[],
  target: GenerationName,
): TypeDamageRelations {
  const targetIdx = genIndex(target);
  if (targetIdx === -1 || pastDR.length === 0) return currentDR;

  let best: (typeof pastDR)[0] | null = null;

  for (const entry of pastDR) {
    const entryIdx = genIndex(entry.generation.name);
    if (entryIdx >= targetIdx) {
      if (!best || entryIdx < genIndex(best.generation.name)) {
        best = entry;
      }
    }
  }

  return best ? best.damage_relations : currentDR;
}

/**
 * Pick the best sprite for a target generation from sprites.versions,
 * trying each game key in the generation's fallback list.
 * Falls back to official artwork if no generation sprite is found.
 */
export function getSpriteForGeneration(
  sprites: PokemonData["sprites"],
  generation: GenerationName,
): { url: string | null; isPixelArt: boolean } {
  const keys = GENERATION_SPRITE_KEYS[generation];
  const genSprites = sprites.versions?.[generation];

  if (genSprites) {
    for (const key of keys) {
      const sprite = genSprites[key]?.front_default;
      if (sprite) return { url: sprite, isPixelArt: true };
    }
  }

  return {
    url: sprites.other?.["official-artwork"]?.front_default ?? null,
    isPixelArt: false,
  };
}
