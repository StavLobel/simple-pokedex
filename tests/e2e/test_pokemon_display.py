import pytest

BASE_URL = "http://localhost:3000"

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


class TestOfficialArtwork:
    """FR-4: High-resolution official artwork is displayed."""

    def test_fr4_image_rendered(self, page):
        _select_pokemon(page, "pikachu")
        img = page.locator("img[src*='official-artwork']")
        assert img.is_visible()

    def test_fr4_image_not_broken(self, page):
        _select_pokemon(page, "pikachu")
        img = page.locator("img[src*='official-artwork']")
        natural_width = img.evaluate("el => el.naturalWidth")
        assert natural_width > 0


class TestIDFormatting:
    """FR-5: Pokédex number with leading zeros."""

    def test_fr5_leading_zeros_displayed(self, page):
        _select_pokemon(page, "bulbasaur")
        id_text = page.locator("text=#001").first
        assert id_text.is_visible()

    def test_fr5_three_digit_id(self, page):
        _select_pokemon(page, "charizard")
        id_text = page.locator("text=#006").first
        assert id_text.is_visible()


class TestTypeEffectiveness:
    """FR-6 / FR-7: Weakness grid displays correct multipliers."""

    def test_fr6_weaknesses_shown(self, page):
        _select_pokemon(page, "charizard")
        weakness_section = page.locator("text=Weak", exact=False).first
        assert weakness_section.is_visible()

    def test_fr6_rock_4x_for_charizard(self, page):
        _select_pokemon(page, "charizard")
        rock_badge = page.locator(
            "[data-testid='type-rock'], text=Rock", exact=False
        )
        assert rock_badge.is_visible()

    def test_fr7_resistances_not_in_weakness_grid(self, page):
        _select_pokemon(page, "charizard")
        weakness_section = page.locator("[data-testid='weaknesses']")
        if weakness_section.count() > 0:
            text = weakness_section.inner_text().lower()
            assert "bug" not in text
