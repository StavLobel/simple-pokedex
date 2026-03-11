export interface PokemonListEntry {
  name: string;
  url: string;
}

export interface PokemonData {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    other: {
      "official-artwork": {
        front_default: string | null;
      };
    };
    versions: {
      "generation-iii": {
        "firered-leafgreen": {
          front_default: string | null;
        };
      };
    };
  };
  types: {
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }[];
  abilities: {
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }[];
}

export interface TypeDamageRelations {
  double_damage_from: { name: string }[];
  double_damage_to: { name: string }[];
  half_damage_from: { name: string }[];
  half_damage_to: { name: string }[];
  no_damage_from: { name: string }[];
  no_damage_to: { name: string }[];
}

export interface TypeData {
  name: string;
  damage_relations: TypeDamageRelations;
}

export interface AbilityFlavorEntry {
  flavor_text: string;
  language: { name: string };
  version_group: { name: string };
}

export interface AbilityData {
  name: string;
  flavor_text_entries: AbilityFlavorEntry[];
}

import { POKEAPI_BASE_URL } from "./constants";

const BASE_URL = POKEAPI_BASE_URL;

export async function fetchAllPokemon(): Promise<PokemonListEntry[]> {
  const res = await fetch(`${BASE_URL}/pokemon?limit=1302`);
  if (!res.ok) throw new Error("Failed to fetch Pokémon list");
  const data = await res.json();
  return data.results;
}

export async function fetchPokemonData(nameOrId: string | number): Promise<PokemonData> {
  const res = await fetch(`${BASE_URL}/pokemon/${nameOrId}`);
  if (!res.ok) throw new Error(`Failed to fetch Pokémon: ${nameOrId}`);
  return res.json();
}

export async function fetchTypeData(url: string): Promise<TypeData> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch type data");
  return res.json();
}

export async function fetchAbilityData(url: string): Promise<AbilityData> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch ability data");
  return res.json();
}

export function getEnglishFlavorText(ability: AbilityData): string {
  const entry = ability.flavor_text_entries
    .filter((e) => e.language.name === "en")
    .pop();
  return entry?.flavor_text ?? "No description available.";
}

export function formatDexNumber(id: number): string {
  return `#${String(id).padStart(3, "0")}`;
}

export function getFrlgSprite(pokemon: PokemonData): string | null {
  return (
    pokemon.sprites.versions?.["generation-iii"]?.["firered-leafgreen"]
      ?.front_default ?? null
  );
}
