import { ALL_TYPES, type PokemonTypeName } from "./constants";
import type { TypeData } from "./pokeapi";

export interface TypeMultiplier {
  type: PokemonTypeName;
  multiplier: number;
}

export function calculateEffectiveness(typeDataArray: TypeData[]): TypeMultiplier[] {
  const multipliers: Record<string, number> = {};

  for (const t of ALL_TYPES) {
    multipliers[t] = 1;
  }

  for (const typeData of typeDataArray) {
    const dr = typeData.damage_relations;

    for (const t of dr.double_damage_from) {
      if (t.name in multipliers) multipliers[t.name] *= 2;
    }
    for (const t of dr.half_damage_from) {
      if (t.name in multipliers) multipliers[t.name] *= 0.5;
    }
    for (const t of dr.no_damage_from) {
      if (t.name in multipliers) multipliers[t.name] *= 0;
    }
  }

  return ALL_TYPES.map((type) => ({
    type,
    multiplier: multipliers[type],
  }));
}

export function getWeaknesses(effectiveness: TypeMultiplier[]): TypeMultiplier[] {
  return effectiveness
    .filter((e) => e.multiplier > 1)
    .sort((a, b) => b.multiplier - a.multiplier);
}

export function getResistances(effectiveness: TypeMultiplier[]): TypeMultiplier[] {
  return effectiveness
    .filter((e) => e.multiplier > 0 && e.multiplier < 1)
    .sort((a, b) => a.multiplier - b.multiplier);
}

export function getImmunities(effectiveness: TypeMultiplier[]): TypeMultiplier[] {
  return effectiveness.filter((e) => e.multiplier === 0);
}
