"""Evolution chain utilities — Python mirror of lib/evolution-utils.ts."""

GENERATION_ORDER = [
    "generation-i", "generation-ii", "generation-iii", "generation-iv",
    "generation-v", "generation-vi", "generation-vii", "generation-viii",
    "generation-ix",
]

GENERATION_MAX_ID = {
    "generation-i": 151, "generation-ii": 251, "generation-iii": 386,
    "generation-iv": 493, "generation-v": 649, "generation-vi": 721,
    "generation-vii": 809, "generation-viii": 905, "generation-ix": 1025,
}


def generation_index(gen: str) -> int:
    try:
        return GENERATION_ORDER.index(gen)
    except ValueError:
        return -1


def extract_id_from_url(url: str) -> int:
    return int(url.rstrip("/").split("/")[-1])


def flatten_chain(link: dict) -> dict:
    return {
        "name": link["species"]["name"],
        "id": extract_id_from_url(link["species"]["url"]),
        "evolution_details": link.get("evolution_details", []),
        "evolves_to": [flatten_chain(c) for c in link.get("evolves_to", [])],
    }


def _capitalize(s: str) -> str:
    return s[0].upper() + s[1:] if s else s


def _format_name(name: str) -> str:
    return " ".join(_capitalize(p) for p in name.split("-"))


def _pick_detail_for_generation(details: list[dict], generation: str) -> dict | None:
    if not details:
        return None
    if len(details) == 1:
        return details[0]

    gen_idx = generation_index(generation)
    has_location = any(d.get("location") is not None for d in details)
    has_item = any(
        d.get("item") is not None and d.get("trigger", {}).get("name") == "use-item"
        for d in details
    )

    if has_location and has_item:
        if gen_idx >= generation_index("generation-viii"):
            return next(
                (d for d in details if d.get("item") and d.get("trigger", {}).get("name") == "use-item"),
                details[0],
            )
        return next((d for d in details if d.get("location")), details[0])

    return details[0]


def _format_single_detail(d: dict) -> str:
    parts: list[str] = []
    trigger = d.get("trigger", {}) or {}
    trigger_name = trigger.get("name", "")

    if trigger_name == "trade":
        held = d.get("held_item")
        if held:
            parts.append(f"Trade ({_format_name(held['name'])})")
        else:
            parts.append("Trade")
    elif trigger_name == "use-item" and d.get("item"):
        parts.append(_format_name(d["item"]["name"]))
    elif d.get("min_level"):
        parts.append(f"Lv. {d['min_level']}")

    if d.get("min_happiness"):
        parts.append(f"Happiness ≥ {d['min_happiness']}")
    if d.get("time_of_day"):
        parts.append(f"at {_capitalize(d['time_of_day'])}")
    if d.get("known_move_type"):
        parts.append(f"Know {_capitalize(d['known_move_type']['name'])} move")
    if d.get("known_move"):
        parts.append(f"Know {_format_name(d['known_move']['name'])}")
    if d.get("location") and trigger_name != "use-item":
        parts.append(f"at {_format_name(d['location']['name'])}")
    if d.get("min_beauty"):
        parts.append(f"Beauty ≥ {d['min_beauty']}")
    if d.get("min_affection"):
        parts.append(f"Affection ≥ {d['min_affection']}")
    if d.get("gender") is not None:
        parts.append("♀ only" if d["gender"] == 1 else "♂ only")
    if d.get("needs_overworld_rain"):
        parts.append("in Rain")
    if d.get("turn_upside_down"):
        parts.append("Upside Down")
    if d.get("relative_physical_stats") is not None:
        rps = d["relative_physical_stats"]
        if rps == 1:
            parts.append("Atk > Def")
        elif rps == -1:
            parts.append("Atk < Def")
        else:
            parts.append("Atk = Def")

    if not parts and trigger_name:
        parts.append(_format_name(trigger_name))

    return ", ".join(parts)


def format_evolution_method(details: list[dict], generation: str) -> str:
    if not details:
        return ""
    picked = _pick_detail_for_generation(details, generation)
    if not picked:
        return ""
    return _format_single_detail(picked)


def is_available_in_generation(pokemon_id: int, generation: str) -> bool:
    max_id = GENERATION_MAX_ID.get(generation, 0)
    return pokemon_id <= max_id
