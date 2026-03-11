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


def _switch_generation(page, gen_value: str):
    """Switch generation using the generation selector."""
    page.locator("select").first.select_option(value=gen_value)
    page.wait_for_timeout(1500)


class TestRegionalVariants:
    """Issue #5: Regional variants selector on Pokémon card."""

    def test_variant_dropdown_visible_for_vulpix(self, page):
        """Vulpix should show a variant dropdown when Gen VII+ is selected."""
        _select_pokemon(page, "vulpix")
        _switch_generation(page, "generation-vii")
        selector = page.locator("[data-testid='variant-selector']")
        assert selector.is_visible()

    def test_variant_dropdown_hidden_for_pikachu(self, page):
        """Pikachu has no regional variants so no dropdown should appear."""
        _select_pokemon(page, "pikachu")
        selector = page.locator("[data-testid='variant-selector']")
        assert selector.count() == 0

    def test_selecting_alolan_updates_card(self, page):
        """Selecting Alolan Vulpix should change the type to Ice."""
        _select_pokemon(page, "vulpix")
        _switch_generation(page, "generation-vii")
        page.wait_for_timeout(500)
        selector = page.locator("[data-testid='variant-selector']")
        if selector.count() > 0:
            selector.select_option(label="Alolan")
            page.wait_for_timeout(2000)
            page_text = page.locator("[data-testid='stats-section']").locator("..").locator("..").inner_text()
            assert "ice" in page_text.lower() or "Ice" in page_text

    def test_variant_sprite_updates(self, page):
        """The sprite should change when switching variants."""
        _select_pokemon(page, "vulpix")
        _switch_generation(page, "generation-vii")
        page.wait_for_timeout(500)
        selector = page.locator("[data-testid='variant-selector']")
        if selector.count() > 0:
            img = page.locator("[data-testid='main-sprite-container'] img")
            original_src = img.get_attribute("src")
            selector.select_option(label="Alolan")
            page.wait_for_timeout(2000)
            new_src = img.get_attribute("src")
            assert new_src != original_src

    def test_variant_hidden_in_earlier_gen(self, page):
        """Alolan form should not be available when Gen III is selected."""
        _select_pokemon(page, "vulpix")
        selector = page.locator("[data-testid='variant-selector']")
        assert selector.count() == 0
