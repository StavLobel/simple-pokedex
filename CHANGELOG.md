# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [26.3.10] - 2026-03-11

### Added

- Main sprite now always shows the canonical `front_default`; generation-specific sprites moved to a new gallery section with a dropdown (Issue #14)
- Hold-to-reveal shiny interaction on both main sprite and gallery sprites using Pointer Events; Gen I disables the interaction since shinies didn't exist (Issue #12)
- Evolution chain display below the Pokémon card with sprites, arrows, and generation-aware evolution methods; supports linear, branching, and single-stage Pokémon (Issue #13)
- Regional variants selector dropdown near the Pokémon name; filters variants by selected generation and re-fetches card data on variant change (Issue #5)
- New components: `SpriteGallery`, `EvolutionChain`
- New utility modules: `lib/evolution-utils.ts`, `lib/variant-utils.ts`
- New fetch functions: `fetchSpeciesData`, `fetchEvolutionChain`, `extractIdFromUrl`
- Python mirrors: `app/evolution_utils.py`, `app/variant_utils.py`
- Unit tests for evolution chain flattening, method formatting, generation filtering, variant detection, name parsing, and generation-based variant filtering
- Integration tests for PokéAPI species, evolution chain, and varieties endpoints
- E2E tests for sprite gallery, shiny hold, evolution chain display, and regional variants
- Updated STP with test sections (§4.7, §4.8, §5.5, §5.6, §6.12–§6.15) and traceability matrix entries for Issues #5, #12, #13, #14

## [26.3.5] - 2026-03-11

### Fixed

- Sprites in later generations (Gen VI-IX) now fill the Pokéball container at full width instead of being fixed at 192px (Issue #10)
- Unified sprite sizing: all sprites use `w-full h-auto` regardless of pixel art vs. official artwork

### Added

- E2E tests for sprite sizing consistency across generations (`tests/e2e/test_sprite_sizing.py`)
- Updated STP with sprite sizing test section (§6.11) and traceability matrix entry

## [26.3.4] - 2026-03-11

### Changed

- Rebranded app from "PokéSearch" to "Simple Pokédex" with new logo
- Switched from dark theme (#313131) to light off-white theme (#F0ECEC) matching the logo
- Updated favicon to a Pokédex device icon
- Updated all component styles for light-background contrast
- Renamed all references in code, docs, config, and Python docstrings

### Fixed

- E2E tests: removed invalid `exact` kwarg from `page.locator()` calls
- E2E tests: fixed image selectors to use `img[alt]` instead of `img[src*='official-artwork']` (Gen III defaults to pixel sprites)

## [26.3.2] - 2026-03-11

### Added

- Generation dropdown filters by selected Pokémon — selecting a Gen V Pokémon hides Gen I–IV from the dropdown (Issue #9)
- Autocomplete now suggests Pokémon from all generations regardless of the current generation selection (Issue #9)
- `getGenerationForId` and `generationIndex` helper functions in `lib/constants.ts`
- Vitest unit tests for generation helper utilities
- E2E tests for generation dropdown filtering and full autocomplete behavior

### Changed

- `PokemonContext` now exposes `masterList` (all Pokémon) alongside generation-filtered `allPokemon`
- `GenerationSelector` accepts optional `minGeneration` prop to constrain available options
- Updated README with current feature set, project structure, and testing instructions

## [26.3.1] - 2026-03-11

### Changed

- Split CI and release workflows: CI for quality gates, release for deploy
- Release workflow is now manually triggered via `workflow_dispatch`
- Added app version footer to the layout

### Fixed

- Prettier formatting for `docs/STP.md`
- Version tag test now skips gracefully when no tags exist (pre-release)

## [26.3.0] - 2026-03-11

### Added

- Autocomplete search bar with instant filtering across all FRLG-obtainable Pokémon
- Official artwork display via PokéAPI `official-artwork` sprites
- FireRed/LeafGreen GBA sprite watermark behind official artwork
- Type effectiveness engine calculating weaknesses (x2, x4), resistances (x0.5, x0.25), and immunities (x0)
- Ability modals showing English descriptions fetched from PokéAPI
- FRLG-specific Pokémon list and Gen III type overrides (no Fairy type)
- National Dex ID formatting with leading zeros (e.g., `#001`)
- Dark-themed UI matching official Pokédex styling
- Responsive layout (two-column desktop, single-column mobile)
- CI/CD pipeline via GitHub Actions (lint, build, test, deploy)
- Vercel production deployment on push to `main`
- Python pytest test suite (unit, integration, E2E with Playwright)
- Vitest unit tests for type effectiveness and helper functions
- MIT license
- `.editorconfig` and Prettier configuration for consistent formatting
- `CONTRIBUTING.md` with contribution guidelines
- GitHub issue and pull request templates
- SRS and STP documentation in `docs/`

[26.3.5]: https://github.com/StavLobel/simple-pokedex/releases/tag/v26.3.5
[26.3.4]: https://github.com/StavLobel/simple-pokedex/releases/tag/v26.3.4
[26.3.2]: https://github.com/StavLobel/simple-pokedex/releases/tag/v26.3.2
[26.3.1]: https://github.com/StavLobel/simple-pokedex/releases/tag/v26.3.1
[26.3.0]: https://github.com/StavLobel/simple-pokedex/releases/tag/v26.3.0
