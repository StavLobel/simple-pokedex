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


class TestPastDataFields:
    """Issue #1, #2, #4: Verify PokéAPI provides past_* fields for generation resolution."""

    def test_past_types_field_exists(self):
        resp = httpx.get(f"{POKEAPI_BASE}/pokemon/35")
        data = resp.json()
        past_types = data["past_types"]
        assert len(past_types) > 0
        gens = [e["generation"]["name"] for e in past_types]
        assert "generation-v" in gens

    def test_past_abilities_field_exists(self):
        resp = httpx.get(f"{POKEAPI_BASE}/pokemon/94")
        data = resp.json()
        past_abilities = data["past_abilities"]
        assert len(past_abilities) > 0
        gens = [e["generation"]["name"] for e in past_abilities]
        assert "generation-vi" in gens

    def test_past_stats_field_exists(self):
        resp = httpx.get(f"{POKEAPI_BASE}/pokemon/25")
        data = resp.json()
        past_stats = data["past_stats"]
        assert len(past_stats) > 0
        gens = [e["generation"]["name"] for e in past_stats]
        assert "generation-v" in gens

    def test_past_damage_relations_field_exists(self):
        resp = httpx.get(f"{POKEAPI_BASE}/type/steel")
        data = resp.json()
        past_dr = data["past_damage_relations"]
        assert len(past_dr) > 0
        gens = [e["generation"]["name"] for e in past_dr]
        assert "generation-v" in gens

    def test_gen2_pokemon_has_gen3_sprite(self):
        resp = httpx.get(f"{POKEAPI_BASE}/pokemon/155")
        data = resp.json()
        rs_sprite = data["sprites"]["versions"]["generation-iii"]["ruby-sapphire"]["front_default"]
        assert rs_sprite is not None
        assert rs_sprite.startswith("https://")

    def test_fr3_frlg_ability_override_applied(self):
        resp = httpx.get(f"{POKEAPI_BASE}/pokemon/94")
        data = resp.json()
        past_abilities = data["past_abilities"]
        gen6_entry = next(
            e for e in past_abilities if e["generation"]["name"] == "generation-vi"
        )
        ability_names = [
            a["ability"]["name"]
            for a in gen6_entry["abilities"]
            if a["ability"] is not None
        ]
        assert "levitate" in ability_names
