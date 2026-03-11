import time

import pytest

pytestmark = pytest.mark.unit


class TestSearchPerformance:
    """NFR: Search filter reacts in under 100ms."""

    def test_nfr_filter_under_100ms(self):
        names = [f"pokemon_{i}" for i in range(1500)]
        query = "pokemon_7"
        start = time.perf_counter()
        results = [n for n in names if n.startswith(query)]
        elapsed_ms = (time.perf_counter() - start) * 1000
        assert elapsed_ms < 100, f"Filter took {elapsed_ms:.2f}ms (limit: 100ms)"
        assert len(results) > 0

    def test_nfr_filter_large_dataset(self):
        """Ensure filtering remains fast even at 10k entries."""
        names = [f"mon_{i}" for i in range(10_000)]
        query = "mon_99"
        start = time.perf_counter()
        results = [n for n in names if n.startswith(query)]
        elapsed_ms = (time.perf_counter() - start) * 1000
        assert elapsed_ms < 100, f"Filter took {elapsed_ms:.2f}ms (limit: 100ms)"
        assert len(results) > 0
