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
    page.wait_for_timeout(2000)


class TestEvolutionChainDisplay:
    """Issue #13: Evolution chain with sprites on Pokémon card."""

    def test_bulbasaur_shows_three_stage_chain(self, page):
        """Bulbasaur should show a three-stage linear evolution chain."""
        _select_pokemon(page, "bulbasaur")
        chain = page.locator("[data-testid='evolution-chain']")
        assert chain.is_visible()
        assert page.locator("[data-testid='evo-stage-bulbasaur']").is_visible()
        assert page.locator("[data-testid='evo-stage-ivysaur']").is_visible()
        assert page.locator("[data-testid='evo-stage-venusaur']").is_visible()

    def test_evolution_arrows_show_methods(self, page):
        """Evolution arrows should display the method (e.g. 'Lv. 16')."""
        _select_pokemon(page, "bulbasaur")
        arrows = page.locator("[data-testid='evo-arrow']")
        assert arrows.count() >= 2
        first_arrow_text = arrows.first.inner_text()
        assert "Lv." in first_arrow_text

    def test_tauros_shows_no_evolution(self, page):
        """Single-stage Pokémon should show 'Does not evolve.'"""
        _select_pokemon(page, "tauros")
        no_evo = page.locator("[data-testid='no-evolution']")
        assert no_evo.is_visible()
        assert "Does not evolve" in no_evo.inner_text()

    def test_current_pokemon_highlighted(self, page):
        """The currently viewed Pokémon should be visually highlighted."""
        _select_pokemon(page, "ivysaur")
        stage = page.locator("[data-testid='evo-stage-ivysaur']")
        assert stage.is_visible()
        bold_name = stage.locator("span.font-bold")
        assert bold_name.count() > 0

    def test_eevee_shows_branching_evolutions(self, page):
        """Eevee should display multiple eeveelution branches."""
        _select_pokemon(page, "eevee")
        chain = page.locator("[data-testid='evolution-chain']")
        assert chain.is_visible()
        assert page.locator("[data-testid='evo-stage-eevee']").is_visible()
        arrows = page.locator("[data-testid='evo-arrow']")
        assert arrows.count() >= 3
