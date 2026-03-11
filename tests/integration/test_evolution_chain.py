import pytest
import httpx

POKEAPI_BASE = "https://pokeapi.co/api/v2"

pytestmark = pytest.mark.integration


class TestEvolutionChainFetch:
    """Issue #13: Verify species and evolution chain endpoints."""

    def test_species_has_evolution_chain_url(self):
        resp = httpx.get(f"{POKEAPI_BASE}/pokemon-species/1")
        assert resp.status_code == 200
        data = resp.json()
        assert "evolution_chain" in data
        assert data["evolution_chain"]["url"].startswith("https://")

    def test_evolution_chain_has_recursive_structure(self):
        resp = httpx.get(f"{POKEAPI_BASE}/pokemon-species/1")
        chain_url = resp.json()["evolution_chain"]["url"]
        chain_resp = httpx.get(chain_url)
        assert chain_resp.status_code == 200
        chain = chain_resp.json()["chain"]
        assert chain["species"]["name"] == "bulbasaur"
        assert len(chain["evolves_to"]) > 0
        ivysaur = chain["evolves_to"][0]
        assert ivysaur["species"]["name"] == "ivysaur"
        assert len(ivysaur["evolution_details"]) > 0

    def test_eevee_has_branching_evolutions(self):
        resp = httpx.get(f"{POKEAPI_BASE}/pokemon-species/133")
        chain_url = resp.json()["evolution_chain"]["url"]
        chain_resp = httpx.get(chain_url)
        chain = chain_resp.json()["chain"]
        assert chain["species"]["name"] == "eevee"
        assert len(chain["evolves_to"]) >= 3

    def test_tauros_has_no_evolutions(self):
        resp = httpx.get(f"{POKEAPI_BASE}/pokemon-species/128")
        chain_url = resp.json()["evolution_chain"]["url"]
        chain_resp = httpx.get(chain_url)
        chain = chain_resp.json()["chain"]
        assert chain["species"]["name"] == "tauros"
        assert len(chain["evolves_to"]) == 0

    def test_evolution_details_fields(self):
        resp = httpx.get(f"{POKEAPI_BASE}/pokemon-species/1")
        chain_url = resp.json()["evolution_chain"]["url"]
        chain_resp = httpx.get(chain_url)
        ivysaur = chain_resp.json()["chain"]["evolves_to"][0]
        detail = ivysaur["evolution_details"][0]
        assert "min_level" in detail
        assert "trigger" in detail
        assert "item" in detail
