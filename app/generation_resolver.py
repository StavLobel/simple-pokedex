"""Generation-aware data resolution for Simple Pokédex.

Mirrors the TypeScript logic in lib/generation-resolver.ts.
Used by Python unit tests to validate resolution algorithms.
"""

GENERATION_ORDER = [
    "generation-i",
    "generation-ii",
    "generation-iii",
    "generation-iv",
    "generation-v",
    "generation-vi",
    "generation-vii",
    "generation-viii",
    "generation-ix",
]

GENERATION_SPRITE_KEYS: dict[str, list[str]] = {
    "generation-i": ["red-blue", "yellow"],
    "generation-ii": ["crystal", "gold", "silver"],
    "generation-iii": ["firered-leafgreen", "ruby-sapphire", "emerald"],
    "generation-iv": ["heartgold-soulsilver", "platinum", "diamond-pearl"],
    "generation-v": ["black-white"],
    "generation-vi": ["x-y", "omegaruby-alphasapphire"],
    "generation-vii": ["ultra-sun-ultra-moon"],
    "generation-viii": ["brilliant-diamond-shining-pearl"],
    "generation-ix": ["scarlet-violet"],
}


def _gen_index(name: str) -> int:
    try:
        return GENERATION_ORDER.index(name)
    except ValueError:
        return -1


def resolve_types_for_generation(
    current_types: list[dict],
    past_types: list[dict],
    target: str,
) -> list[dict]:
    """Resolve types for a target generation using past_types entries."""
    target_idx = _gen_index(target)
    if target_idx == -1 or not past_types:
        return current_types

    best = None
    for entry in past_types:
        entry_idx = _gen_index(entry["generation"]["name"])
        if entry_idx >= target_idx:
            if best is None or entry_idx < _gen_index(best["generation"]["name"]):
                best = entry

    return best["types"] if best else current_types


def resolve_abilities_for_generation(
    current_abilities: list[dict],
    past_abilities: list[dict],
    target: str,
) -> list[dict]:
    """Resolve abilities for a target generation using past_abilities entries.

    Each entry lists only changed slots. ability=None means the slot didn't
    exist yet. For a given slot, the earliest applicable entry wins.
    """
    target_idx = _gen_index(target)
    if target_idx == -1 or not past_abilities:
        return current_abilities

    slot_overrides: dict[int, dict] = {}
    for entry in past_abilities:
        entry_idx = _gen_index(entry["generation"]["name"])
        if entry_idx >= target_idx:
            for a in entry["abilities"]:
                if a["slot"] not in slot_overrides:
                    slot_overrides[a["slot"]] = a

    if not slot_overrides:
        return current_abilities

    result = []
    for a in current_abilities:
        override = slot_overrides.get(a["slot"])
        if override is None:
            result.append(a)
        elif override["ability"] is not None:
            result.append({
                **a,
                "ability": override["ability"],
                "is_hidden": override["is_hidden"],
            })
    return result


def resolve_stats_for_generation(
    current_stats: list[dict],
    past_stats: list[dict],
    target: str,
) -> list[dict]:
    """Resolve base stats for a target generation using past_stats entries."""
    target_idx = _gen_index(target)
    if target_idx == -1 or not past_stats:
        return current_stats

    stat_overrides: dict[str, dict] = {}
    for entry in past_stats:
        entry_idx = _gen_index(entry["generation"]["name"])
        if entry_idx >= target_idx:
            for s in entry["stats"]:
                stat_name = s["stat"]["name"]
                if stat_name not in stat_overrides:
                    stat_overrides[stat_name] = s

    if not stat_overrides:
        return current_stats

    return [
        {**s, "base_stat": stat_overrides[s["stat"]["name"]]["base_stat"]}
        if s["stat"]["name"] in stat_overrides
        else s
        for s in current_stats
    ]


def resolve_damage_relations_for_generation(
    current_dr: dict,
    past_dr: list[dict],
    target: str,
) -> dict:
    """Resolve damage relations for a target generation."""
    target_idx = _gen_index(target)
    if target_idx == -1 or not past_dr:
        return current_dr

    best = None
    for entry in past_dr:
        entry_idx = _gen_index(entry["generation"]["name"])
        if entry_idx >= target_idx:
            if best is None or entry_idx < _gen_index(best["generation"]["name"]):
                best = entry

    return best["damage_relations"] if best else current_dr


def get_sprite_for_generation(
    sprites: dict,
    generation: str,
) -> dict:
    """Pick the best sprite for a target generation.

    Returns {"url": str | None, "is_pixel_art": bool}.
    """
    keys = GENERATION_SPRITE_KEYS.get(generation, [])
    gen_sprites = sprites.get("versions", {}).get(generation, {})

    if gen_sprites:
        for key in keys:
            game = gen_sprites.get(key)
            if game and game.get("front_default"):
                return {"url": game["front_default"], "is_pixel_art": True}

    artwork = (
        sprites.get("other", {})
        .get("official-artwork", {})
        .get("front_default")
    )
    return {"url": artwork, "is_pixel_art": False}
