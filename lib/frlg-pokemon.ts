/**
 * Complete set of Pokémon IDs obtainable in Pokémon FireRed & LeafGreen
 * (both versions combined, including Sevii Islands and event distributions).
 */

const KANTO_IDS = Array.from({ length: 151 }, (_, i) => i + 1);

const JOHTO_IDS = [
  169, // Crobat
  172, // Pichu
  173, // Cleffa
  174, // Igglybuff
  175, // Togepi
  176, // Togetic
  177, // Natu
  178, // Xatu
  182, // Bellossom
  183, // Marill
  184, // Azumarill
  185, // Sudowoodo
  186, // Politoed
  196, // Espeon
  197, // Umbreon
  198, // Murkrow        (FR)
  199, // Slowking
  200, // Misdreavus     (LG)
  201, // Unown          (Tanoby Chambers)
  202, // Wobbuffet      (Ruin Valley)
  204, // Pineco         (Pattern Bush)
  205, // Forretress
  206, // Dunsparce      (Three Isle Path)
  207, // Gligar         (FR)
  208, // Steelix
  211, // Qwilfish
  212, // Scizor
  213, // Shuckle
  214, // Heracross      (Pattern Bush)
  215, // Sneasel        (Icefall Cave)
  216, // Teddiursa      (LG)
  217, // Ursaring       (LG)
  218, // Slugma         (Mt. Ember)
  219, // Magcargo
  220, // Swinub         (Icefall Cave)
  221, // Piloswine
  222, // Corsola
  223, // Remoraid
  224, // Octillery
  225, // Delibird       (LG)
  226, // Mantine        (LG)
  227, // Skarmory       (FR)
  228, // Houndour       (LG)
  229, // Houndoom       (LG)
  230, // Kingdra
  231, // Phanpy         (FR)
  232, // Donphan        (FR)
  233, // Porygon2
  236, // Tyrogue
  237, // Hitmontop
  238, // Smoochum
  239, // Elekid
  240, // Magby
  242, // Blissey
  243, // Raikou         (roaming)
  244, // Entei          (roaming)
  245, // Suicune        (roaming)
  246, // Larvitar       (Sevault Canyon)
  247, // Pupitar
  248, // Tyranitar
  249, // Lugia          (Navel Rock event)
  250, // Ho-Oh          (Navel Rock event)
];

const HOENN_IDS = [
  298, // Azurill        (breed Marill)
  360, // Wynaut         (breed Wobbuffet)
  386, // Deoxys         (Birth Island event)
];

export const FRLG_POKEMON_IDS: ReadonlySet<number> = new Set([
  ...KANTO_IDS,
  ...JOHTO_IDS,
  ...HOENN_IDS,
]);

export function extractIdFromUrl(url: string): number {
  const parts = url.replace(/\/$/, "").split("/");
  return parseInt(parts[parts.length - 1], 10);
}
