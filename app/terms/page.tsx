import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Simple Pokédex",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href="/"
        className="mb-8 inline-block text-sm text-muted underline hover:text-foreground"
      >
        &larr; Back to Simple Pokédex
      </Link>

      <h1 className="mb-6 text-3xl font-bold text-foreground">Terms of Service</h1>

      <section className="space-y-4 text-sm leading-relaxed text-muted">
        <h2 className="text-lg font-semibold text-foreground">Nature of the Service</h2>
        <p>
          Simple Pokédex is a free, fan-made, educational project. It is not a commercial product.
          The service is provided for personal, non-commercial use and is intended to help fans
          explore Pokémon data in a convenient format.
        </p>

        <h2 className="text-lg font-semibold text-foreground">Disclaimer</h2>
        <p>
          This service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
          warranties of any kind, either express or implied. We make no guarantees regarding the
          accuracy, completeness, or reliability of the information displayed. Use of the service is
          at your own risk.
        </p>

        <h2 className="text-lg font-semibold text-foreground">Acceptable Use</h2>
        <p>
          You agree not to misuse this service, including but not limited to: scraping data at
          excessive rates, attempting to disrupt the service, or using it for any unlawful purpose.
          Automated access should respect reasonable rate limits.
        </p>

        <h2 className="text-lg font-semibold text-foreground">
          Modifications &amp; Discontinuation
        </h2>
        <p>
          We reserve the right to modify, suspend, or discontinue the service at any time without
          prior notice. We are not liable for any modification, suspension, or discontinuation of
          the service.
        </p>
      </section>
    </main>
  );
}
