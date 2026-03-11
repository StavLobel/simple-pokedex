import { describe, it, expect } from "vitest";
import { formatDexNumber, getEnglishFlavorText } from "../pokeapi";
import type { AbilityData } from "../pokeapi";

describe("formatDexNumber", () => {
  it("pads single-digit IDs to 3 digits", () => {
    expect(formatDexNumber(1)).toBe("#001");
  });

  it("pads double-digit IDs to 3 digits", () => {
    expect(formatDexNumber(25)).toBe("#025");
  });

  it("leaves triple-digit IDs unchanged", () => {
    expect(formatDexNumber(150)).toBe("#150");
  });

  it("does not truncate IDs with more than 3 digits", () => {
    expect(formatDexNumber(1000)).toBe("#1000");
  });
});

describe("getEnglishFlavorText", () => {
  it("returns the last English entry", () => {
    const ability: AbilityData = {
      name: "overgrow",
      flavor_text_entries: [
        { flavor_text: "Beschreibung", language: { name: "de" }, version_group: { name: "x-y" } },
        { flavor_text: "Powers up Grass-type moves.", language: { name: "en" }, version_group: { name: "x-y" } },
        { flavor_text: "Boosts Grass moves in a pinch.", language: { name: "en" }, version_group: { name: "sword-shield" } },
      ],
    };
    expect(getEnglishFlavorText(ability)).toBe("Boosts Grass moves in a pinch.");
  });

  it("returns fallback when no English entry exists", () => {
    const ability: AbilityData = {
      name: "test",
      flavor_text_entries: [
        { flavor_text: "テスト", language: { name: "ja" }, version_group: { name: "x-y" } },
      ],
    };
    expect(getEnglishFlavorText(ability)).toBe("No description available.");
  });

  it("returns fallback for empty entries", () => {
    const ability: AbilityData = {
      name: "test",
      flavor_text_entries: [],
    };
    expect(getEnglishFlavorText(ability)).toBe("No description available.");
  });
});
