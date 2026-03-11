import pytest

BASE_URL = "http://localhost:3000"

pytestmark = pytest.mark.e2e


class TestSearchAutocomplete:
    """FR-1 / FR-2: Autocomplete search with cached Pokémon names."""

    def test_fr1_search_bar_visible(self, page):
        page.goto(BASE_URL)
        search = page.locator("input[type='text'], input[type='search']")
        assert search.is_visible()

    def test_fr2_autocomplete_shows_suggestions(self, page):
        page.goto(BASE_URL)
        page.fill("input", "char")
        page.wait_for_timeout(500)
        suggestions = page.locator(
            "[data-testid='suggestion'], .autocomplete-item, li"
        )
        assert suggestions.count() > 0

    def test_fr2_autocomplete_filters_correctly(self, page):
        page.goto(BASE_URL)
        page.fill("input", "pika")
        page.wait_for_timeout(500)
        suggestions = page.locator(
            "[data-testid='suggestion'], .autocomplete-item, li"
        )
        for i in range(suggestions.count()):
            text = suggestions.nth(i).inner_text().lower()
            assert "pika" in text

    def test_fr2_select_suggestion_loads_pokemon(self, page):
        page.goto(BASE_URL)
        page.fill("input", "bulbasaur")
        page.wait_for_timeout(500)
        page.locator(
            "[data-testid='suggestion'], .autocomplete-item, li"
        ).first.click()
        page.wait_for_timeout(1000)
        assert page.locator("text=bulbasaur", exact=False).is_visible()
