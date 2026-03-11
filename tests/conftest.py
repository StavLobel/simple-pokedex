import pytest

try:
    from playwright.sync_api import sync_playwright
    HAS_PLAYWRIGHT = True
except ImportError:
    HAS_PLAYWRIGHT = False

BASE_URL = "http://localhost:3000"


# ── Mock Data ──────────────────────────────────────────────────────────────────

@pytest.fixture
def charizard_data():
    """Dual-type Pokémon (Fire/Flying) — exercises multiplier combinations."""
    return {
        "id": 6,
        "name": "charizard",
        "types": [
            {"type": {"name": "fire"}},
            {"type": {"name": "flying"}},
        ],
        "sprites": {
            "other": {
                "official-artwork": {
                    "front_default": (
                        "https://raw.githubusercontent.com/PokeAPI/sprites/"
                        "master/sprites/pokemon/other/official-artwork/6.png"
                    )
                }
            }
        },
        "abilities": [
            {"ability": {"name": "blaze", "url": "https://pokeapi.co/api/v2/ability/66/"}},
            {"ability": {"name": "solar-power", "url": "https://pokeapi.co/api/v2/ability/94/"}},
        ],
    }


@pytest.fixture
def shedinja_data():
    """Dual-type Pokémon (Bug/Ghost) with unique resistances — edge case."""
    return {
        "id": 292,
        "name": "shedinja",
        "types": [
            {"type": {"name": "bug"}},
            {"type": {"name": "ghost"}},
        ],
    }


@pytest.fixture
def pikachu_data():
    """Single-type Pokémon (Electric) — simplest multiplier case."""
    return {
        "id": 25,
        "name": "pikachu",
        "types": [
            {"type": {"name": "electric"}},
        ],
    }


@pytest.fixture
def ability_response_blaze():
    """Raw PokéAPI ability response with multi-language entries."""
    return {
        "effect_entries": [
            {
                "effect": "Verstärkt Feuer-Attacken bei niedrigen KP.",
                "language": {"name": "de"},
            },
            {
                "effect": "Powers up Fire-type moves when the Pokémon's HP is low.",
                "language": {"name": "en"},
            },
            {
                "effect": "Augmente les attaques Feu quand les PV sont bas.",
                "language": {"name": "fr"},
            },
        ],
    }


@pytest.fixture
def type_chart():
    """Partial type effectiveness chart for testing multiplier logic."""
    return {
        "fire": {
            "double_damage_from": ["water", "ground", "rock"],
            "half_damage_from": ["fire", "grass", "ice", "bug", "steel", "fairy"],
            "no_damage_from": [],
        },
        "flying": {
            "double_damage_from": ["electric", "ice", "rock"],
            "half_damage_from": ["grass", "fighting", "bug"],
            "no_damage_from": ["ground"],
        },
        "electric": {
            "double_damage_from": ["ground"],
            "half_damage_from": ["electric", "flying", "steel"],
            "no_damage_from": [],
        },
    }


# ── Browser / E2E ─────────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def browser():
    if not HAS_PLAYWRIGHT:
        pytest.skip("playwright is not installed")
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True)
        yield b
        b.close()


@pytest.fixture
def page(browser):
    context = browser.new_context(viewport={"width": 1280, "height": 720})
    pg = context.new_page()
    yield pg
    context.close()


@pytest.fixture
def mobile_page(browser):
    context = browser.new_context(viewport={"width": 375, "height": 812})
    pg = context.new_page()
    yield pg
    context.close()
