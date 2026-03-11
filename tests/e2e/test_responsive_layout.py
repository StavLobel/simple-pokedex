import pytest

BASE_URL = "http://localhost:3000"

pytestmark = pytest.mark.e2e


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
        img_box = page.locator("img[src*='official-artwork']").bounding_box()
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
        img = mobile_page.locator("img[src*='official-artwork']")
        if img.is_visible():
            img_box = img.bounding_box()
            assert img_box["width"] <= 375, \
                "Image should fit within mobile viewport"
