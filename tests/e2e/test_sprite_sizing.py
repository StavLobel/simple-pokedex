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


def _switch_generation(page, gen_label: str):
    """Open the generation selector and pick a generation by visible label."""
    page.locator("select").select_option(label=gen_label)
    page.wait_for_timeout(500)


class TestSpriteSizing:
    """Issue #10: Sprites should fill the Pokéball container across all generations."""

    def test_sprite_fills_container_official_artwork(self, page):
        """Official artwork sprite width matches the container width."""
        _select_pokemon(page, "pikachu")
        img = page.locator("img[alt='pikachu']")
        assert img.is_visible()
        container = img.locator("..")
        img_width = img.evaluate("el => el.getBoundingClientRect().width")
        container_width = container.evaluate("el => el.getBoundingClientRect().width")
        assert img_width / container_width >= 0.95, (
            f"Sprite width ({img_width:.0f}px) is too small relative to "
            f"container ({container_width:.0f}px)"
        )

    def test_sprite_fills_container_gen_sprite(self, page):
        """Generation-specific sprite width matches the container width."""
        _select_pokemon(page, "pikachu")
        _switch_generation(page, "Gen I")
        page.wait_for_timeout(1500)
        img = page.locator("img[alt='pikachu']")
        assert img.is_visible()
        container = img.locator("..")
        img_width = img.evaluate("el => el.getBoundingClientRect().width")
        container_width = container.evaluate("el => el.getBoundingClientRect().width")
        assert img_width / container_width >= 0.95, (
            f"Sprite width ({img_width:.0f}px) is too small relative to "
            f"container ({container_width:.0f}px)"
        )

    def test_sprite_maintains_aspect_ratio(self, page):
        """Sprite image preserves its natural aspect ratio (h-auto)."""
        _select_pokemon(page, "pikachu")
        img = page.locator("img[alt='pikachu']")
        natural = img.evaluate(
            "el => ({ w: el.naturalWidth, h: el.naturalHeight })"
        )
        rendered = img.evaluate(
            "el => ({ w: el.getBoundingClientRect().width, "
            "h: el.getBoundingClientRect().height })"
        )
        if natural["w"] > 0 and natural["h"] > 0:
            natural_ratio = natural["w"] / natural["h"]
            rendered_ratio = rendered["w"] / rendered["h"]
            assert abs(natural_ratio - rendered_ratio) < 0.1, (
                f"Aspect ratio mismatch: natural={natural_ratio:.2f}, "
                f"rendered={rendered_ratio:.2f}"
            )
