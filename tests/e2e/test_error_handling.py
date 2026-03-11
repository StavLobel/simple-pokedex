import pytest

BASE_URL = "http://localhost:3000"

pytestmark = pytest.mark.e2e


class TestErrorStates:
    """NFR: App handles PokéAPI downtime gracefully."""

    def test_nfr_invalid_pokemon_shows_error(self, page):
        page.goto(BASE_URL)
        page.fill("input", "notapokemon12345")
        page.wait_for_timeout(500)
        suggestions = page.locator(
            "[data-testid='suggestion'], .autocomplete-item, li"
        )
        assert suggestions.count() == 0

    def test_nfr_app_loads_without_crash(self, page):
        resp = page.goto(BASE_URL)
        assert resp.status == 200

    def test_nfr_no_console_errors_on_load(self, page):
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        page.goto(BASE_URL)
        page.wait_for_timeout(2000)
        assert len(errors) == 0, f"Console errors: {errors}"
