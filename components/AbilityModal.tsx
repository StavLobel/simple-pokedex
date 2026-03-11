"use client";

import { useEffect, useRef } from "react";

interface AbilityModalProps {
  abilityName: string;
  description: string;
  onClose: () => void;
}

export default function AbilityModal({
  abilityName,
  description,
  onClose,
}: AbilityModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${abilityName} ability details`}
    >
      <div className="relative w-full max-w-md rounded-xl bg-surface-dark p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/10 hover:text-foreground"
          aria-label="Close"
        >
          ✕
        </button>
        <h2 className="mb-3 text-xl font-bold capitalize text-foreground">
          {abilityName.replace("-", " ")}
        </h2>
        <p className="leading-relaxed text-foreground/80">{description}</p>
      </div>
    </div>
  );
}
