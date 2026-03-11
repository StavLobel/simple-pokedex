import pytest

from app.utils import get_english_description

pytestmark = pytest.mark.unit


class TestLanguageFilter:
    """FR-9: Only the English description is extracted."""

    def test_fr9_english_extracted(self, ability_response_blaze):
        desc = get_english_description(ability_response_blaze["effect_entries"])
        assert desc == "Powers up Fire-type moves when the Pokémon's HP is low."

    def test_fr9_non_english_excluded(self, ability_response_blaze):
        desc = get_english_description(ability_response_blaze["effect_entries"])
        assert "Verstärkt" not in desc
        assert "Augmente" not in desc

    def test_fr9_missing_english_returns_fallback(self):
        entries = [
            {"effect": "Texto en español", "language": {"name": "es"}},
        ]
        desc = get_english_description(entries)
        assert desc is not None

    def test_fr9_empty_entries_returns_fallback(self):
        desc = get_english_description([])
        assert desc is not None

    def test_fr9_fallback_is_meaningful_string(self):
        desc = get_english_description([])
        assert len(desc) > 0
        assert isinstance(desc, str)
