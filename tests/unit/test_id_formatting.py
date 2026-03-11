import pytest

from app.utils import format_pokemon_id

pytestmark = pytest.mark.unit


class TestIDFormatting:
    """FR-5: National Dex numbers displayed with leading zeros."""

    @pytest.mark.parametrize("raw_id, expected", [
        (1, "#001"),
        (25, "#025"),
        (100, "#100"),
        (999, "#999"),
        (1000, "#1000"),
    ])
    def test_fr5_leading_zeros(self, raw_id, expected):
        assert format_pokemon_id(raw_id) == expected

    def test_fr5_zero_id_rejected(self):
        with pytest.raises(ValueError):
            format_pokemon_id(0)

    def test_fr5_negative_id_rejected(self):
        with pytest.raises(ValueError):
            format_pokemon_id(-5)
