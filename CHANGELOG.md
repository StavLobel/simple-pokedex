# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[26.3.1]: https://github.com/StavLobel/simple-pokedex/releases/tag/v26.3.1
[26.3.0]: https://github.com/StavLobel/simple-pokedex/releases/tag/v26.3.0
