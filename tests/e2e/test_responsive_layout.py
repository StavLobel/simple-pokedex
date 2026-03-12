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


class TestDesktopLayout:
    """SRS §4.2: Two-column grid on desktop."""

    def test_desktop_two_column_layout(self, page):
        page.goto(BASE_URL)
        page.fill("input", "pikachu")
        page.wait_for_timeout(500)
        page.locator(
            "[data-testid='suggestion'], .autocomplete-item, li"
        ).first.click()
        page.wait_for_timeout(1500)
        img_box = page.locator("img[alt='pikachu']").bounding_box()
        stats = page.locator(
            "[data-testid='stats'], .stats-section, .pokemon-stats"
        ).first
        if stats.is_visible():
            stats_box = stats.bounding_box()
            assert img_box["x"] < stats_box["x"], \
                "Image should be left of stats on desktop"


class TestMobileLayout:
    """SRS §4.2: Single-column responsive stack on mobile."""

    def test_mobile_single_column(self, mobile_page):
        mobile_page.goto(BASE_URL)
        mobile_page.fill("input", "pikachu")
        mobile_page.wait_for_timeout(500)
        mobile_page.locator(
            "[data-testid='suggestion'], .autocomplete-item, li"
        ).first.click()
        mobile_page.wait_for_timeout(1500)
        img = mobile_page.locator("img[alt='pikachu']")
        if img.is_visible():
            img_box = img.bounding_box()
            assert img_box["width"] <= 375, \
                "Image should fit within mobile viewport"


class TestNoHorizontalOverflow:
    """Issue #15: No horizontal scrollbar on any screen size."""

    def test_no_overflow_eevee_320px(self, browser):
        """Eevee's branching evolution chain stays within 320px viewport."""
        context = browser.new_context(viewport={"width": 320, "height": 568})
        pg = context.new_page()
        _select_pokemon(pg, "eevee")
        body_width = pg.evaluate("document.body.scrollWidth")
        viewport_width = pg.evaluate("window.innerWidth")
        assert body_width <= viewport_width, \
            f"Body ({body_width}px) overflows viewport ({viewport_width}px) at 320px"
        context.close()

    def test_no_overflow_eevee_375px(self, browser):
        """Eevee's branching evolution chain stays within 375px viewport."""
        context = browser.new_context(viewport={"width": 375, "height": 812})
        pg = context.new_page()
        _select_pokemon(pg, "eevee")
        body_width = pg.evaluate("document.body.scrollWidth")
        viewport_width = pg.evaluate("window.innerWidth")
        assert body_width <= viewport_width, \
            f"Body ({body_width}px) overflows viewport ({viewport_width}px) at 375px"
        context.close()

    def test_evolution_chain_within_bounds(self, browser):
        """Evolution chain container doesn't exceed card bounds."""
        context = browser.new_context(viewport={"width": 375, "height": 812})
        pg = context.new_page()
        _select_pokemon(pg, "eevee")
        chain = pg.locator("[data-testid='evolution-chain']")
        if chain.is_visible():
            chain_box = chain.bounding_box()
            assert chain_box["x"] >= 0, "Evolution chain starts off-screen"
            assert chain_box["x"] + chain_box["width"] <= 375, \
                "Evolution chain overflows viewport"
        context.close()

    def test_no_overflow_pikachu_768px(self, browser):
        """Standard Pokémon doesn't overflow at tablet width."""
        context = browser.new_context(viewport={"width": 768, "height": 1024})
        pg = context.new_page()
        _select_pokemon(pg, "pikachu")
        body_width = pg.evaluate("document.body.scrollWidth")
        viewport_width = pg.evaluate("window.innerWidth")
        assert body_width <= viewport_width, \
            f"Body ({body_width}px) overflows viewport ({viewport_width}px) at 768px"
        context.close()
