import type { SpeciesVariety } from "./pokeapi";
import { generationIndex, type GenerationName } from "./constants";

const VARIANT_SUFFIXES: Record<string, { label: string; generation: GenerationName }> = {
  alola: { label: "Alolan", generation: "generation-vii" },
  galar: { label: "Galarian", generation: "generation-viii" },
  hisui: { label: "Hisuian", generation: "generation-viii" },
  paldea: { label: "Paldean", generation: "generation-ix" },
};

export interface VariantOption {
  name: string;
  label: string;
  isDefault: boolean;
}

/**
 * Extract the variant suffix from a Pokemon name (e.g. "vulpix-alola" -> "alola").
 */
function getVariantSuffix(name: string, baseName: string): string | null {
  if (name === baseName) return null;
  const suffix = name.replace(`${baseName}-`, "");
  return suffix in VARIANT_SUFFIXES ? suffix : null;
}

/**
 * Build a human-readable label for a variant (e.g. "Alolan", "Galarian").
 */
export function formatVariantLabel(variantName: string, baseName: string): string {
  const suffix = getVariantSuffix(variantName, baseName);
  if (!suffix) return "Standard";
  return VARIANT_SUFFIXES[suffix]?.label ?? variantName;
}

/**
 * Filter varieties to those available in the selected generation.
 * The default form is always included. Regional variants are filtered
 * by the generation they were introduced in.
 */
export function getAvailableVariants(
  varieties: SpeciesVariety[],
  baseName: string,
  generation: GenerationName,
): VariantOption[] {
  const genIdx = generationIndex(generation);
  const result: VariantOption[] = [];

  for (const v of varieties) {
    if (v.is_default) {
      result.push({
        name: v.pokemon.name,
        label: "Standard",
        isDefault: true,
      });
      continue;
    }

    const suffix = getVariantSuffix(v.pokemon.name, baseName);
    if (!suffix) continue;

    const meta = VARIANT_SUFFIXES[suffix];
    if (!meta) continue;

    if (generationIndex(meta.generation) <= genIdx) {
      result.push({
        name: v.pokemon.name,
        label: meta.label,
        isDefault: false,
      });
    }
  }

  return result;
}

/**
 * Check if a Pokemon has any regional variants (more than just the default).
 */
export function hasRegionalVariants(varieties: SpeciesVariety[], baseName: string): boolean {
  return varieties.some((v) => {
    if (v.is_default) return false;
    const suffix = getVariantSuffix(v.pokemon.name, baseName);
    return suffix !== null;
  });
}
