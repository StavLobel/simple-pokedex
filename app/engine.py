"""Gen III type effectiveness calculation engine for Simple Pokédex (FRLG edition).

Computes defensive multipliers for all 17 types (no Fairy) against a given
Pokémon's type combination, following the standard formula:
    final_multiplier = multiplier_vs_type_A × multiplier_vs_type_B

The chart reflects Gen III rules:
  - Fairy type does not exist
  - Steel resists Dark and Ghost
"""

ALL_TYPES = [
    "normal", "fire", "water", "electric", "grass", "ice",
    "fighting", "poison", "ground", "flying", "psychic",
    "bug", "rock", "ghost", "dragon", "dark", "steel",
]

FULL_TYPE_CHART: dict[str, dict[str, list[str]]] = {
    "normal": {
        "double_damage_from": ["fighting"],
        "half_damage_from": [],
        "no_damage_from": ["ghost"],
    },
    "fire": {
        "double_damage_from": ["water", "ground", "rock"],
        "half_damage_from": ["fire", "grass", "ice", "bug", "steel"],
        "no_damage_from": [],
    },
    "water": {
        "double_damage_from": ["electric", "grass"],
        "half_damage_from": ["fire", "water", "ice", "steel"],
        "no_damage_from": [],
    },
    "electric": {
        "double_damage_from": ["ground"],
        "half_damage_from": ["electric", "flying", "steel"],
        "no_damage_from": [],
    },
    "grass": {
        "double_damage_from": ["fire", "ice", "poison", "flying", "bug"],
        "half_damage_from": ["water", "electric", "grass", "ground"],
        "no_damage_from": [],
    },
    "ice": {
        "double_damage_from": ["fire", "fighting", "rock", "steel"],
        "half_damage_from": ["ice"],
        "no_damage_from": [],
    },
    "fighting": {
        "double_damage_from": ["flying", "psychic"],
        "half_damage_from": ["bug", "rock", "dark"],
        "no_damage_from": [],
    },
    "poison": {
        "double_damage_from": ["ground", "psychic"],
        "half_damage_from": ["grass", "fighting", "poison", "bug"],
        "no_damage_from": [],
    },
    "ground": {
        "double_damage_from": ["water", "grass", "ice"],
        "half_damage_from": ["poison", "rock"],
        "no_damage_from": ["electric"],
    },
    "flying": {
        "double_damage_from": ["electric", "ice", "rock"],
        "half_damage_from": ["grass", "fighting", "bug"],
        "no_damage_from": ["ground"],
    },
    "psychic": {
        "double_damage_from": ["bug", "ghost", "dark"],
        "half_damage_from": ["fighting", "psychic"],
        "no_damage_from": [],
    },
    "bug": {
        "double_damage_from": ["fire", "flying", "rock"],
        "half_damage_from": ["grass", "fighting", "ground"],
        "no_damage_from": [],
    },
    "rock": {
        "double_damage_from": ["water", "grass", "fighting", "ground", "steel"],
        "half_damage_from": ["normal", "fire", "poison", "flying"],
        "no_damage_from": [],
    },
    "ghost": {
        "double_damage_from": ["ghost", "dark"],
        "half_damage_from": ["poison", "bug"],
        "no_damage_from": ["normal", "fighting"],
    },
    "dragon": {
        "double_damage_from": ["ice", "dragon"],
        "half_damage_from": ["fire", "water", "electric", "grass"],
        "no_damage_from": [],
    },
    "dark": {
        "double_damage_from": ["fighting", "bug"],
        "half_damage_from": ["ghost", "dark"],
        "no_damage_from": ["psychic"],
    },
    "steel": {
        "double_damage_from": ["fire", "fighting", "ground"],
        "half_damage_from": [
            "normal", "grass", "ice", "flying", "psychic",
            "bug", "rock", "ghost", "dragon", "dark", "steel",
        ],
        "no_damage_from": ["poison"],
    },
}


def _single_type_multiplier(attacking_type: str, defending_type: str,
                            type_chart: dict) -> float:
    """Return the multiplier for a single attacking type vs a single defending type."""
    if defending_type not in type_chart:
        return 1.0
    relations = type_chart[defending_type]
    if attacking_type in relations.get("no_damage_from", []):
        return 0.0
    if attacking_type in relations.get("double_damage_from", []):
        return 2.0
    if attacking_type in relations.get("half_damage_from", []):
        return 0.5
    return 1.0


def calculate_effectiveness(
    defending_types: list[str],
    type_chart: dict | None = None,
) -> dict[str, float]:
    """Calculate the defensive multiplier for every attacking type.

    Args:
        defending_types: List of 1-2 type names for the defending Pokémon.
        type_chart: Optional override for the type chart (used by tests).
                    Falls back to FULL_TYPE_CHART.

    Returns:
        Dict mapping each of the 17 Gen III attacking types to its final multiplier.
    """
    if type_chart is None:
        type_chart = FULL_TYPE_CHART

    result: dict[str, float] = {}
    for atk in ALL_TYPES:
        multiplier = 1.0
        for def_type in defending_types:
            multiplier *= _single_type_multiplier(atk, def_type, type_chart)
        result[atk] = multiplier
    return result


def get_weaknesses(defending_types: list[str],
                   type_chart: dict | None = None) -> dict[str, float]:
    """Return only the types with multiplier > 1 (weaknesses)."""
    effectiveness = calculate_effectiveness(defending_types, type_chart)
    return {k: v for k, v in effectiveness.items() if v > 1}
