"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePokemonList } from "@/contexts/PokemonContext";

interface SearchBarProps {
  onSelect: (name: string) => void;
}

export default function SearchBar({ onSelect }: SearchBarProps) {
  const { allPokemon, loading, error } = usePokemonList();
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<{ name: string; id: number }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filter = useCallback(
    (q: string) => {
      if (!q.trim()) {
        setFiltered([]);
        return;
      }
      const lower = q.toLowerCase();
      const results = allPokemon
        .filter((p) => p.name.includes(lower))
        .map((p) => ({ name: p.name, id: p.id }))
        .slice(0, 20);
      setFiltered(results);
    },
    [allPokemon]
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    filter(val);
    setIsOpen(true);
    setHighlightIndex(-1);
  }

  function handleSelect(name: string) {
    setQuery(name);
    setIsOpen(false);
    setFiltered([]);
    onSelect(name);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(filtered[highlightIndex].name);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-lg mx-auto">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => filtered.length > 0 && setIsOpen(true)}
        placeholder={
          error
            ? "Failed to load Pokémon list"
            : loading
              ? "Loading Pokémon…"
              : "Search Pokémon…"
        }
        disabled={loading || !!error}
        className={`w-full rounded-xl border px-4 py-3 text-foreground placeholder:text-muted outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/10 disabled:opacity-50 ${
          error
            ? "border-red-500/40 bg-red-500/5"
            : "border-white/20 bg-surface-dark"
        }`}
      />
      {error && (
        <p className="mt-2 text-center text-sm text-red-400">{error}</p>
      )}
      {isOpen && filtered.length > 0 && (
        <ul className="absolute left-0 right-0 z-40 mt-1 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-surface-dark shadow-xl">
          {filtered.map((p, i) => (
            <li key={p.name}>
              <button
                type="button"
                onClick={() => handleSelect(p.name)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm capitalize transition ${
                  i === highlightIndex
                    ? "bg-white/10 text-foreground"
                    : "text-foreground/70 hover:bg-white/5"
                }`}
              >
                <span className="font-mono text-xs text-muted">
                  #{String(p.id).padStart(3, "0")}
                </span>
                <span>{p.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
