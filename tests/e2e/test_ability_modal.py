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


class TestAbilityModal:
    """FR-8 / FR-9: Ability popups with English descriptions."""

    def test_fr8_ability_clickable(self, page):
        _select_pokemon(page, "charizard")
        ability = page.locator("text=blaze", exact=False).first
        assert ability.is_visible()
        ability.click()
        page.wait_for_timeout(500)

    def test_fr8_modal_opens(self, page):
        _select_pokemon(page, "charizard")
        page.locator("text=blaze", exact=False).first.click()
        page.wait_for_timeout(500)
        modal = page.locator(
            "[role='dialog'], .modal, [data-testid='ability-modal']"
        )
        assert modal.is_visible()

    def test_fr9_english_description_shown(self, page):
        _select_pokemon(page, "charizard")
        page.locator("text=blaze", exact=False).first.click()
        page.wait_for_timeout(800)
        modal = page.locator(
            "[role='dialog'], .modal, [data-testid='ability-modal']"
        )
        text = modal.inner_text()
        assert "fire" in text.lower() or "hp" in text.lower()

    def test_fr8_modal_close_x_button(self, page):
        _select_pokemon(page, "charizard")
        page.locator("text=blaze", exact=False).first.click()
        page.wait_for_timeout(500)
        close_btn = page.locator(
            "[aria-label='Close'], button:has-text('×'), button:has-text('X')"
        )
        close_btn.first.click()
        page.wait_for_timeout(300)
        modal = page.locator(
            "[role='dialog'], .modal, [data-testid='ability-modal']"
        )
        assert not modal.is_visible()

    def test_fr8_modal_close_esc_key(self, page):
        """NFR Accessibility: Modal closable via Esc key."""
        _select_pokemon(page, "charizard")
        page.locator("text=blaze", exact=False).first.click()
        page.wait_for_timeout(500)
        page.keyboard.press("Escape")
        page.wait_for_timeout(300)
        modal = page.locator(
            "[role='dialog'], .modal, [data-testid='ability-modal']"
        )
        assert not modal.is_visible()
