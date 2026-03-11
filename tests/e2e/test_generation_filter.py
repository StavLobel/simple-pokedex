import os

import pytest

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")

pytestmark = pytest.mark.e2e


def _select_pokemon(page, name: str):
    """Search and select a Pokémon by name."""
    page.goto(BASE_URL)
    page.fill("input", name)
    page.wait_for_timeout(500)
    page.locator(
        "[data-testid='suggestion'], .autocomplete-item, li"
    ).first.click()
    page.wait_for_timeout(1500)


class TestGenerationDropdownFilter:
    """Issue #9: Generation dropdown excludes generations below the selected Pokémon."""

    def test_gen_dropdown_filters_after_gen5_pokemon(self, page):
        """Selecting a Gen V Pokémon should hide Gen I–IV from the dropdown."""
        _select_pokemon(page, "darmanitan")
        selector = page.locator("[data-testid='generation-selector']")
        options = selector.locator("option")
        values = [options.nth(i).get_attribute("value") for i in range(options.count())]
        assert "generation-i" not in values
        assert "generation-iv" not in values
        assert "generation-v" in values
        assert "generation-ix" in values

    def test_gen_dropdown_shows_all_for_gen1_pokemon(self, page):
        """Selecting a Gen I Pokémon should keep all generations visible."""
        _select_pokemon(page, "pikachu")
        selector = page.locator("[data-testid='generation-selector']")
        options = selector.locator("option")
        count = options.count()
        assert count == 9

    def test_gen_auto_switches_to_pokemon_generation(self, page):
        """If current gen < Pokémon's gen, dropdown auto-switches to that gen."""
        _select_pokemon(page, "darmanitan")
        selector = page.locator("[data-testid='generation-selector']")
        value = selector.input_value()
        assert value == "generation-v"

    def test_gen_stays_when_selecting_earlier_pokemon(self, page):
        """If current gen >= Pokémon's gen, dropdown value stays unchanged."""
        _select_pokemon(page, "pikachu")
        selector = page.locator("[data-testid='generation-selector']")
        value = selector.input_value()
        assert value == "generation-iii"


class TestAutocompleteAllPokemon:
    """Issue #9: Autocomplete suggests Pokémon from all generations."""

    def test_autocomplete_shows_gen5_pokemon_on_gen3(self, page):
        """Gen V Pokémon should appear in autocomplete even when on Gen III."""
        page.goto(BASE_URL)
        page.fill("input", "darmanitan")
        page.wait_for_timeout(500)
        suggestions = page.locator(
            "[data-testid='suggestion'], .autocomplete-item, li"
        )
        assert suggestions.count() > 0
        text = suggestions.first.inner_text().lower()
        assert "darmanitan" in text

    def test_autocomplete_shows_gen9_pokemon(self, page):
        """Gen IX Pokémon should appear in autocomplete."""
        page.goto(BASE_URL)
        page.fill("input", "sprigatito")
        page.wait_for_timeout(500)
        suggestions = page.locator(
            "[data-testid='suggestion'], .autocomplete-item, li"
        )
        assert suggestions.count() > 0
        text = suggestions.first.inner_text().lower()
        assert "sprigatito" in text
