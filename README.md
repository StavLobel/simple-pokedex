# PokéSearch

A web-based Pokédex app that lets you search for Pokémon, view official artwork, explore type effectiveness, and read ability descriptions.

Built with [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com), and the [PokéAPI](https://pokeapi.co).

## Features

- **Instant autocomplete** — all 1300+ Pokémon names are cached on load for sub-100ms filtering
- **Official artwork** — high-resolution sprites from the PokéAPI official-artwork collection
- **Type effectiveness engine** — calculates weaknesses (×2, ×4), resistances (×0.5, ×0.25), and immunities (×0)
- **Ability modals** — click any ability to see its English description in a popup

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

Deploy to [Vercel](https://vercel.com) with zero configuration:

```bash
npm run build
```

Or connect the repo to Vercel for automatic deployments on every push to `main`.

## Tech Stack

| Layer     | Technology   |
| --------- | ------------ |
| Framework | Next.js 16   |
| Styling   | Tailwind CSS |
| Data      | PokéAPI REST |
| Language  | TypeScript   |
