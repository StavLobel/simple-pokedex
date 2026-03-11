/**
 * Gen III type corrections for Pokémon whose typing changed when
 * the Fairy type was introduced in Gen VI (X/Y).
 *
 * Maps Pokémon ID → array of Gen III type names.
 */
export const GEN3_TYPE_OVERRIDES: Record<number, string[]> = {
  35:  ["normal"],           // Clefairy        (Fairy → Normal)
  36:  ["normal"],           // Clefable        (Fairy → Normal)
  39:  ["normal"],           // Jigglypuff      (Normal/Fairy → Normal)
  40:  ["normal"],           // Wigglytuff      (Normal/Fairy → Normal)
  122: ["psychic"],          // Mr. Mime         (Psychic/Fairy → Psychic)
  173: ["normal"],           // Cleffa          (Fairy → Normal)
  174: ["normal"],           // Igglybuff       (Normal/Fairy → Normal)
  175: ["normal"],           // Togepi          (Fairy → Normal)
  176: ["normal", "flying"], // Togetic         (Fairy/Flying → Normal/Flying)
  183: ["water"],            // Marill          (Water/Fairy → Water)
  184: ["water"],            // Azumarill       (Water/Fairy → Water)
  298: ["normal"],           // Azurill         (Normal/Fairy → Normal)
};
