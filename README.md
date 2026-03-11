# PokéSearch

[![CI](https://github.com/your-username/simple_pokedex/actions/workflows/ci-deploy.yml/badge.svg)](https://github.com/your-username/simple_pokedex/actions/workflows/ci-deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

A web-based Pokédex app that lets you search for Pokémon, view official artwork, explore type effectiveness, and read ability descriptions.

Built with [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com), and the [PokéAPI](https://pokeapi.co).

<!-- TODO: Replace with an actual screenshot of the app -->
<!-- ![PokéSearch Screenshot](docs/screenshot.png) -->

## Features

- **Instant autocomplete** — all FRLG Pokémon names are cached on load for sub-100ms filtering
- **Official artwork** — high-resolution sprites from the PokéAPI official-artwork collection, with FireRed/LeafGreen GBA sprites when available
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

| Command              | Description                                |
| -------------------- | ------------------------------------------ |
| `npm run dev`        | Start development server                   |
| `npm run build`      | Create production build                    |
| `npm start`          | Start production server                    |
| `npm run lint`       | Run ESLint                                 |
| `npm run format`     | Format code with Prettier                  |
| `npm run format:check` | Check formatting (used in CI)           |

## Testing

Tests are written in Python using pytest:

```bash
# Install test dependencies
pip install -r requirements-test.txt

# Run unit tests
pytest tests/unit/ -v

# Run integration tests (hits live PokéAPI)
pytest tests/integration/ -v

# Run E2E tests (requires dev server on localhost:3000)
pytest tests/e2e/ -v
```

## Project Structure

```
simple_pokedex/
├── app/                    # Next.js App Router (pages, layout, global styles)
├── components/             # React UI components
│   ├── AbilityModal.tsx    #   Ability description popup
│   ├── PokemonCard.tsx     #   Main Pokémon display card
│   ├── SearchBar.tsx       #   Autocomplete search input
│   ├── TypeBadge.tsx       #   Type pill badge
│   └── WeaknessGrid.tsx    #   Weakness/resistance/immunity grid
├── contexts/               # React Context providers
│   └── PokemonContext.tsx  #   Pokémon list state
├── lib/                    # Data layer & business logic
│   ├── constants.ts        #   Type names, colors, API base URL
│   ├── pokeapi.ts          #   PokéAPI fetch functions & types
│   ├── typeEffectiveness.ts#   Type multiplier calculations
│   ├── frlg-pokemon.ts     #   FRLG Pokémon ID list
│   └── frlg-type-overrides.ts # Gen III type corrections
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

| Layer     | Technology        |
| --------- | ----------------- |
| Framework | Next.js 16        |
| UI        | React 19          |
| Styling   | Tailwind CSS 4    |
| Language  | TypeScript (strict) |
| Data      | PokéAPI REST      |
| Testing   | pytest + Playwright |
| CI/CD     | GitHub Actions    |
| Hosting   | Vercel            |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
