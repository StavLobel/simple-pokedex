"use client";

import { TYPE_COLORS, type PokemonTypeName } from "@/lib/constants";

interface TypeBadgeProps {
  type: PokemonTypeName;
  multiplier?: number;
}

function textColor(bg: string): string {
  const hex = bg.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#333" : "#fff";
}

export default function TypeBadge({ type, multiplier }: TypeBadgeProps) {
  const bg = TYPE_COLORS[type] ?? "#888";
  const color = textColor(bg);

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
      style={{ backgroundColor: bg, color }}
    >
      {type}
      {multiplier !== undefined && (
        <span className="ml-0.5 text-[10px] opacity-90">×{multiplier}</span>
      )}
    </span>
  );
}
