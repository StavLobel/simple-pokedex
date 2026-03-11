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


class TestShinyHold:
    """Issue #12: Hold sprite to reveal shiny variant."""

    def test_holding_main_sprite_shows_shiny(self, page):
        """Pressing and holding the main sprite swaps to the shiny version."""
        _select_pokemon(page, "pikachu")
        container = page.locator("[data-testid='main-sprite-container']")
        img = container.locator("img")
        normal_src = img.get_attribute("src")

        container.dispatch_event("pointerdown")
        page.wait_for_timeout(300)
        shiny_src = img.get_attribute("src")
        assert shiny_src != normal_src, "Sprite should change to shiny on hold"

    def test_releasing_main_sprite_reverts(self, page):
        """Releasing the sprite reverts to the normal version."""
        _select_pokemon(page, "pikachu")
        container = page.locator("[data-testid='main-sprite-container']")
        img = container.locator("img")
        normal_src = img.get_attribute("src")

        container.dispatch_event("pointerdown")
        page.wait_for_timeout(300)
        container.dispatch_event("pointerup")
        page.wait_for_timeout(300)
        reverted_src = img.get_attribute("src")
        assert reverted_src == normal_src, "Sprite should revert to normal on release"

    def test_gallery_sprite_shiny_hold(self, page):
        """Holding the gallery sprite shows the generation-specific shiny."""
        _select_pokemon(page, "pikachu")
        gallery_container = page.locator("[data-testid='sprite-gallery-sprite-container']")
        gallery_img = page.locator("[data-testid='sprite-gallery-image']")

        select = page.locator("[data-testid='sprite-gallery-select']")
        options = select.locator("option")
        has_gen2_plus = False
        for i in range(options.count()):
            text = options.nth(i).inner_text()
            if "Gen I —" not in text:
                has_gen2_plus = True
                select.select_option(index=i)
                page.wait_for_timeout(300)
                break

        if not has_gen2_plus:
            pytest.skip("No Gen II+ sprites available for shiny test")

        normal_src = gallery_img.get_attribute("src")
        gallery_container.dispatch_event("pointerdown")
        page.wait_for_timeout(300)
        shiny_src = gallery_img.get_attribute("src")
        assert shiny_src != normal_src, "Gallery sprite should change to shiny on hold"

    def test_no_layout_shift_on_shiny_swap(self, page):
        """No layout shift or flicker when swapping sprites."""
        _select_pokemon(page, "pikachu")
        container = page.locator("[data-testid='main-sprite-container']")
        box_before = container.bounding_box()

        container.dispatch_event("pointerdown")
        page.wait_for_timeout(300)
        box_during = container.bounding_box()

        assert abs(box_before["width"] - box_during["width"]) < 2
        assert abs(box_before["height"] - box_during["height"]) < 2
