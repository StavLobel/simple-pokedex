import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Simple Pokédex",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href="/"
        className="mb-8 inline-block text-sm text-muted underline hover:text-foreground"
      >
        &larr; Back to Simple Pokédex
      </Link>

      <h1 className="mb-6 text-3xl font-bold text-foreground">Privacy Policy</h1>

      <section className="space-y-4 text-sm leading-relaxed text-muted">
        <h2 className="text-lg font-semibold text-foreground">Data Collection</h2>
        <p>
          Simple Pokédex does not collect, store, or process any personal data. No accounts,
          cookies, or tracking mechanisms are used by this application.
        </p>

        <h2 className="text-lg font-semibold text-foreground">Third-Party Services</h2>
        <p>This application relies on the following third-party services:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            <strong>PokéAPI</strong> (
            <a
              href="https://pokeapi.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              pokeapi.co
            </a>
            ) — Pokémon data is fetched from this public REST API. PokéAPI has its own privacy
            practices; please refer to their site for details.
          </li>
          <li>
            <strong>Vercel</strong> (
            <a
              href="https://vercel.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              vercel.com
            </a>
            ) — The application is hosted on Vercel. Vercel may collect standard server logs (IP
            addresses, request timestamps). See{" "}
            <a
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Vercel&apos;s Privacy Policy
            </a>{" "}
            for more information.
          </li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">Analytics &amp; Cookies</h2>
        <p>
          Simple Pokédex does not use analytics services or set cookies. Should this change in the
          future, this policy will be updated accordingly.
        </p>

        <h2 className="text-lg font-semibold text-foreground">Contact</h2>
        <p>
          For privacy-related inquiries, please open an issue on the project&apos;s{" "}
          <a
            href="https://github.com/StavLobel/simple_pokedex"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            GitHub repository
          </a>
          .
        </p>
      </section>
    </main>
  );
}
