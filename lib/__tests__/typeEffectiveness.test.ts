import { describe, it, expect } from "vitest";
import {
  calculateEffectiveness,
  getWeaknesses,
  getResistances,
  getImmunities,
} from "../typeEffectiveness";
import type { TypeData } from "../pokeapi";

function makeTypeData(overrides: Partial<TypeData["damage_relations"]>): TypeData {
  return {
    name: "test",
    damage_relations: {
      double_damage_from: [],
      double_damage_to: [],
      half_damage_from: [],
      half_damage_to: [],
      no_damage_from: [],
      no_damage_to: [],
      ...overrides,
    },
  };
}

describe("calculateEffectiveness", () => {
  it("returns x1 for all types when no damage relations exist", () => {
    const result = calculateEffectiveness([makeTypeData({})]);
    expect(result.every((r) => r.multiplier === 1)).toBe(true);
  });

  it("returns x2 for types in double_damage_from", () => {
    const result = calculateEffectiveness([
      makeTypeData({ double_damage_from: [{ name: "fire" }] }),
    ]);
    const fire = result.find((r) => r.type === "fire");
    expect(fire?.multiplier).toBe(2);
  });

  it("returns x0.5 for types in half_damage_from", () => {
    const result = calculateEffectiveness([
      makeTypeData({ half_damage_from: [{ name: "water" }] }),
    ]);
    const water = result.find((r) => r.type === "water");
    expect(water?.multiplier).toBe(0.5);
  });

  it("returns x0 for types in no_damage_from", () => {
    const result = calculateEffectiveness([
      makeTypeData({ no_damage_from: [{ name: "ghost" }] }),
    ]);
    const ghost = result.find((r) => r.type === "ghost");
    expect(ghost?.multiplier).toBe(0);
  });

  it("stacks multipliers across dual types (x4 weakness)", () => {
    const result = calculateEffectiveness([
      makeTypeData({ double_damage_from: [{ name: "ice" }] }),
      makeTypeData({ double_damage_from: [{ name: "ice" }] }),
    ]);
    const ice = result.find((r) => r.type === "ice");
    expect(ice?.multiplier).toBe(4);
  });

  it("cancels out weakness and resistance (x1 neutral)", () => {
    const result = calculateEffectiveness([
      makeTypeData({ double_damage_from: [{ name: "electric" }] }),
      makeTypeData({ half_damage_from: [{ name: "electric" }] }),
    ]);
    const electric = result.find((r) => r.type === "electric");
    expect(electric?.multiplier).toBe(1);
  });
});

describe("getWeaknesses", () => {
  it("returns only types with multiplier > 1, sorted descending", () => {
    const effectiveness = calculateEffectiveness([
      makeTypeData({
        double_damage_from: [{ name: "fire" }, { name: "ice" }],
        half_damage_from: [{ name: "water" }],
      }),
      makeTypeData({ double_damage_from: [{ name: "fire" }] }),
    ]);
    const weaknesses = getWeaknesses(effectiveness);
    expect(weaknesses[0].type).toBe("fire");
    expect(weaknesses[0].multiplier).toBe(4);
    expect(weaknesses.every((w) => w.multiplier > 1)).toBe(true);
  });
});

describe("getResistances", () => {
  it("returns only types with 0 < multiplier < 1", () => {
    const effectiveness = calculateEffectiveness([
      makeTypeData({ half_damage_from: [{ name: "grass" }, { name: "bug" }] }),
    ]);
    const resistances = getResistances(effectiveness);
    expect(resistances.length).toBe(2);
    expect(resistances.every((r) => r.multiplier > 0 && r.multiplier < 1)).toBe(true);
  });
});

describe("getImmunities", () => {
  it("returns only types with multiplier === 0", () => {
    const effectiveness = calculateEffectiveness([
      makeTypeData({ no_damage_from: [{ name: "normal" }, { name: "fighting" }] }),
    ]);
    const immunities = getImmunities(effectiveness);
    expect(immunities.length).toBe(2);
    expect(immunities.every((i) => i.multiplier === 0)).toBe(true);
  });
});
