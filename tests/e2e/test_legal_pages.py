import os

import pytest

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")

pytestmark = pytest.mark.e2e


class TestFooterAttribution:
    """Issue #7: Footer displays PokeAPI attribution and trademark disclaimer."""

    def test_footer_contains_pokeapi_attribution(self, page):
        page.goto(BASE_URL)
        footer = page.locator("footer")
        assert footer.is_visible()
        assert "PokéAPI" in footer.inner_text() or "PokeAPI" in footer.inner_text()
        link = footer.locator("a[href='https://pokeapi.co/']")
        assert link.count() > 0

    def test_footer_contains_trademark_disclaimer(self, page):
        page.goto(BASE_URL)
        footer = page.locator("footer")
        text = footer.inner_text()
        assert "Nintendo" in text
        assert "Game Freak" in text
        assert ("The Pokémon Company" in text) or ("The Pokemon Company" in text)
        assert "unofficial" in text.lower()


class TestTermsPage:
    """Issue #7: Terms of Service page exists and contains required sections."""

    def test_terms_page_accessible(self, page):
        page.goto(BASE_URL)
        footer = page.locator("footer")
        terms_link = footer.locator("a[href='/terms']")
        assert terms_link.is_visible()
        terms_link.click()
        page.wait_for_timeout(1000)
        assert "/terms" in page.url
        heading = page.locator("h1")
        assert "Terms of Service" in heading.inner_text()

    def test_terms_page_has_required_sections(self, page):
        page.goto(f"{BASE_URL}/terms")
        page.wait_for_timeout(1000)
        content = page.locator("main").inner_text()
        assert "Nature of the Service" in content or "service" in content.lower()
        assert "Disclaimer" in content
        assert "as is" in content.lower() or "as-is" in content.lower()
        assert "Acceptable Use" in content
        assert "Modifications" in content or "Discontinuation" in content


class TestPrivacyPage:
    """Issue #7: Privacy Policy page exists and contains required sections."""

    def test_privacy_page_accessible(self, page):
        page.goto(BASE_URL)
        footer = page.locator("footer")
        privacy_link = footer.locator("a[href='/privacy']")
        assert privacy_link.is_visible()
        privacy_link.click()
        page.wait_for_timeout(1000)
        assert "/privacy" in page.url
        heading = page.locator("h1")
        assert "Privacy Policy" in heading.inner_text()

    def test_privacy_page_has_required_sections(self, page):
        page.goto(f"{BASE_URL}/privacy")
        page.wait_for_timeout(1000)
        content = page.locator("main").inner_text()
        assert "Data Collection" in content or "data" in content.lower()
        assert "Third-Party" in content or "third-party" in content.lower()
        assert "PokéAPI" in content or "PokeAPI" in content
        assert "Vercel" in content
        assert "Contact" in content


class TestFooterLinksOnAllPages:
    """Issue #7: Footer legal links are visible on every page."""

    def test_footer_links_present_on_all_pages(self, page):
        for path in ["/", "/terms", "/privacy"]:
            page.goto(f"{BASE_URL}{path}")
            page.wait_for_timeout(500)
            footer = page.locator("footer")
            assert footer.is_visible(), f"Footer not visible on {path}"
            terms_link = footer.locator("a[href='/terms']")
            privacy_link = footer.locator("a[href='/privacy']")
            assert terms_link.count() > 0, f"Terms link missing on {path}"
            assert privacy_link.count() > 0, f"Privacy link missing on {path}"
