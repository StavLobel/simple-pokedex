import pytest

from app.variant_utils import (
    format_variant_label,
    get_available_variants,
    has_regional_variants,
)

pytestmark = pytest.mark.unit


@pytest.fixture
def vulpix_varieties():
    """Vulpix has a standard form and an Alolan form."""
    return [
        {"is_default": True, "pokemon": {"name": "vulpix", "url": "https://pokeapi.co/api/v2/pokemon/37/"}},
        {"is_default": False, "pokemon": {"name": "vulpix-alola", "url": "https://pokeapi.co/api/v2/pokemon/10103/"}},
    ]


@pytest.fixture
def pikachu_varieties():
    """Pikachu has no regional variants (only cosmetic forms)."""
    return [
        {"is_default": True, "pokemon": {"name": "pikachu", "url": "https://pokeapi.co/api/v2/pokemon/25/"}},
        {"is_default": False, "pokemon": {"name": "pikachu-rock-star", "url": "https://pokeapi.co/api/v2/pokemon/10080/"}},
    ]


@pytest.fixture
def meowth_varieties():
    """Meowth has Alolan and Galarian forms."""
    return [
        {"is_default": True, "pokemon": {"name": "meowth", "url": "https://pokeapi.co/api/v2/pokemon/52/"}},
        {"is_default": False, "pokemon": {"name": "meowth-alola", "url": "https://pokeapi.co/api/v2/pokemon/10107/"}},
        {"is_default": False, "pokemon": {"name": "meowth-galar", "url": "https://pokeapi.co/api/v2/pokemon/10161/"}},
    ]


class TestVariantDetection:
    """Issue #5: Detect regional variants from species data."""

    def test_vulpix_has_alolan_variant(self, vulpix_varieties):
        assert has_regional_variants(vulpix_varieties, "vulpix") is True

    def test_pikachu_has_no_regional_variant(self, pikachu_varieties):
        assert has_regional_variants(pikachu_varieties, "pikachu") is False

    def test_meowth_has_variants(self, meowth_varieties):
        assert has_regional_variants(meowth_varieties, "meowth") is True


class TestVariantNameParsing:
    """Issue #5: Parse variant names into display labels."""

    def test_variant_names_parsed_correctly(self):
        assert format_variant_label("vulpix-alola", "vulpix") == "Alolan"
        assert format_variant_label("ponyta-galar", "ponyta") == "Galarian"
        assert format_variant_label("growlithe-hisui", "growlithe") == "Hisuian"
        assert format_variant_label("wooper-paldea", "wooper") == "Paldean"

    def test_standard_form_label(self):
        assert format_variant_label("vulpix", "vulpix") == "Standard"


class TestVariantGenerationFilter:
    """Issue #5: Filter variants by selected generation."""

    def test_variants_filtered_by_generation_gen3(self, vulpix_varieties):
        options = get_available_variants(vulpix_varieties, "vulpix", "generation-iii")
        names = [o["name"] for o in options]
        assert "vulpix" in names
        assert "vulpix-alola" not in names

    def test_variants_available_in_gen7(self, vulpix_varieties):
        options = get_available_variants(vulpix_varieties, "vulpix", "generation-vii")
        names = [o["name"] for o in options]
        assert "vulpix" in names
        assert "vulpix-alola" in names

    def test_meowth_galarian_only_in_gen8(self, meowth_varieties):
        options_gen7 = get_available_variants(meowth_varieties, "meowth", "generation-vii")
        names_gen7 = [o["name"] for o in options_gen7]
        assert "meowth-alola" in names_gen7
        assert "meowth-galar" not in names_gen7

        options_gen8 = get_available_variants(meowth_varieties, "meowth", "generation-viii")
        names_gen8 = [o["name"] for o in options_gen8]
        assert "meowth-alola" in names_gen8
        assert "meowth-galar" in names_gen8

    def test_standard_always_included(self, vulpix_varieties):
        options = get_available_variants(vulpix_varieties, "vulpix", "generation-i")
        names = [o["name"] for o in options]
        assert "vulpix" in names
