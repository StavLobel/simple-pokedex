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


def _set_generation(page, gen_value: str):
    """Change the generation selector dropdown."""
    page.select_option("[data-testid='generation-selector']", gen_value)
    page.wait_for_timeout(500)


class TestGenerationSelectorUI:
    """Issue #4: Generation selector renders and defaults correctly."""

    def test_gen_selector_visible(self, page):
        page.goto(BASE_URL)
        selector = page.locator("[data-testid='generation-selector']")
        assert selector.is_visible()

    def test_default_gen_is_gen3(self, page):
        page.goto(BASE_URL)
        selector = page.locator("[data-testid='generation-selector']")
        value = selector.input_value()
        assert value == "generation-iii"


class TestAbilityResolutionE2E:
    """Issue #1: Abilities reflect the selected generation."""

    def test_gengar_shows_levitate_gen3(self, page):
        _select_pokemon(page, "gengar")
        abilities_text = page.locator("text=levitate", exact=False)
        assert abilities_text.is_visible()

    def test_gengar_shows_cursed_body_gen9(self, page):
        page.goto(BASE_URL)
        _set_generation(page, "generation-ix")
        _select_pokemon(page, "gengar")
        abilities_text = page.locator("text=cursed body", exact=False)
        assert abilities_text.is_visible()


class TestTypeResolutionE2E:
    """Issue #4: Types reflect the selected generation."""

    def test_clefairy_normal_gen3(self, page):
        _select_pokemon(page, "clefairy")
        normal_badge = page.locator("text=Normal", exact=False).first
        assert normal_badge.is_visible()

    def test_clefairy_fairy_gen6(self, page):
        page.goto(BASE_URL)
        _set_generation(page, "generation-vi")
        _select_pokemon(page, "clefairy")
        fairy_badge = page.locator("text=Fairy", exact=False).first
        assert fairy_badge.is_visible()


class TestSpriteResolutionE2E:
    """Issue #2: Gen 2 Pokemon show pixel sprites, not official artwork."""

    def test_gen2_pokemon_pixel_sprite_gen3(self, page):
        _select_pokemon(page, "cyndaquil")
        img = page.locator("img").first
        src = img.get_attribute("src") or ""
        assert "official-artwork" not in src


class TestGenerationSwitchingE2E:
    """Issue #4: Switching generations updates visible data."""

    def test_switching_gen_updates_pokemon_list(self, page):
        page.goto(BASE_URL)
        page.fill("input", "mewtwo")
        page.wait_for_timeout(500)
        gen3_suggestions = page.locator(
            "[data-testid='suggestion'], .autocomplete-item, li"
        )
        assert gen3_suggestions.count() > 0

        _set_generation(page, "generation-i")
        page.fill("input", "mewtwo")
        page.wait_for_timeout(500)
        gen1_suggestions = page.locator(
            "[data-testid='suggestion'], .autocomplete-item, li"
        )
        assert gen1_suggestions.count() > 0

    def test_stats_displayed(self, page):
        _select_pokemon(page, "pikachu")
        stats_section = page.locator("[data-testid='stats-section']")
        assert stats_section.is_visible()
        stat_bars = stats_section.locator("> div")
        assert stat_bars.count() == 6
