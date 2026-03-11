import pytest
import httpx

POKEAPI_BASE = "https://pokeapi.co/api/v2"

pytestmark = pytest.mark.integration


class TestSearchPipeline:
    """FR-2: Search filter logic against the cached Pokémon list."""

    def test_fr2_filter_by_prefix(self):
        resp = httpx.get(f"{POKEAPI_BASE}/pokemon?limit=1400")
        names = [p["name"] for p in resp.json()["results"]]
        query = "char"
        matches = [n for n in names if n.startswith(query)]
        assert "charmander" in matches
        assert "charmeleon" in matches
        assert "charizard" in matches

    def test_fr2_no_results_for_gibberish(self):
        resp = httpx.get(f"{POKEAPI_BASE}/pokemon?limit=1400")
        names = [p["name"] for p in resp.json()["results"]]
        matches = [n for n in names if n.startswith("xyzxyz")]
        assert len(matches) == 0

    def test_fr2_case_insensitive(self):
        resp = httpx.get(f"{POKEAPI_BASE}/pokemon?limit=1400")
        names = [p["name"] for p in resp.json()["results"]]
        query = "PIKA"
        matches = [n for n in names if n.lower().startswith(query.lower())]
        assert "pikachu" in matches


class TestDataPipelineEndToEnd:
    """FR-3: Full pipeline — fetch base, resolve types, resolve abilities."""

    def test_fr3_full_pipeline(self):
        base = httpx.get(f"{POKEAPI_BASE}/pokemon/6").json()
        assert base["name"] == "charizard"

        type_urls = [t["type"]["url"] for t in base["types"]]
        for url in type_urls:
            type_resp = httpx.get(url)
            assert type_resp.status_code == 200
            assert "damage_relations" in type_resp.json()

        ability_urls = [a["ability"]["url"] for a in base["abilities"]]
        for url in ability_urls:
            ability_resp = httpx.get(url)
            assert ability_resp.status_code == 200
            assert "effect_entries" in ability_resp.json()
