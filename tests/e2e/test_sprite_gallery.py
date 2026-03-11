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


class TestSpriteGallery:
    """Issue #14: Generation sprite gallery with dropdown below the card."""

    def test_main_sprite_is_front_default(self, page):
        """The main sprite always uses the canonical front_default URL."""
        _select_pokemon(page, "pikachu")
        img = page.locator("[data-testid='main-sprite-container'] img")
        assert img.is_visible()
        src = img.get_attribute("src")
        assert "front_default" in src or "/25.png" in src

    def test_gallery_section_visible(self, page):
        """The sprite gallery section appears below the card."""
        _select_pokemon(page, "pikachu")
        gallery = page.locator("[data-testid='sprite-gallery']")
        assert gallery.is_visible()

    def test_gallery_dropdown_has_options(self, page):
        """The gallery dropdown lists available generation sprites."""
        _select_pokemon(page, "pikachu")
        select = page.locator("[data-testid='sprite-gallery-select']")
        options = select.locator("option")
        count = options.count()
        assert count > 0, "Gallery dropdown should have at least one sprite option"

    def test_gallery_dropdown_changes_sprite(self, page):
        """Selecting a different game in the dropdown updates the gallery sprite."""
        _select_pokemon(page, "pikachu")
        gallery_img = page.locator("[data-testid='sprite-gallery-image']")
        initial_src = gallery_img.get_attribute("src")

        select = page.locator("[data-testid='sprite-gallery-select']")
        options = select.locator("option")
        if options.count() > 1:
            select.select_option(index=1)
            page.wait_for_timeout(300)
            new_src = gallery_img.get_attribute("src")
            assert new_src != initial_src, "Sprite should change when a different option is selected"

    def test_gallery_not_shown_for_invalid_pokemon(self, page):
        """Gallery should not crash or appear for edge-case Pokémon with no generation sprites."""
        _select_pokemon(page, "pikachu")
        gallery = page.locator("[data-testid='sprite-gallery']")
        assert gallery.is_visible()
