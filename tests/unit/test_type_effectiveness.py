import pytest

from app.engine import calculate_effectiveness, get_weaknesses

pytestmark = pytest.mark.unit


class TestSingleTypeMultiplier:
    """FR-6: Single-type Pokémon multiplier calculation."""

    def test_fr6_super_effective(self, type_chart):
        """Ground should be 2x effective against Electric."""
        result = calculate_effectiveness(["electric"], type_chart)
        assert result["ground"] == 2.0

    def test_fr6_not_very_effective(self, type_chart):
        """Electric should be 0.5x effective against Electric."""
        result = calculate_effectiveness(["electric"], type_chart)
        assert result["electric"] == 0.5

    def test_fr6_neutral(self, type_chart):
        """Fire should be 1x against Electric (no relation)."""
        result = calculate_effectiveness(["electric"], type_chart)
        assert result["fire"] == 1.0


class TestDualTypeMultiplier:
    """FR-6: Dual-type Pokémon multiplier calculation (Type A × Type B)."""

    def test_fr6_4x_weakness(self, type_chart):
        """Rock should be 4x against Fire/Flying (2x × 2x)."""
        result = calculate_effectiveness(["fire", "flying"], type_chart)
        assert result["rock"] == 4.0

    def test_fr6_double_resist(self, type_chart):
        """Bug should be 0.25x against Fire/Flying (0.5x × 0.5x)."""
        result = calculate_effectiveness(["fire", "flying"], type_chart)
        assert result["bug"] == 0.25

    def test_fr6_immunity(self, type_chart):
        """Ground should be 0x against Fire/Flying (2x fire × 0x flying = 0x)."""
        result = calculate_effectiveness(["fire", "flying"], type_chart)
        assert result["ground"] == 0.0

    def test_fr6_cancel_out(self, type_chart):
        """Ice is 0.5x vs Fire and 2x vs Flying → net 1.0."""
        result = calculate_effectiveness(["fire", "flying"], type_chart)
        assert result["ice"] == 1.0


class TestFilteredResults:
    """FR-7: Only weaknesses (multiplier > 1) displayed by default."""

    def test_fr7_weaknesses_only(self, type_chart):
        result = calculate_effectiveness(["electric"], type_chart)
        weaknesses = {k: v for k, v in result.items() if v > 1}
        assert "ground" in weaknesses
        assert all(v > 1 for v in weaknesses.values())

    def test_fr7_no_false_weaknesses(self, type_chart):
        result = calculate_effectiveness(["electric"], type_chart)
        weaknesses = {k: v for k, v in result.items() if v > 1}
        assert "electric" not in weaknesses
        assert "flying" not in weaknesses

    def test_fr7_get_weaknesses_helper(self, type_chart):
        weaknesses = get_weaknesses(["electric"], type_chart)
        assert "ground" in weaknesses
        assert "electric" not in weaknesses


class TestEdgeCases:
    """Edge-case coverage for the multiplier engine."""

    def test_fr6_all_17_gen3_types_present(self, type_chart):
        """Result dict must contain an entry for every Gen III attacking type."""
        gen3_types = [
            "normal", "fire", "water", "electric", "grass", "ice",
            "fighting", "poison", "ground", "flying", "psychic",
            "bug", "rock", "ghost", "dragon", "dark", "steel",
        ]
        result = calculate_effectiveness(["fire"], type_chart)
        for t in gen3_types:
            assert t in result, f"Missing type: {t}"
        assert "fairy" not in result

    def test_fr6_no_negative_multipliers(self, type_chart):
        result = calculate_effectiveness(["fire", "flying"], type_chart)
        assert all(v >= 0 for v in result.values())

    def test_fr6_default_chart_used_when_none(self):
        """Falls back to built-in FULL_TYPE_CHART when no chart is passed."""
        result = calculate_effectiveness(["fire"])
        assert result["water"] == 2.0
        assert result["fire"] == 0.5

    def test_fr6_single_type_list_length(self, type_chart):
        result = calculate_effectiveness(["electric"], type_chart)
        assert len(result) == 17
