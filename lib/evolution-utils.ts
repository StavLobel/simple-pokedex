import type { EvolutionChainLink, EvolutionDetail } from "./pokeapi";
import { extractIdFromUrl } from "./pokeapi";
import { GENERATION_MAX_ID, generationIndex, type GenerationName } from "./constants";

export interface EvolutionStage {
  name: string;
  id: number;
  evolutionDetails: EvolutionDetail[];
  evolvesTo: EvolutionStage[];
}

export function flattenChain(link: EvolutionChainLink): EvolutionStage {
  return {
    name: link.species.name,
    id: extractIdFromUrl(link.species.url),
    evolutionDetails: link.evolution_details,
    evolvesTo: link.evolves_to.map(flattenChain),
  };
}

/**
 * Format an evolution method for display, picking the generation-appropriate
 * entry when multiple methods exist.
 */
export function formatEvolutionMethod(
  details: EvolutionDetail[],
  generation: GenerationName,
): string {
  if (details.length === 0) return "";

  const picked = pickDetailForGeneration(details, generation);
  if (!picked) return "";

  return formatSingleDetail(picked);
}

function pickDetailForGeneration(
  details: EvolutionDetail[],
  generation: GenerationName,
): EvolutionDetail | null {
  if (details.length === 1) return details[0];

  const genIdx = generationIndex(generation);
  const hasLocation = details.some((d) => d.location !== null);
  const hasItem = details.some((d) => d.item !== null && d.trigger?.name === "use-item");

  // Leafeon/Glaceon heuristic: location-based for Gen IV-VII, item-based for Gen VIII+
  if (hasLocation && hasItem) {
    if (genIdx >= generationIndex("generation-viii")) {
      return details.find((d) => d.item !== null && d.trigger?.name === "use-item") ?? details[0];
    }
    return details.find((d) => d.location !== null) ?? details[0];
  }

  return details[0];
}

function formatSingleDetail(d: EvolutionDetail): string {
  const parts: string[] = [];

  if (d.trigger?.name === "trade") {
    if (d.held_item) {
      parts.push(`Trade (${formatName(d.held_item.name)})`);
    } else {
      parts.push("Trade");
    }
  } else if (d.trigger?.name === "use-item" && d.item) {
    parts.push(formatName(d.item.name));
  } else if (d.min_level) {
    parts.push(`Lv. ${d.min_level}`);
  }

  if (d.min_happiness) {
    parts.push(`Happiness ≥ ${d.min_happiness}`);
  }

  if (d.time_of_day && d.time_of_day !== "") {
    parts.push(`at ${capitalize(d.time_of_day)}`);
  }

  if (d.known_move_type) {
    parts.push(`Know ${capitalize(d.known_move_type.name)} move`);
  }

  if (d.known_move) {
    parts.push(`Know ${formatName(d.known_move.name)}`);
  }

  if (d.location && d.trigger?.name !== "use-item") {
    parts.push(`at ${formatName(d.location.name)}`);
  }

  if (d.min_beauty) {
    parts.push(`Beauty ≥ ${d.min_beauty}`);
  }

  if (d.min_affection) {
    parts.push(`Affection ≥ ${d.min_affection}`);
  }

  if (d.gender !== null) {
    parts.push(d.gender === 1 ? "♀ only" : "♂ only");
  }

  if (d.needs_overworld_rain) {
    parts.push("in Rain");
  }

  if (d.turn_upside_down) {
    parts.push("Upside Down");
  }

  if (d.relative_physical_stats !== null) {
    if (d.relative_physical_stats === 1) parts.push("Atk > Def");
    else if (d.relative_physical_stats === -1) parts.push("Atk < Def");
    else parts.push("Atk = Def");
  }

  if (parts.length === 0 && d.trigger) {
    parts.push(formatName(d.trigger.name));
  }

  return parts.join(", ");
}

function formatName(name: string): string {
  return name.split("-").map(capitalize).join(" ");
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Determine if a Pokémon (by national dex ID) existed in a given generation.
 */
export function isAvailableInGeneration(pokemonId: number, generation: GenerationName): boolean {
  return pokemonId <= GENERATION_MAX_ID[generation];
}

/**
 * Get the sprite URL for an evolution stage without a full API call.
 */
export function getEvolutionSpriteUrl(pokemonId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
}
