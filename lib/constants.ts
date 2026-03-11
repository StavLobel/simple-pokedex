export const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

export const ALL_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export type PokemonTypeName = (typeof ALL_TYPES)[number];

export const TYPE_COLORS: Record<PokemonTypeName, string> = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};

export const GENERATION_ORDER = [
  "generation-i",
  "generation-ii",
  "generation-iii",
  "generation-iv",
  "generation-v",
  "generation-vi",
  "generation-vii",
  "generation-viii",
  "generation-ix",
] as const;

export type GenerationName = (typeof GENERATION_ORDER)[number];

export const DEFAULT_GENERATION: GenerationName = "generation-iii";

export const GENERATION_LABELS: Record<GenerationName, string> = {
  "generation-i": "Gen I \u2014 Red, Blue, Yellow",
  "generation-ii": "Gen II \u2014 Gold, Silver, Crystal",
  "generation-iii": "Gen III \u2014 Ruby, Sapphire, Emerald, FireRed, LeafGreen",
  "generation-iv": "Gen IV \u2014 Diamond, Pearl, Platinum, HeartGold, SoulSilver",
  "generation-v": "Gen V \u2014 Black, White, Black 2, White 2",
  "generation-vi": "Gen VI \u2014 X, Y, Omega Ruby, Alpha Sapphire",
  "generation-vii":
    "Gen VII \u2014 Sun, Moon, Ultra Sun, Ultra Moon, Let\u2019s Go Pikachu, Let\u2019s Go Eevee",
  "generation-viii":
    "Gen VIII \u2014 Sword, Shield, Brilliant Diamond, Shining Pearl, Legends: Arceus",
  "generation-ix": "Gen IX \u2014 Scarlet, Violet, Legends: Z-A",
};

export function getGenerationForId(id: number): GenerationName {
  for (const gen of GENERATION_ORDER) {
    if (id <= GENERATION_MAX_ID[gen]) return gen;
  }
  return GENERATION_ORDER[GENERATION_ORDER.length - 1];
}

export function generationIndex(gen: GenerationName): number {
  return GENERATION_ORDER.indexOf(gen);
}

export const GENERATION_MAX_ID: Record<GenerationName, number> = {
  "generation-i": 151,
  "generation-ii": 251,
  "generation-iii": 386,
  "generation-iv": 493,
  "generation-v": 649,
  "generation-vi": 721,
  "generation-vii": 809,
  "generation-viii": 905,
  "generation-ix": 1025,
};

export const GENERATION_SPRITE_KEYS: Record<GenerationName, string[]> = {
  "generation-i": ["red-blue", "yellow"],
  "generation-ii": ["crystal", "gold", "silver"],
  "generation-iii": ["firered-leafgreen", "ruby-sapphire", "emerald"],
  "generation-iv": ["heartgold-soulsilver", "platinum", "diamond-pearl"],
  "generation-v": ["black-white"],
  "generation-vi": ["x-y", "omegaruby-alphasapphire"],
  "generation-vii": ["ultra-sun-ultra-moon"],
  "generation-viii": ["brilliant-diamond-shining-pearl"],
  "generation-ix": ["scarlet-violet"],
};

export const GAME_DISPLAY_NAMES: Record<string, string> = {
  "red-blue": "Red / Blue",
  yellow: "Yellow",
  crystal: "Crystal",
  gold: "Gold",
  silver: "Silver",
  "firered-leafgreen": "FireRed / LeafGreen",
  "ruby-sapphire": "Ruby / Sapphire",
  emerald: "Emerald",
  "heartgold-soulsilver": "HeartGold / SoulSilver",
  platinum: "Platinum",
  "diamond-pearl": "Diamond / Pearl",
  "black-white": "Black / White",
  "x-y": "X / Y",
  "omegaruby-alphasapphire": "Omega Ruby / Alpha Sapphire",
  "ultra-sun-ultra-moon": "Ultra Sun / Ultra Moon",
  "brilliant-diamond-shining-pearl": "Brilliant Diamond / Shining Pearl",
  "scarlet-violet": "Scarlet / Violet",
};

export const GENERATION_SHORT_LABELS: Record<GenerationName, string> = {
  "generation-i": "Gen I",
  "generation-ii": "Gen II",
  "generation-iii": "Gen III",
  "generation-iv": "Gen IV",
  "generation-v": "Gen V",
  "generation-vi": "Gen VI",
  "generation-vii": "Gen VII",
  "generation-viii": "Gen VIII",
  "generation-ix": "Gen IX",
};

export const TYPES_BY_GENERATION: Record<GenerationName, readonly PokemonTypeName[]> = {
  "generation-i": [
    "normal",
    "fire",
    "water",
    "electric",
    "grass",
    "ice",
    "fighting",
    "poison",
    "ground",
    "flying",
    "psychic",
    "bug",
    "rock",
    "ghost",
    "dragon",
  ],
  "generation-ii": [
    "normal",
    "fire",
    "water",
    "electric",
    "grass",
    "ice",
    "fighting",
    "poison",
    "ground",
    "flying",
    "psychic",
    "bug",
    "rock",
    "ghost",
    "dragon",
    "dark",
    "steel",
  ],
  "generation-iii": [
    "normal",
    "fire",
    "water",
    "electric",
    "grass",
    "ice",
    "fighting",
    "poison",
    "ground",
    "flying",
    "psychic",
    "bug",
    "rock",
    "ghost",
    "dragon",
    "dark",
    "steel",
  ],
  "generation-iv": [
    "normal",
    "fire",
    "water",
    "electric",
    "grass",
    "ice",
    "fighting",
    "poison",
    "ground",
    "flying",
    "psychic",
    "bug",
    "rock",
    "ghost",
    "dragon",
    "dark",
    "steel",
  ],
  "generation-v": [
    "normal",
    "fire",
    "water",
    "electric",
    "grass",
    "ice",
    "fighting",
    "poison",
    "ground",
    "flying",
    "psychic",
    "bug",
    "rock",
    "ghost",
    "dragon",
    "dark",
    "steel",
  ],
  "generation-vi": ALL_TYPES,
  "generation-vii": ALL_TYPES,
  "generation-viii": ALL_TYPES,
  "generation-ix": ALL_TYPES,
};
