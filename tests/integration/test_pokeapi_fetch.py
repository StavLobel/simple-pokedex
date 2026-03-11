import pytest
import httpx

POKEAPI_BASE = "https://pokeapi.co/api/v2"

pytestmark = pytest.mark.integration


class TestGlobalCache:
    """FR-1: Fetch all 1000+ Pokémon names/IDs."""

    def test_fr1_pokemon_list_fetched(self):
        resp = httpx.get(f"{POKEAPI_BASE}/pokemon?limit=1400")
        assert resp.status_code == 200
        data = resp.json()
        assert data["count"] >= 1000
        assert len(data["results"]) >= 1000

    def test_fr1_each_entry_has_name_and_url(self):
        resp = httpx.get(f"{POKEAPI_BASE}/pokemon?limit=5")
        data = resp.json()
        for entry in data["results"]:
            assert "name" in entry
            assert "url" in entry


class TestMultiStageFetch:
    """FR-3: Selecting a Pokémon triggers base → type → ability fetches."""

    def test_fr3_base_data_fields(self):
        resp = httpx.get(f"{POKEAPI_BASE}/pokemon/25")
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "pikachu"
        assert data["id"] == 25
        assert "types" in data
        assert "abilities" in data
        assert "sprites" in data

    def test_fr3_type_damage_relations(self):
        resp = httpx.get(f"{POKEAPI_BASE}/type/electric")
        assert resp.status_code == 200
        data = resp.json()
        relations = data["damage_relations"]
        assert "double_damage_from" in relations
        assert "half_damage_from" in relations
        assert "no_damage_from" in relations

    def test_fr3_ability_effect_entries(self):
        resp = httpx.get(f"{POKEAPI_BASE}/ability/9")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["effect_entries"]) > 0
        langs = [e["language"]["name"] for e in data["effect_entries"]]
        assert "en" in langs


class TestOfficialArtwork:
    """FR-4: Official artwork URL is present in sprite data."""

    def test_fr4_artwork_url_exists(self):
        resp = httpx.get(f"{POKEAPI_BASE}/pokemon/6")
        data = resp.json()
        artwork = data["sprites"]["other"]["official-artwork"]["front_default"]
        assert artwork is not None
        assert artwork.startswith("https://")
        assert artwork.endswith(".png")
