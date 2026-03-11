import Link from "next/link";
import { version } from "@/package.json";

export default function Footer() {
  return (
    <footer className="border-t border-surface-dark px-4 py-6 text-center text-xs text-muted">
      <p>
        Data provided by{" "}
        <a
          href="https://pokeapi.co/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          PokéAPI
        </a>
        {" · "}
        Sprites courtesy of{" "}
        <a
          href="https://github.com/PokeAPI/sprites"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          PokeAPI/sprites
        </a>
      </p>

      <p className="mx-auto mt-2 max-w-xl">
        Pokémon and all related trademarks are the property of Nintendo, Game Freak, and The Pokémon
        Company. This is an unofficial fan project and is not affiliated with, endorsed by, or
        sponsored by any of these entities.
      </p>

      <p className="mt-3">
        <Link href="/terms" className="underline hover:text-foreground">
          Terms of Service
        </Link>
        {" · "}
        <Link href="/privacy" className="underline hover:text-foreground">
          Privacy Policy
        </Link>
        {" · "}v{version}
      </p>
    </footer>
  );
}
