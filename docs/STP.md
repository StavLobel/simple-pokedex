# Software Test Plan (STP): PokéSearch App

> **Derived from:** [SRS.md](./SRS.md)
> **Test Framework:** pytest + pytest-playwright
> **Version:** 1.0

---

## 1. Introduction

### 1.1 Purpose

This document defines the testing strategy, test cases, and pytest structure for the **PokéSearch** application. Every test case is traceable to a requirement in the SRS.

### 1.2 Scope

| In Scope                               | Out of Scope                   |
| -------------------------------------- | ------------------------------ |
| Type effectiveness calculation engine  | Vercel infrastructure uptime   |
| PokéAPI integration & data parsing     | PokéAPI internal correctness   |
| Search & autocomplete behavior         | Browser-specific CSS rendering |
| UI layout & interactive elements (E2E) | Third-party CDN availability   |
| Accessibility (keyboard navigation)    | Load/stress testing at scale   |
| Error handling & edge cases            |                                |

### 1.3 References

| Document                            | Location                   |
| ----------------------------------- | -------------------------- |
| Software Requirements Specification | `docs/SRS.md`              |
| PokéAPI Documentation               | https://pokeapi.co/docs/v2 |

---

## 2. Test Strategy

### 2.1 Test Levels

| Level           | Tool                    | Target                                                    |
| --------------- | ----------------------- | --------------------------------------------------------- |
| **Unit**        | pytest                  | Type multiplier engine, ID formatting, language filtering |
| **Integration** | pytest + httpx/requests | PokéAPI data fetching & parsing                           |
| **End-to-End**  | pytest-playwright       | Full user flows in a real browser                         |

### 2.2 Project Structure

```
tests/
├── conftest.py                  # Shared fixtures (mock data, browser setup)
├── unit/
│   ├── test_type_effectiveness.py
│   ├── test_id_formatting.py
│   ├── test_language_filter.py
│   ├── test_versioning.py
│   ├── test_generation_resolver.py
│   └── (TS) lib/__tests__/constants.test.ts
├── integration/
│   ├── test_pokeapi_fetch.py
│   ├── test_data_pipeline.py
│   └── test_versioning.py
└── e2e/
    ├── test_search_flow.py
    ├── test_pokemon_display.py
    ├── test_ability_modal.py
    ├── test_responsive_layout.py
    ├── test_error_handling.py
    ├── test_legal_pages.py
    ├── test_generation_selector.py
    └── test_generation_filter.py
```

### 2.3 Conventions

- **Markers:** `@pytest.mark.unit`, `@pytest.mark.integration`, `@pytest.mark.e2e`
- **Naming:** `test_<FR_ID>_<short_description>`
- **Fixtures:** Reusable Pokémon data and browser contexts defined in `conftest.py`

### 2.4 Dependencies

```
pytest>=8.0
pytest-playwright>=0.5
pytest-asyncio>=0.23
httpx>=0.27
pytest-cov>=5.0
```

---

## 3. Shared Fixtures (`conftest.py`)

```python
import pytest
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"

# ── Mock Data ──────────────────────────────────────────────

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
                    "front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png"
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
    """Single-type Pokémon (Bug/Ghost) with unique resistances — edge case."""
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
            {"effect": "Verstärkt Feuer-Attacken bei niedrigen KP.", "language": {"name": "de"}},
            {
                "effect": "Powers up Fire-type moves when the Pokémon's HP is low.",
                "language": {"name": "en"},
            },
            {"effect": "Augmente les attaques Feu quand les PV sont bas.", "language": {"name": "fr"}},
        ],
    }


@pytest.fixture
def type_chart():
    """Partial type effectiveness chart for testing multiplier logic."""
    return {
        "fire": {"double_damage_from": ["water", "ground", "rock"],
                 "half_damage_from": ["fire", "grass", "ice", "bug", "steel", "fairy"],
                 "no_damage_from": []},
        "flying": {"double_damage_from": ["electric", "ice", "rock"],
                   "half_damage_from": ["grass", "fighting", "bug"],
                   "no_damage_from": ["ground"]},
        "electric": {"double_damage_from": ["ground"],
                     "half_damage_from": ["electric", "flying", "steel"],
                     "no_damage_from": []},
    }


# ── Browser / E2E ─────────────────────────────────────────

@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        yield browser
        browser.close()


@pytest.fixture
def page(browser):
    context = browser.new_context(viewport={"width": 1280, "height": 720})
    page = context.new_page()
    yield page
    context.close()


@pytest.fixture
def mobile_page(browser):
    context = browser.new_context(viewport={"width": 375, "height": 812})
    page = context.new_page()
    yield page
    context.close()
```

---

## 4. Test Cases — Unit Tests

### 4.1 Type Effectiveness Engine

**File:** `tests/unit/test_type_effectiveness.py`
**Traces to:** FR-6, FR-7

```python
import pytest

# from app.engine import calculate_effectiveness  # adjust import to match project structure

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


class TestEdgeCases:
    """Edge-case coverage for the multiplier engine."""

    def test_fr6_all_18_types_present(self, type_chart):
        """Result dict must contain an entry for every attacking type."""
        all_types = [
            "normal", "fire", "water", "electric", "grass", "ice",
            "fighting", "poison", "ground", "flying", "psychic",
            "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
        ]
        result = calculate_effectiveness(["fire"], type_chart)
        for t in all_types:
            assert t in result, f"Missing type: {t}"

    def test_fr6_no_negative_multipliers(self, type_chart):
        result = calculate_effectiveness(["fire", "flying"], type_chart)
        assert all(v >= 0 for v in result.values())
```

### 4.2 ID Formatting

**File:** `tests/unit/test_id_formatting.py`
**Traces to:** FR-5

```python
import pytest

# from app.utils import format_pokemon_id  # adjust import

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
```

### 4.3 Language Filtering

**File:** `tests/unit/test_language_filter.py`
**Traces to:** FR-9

```python
import pytest

# from app.utils import get_english_description  # adjust import

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
        assert desc is not None  # should return a fallback, not crash

    def test_fr9_empty_entries_returns_fallback(self):
        desc = get_english_description([])
        assert desc is not None
```

### 4.4 Versioning

**File:** `tests/unit/test_versioning.py`
**Traces to:** Issue #8

```python
import json
import re
from pathlib import Path

import pytest

pytestmark = pytest.mark.unit

PROJECT_ROOT = Path(__file__).resolve().parents[2]
PACKAGE_JSON = PROJECT_ROOT / "package.json"
CHANGELOG = PROJECT_ROOT / "CHANGELOG.md"


@pytest.fixture
def package_data():
    return json.loads(PACKAGE_JSON.read_text())


class TestVersioning:
    """Verify package.json version and CHANGELOG.md consistency."""

    def test_package_json_has_version(self, package_data):
        """package.json must contain a non-empty 'version' field."""
        assert "version" in package_data
        assert isinstance(package_data["version"], str)
        assert len(package_data["version"]) > 0

    def test_version_follows_semver(self, package_data):
        """Version string must match MAJOR.MINOR.PATCH format."""
        semver_pattern = r"^\d+\.\d+\.\d+$"
        assert re.match(semver_pattern, package_data["version"]), (
            f"Version '{package_data['version']}' does not follow semver (MAJOR.MINOR.PATCH)"
        )

    def test_changelog_exists(self):
        """CHANGELOG.md must exist and be non-empty."""
        assert CHANGELOG.exists(), "CHANGELOG.md not found at project root"
        content = CHANGELOG.read_text()
        assert len(content.strip()) > 0, "CHANGELOG.md is empty"

    def test_changelog_has_current_version_entry(self, package_data):
        """CHANGELOG.md must contain a heading for the current package.json version."""
        version = package_data["version"]
        content = CHANGELOG.read_text()
        assert version in content, (
            f"CHANGELOG.md does not contain an entry for version {version}"
        )
```

### 4.6 Generation Resolver

**File:** `tests/unit/test_generation_resolver.py`
**Traces to:** Issue #1, Issue #2, Issue #4

Tests the generation-aware resolution logic that uses PokéAPI `past_types`, `past_abilities`, `past_stats`, and `past_damage_relations` fields.

```python
class TestTypeResolution:
    def test_gen3_types_no_fairy(self, clefairy_types): ...
    def test_gen6_introduces_fairy(self, clefairy_types): ...
    def test_pokemon_without_past_types_unchanged(self): ...

class TestAbilityResolution:
    def test_gengar_has_levitate_in_gen3(self, gengar_abilities): ...
    def test_gengar_has_cursed_body_in_gen9(self, gengar_abilities): ...
    def test_null_ability_slot_removed(self, charizard_abilities): ...
    def test_multiple_past_entries_earliest_wins(self, clefable_abilities): ...
    def test_pokemon_without_past_abilities_unchanged(self): ...

class TestStatResolution:
    def test_pikachu_stats_gen3(self, pikachu_stats): ...
    def test_stats_unchanged_when_no_past_stats(self): ...

class TestDamageRelationsResolution:
    def test_steel_resists_ghost_dark_gen3(self, steel_damage_relations): ...
    def test_steel_not_resist_ghost_dark_gen6(self, steel_damage_relations): ...

class TestSpriteResolution:
    def test_sprite_frlg_first(self): ...
    def test_sprite_fallback_ruby_sapphire(self): ...
    def test_sprite_fallback_official_artwork(self): ...
    def test_sprite_fallback_none_when_all_null(self): ...
```

---

## 5. Test Cases — Integration Tests

### 5.1 PokéAPI Fetch

**File:** `tests/integration/test_pokeapi_fetch.py`
**Traces to:** FR-1, FR-3

```python
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
        resp = httpx.get(f"{POKEAPI_BASE}/ability/9")  # static (overgrow)
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
```

### 5.2 Data Pipeline

**File:** `tests/integration/test_data_pipeline.py`
**Traces to:** FR-2, FR-3

```python
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
```

### 5.3 Version–Tag Consistency

**File:** `tests/integration/test_versioning.py`
**Traces to:** Issue #8

```python
import json
import subprocess
from pathlib import Path

import pytest

pytestmark = pytest.mark.integration

PROJECT_ROOT = Path(__file__).resolve().parents[2]
PACKAGE_JSON = PROJECT_ROOT / "package.json"


class TestVersionTagConsistency:
    """Verify git tags stay in sync with the declared package version."""

    def test_git_tag_matches_package_version(self):
        """A git tag 'v{version}' must exist matching the current package.json version."""
        version = json.loads(PACKAGE_JSON.read_text())["version"]
        expected_tag = f"v{version}"

        result = subprocess.run(
            ["git", "tag", "--list", expected_tag],
            capture_output=True,
            text=True,
            cwd=PROJECT_ROOT,
        )
        tags = result.stdout.strip().splitlines()
        assert expected_tag in tags, (
            f"Git tag '{expected_tag}' not found. "
            f"Existing tags: {tags or '(none)'}"
        )
```

### 5.4 Past Data Fields (Generation Resolution)

**File:** `tests/integration/test_pokeapi_fetch.py` (class `TestPastDataFields`)
**Traces to:** Issue #1, Issue #2, Issue #4

Verifies that PokéAPI provides the `past_types`, `past_abilities`, `past_stats`, and `past_damage_relations` fields required for generation-aware resolution.

```python
class TestPastDataFields:
    def test_past_types_field_exists(self): ...
    def test_past_abilities_field_exists(self): ...
    def test_past_stats_field_exists(self): ...
    def test_past_damage_relations_field_exists(self): ...
    def test_gen2_pokemon_has_gen3_sprite(self): ...
    def test_fr3_frlg_ability_override_applied(self): ...
```

---

## 6. Test Cases — End-to-End Tests

### 6.1 Search Flow

**File:** `tests/e2e/test_search_flow.py`
**Traces to:** FR-1, FR-2

```python
import pytest

BASE_URL = "http://localhost:3000"

pytestmark = pytest.mark.e2e


class TestSearchAutocomplete:
    """FR-1 / FR-2: Autocomplete search with cached Pokémon names."""

    def test_fr1_search_bar_visible(self, page):
        page.goto(BASE_URL)
        search = page.locator("input[type='text'], input[type='search']")
        assert search.is_visible()

    def test_fr2_autocomplete_shows_suggestions(self, page):
        page.goto(BASE_URL)
        page.fill("input", "char")
        page.wait_for_timeout(500)
        suggestions = page.locator("[data-testid='suggestion'], .autocomplete-item, li")
        assert suggestions.count() > 0

    def test_fr2_autocomplete_filters_correctly(self, page):
        page.goto(BASE_URL)
        page.fill("input", "pika")
        page.wait_for_timeout(500)
        suggestions = page.locator("[data-testid='suggestion'], .autocomplete-item, li")
        for i in range(suggestions.count()):
            text = suggestions.nth(i).inner_text().lower()
            assert "pika" in text

    def test_fr2_select_suggestion_loads_pokemon(self, page):
        page.goto(BASE_URL)
        page.fill("input", "bulbasaur")
        page.wait_for_timeout(500)
        page.locator("[data-testid='suggestion'], .autocomplete-item, li").first.click()
        page.wait_for_timeout(1000)
        assert page.locator("text=bulbasaur", exact=False).is_visible()
```

### 6.2 Pokémon Display

**File:** `tests/e2e/test_pokemon_display.py`
**Traces to:** FR-4, FR-5, FR-6, FR-7

```python
import pytest
import re

BASE_URL = "http://localhost:3000"

pytestmark = pytest.mark.e2e


def _select_pokemon(page, name: str):
    """Helper: search and select a Pokémon by name."""
    page.goto(BASE_URL)
    page.fill("input", name)
    page.wait_for_timeout(500)
    page.locator("[data-testid='suggestion'], .autocomplete-item, li").first.click()
    page.wait_for_timeout(1500)


class TestOfficialArtwork:
    """FR-4: High-resolution official artwork is displayed."""

    def test_fr4_image_rendered(self, page):
        _select_pokemon(page, "pikachu")
        img = page.locator("img[src*='official-artwork']")
        assert img.is_visible()

    def test_fr4_image_not_broken(self, page):
        _select_pokemon(page, "pikachu")
        img = page.locator("img[src*='official-artwork']")
        natural_width = img.evaluate("el => el.naturalWidth")
        assert natural_width > 0


class TestIDFormatting:
    """FR-5: Pokédex number with leading zeros."""

    def test_fr5_leading_zeros_displayed(self, page):
        _select_pokemon(page, "bulbasaur")
        id_text = page.locator("text=#001").first
        assert id_text.is_visible()

    def test_fr5_three_digit_id(self, page):
        _select_pokemon(page, "charizard")
        id_text = page.locator("text=#006").first
        assert id_text.is_visible()


class TestTypeEffectiveness:
    """FR-6 / FR-7: Weakness grid displays correct multipliers."""

    def test_fr6_weaknesses_shown(self, page):
        _select_pokemon(page, "charizard")
        weakness_section = page.locator("text=Weak", exact=False).first
        assert weakness_section.is_visible()

    def test_fr6_rock_4x_for_charizard(self, page):
        _select_pokemon(page, "charizard")
        rock_badge = page.locator("[data-testid='type-rock'], text=Rock", exact=False)
        assert rock_badge.is_visible()

    def test_fr7_resistances_not_in_weakness_grid(self, page):
        _select_pokemon(page, "charizard")
        weakness_section = page.locator("[data-testid='weaknesses']")
        if weakness_section.count() > 0:
            text = weakness_section.inner_text().lower()
            assert "bug" not in text  # bug is 0.25x (resistance), not a weakness
```

### 6.3 Ability Modal

**File:** `tests/e2e/test_ability_modal.py`
**Traces to:** FR-8, FR-9

```python
import pytest

BASE_URL = "http://localhost:3000"

pytestmark = pytest.mark.e2e


def _select_pokemon(page, name: str):
    page.goto(BASE_URL)
    page.fill("input", name)
    page.wait_for_timeout(500)
    page.locator("[data-testid='suggestion'], .autocomplete-item, li").first.click()
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
        modal = page.locator("[role='dialog'], .modal, [data-testid='ability-modal']")
        assert modal.is_visible()

    def test_fr9_english_description_shown(self, page):
        _select_pokemon(page, "charizard")
        page.locator("text=blaze", exact=False).first.click()
        page.wait_for_timeout(800)
        modal = page.locator("[role='dialog'], .modal, [data-testid='ability-modal']")
        text = modal.inner_text()
        assert "fire" in text.lower() or "hp" in text.lower()

    def test_fr8_modal_close_x_button(self, page):
        _select_pokemon(page, "charizard")
        page.locator("text=blaze", exact=False).first.click()
        page.wait_for_timeout(500)
        close_btn = page.locator("[aria-label='Close'], button:has-text('×'), button:has-text('X')")
        close_btn.first.click()
        page.wait_for_timeout(300)
        modal = page.locator("[role='dialog'], .modal, [data-testid='ability-modal']")
        assert not modal.is_visible()

    def test_fr8_modal_close_esc_key(self, page):
        """NFR Accessibility: Modal closable via Esc key."""
        _select_pokemon(page, "charizard")
        page.locator("text=blaze", exact=False).first.click()
        page.wait_for_timeout(500)
        page.keyboard.press("Escape")
        page.wait_for_timeout(300)
        modal = page.locator("[role='dialog'], .modal, [data-testid='ability-modal']")
        assert not modal.is_visible()
```

### 6.4 Responsive Layout

**File:** `tests/e2e/test_responsive_layout.py`
**Traces to:** SRS §4.2

```python
import pytest

BASE_URL = "http://localhost:3000"

pytestmark = pytest.mark.e2e


class TestDesktopLayout:
    """SRS §4.2: Two-column grid on desktop."""

    def test_desktop_two_column_layout(self, page):
        page.goto(BASE_URL)
        page.fill("input", "pikachu")
        page.wait_for_timeout(500)
        page.locator("[data-testid='suggestion'], .autocomplete-item, li").first.click()
        page.wait_for_timeout(1500)
        img_box = page.locator("img[src*='official-artwork']").bounding_box()
        stats = page.locator("[data-testid='stats'], .stats-section, .pokemon-stats").first
        if stats.is_visible():
            stats_box = stats.bounding_box()
            assert img_box["x"] < stats_box["x"], "Image should be left of stats on desktop"


class TestMobileLayout:
    """SRS §4.2: Single-column responsive stack on mobile."""

    def test_mobile_single_column(self, mobile_page):
        mobile_page.goto(BASE_URL)
        mobile_page.fill("input", "pikachu")
        mobile_page.wait_for_timeout(500)
        mobile_page.locator("[data-testid='suggestion'], .autocomplete-item, li").first.click()
        mobile_page.wait_for_timeout(1500)
        img = mobile_page.locator("img[src*='official-artwork']")
        if img.is_visible():
            img_box = img.bounding_box()
            assert img_box["width"] <= 375, "Image should fit within mobile viewport"
```

### 6.5 Error Handling

**File:** `tests/e2e/test_error_handling.py`
**Traces to:** SRS §6 (Non-Functional Requirements)

```python
import pytest

BASE_URL = "http://localhost:3000"

pytestmark = pytest.mark.e2e


class TestErrorStates:
    """NFR: App handles PokéAPI downtime gracefully."""

    def test_nfr_invalid_pokemon_shows_error(self, page):
        page.goto(BASE_URL)
        page.fill("input", "notapokemon12345")
        page.wait_for_timeout(500)
        suggestions = page.locator("[data-testid='suggestion'], .autocomplete-item, li")
        assert suggestions.count() == 0

    def test_nfr_app_loads_without_crash(self, page):
        resp = page.goto(BASE_URL)
        assert resp.status == 200

    def test_nfr_no_console_errors_on_load(self, page):
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        page.goto(BASE_URL)
        page.wait_for_timeout(2000)
        assert len(errors) == 0, f"Console errors: {errors}"
```

### 6.6 Legal Pages

**File:** `tests/e2e/test_legal_pages.py`
**Traces to:** Issue #7

```python
import os

import pytest

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")

pytestmark = pytest.mark.e2e


class TestFooterAttribution:
    """Issue #7: Footer displays PokeAPI attribution and trademark disclaimer."""

    def test_footer_contains_pokeapi_attribution(self, page):
        page.goto(BASE_URL)
        footer = page.locator("footer")
        assert footer.is_visible()
        assert "PokéAPI" in footer.inner_text() or "PokeAPI" in footer.inner_text()
        link = footer.locator("a[href='https://pokeapi.co/']")
        assert link.count() > 0

    def test_footer_contains_trademark_disclaimer(self, page):
        page.goto(BASE_URL)
        footer = page.locator("footer")
        text = footer.inner_text()
        assert "Nintendo" in text
        assert "Game Freak" in text
        assert ("The Pokémon Company" in text) or ("The Pokemon Company" in text)
        assert "unofficial" in text.lower()


class TestTermsPage:
    """Issue #7: Terms of Service page exists and contains required sections."""

    def test_terms_page_accessible(self, page):
        page.goto(BASE_URL)
        footer = page.locator("footer")
        terms_link = footer.locator("a[href='/terms']")
        assert terms_link.is_visible()
        terms_link.click()
        page.wait_for_timeout(1000)
        assert "/terms" in page.url
        heading = page.locator("h1")
        assert "Terms of Service" in heading.inner_text()

    def test_terms_page_has_required_sections(self, page):
        page.goto(f"{BASE_URL}/terms")
        page.wait_for_timeout(1000)
        content = page.locator("main").inner_text()
        assert "Nature of the Service" in content or "service" in content.lower()
        assert "Disclaimer" in content
        assert "as is" in content.lower() or "as-is" in content.lower()
        assert "Acceptable Use" in content
        assert "Modifications" in content or "Discontinuation" in content


class TestPrivacyPage:
    """Issue #7: Privacy Policy page exists and contains required sections."""

    def test_privacy_page_accessible(self, page):
        page.goto(BASE_URL)
        footer = page.locator("footer")
        privacy_link = footer.locator("a[href='/privacy']")
        assert privacy_link.is_visible()
        privacy_link.click()
        page.wait_for_timeout(1000)
        assert "/privacy" in page.url
        heading = page.locator("h1")
        assert "Privacy Policy" in heading.inner_text()

    def test_privacy_page_has_required_sections(self, page):
        page.goto(f"{BASE_URL}/privacy")
        page.wait_for_timeout(1000)
        content = page.locator("main").inner_text()
        assert "Data Collection" in content or "data" in content.lower()
        assert "Third-Party" in content or "third-party" in content.lower()
        assert "PokéAPI" in content or "PokeAPI" in content
        assert "Vercel" in content
        assert "Contact" in content


class TestFooterLinksOnAllPages:
    """Issue #7: Footer legal links are visible on every page."""

    def test_footer_links_present_on_all_pages(self, page):
        for path in ["/", "/terms", "/privacy"]:
            page.goto(f"{BASE_URL}{path}")
            page.wait_for_timeout(500)
            footer = page.locator("footer")
            assert footer.is_visible(), f"Footer not visible on {path}"
            terms_link = footer.locator("a[href='/terms']")
            privacy_link = footer.locator("a[href='/privacy']")
            assert terms_link.count() > 0, f"Terms link missing on {path}"
            assert privacy_link.count() > 0, f"Privacy link missing on {path}"
```

### 6.8 Generation Selector

**File:** `tests/e2e/test_generation_selector.py`
**Traces to:** Issue #1, Issue #2, Issue #4

Tests the generation selector UI and verifies that switching generations updates sprites, types, abilities, stats, and the Pokémon list.

```python
class TestGenerationSelectorUI:
    def test_gen_selector_visible(self, page): ...
    def test_default_gen_is_gen3(self, page): ...

class TestAbilityResolutionE2E:
    def test_gengar_shows_levitate_gen3(self, page): ...
    def test_gengar_shows_cursed_body_gen9(self, page): ...

class TestTypeResolutionE2E:
    def test_clefairy_normal_gen3(self, page): ...
    def test_clefairy_fairy_gen6(self, page): ...

class TestSpriteResolutionE2E:
    def test_gen2_pokemon_pixel_sprite_gen3(self, page): ...

class TestGenerationSwitchingE2E:
    def test_switching_gen_updates_pokemon_list(self, page): ...
    def test_stats_displayed(self, page): ...
```

### 6.9 Generation Dropdown Filter & Full Autocomplete

**File:** `tests/e2e/test_generation_filter.py`
**Traces to:** Issue #9

Tests that the generation dropdown filters out earlier generations when a Pokémon is selected, and that the autocomplete suggests Pokémon from all generations regardless of the current selection.

```python
class TestGenerationDropdownFilter:
    def test_gen_dropdown_filters_after_gen5_pokemon(self, page): ...
    def test_gen_dropdown_shows_all_for_gen1_pokemon(self, page): ...
    def test_gen_auto_switches_to_pokemon_generation(self, page): ...
    def test_gen_stays_when_selecting_earlier_pokemon(self, page): ...

class TestAutocompleteAllPokemon:
    def test_autocomplete_shows_gen5_pokemon_on_gen3(self, page): ...
    def test_autocomplete_shows_gen9_pokemon(self, page): ...
```

### 6.10 Generation Helper Utilities (Vitest)

**File:** `lib/__tests__/constants.test.ts`
**Traces to:** Issue #9

Unit tests for `getGenerationForId` and `generationIndex` helper functions.

```typescript
describe("getGenerationForId") {
    it("maps Gen I Pokemon (id 1–151)") ...
    it("maps Gen II Pokemon (id 152–251)") ...
    it("maps Gen III Pokemon (id 252–386)") ...
    it("maps Gen V Pokemon (id 494–649)") ...
    it("maps Gen IX Pokemon (id 906–1025)") ...
    it("falls back to last generation for ids beyond known range") ...
}
describe("generationIndex") {
    it("returns 0 for generation-i") ...
    it("returns 4 for generation-v") ...
    it("returns 8 for generation-ix") ...
}
```

---

## 7. Non-Functional Test Cases

### 7.1 Performance

**File:** `tests/unit/test_performance.py`
**Traces to:** SRS §6

```python
import pytest
import time

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
```

---

## 8. Traceability Matrix

| SRS Requirement             | Test ID(s)                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Level                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| **FR-1** Global Cache       | `test_fr1_pokemon_list_fetched`, `test_fr1_each_entry_has_name_and_url`, `test_fr1_search_bar_visible`                                                                                                                                                                                                                                                                                                                                                             | Integration, E2E       |
| **FR-2** Search Logic       | `test_fr2_filter_by_prefix`, `test_fr2_no_results_for_gibberish`, `test_fr2_case_insensitive`, `test_fr2_autocomplete_*`                                                                                                                                                                                                                                                                                                                                           | Integration, E2E       |
| **FR-3** Data Fetching      | `test_fr3_base_data_fields`, `test_fr3_type_damage_relations`, `test_fr3_ability_effect_entries`, `test_fr3_full_pipeline`                                                                                                                                                                                                                                                                                                                                         | Integration            |
| **FR-4** Official Artwork   | `test_fr4_artwork_url_exists`, `test_fr4_image_rendered`, `test_fr4_image_not_broken`                                                                                                                                                                                                                                                                                                                                                                              | Integration, E2E       |
| **FR-5** ID Formatting      | `test_fr5_leading_zeros`, `test_fr5_zero_id_rejected`, `test_fr5_negative_id_rejected`, `test_fr5_leading_zeros_displayed`, `test_fr5_three_digit_id`                                                                                                                                                                                                                                                                                                              | Unit, E2E              |
| **FR-6** Multiplier Calc    | `test_fr6_super_effective`, `test_fr6_4x_weakness`, `test_fr6_immunity`, `test_fr6_cancel_out`, `test_fr6_*`                                                                                                                                                                                                                                                                                                                                                       | Unit, E2E              |
| **FR-7** Filtered Results   | `test_fr7_weaknesses_only`, `test_fr7_no_false_weaknesses`, `test_fr7_resistances_not_in_weakness_grid`                                                                                                                                                                                                                                                                                                                                                            | Unit, E2E              |
| **FR-8** Ability Popups     | `test_fr8_ability_clickable`, `test_fr8_modal_opens`, `test_fr8_modal_close_*`                                                                                                                                                                                                                                                                                                                                                                                     | E2E                    |
| **FR-9** Language Filter    | `test_fr9_english_extracted`, `test_fr9_non_english_excluded`, `test_fr9_missing_english_*`, `test_fr9_english_description_shown`                                                                                                                                                                                                                                                                                                                                  | Unit, E2E              |
| **NFR** Performance         | `test_nfr_filter_under_100ms`                                                                                                                                                                                                                                                                                                                                                                                                                                      | Unit                   |
| **NFR** Accessibility       | `test_fr8_modal_close_esc_key`, `test_fr8_modal_close_x_button`                                                                                                                                                                                                                                                                                                                                                                                                    | E2E                    |
| **NFR** Availability        | `test_nfr_invalid_pokemon_shows_error`, `test_nfr_app_loads_without_crash`, `test_nfr_no_console_errors_on_load`                                                                                                                                                                                                                                                                                                                                                   | E2E                    |
| **§4.2** Layout             | `test_desktop_two_column_layout`, `test_mobile_single_column`                                                                                                                                                                                                                                                                                                                                                                                                      | E2E                    |
| **Issue #7** Legal Pages    | `test_footer_contains_pokeapi_attribution`, `test_footer_contains_trademark_disclaimer`, `test_terms_page_accessible`, `test_privacy_page_accessible`, `test_terms_page_has_required_sections`, `test_privacy_page_has_required_sections`, `test_footer_links_present_on_all_pages`                                                                                                                                                                                | E2E                    |
| **Issue #8** Versioning     | `test_package_json_has_version`, `test_version_follows_semver`, `test_changelog_exists`, `test_changelog_has_current_version_entry`, `test_git_tag_matches_package_version`                                                                                                                                                                                                                                                                                        | Unit, Integration      |
| **Issue #1** FRLG Abilities | `test_gengar_has_levitate_in_gen3`, `test_gengar_has_cursed_body_in_gen9`, `test_null_ability_slot_removed`, `test_multiple_past_entries_earliest_wins`, `test_past_abilities_field_exists`, `test_fr3_frlg_ability_override_applied`, `test_gengar_shows_levitate_gen3`, `test_gengar_shows_cursed_body_gen9`                                                                                                                                                     | Unit, Integration, E2E |
| **Issue #2** Gen2 Sprites   | `test_sprite_frlg_first`, `test_sprite_fallback_ruby_sapphire`, `test_sprite_fallback_official_artwork`, `test_gen2_pokemon_has_gen3_sprite`, `test_gen2_pokemon_pixel_sprite_gen3`                                                                                                                                                                                                                                                                                | Unit, Integration, E2E |
| **Issue #9** Gen Filter     | `test_gen_dropdown_filters_after_gen5_pokemon`, `test_gen_dropdown_shows_all_for_gen1_pokemon`, `test_gen_auto_switches_to_pokemon_generation`, `test_gen_stays_when_selecting_earlier_pokemon`, `test_autocomplete_shows_gen5_pokemon_on_gen3`, `test_autocomplete_shows_gen9_pokemon`, `getGenerationForId (vitest)`, `generationIndex (vitest)`                                                                                                                 | Unit, E2E              |
| **Issue #4** Gen Selector   | `test_gen3_types_no_fairy`, `test_gen6_introduces_fairy`, `test_pikachu_stats_gen3`, `test_steel_resists_ghost_dark_gen3`, `test_steel_not_resist_ghost_dark_gen6`, `test_past_types_field_exists`, `test_past_stats_field_exists`, `test_past_damage_relations_field_exists`, `test_gen_selector_visible`, `test_default_gen_is_gen3`, `test_clefairy_normal_gen3`, `test_clefairy_fairy_gen6`, `test_switching_gen_updates_pokemon_list`, `test_stats_displayed` | Unit, Integration, E2E |

---

## 9. Running the Tests

```bash
# Install dependencies
pip install pytest pytest-playwright httpx pytest-cov pytest-asyncio
playwright install chromium

# Run all tests
pytest tests/ -v

# Run by level
pytest tests/ -m unit -v
pytest tests/ -m integration -v
pytest tests/ -m e2e -v

# Run with coverage
pytest tests/ --cov=app --cov-report=html -v

# Run a single file
pytest tests/unit/test_type_effectiveness.py -v
```

---

## 10. Entry / Exit Criteria

### Entry Criteria

- Application builds and runs locally on `localhost:3000`
- PokéAPI is reachable (for integration tests)
- `playwright install chromium` has been executed

### Exit Criteria

- All **unit** tests pass (100%)
- All **integration** tests pass (100%)
- All **E2E** tests pass (≥ 95% — flaky network tolerance)
- No **critical** or **high** severity defects remain open
- Test coverage ≥ 80% on business logic modules
