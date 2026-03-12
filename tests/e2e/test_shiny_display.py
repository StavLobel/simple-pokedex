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


class TestShinyDisplay:
    """Issue #16: Side-by-side normal and shiny sprites."""

    def test_normal_and_shiny_sprites_visible(self, page):
        """Both normal and shiny sprites are visible on the card."""
        _select_pokemon(page, "pikachu")
        normal = page.locator("[data-testid='normal-sprite']")
        shiny = page.locator("[data-testid='shiny-sprite']")
        assert normal.is_visible()
        assert shiny.is_visible()

    def test_sprite_labels_present(self, page):
        """Normal and Shiny labels are displayed under the sprites."""
        _select_pokemon(page, "pikachu")
        normal_label = page.locator("[data-testid='normal-sprite-label']")
        shiny_label = page.locator("[data-testid='shiny-sprite-label']")
        assert normal_label.is_visible()
        assert "Normal" in normal_label.inner_text()
        assert shiny_label.is_visible()
        assert "Shiny" in shiny_label.inner_text()

    def test_different_sprite_srcs(self, page):
        """Normal and shiny sprites have different src URLs."""
        _select_pokemon(page, "pikachu")
        normal_src = page.locator(
            "[data-testid='normal-sprite']"
        ).get_attribute("src")
        shiny_src = page.locator(
            "[data-testid='shiny-sprite']"
        ).get_attribute("src")
        assert normal_src != shiny_src

    def test_gallery_side_by_side(self, page):
        """Gallery shows normal and shiny side by side for Gen II+ sprites."""
        _select_pokemon(page, "pikachu")
        select = page.locator("[data-testid='sprite-gallery-select']")
        options = select.locator("option")
        for i in range(options.count()):
            text = options.nth(i).inner_text()
            if "Gen I —" not in text:
                select.select_option(index=i)
                page.wait_for_timeout(300)
                break

        normal_img = page.locator("[data-testid='sprite-gallery-image']")
        shiny_img = page.locator("[data-testid='sprite-gallery-shiny-image']")
        assert normal_img.is_visible()
        assert shiny_img.is_visible()

    def test_gallery_gen_i_no_shiny(self, page):
        """Gen I gallery entry shows only normal sprite, no shiny."""
        _select_pokemon(page, "pikachu")
        select = page.locator("[data-testid='sprite-gallery-select']")
        options = select.locator("option")
        gen_i_found = False
        for i in range(options.count()):
            text = options.nth(i).inner_text()
            if "Gen I —" in text:
                gen_i_found = True
                select.select_option(index=i)
                page.wait_for_timeout(300)
                break

        if not gen_i_found:
            pytest.skip("No Gen I sprite entry found")

        shiny_img = page.locator("[data-testid='sprite-gallery-shiny-image']")
        assert shiny_img.count() == 0

    def test_no_layout_shift_on_pokemon_switch(self, page):
        """No layout shift when switching between Pokémon."""
        _select_pokemon(page, "pikachu")
        container = page.locator("[data-testid='main-sprite-container']")
        box_before = container.bounding_box()

        page.fill("input", "charmander")
        page.wait_for_timeout(500)
        page.locator(
            "[data-testid='suggestion'], .autocomplete-item, li"
        ).first.click()
        page.wait_for_timeout(1500)

        box_after = container.bounding_box()
        assert abs(box_before["width"] - box_after["width"]) < 5
