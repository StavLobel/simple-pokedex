"use client";

import type { TypeMultiplier } from "@/lib/typeEffectiveness";
import TypeBadge from "./TypeBadge";

interface WeaknessGridProps {
  weaknesses: TypeMultiplier[];
  resistances: TypeMultiplier[];
  immunities: TypeMultiplier[];
}

export default function WeaknessGrid({ weaknesses, resistances, immunities }: WeaknessGridProps) {
  return (
    <div className="min-w-0 space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">
          Weaknesses
        </h3>
        {weaknesses.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {weaknesses.map((w) => (
              <TypeBadge key={w.type} type={w.type} multiplier={w.multiplier} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">None</p>
        )}
      </div>

      {resistances.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">
            Resistances
          </h3>
          <div className="flex flex-wrap gap-2">
            {resistances.map((r) => (
              <TypeBadge key={r.type} type={r.type} multiplier={r.multiplier} />
            ))}
          </div>
        </div>
      )}

      {immunities.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">
            Immunities
          </h3>
          <div className="flex flex-wrap gap-2">
            {immunities.map((i) => (
              <TypeBadge key={i.type} type={i.type} multiplier={0} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
