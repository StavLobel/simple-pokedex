# PokéSearch

[![CI](https://github.com/your-username/simple_pokedex/actions/workflows/ci-deploy.yml/badge.svg)](https://github.com/your-username/simple_pokedex/actions/workflows/ci-deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

A web-based Pokédex app that lets you search for Pokémon, view official artwork, explore type effectiveness, and read ability descriptions.

Built with [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com), and the [PokéAPI](https://pokeapi.co).

<!-- TODO: Replace with an actual screenshot of the app -->
<!-- ![PokéSearch Screenshot](docs/screenshot.png) -->

## Features

- **Instant autocomplete** — all Pokémon names (Gen I–IX) are cached on load for sub-100ms filtering, regardless of the selected generation
- **Generation selector** — switch between Gen I–IX to view generation-accurate sprites, types, abilities, stats, and damage relations
- **Smart generation filtering** — selecting a Pokémon automatically adjusts the generation dropdown (e.g. picking a Gen V Pokémon hides Gen I–IV)
- **Official artwork & retro sprites** — high-resolution sprites from the PokéAPI official-artwork collection, with generation-specific pixel sprites when available
- **Base stats** — color-coded stat bars for HP, Atk, Def, Sp.Atk, Sp.Def, and Speed with generation-aware values
- **Type effectiveness engine** — calculates weaknesses (x2, x4), resistances (x0.5, x0.25), and immunities (x0)
- **Ability modals** — click any ability to see its English description in a popup

## Prerequisites

- [Node.js](https://nodejs.org) >= 20.0.0
- npm (comes with Node.js)
- [Python](https://www.python.org) >= 3.11 (for running tests)

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command                | Description                   |
| ---------------------- | ----------------------------- |
| `npm run dev`          | Start development server      |
| `npm run build`        | Create production build       |
| `npm start`            | Start production server       |
| `npm run lint`         | Run ESLint                    |
| `npm run format`       | Format code with Prettier     |
| `npm run format:check` | Check formatting (used in CI) |
| `npx vitest run`       | Run TypeScript unit tests     |

## Testing

TypeScript unit tests use [Vitest](https://vitest.dev); Python tests use [pytest](https://docs.pytest.org):

```bash
# TypeScript unit tests (constants, pokeapi helpers, type effectiveness)
npx vitest run

# Install Python test dependencies
pip install -r requirements-test.txt

# Python unit tests
pytest tests/unit/ -v

# Integration tests (hits live PokéAPI)
pytest tests/integration/ -v

# E2E tests (requires dev server on localhost:3000)
pytest tests/e2e/ -v
```

## Project Structure

```
simple_pokedex/
├── app/                    # Next.js App Router (pages, layout, global styles)
├── components/             # React UI components
│   ├── AbilityModal.tsx    #   Ability description popup
│   ├── GenerationSelector.tsx # Generation dropdown (Gen I–IX)
│   ├── PokemonCard.tsx     #   Main Pokémon display card
│   ├── SearchBar.tsx       #   Autocomplete search input
│   ├── TypeBadge.tsx       #   Type pill badge
│   └── WeaknessGrid.tsx    #   Weakness/resistance/immunity grid
├── contexts/               # React Context providers
│   ├── GenerationContext.tsx # Generation state management
│   └── PokemonContext.tsx  #   Pokémon list state (master + filtered)
├── lib/                    # Data layer & business logic
│   ├── constants.ts        #   Types, colors, generation maps, API URL
│   ├── generation-resolver.ts # Generation-aware type/ability/stat/sprite resolution
│   ├── pokeapi.ts          #   PokéAPI fetch functions & types
│   ├── typeEffectiveness.ts#   Type multiplier calculations
│   └── frlg-pokemon.ts     #   FRLG Pokémon ID list & URL helpers
├── tests/                  # Python test suite
│   ├── unit/               #   Unit tests
│   ├── integration/        #   API integration tests
│   └── e2e/                #   Playwright E2E tests
├── docs/                   # Documentation (SRS, STP)
└── public/                 # Static assets
```

## Deployment

This project deploys to [Vercel](https://vercel.com) automatically on every push to `main` via GitHub Actions.

To deploy manually:

```bash
npm run build
```

Or connect the repo to Vercel for automatic deployments.

## Tech Stack

| Layer     | Technology                   |
| --------- | ---------------------------- |
| Framework | Next.js 16                   |
| UI        | React 19                     |
| Styling   | Tailwind CSS 4               |
| Language  | TypeScript (strict)          |
| Data      | PokéAPI REST                 |
| Testing   | Vitest + pytest + Playwright |
| CI/CD     | GitHub Actions               |
| Hosting   | Vercel                       |

## Versioning

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** — breaking changes (e.g., removing FRLG-only mode)
- **MINOR** — new features (e.g., generation selector, move pool)
- **PATCH** — bug fixes (e.g., ability overrides, sprite fallbacks)

All notable changes are documented in [CHANGELOG.md](CHANGELOG.md).
Releases are published on the [GitHub Releases](https://github.com/StavLobel/simple-pokedex/releases) page.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
