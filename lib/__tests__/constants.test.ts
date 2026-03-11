import { describe, it, expect } from "vitest";
import { getGenerationForId, generationIndex } from "../constants";

describe("getGenerationForId", () => {
  it("maps Gen I Pokemon (id 1–151)", () => {
    expect(getGenerationForId(1)).toBe("generation-i");
    expect(getGenerationForId(25)).toBe("generation-i");
    expect(getGenerationForId(151)).toBe("generation-i");
  });

  it("maps Gen II Pokemon (id 152–251)", () => {
    expect(getGenerationForId(152)).toBe("generation-ii");
    expect(getGenerationForId(251)).toBe("generation-ii");
  });

  it("maps Gen III Pokemon (id 252–386)", () => {
    expect(getGenerationForId(252)).toBe("generation-iii");
    expect(getGenerationForId(386)).toBe("generation-iii");
  });

  it("maps Gen V Pokemon (id 494–649)", () => {
    expect(getGenerationForId(494)).toBe("generation-v");
    expect(getGenerationForId(555)).toBe("generation-v");
    expect(getGenerationForId(649)).toBe("generation-v");
  });

  it("maps Gen IX Pokemon (id 906–1025)", () => {
    expect(getGenerationForId(906)).toBe("generation-ix");
    expect(getGenerationForId(1025)).toBe("generation-ix");
  });

  it("falls back to last generation for ids beyond known range", () => {
    expect(getGenerationForId(9999)).toBe("generation-ix");
  });
});

describe("generationIndex", () => {
  it("returns 0 for generation-i", () => {
    expect(generationIndex("generation-i")).toBe(0);
  });

  it("returns 4 for generation-v", () => {
    expect(generationIndex("generation-v")).toBe(4);
  });

  it("returns 8 for generation-ix", () => {
    expect(generationIndex("generation-ix")).toBe(8);
  });
});
