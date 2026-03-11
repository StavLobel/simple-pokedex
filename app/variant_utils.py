"""Regional variant utilities — Python mirror of lib/variant-utils.ts."""

GENERATION_ORDER = [
    "generation-i", "generation-ii", "generation-iii", "generation-iv",
    "generation-v", "generation-vi", "generation-vii", "generation-viii",
    "generation-ix",
]

VARIANT_SUFFIXES = {
    "alola": {"label": "Alolan", "generation": "generation-vii"},
    "galar": {"label": "Galarian", "generation": "generation-viii"},
    "hisui": {"label": "Hisuian", "generation": "generation-viii"},
    "paldea": {"label": "Paldean", "generation": "generation-ix"},
}


def _generation_index(gen: str) -> int:
    try:
        return GENERATION_ORDER.index(gen)
    except ValueError:
        return -1


def _get_variant_suffix(name: str, base_name: str) -> str | None:
    if name == base_name:
        return None
    suffix = name.replace(f"{base_name}-", "")
    return suffix if suffix in VARIANT_SUFFIXES else None


def format_variant_label(variant_name: str, base_name: str) -> str:
    suffix = _get_variant_suffix(variant_name, base_name)
    if not suffix:
        return "Standard"
    return VARIANT_SUFFIXES.get(suffix, {}).get("label", variant_name)


def get_available_variants(
    varieties: list[dict], base_name: str, generation: str
) -> list[dict]:
    gen_idx = _generation_index(generation)
    result = []

    for v in varieties:
        if v.get("is_default"):
            result.append({
                "name": v["pokemon"]["name"],
                "label": "Standard",
                "is_default": True,
            })
            continue

        suffix = _get_variant_suffix(v["pokemon"]["name"], base_name)
        if not suffix:
            continue

        meta = VARIANT_SUFFIXES.get(suffix)
        if not meta:
            continue

        if _generation_index(meta["generation"]) <= gen_idx:
            result.append({
                "name": v["pokemon"]["name"],
                "label": meta["label"],
                "is_default": False,
            })

    return result


def has_regional_variants(varieties: list[dict], base_name: str) -> bool:
    return any(
        _get_variant_suffix(v["pokemon"]["name"], base_name) is not None
        for v in varieties
        if not v.get("is_default")
    )
