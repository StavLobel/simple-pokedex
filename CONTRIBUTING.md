# Contributing to Simple Pokédex

Thanks for your interest in contributing! Here's how to get started.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork locally
3. **Install dependencies**

```bash
npm install
```

4. **Create a branch** for your change

```bash
git checkout -b feat/your-feature-name
```

5. **Run the dev server** to verify everything works

```bash
npm run dev
```

## Development Workflow

- **Code style** — Run `npm run format` before committing (uses Prettier)
- **Linting** — Run `npm run lint` and fix any warnings
- **Build** — Run `npm run build` to verify the production build succeeds

## Testing

This project uses Python (pytest) for testing:

```bash
pip install -r requirements-test.txt
pytest tests/unit/ -v          # Unit tests
pytest tests/integration/ -v   # Integration tests (hits live PokéAPI)
pytest tests/e2e/ -v           # E2E tests (requires localhost:3000)
```

## Submitting a Pull Request

1. Push your branch to your fork
2. Open a PR against `main`
3. Fill out the PR template
4. Wait for CI checks to pass
5. A maintainer will review your PR

## Conventions

- **Commits** — Use clear, descriptive commit messages
- **TypeScript** — Strict mode is enabled; avoid `any`
- **Components** — Functional components only, with typed props interfaces
- **Styling** — Tailwind CSS utility classes; no CSS modules or styled-components
