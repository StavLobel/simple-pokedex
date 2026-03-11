"""Utility functions for Simple Pokédex — formatting, parsing, filtering."""

_FALLBACK_DESCRIPTION = "No description available."


def format_pokemon_id(raw_id: int) -> str:
    """Format a National Dex number with leading zeros (e.g. 1 → '#001').

    Raises:
        ValueError: If raw_id is less than 1.
    """
    if raw_id < 1:
        raise ValueError(f"Pokémon ID must be >= 1, got {raw_id}")
    return f"#{raw_id:03d}"


def get_english_description(effect_entries: list[dict]) -> str:
    """Extract the English effect description from a PokéAPI ability response.

    Returns a fallback string when no English entry exists or the list is empty.
    """
    for entry in effect_entries:
        if entry.get("language", {}).get("name") == "en":
            return entry["effect"]
    return _FALLBACK_DESCRIPTION
