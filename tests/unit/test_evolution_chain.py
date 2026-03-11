import pytest

from app.evolution_utils import (
    flatten_chain,
    format_evolution_method,
    is_available_in_generation,
    extract_id_from_url,
)

pytestmark = pytest.mark.unit


@pytest.fixture
def bulbasaur_chain():
    """Linear three-stage chain: Bulbasaur → Ivysaur → Venusaur."""
    return {
        "species": {"name": "bulbasaur", "url": "https://pokeapi.co/api/v2/pokemon-species/1/"},
        "evolution_details": [],
        "evolves_to": [
            {
                "species": {"name": "ivysaur", "url": "https://pokeapi.co/api/v2/pokemon-species/2/"},
                "evolution_details": [
                    {"min_level": 16, "trigger": {"name": "level-up"}, "item": None,
                     "held_item": None, "min_happiness": None, "time_of_day": "",
                     "location": None, "known_move_type": None, "known_move": None,
                     "gender": None, "min_beauty": None, "min_affection": None,
                     "relative_physical_stats": None, "needs_overworld_rain": False,
                     "turn_upside_down": False},
                ],
                "evolves_to": [
                    {
                        "species": {"name": "venusaur", "url": "https://pokeapi.co/api/v2/pokemon-species/3/"},
                        "evolution_details": [
                            {"min_level": 32, "trigger": {"name": "level-up"}, "item": None,
                             "held_item": None, "min_happiness": None, "time_of_day": "",
                             "location": None, "known_move_type": None, "known_move": None,
                             "gender": None, "min_beauty": None, "min_affection": None,
                             "relative_physical_stats": None, "needs_overworld_rain": False,
                             "turn_upside_down": False},
                        ],
                        "evolves_to": [],
                    }
                ],
            }
        ],
    }


@pytest.fixture
def trade_chain():
    """Trade evolution: Kadabra → Alakazam."""
    return {
        "species": {"name": "abra", "url": "https://pokeapi.co/api/v2/pokemon-species/63/"},
        "evolution_details": [],
        "evolves_to": [
            {
                "species": {"name": "kadabra", "url": "https://pokeapi.co/api/v2/pokemon-species/64/"},
                "evolution_details": [
                    {"min_level": 16, "trigger": {"name": "level-up"}, "item": None,
                     "held_item": None, "min_happiness": None, "time_of_day": "",
                     "location": None, "known_move_type": None, "known_move": None,
                     "gender": None, "min_beauty": None, "min_affection": None,
                     "relative_physical_stats": None, "needs_overworld_rain": False,
                     "turn_upside_down": False},
                ],
                "evolves_to": [
                    {
                        "species": {"name": "alakazam", "url": "https://pokeapi.co/api/v2/pokemon-species/65/"},
                        "evolution_details": [
                            {"min_level": None, "trigger": {"name": "trade"}, "item": None,
                             "held_item": None, "min_happiness": None, "time_of_day": "",
                             "location": None, "known_move_type": None, "known_move": None,
                             "gender": None, "min_beauty": None, "min_affection": None,
                             "relative_physical_stats": None, "needs_overworld_rain": False,
                             "turn_upside_down": False},
                        ],
                        "evolves_to": [],
                    }
                ],
            }
        ],
    }


@pytest.fixture
def item_evolution_detail():
    """Water Stone evolution detail."""
    return [
        {"min_level": None, "trigger": {"name": "use-item"},
         "item": {"name": "water-stone", "url": ""},
         "held_item": None, "min_happiness": None, "time_of_day": "",
         "location": None, "known_move_type": None, "known_move": None,
         "gender": None, "min_beauty": None, "min_affection": None,
         "relative_physical_stats": None, "needs_overworld_rain": False,
         "turn_upside_down": False},
    ]


@pytest.fixture
def leafeon_details():
    """Leafeon: location-based (Gen IV-VII) and item-based (Gen VIII+) methods."""
    return [
        {"min_level": None, "trigger": {"name": "level-up"},
         "item": None, "held_item": None, "min_happiness": None,
         "time_of_day": "", "location": {"name": "eterna-forest", "url": ""},
         "known_move_type": None, "known_move": None, "gender": None,
         "min_beauty": None, "min_affection": None,
         "relative_physical_stats": None, "needs_overworld_rain": False,
         "turn_upside_down": False},
        {"min_level": None, "trigger": {"name": "use-item"},
         "item": {"name": "leaf-stone", "url": ""},
         "held_item": None, "min_happiness": None, "time_of_day": "",
         "location": None, "known_move_type": None, "known_move": None,
         "gender": None, "min_beauty": None, "min_affection": None,
         "relative_physical_stats": None, "needs_overworld_rain": False,
         "turn_upside_down": False},
    ]


class TestFlattenChain:
    """Flatten the recursive evolution chain into a tree structure."""

    def test_linear_chain_structure(self, bulbasaur_chain):
        tree = flatten_chain(bulbasaur_chain)
        assert tree["name"] == "bulbasaur"
        assert tree["id"] == 1
        assert len(tree["evolves_to"]) == 1
        ivysaur = tree["evolves_to"][0]
        assert ivysaur["name"] == "ivysaur"
        assert ivysaur["id"] == 2
        assert len(ivysaur["evolves_to"]) == 1
        venusaur = ivysaur["evolves_to"][0]
        assert venusaur["name"] == "venusaur"
        assert venusaur["id"] == 3

    def test_single_stage_pokemon(self):
        chain = {
            "species": {"name": "tauros", "url": "https://pokeapi.co/api/v2/pokemon-species/128/"},
            "evolution_details": [],
            "evolves_to": [],
        }
        tree = flatten_chain(chain)
        assert tree["name"] == "tauros"
        assert len(tree["evolves_to"]) == 0

    def test_extract_id_from_species_url(self):
        assert extract_id_from_url("https://pokeapi.co/api/v2/pokemon-species/25/") == 25
        assert extract_id_from_url("https://pokeapi.co/api/v2/pokemon-species/150") == 150


class TestFormatEvolutionMethod:
    """Format evolution methods for display."""

    def test_level_up_method(self, bulbasaur_chain):
        tree = flatten_chain(bulbasaur_chain)
        ivysaur = tree["evolves_to"][0]
        method = format_evolution_method(ivysaur["evolution_details"], "generation-iii")
        assert method == "Lv. 16"

    def test_trade_method(self, trade_chain):
        tree = flatten_chain(trade_chain)
        alakazam = tree["evolves_to"][0]["evolves_to"][0]
        method = format_evolution_method(alakazam["evolution_details"], "generation-iii")
        assert method == "Trade"

    def test_item_method(self, item_evolution_detail):
        method = format_evolution_method(item_evolution_detail, "generation-iii")
        assert method == "Water Stone"

    def test_trade_with_held_item(self):
        details = [
            {"min_level": None, "trigger": {"name": "trade"},
             "item": None, "held_item": {"name": "kings-rock", "url": ""},
             "min_happiness": None, "time_of_day": "", "location": None,
             "known_move_type": None, "known_move": None, "gender": None,
             "min_beauty": None, "min_affection": None,
             "relative_physical_stats": None, "needs_overworld_rain": False,
             "turn_upside_down": False},
        ]
        method = format_evolution_method(details, "generation-iii")
        assert method == "Trade (Kings Rock)"

    def test_happiness_method(self):
        details = [
            {"min_level": None, "trigger": {"name": "level-up"},
             "item": None, "held_item": None, "min_happiness": 160,
             "time_of_day": "", "location": None, "known_move_type": None,
             "known_move": None, "gender": None, "min_beauty": None,
             "min_affection": None, "relative_physical_stats": None,
             "needs_overworld_rain": False, "turn_upside_down": False},
        ]
        method = format_evolution_method(details, "generation-iii")
        assert "Happiness ≥ 160" in method

    def test_empty_details(self):
        assert format_evolution_method([], "generation-iii") == ""

    def test_leafeon_gen4_uses_location(self, leafeon_details):
        method = format_evolution_method(leafeon_details, "generation-iv")
        assert "Eterna Forest" in method

    def test_leafeon_gen8_uses_item(self, leafeon_details):
        method = format_evolution_method(leafeon_details, "generation-viii")
        assert method == "Leaf Stone"


class TestGenerationAvailability:
    """Check if a Pokémon existed in a given generation."""

    def test_gen1_pokemon_available_in_gen1(self):
        assert is_available_in_generation(25, "generation-i") is True

    def test_gen4_pokemon_not_in_gen3(self):
        assert is_available_in_generation(470, "generation-iii") is False

    def test_gen4_pokemon_in_gen4(self):
        assert is_available_in_generation(470, "generation-iv") is True
