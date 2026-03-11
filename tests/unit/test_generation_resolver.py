import pytest

from app.generation_resolver import (
    resolve_types_for_generation,
    resolve_abilities_for_generation,
    resolve_stats_for_generation,
    resolve_damage_relations_for_generation,
    get_sprite_for_generation,
)

pytestmark = pytest.mark.unit


# ── Fixtures ──────────────────────────────────────────────────────────────────


@pytest.fixture
def clefairy_types():
    """Clefairy: was Normal through Gen V, became Fairy in Gen VI."""
    current = [{"slot": 1, "type": {"name": "fairy", "url": "https://pokeapi.co/api/v2/type/18/"}}]
    past = [
        {
            "generation": {"name": "generation-v", "url": "https://pokeapi.co/api/v2/generation/5/"},
            "types": [
                {"slot": 1, "type": {"name": "normal", "url": "https://pokeapi.co/api/v2/type/1/"}},
            ],
        }
    ]
    return current, past


@pytest.fixture
def gengar_abilities():
    """Gengar: had Levitate through Gen VI, then Cursed Body from Gen VII."""
    current = [
        {
            "ability": {"name": "cursed-body", "url": "https://pokeapi.co/api/v2/ability/130/"},
            "is_hidden": False,
            "slot": 1,
        }
    ]
    past = [
        {
            "generation": {"name": "generation-vi", "url": "https://pokeapi.co/api/v2/generation/6/"},
            "abilities": [
                {
                    "ability": {"name": "levitate", "url": "https://pokeapi.co/api/v2/ability/26/"},
                    "is_hidden": False,
                    "slot": 1,
                }
            ],
        }
    ]
    return current, past


@pytest.fixture
def charizard_abilities():
    """Charizard: had no hidden ability through Gen IV."""
    current = [
        {
            "ability": {"name": "blaze", "url": "https://pokeapi.co/api/v2/ability/66/"},
            "is_hidden": False,
            "slot": 1,
        },
        {
            "ability": {"name": "solar-power", "url": "https://pokeapi.co/api/v2/ability/94/"},
            "is_hidden": True,
            "slot": 3,
        },
    ]
    past = [
        {
            "generation": {"name": "generation-iv", "url": "https://pokeapi.co/api/v2/generation/4/"},
            "abilities": [
                {"ability": None, "is_hidden": True, "slot": 3},
            ],
        }
    ]
    return current, past


@pytest.fixture
def clefable_abilities():
    """Clefable: slot 2 null through Gen III, slot 3 null through Gen IV."""
    current = [
        {
            "ability": {"name": "cute-charm", "url": "https://pokeapi.co/api/v2/ability/56/"},
            "is_hidden": False,
            "slot": 1,
        },
        {
            "ability": {"name": "magic-guard", "url": "https://pokeapi.co/api/v2/ability/98/"},
            "is_hidden": False,
            "slot": 2,
        },
        {
            "ability": {"name": "unaware", "url": "https://pokeapi.co/api/v2/ability/109/"},
            "is_hidden": True,
            "slot": 3,
        },
    ]
    past = [
        {
            "generation": {"name": "generation-iii", "url": "https://pokeapi.co/api/v2/generation/3/"},
            "abilities": [{"ability": None, "is_hidden": False, "slot": 2}],
        },
        {
            "generation": {"name": "generation-iv", "url": "https://pokeapi.co/api/v2/generation/4/"},
            "abilities": [{"ability": None, "is_hidden": True, "slot": 3}],
        },
    ]
    return current, past


@pytest.fixture
def pikachu_stats():
    """Pikachu: defense was 30, sp-def was 40 through Gen V."""
    current = [
        {"base_stat": 35, "effort": 0, "stat": {"name": "hp", "url": ""}},
        {"base_stat": 55, "effort": 0, "stat": {"name": "attack", "url": ""}},
        {"base_stat": 40, "effort": 0, "stat": {"name": "defense", "url": ""}},
        {"base_stat": 50, "effort": 0, "stat": {"name": "special-attack", "url": ""}},
        {"base_stat": 50, "effort": 0, "stat": {"name": "special-defense", "url": ""}},
        {"base_stat": 90, "effort": 2, "stat": {"name": "speed", "url": ""}},
    ]
    past = [
        {
            "generation": {"name": "generation-v", "url": ""},
            "stats": [
                {"base_stat": 30, "effort": 0, "stat": {"name": "defense", "url": ""}},
                {"base_stat": 40, "effort": 0, "stat": {"name": "special-defense", "url": ""}},
            ],
        }
    ]
    return current, past


@pytest.fixture
def steel_damage_relations():
    """Steel type: resisted Ghost/Dark through Gen V, removed in Gen VI."""
    current = {
        "double_damage_from": [{"name": "fighting"}, {"name": "ground"}, {"name": "fire"}],
        "half_damage_from": [
            {"name": "normal"}, {"name": "flying"}, {"name": "rock"},
            {"name": "bug"}, {"name": "steel"}, {"name": "grass"},
            {"name": "psychic"}, {"name": "ice"}, {"name": "dragon"},
            {"name": "fairy"},
        ],
        "no_damage_from": [{"name": "poison"}],
        "double_damage_to": [], "half_damage_to": [], "no_damage_to": [],
    }
    past = [
        {
            "generation": {"name": "generation-v", "url": ""},
            "damage_relations": {
                "double_damage_from": [{"name": "fighting"}, {"name": "ground"}, {"name": "fire"}],
                "half_damage_from": [
                    {"name": "normal"}, {"name": "flying"}, {"name": "rock"},
                    {"name": "bug"}, {"name": "steel"}, {"name": "grass"},
                    {"name": "psychic"}, {"name": "ice"}, {"name": "dragon"},
                    {"name": "ghost"}, {"name": "dark"},
                ],
                "no_damage_from": [{"name": "poison"}],
                "double_damage_to": [], "half_damage_to": [], "no_damage_to": [],
            },
        }
    ]
    return current, past


# ── Type Resolution ───────────────────────────────────────────────────────────


class TestTypeResolution:
    """Issue #4: Resolve types per generation via past_types."""

    def test_gen3_types_no_fairy(self, clefairy_types):
        current, past = clefairy_types
        resolved = resolve_types_for_generation(current, past, "generation-iii")
        names = [t["type"]["name"] for t in resolved]
        assert names == ["normal"]

    def test_gen6_introduces_fairy(self, clefairy_types):
        current, past = clefairy_types
        resolved = resolve_types_for_generation(current, past, "generation-vi")
        names = [t["type"]["name"] for t in resolved]
        assert names == ["fairy"]

    def test_pokemon_without_past_types_unchanged(self):
        current = [{"slot": 1, "type": {"name": "fire", "url": ""}}]
        resolved = resolve_types_for_generation(current, [], "generation-iii")
        assert resolved is current


# ── Ability Resolution ────────────────────────────────────────────────────────


class TestAbilityResolution:
    """Issue #1 / #4: Resolve abilities per generation via past_abilities."""

    def test_gengar_has_levitate_in_gen3(self, gengar_abilities):
        current, past = gengar_abilities
        resolved = resolve_abilities_for_generation(current, past, "generation-iii")
        names = [a["ability"]["name"] for a in resolved]
        assert names == ["levitate"]

    def test_gengar_has_cursed_body_in_gen9(self, gengar_abilities):
        current, past = gengar_abilities
        resolved = resolve_abilities_for_generation(current, past, "generation-ix")
        names = [a["ability"]["name"] for a in resolved]
        assert names == ["cursed-body"]

    def test_null_ability_slot_removed(self, charizard_abilities):
        current, past = charizard_abilities
        resolved = resolve_abilities_for_generation(current, past, "generation-iii")
        names = [a["ability"]["name"] for a in resolved]
        assert names == ["blaze"]
        assert all(not a["is_hidden"] for a in resolved)

    def test_multiple_past_entries_earliest_wins(self, clefable_abilities):
        current, past = clefable_abilities
        resolved = resolve_abilities_for_generation(current, past, "generation-iii")
        names = [a["ability"]["name"] for a in resolved]
        assert names == ["cute-charm"]

    def test_pokemon_without_past_abilities_unchanged(self):
        current = [
            {"ability": {"name": "static", "url": ""}, "is_hidden": False, "slot": 1}
        ]
        resolved = resolve_abilities_for_generation(current, [], "generation-iii")
        assert resolved is current


# ── Stat Resolution ───────────────────────────────────────────────────────────


class TestStatResolution:
    """Issue #4: Resolve stats per generation via past_stats."""

    def test_pikachu_stats_gen3(self, pikachu_stats):
        current, past = pikachu_stats
        resolved = resolve_stats_for_generation(current, past, "generation-iii")
        by_name = {s["stat"]["name"]: s["base_stat"] for s in resolved}
        assert by_name["defense"] == 30
        assert by_name["special-defense"] == 40
        assert by_name["hp"] == 35
        assert by_name["speed"] == 90

    def test_stats_unchanged_when_no_past_stats(self):
        current = [
            {"base_stat": 20, "effort": 0, "stat": {"name": "hp", "url": ""}},
        ]
        resolved = resolve_stats_for_generation(current, [], "generation-iii")
        assert resolved is current


# ── Damage Relations Resolution ───────────────────────────────────────────────


class TestDamageRelationsResolution:
    """Issue #4: Resolve type damage relations per generation."""

    def test_steel_resists_ghost_dark_gen3(self, steel_damage_relations):
        current, past = steel_damage_relations
        resolved = resolve_damage_relations_for_generation(current, past, "generation-iii")
        half_names = [t["name"] for t in resolved["half_damage_from"]]
        assert "ghost" in half_names
        assert "dark" in half_names

    def test_steel_not_resist_ghost_dark_gen6(self, steel_damage_relations):
        current, past = steel_damage_relations
        resolved = resolve_damage_relations_for_generation(current, past, "generation-vi")
        half_names = [t["name"] for t in resolved["half_damage_from"]]
        assert "ghost" not in half_names
        assert "dark" not in half_names


# ── Sprite Resolution ─────────────────────────────────────────────────────────


class TestSpriteResolution:
    """Issue #2 / #4: Resolve sprites per generation with fallback chain."""

    def test_sprite_frlg_first(self):
        sprites = {
            "versions": {
                "generation-iii": {
                    "firered-leafgreen": {"front_default": "https://frlg.png"},
                    "ruby-sapphire": {"front_default": "https://rs.png"},
                    "emerald": {"front_default": "https://em.png"},
                }
            },
            "other": {"official-artwork": {"front_default": "https://art.png"}},
        }
        result = get_sprite_for_generation(sprites, "generation-iii")
        assert result["url"] == "https://frlg.png"
        assert result["is_pixel_art"] is True

    def test_sprite_fallback_ruby_sapphire(self):
        sprites = {
            "versions": {
                "generation-iii": {
                    "firered-leafgreen": {"front_default": None},
                    "ruby-sapphire": {"front_default": "https://rs.png"},
                    "emerald": {"front_default": "https://em.png"},
                }
            },
            "other": {"official-artwork": {"front_default": "https://art.png"}},
        }
        result = get_sprite_for_generation(sprites, "generation-iii")
        assert result["url"] == "https://rs.png"
        assert result["is_pixel_art"] is True

    def test_sprite_fallback_official_artwork(self):
        sprites = {
            "versions": {
                "generation-iii": {
                    "firered-leafgreen": {"front_default": None},
                    "ruby-sapphire": {"front_default": None},
                    "emerald": {"front_default": None},
                }
            },
            "other": {"official-artwork": {"front_default": "https://art.png"}},
        }
        result = get_sprite_for_generation(sprites, "generation-iii")
        assert result["url"] == "https://art.png"
        assert result["is_pixel_art"] is False

    def test_sprite_fallback_none_when_all_null(self):
        sprites = {
            "versions": {"generation-iii": {}},
            "other": {"official-artwork": {"front_default": None}},
        }
        result = get_sprite_for_generation(sprites, "generation-iii")
        assert result["url"] is None
        assert result["is_pixel_art"] is False
