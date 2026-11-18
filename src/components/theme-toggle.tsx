"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  function handleToggle() {
    const nextDark = !isDark;
    setIsDark(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleToggle}
      aria-pressed={isDark}
      className="min-h-[44px] border-sedp-control-border bg-sedp-surface px-4 text-sm font-medium text-sedp-ink hover:bg-sedp-inset hover:text-sedp-ink"
    >
      {isDark ? "Tema: Abyssal Dark" : "Tema: Pelagic Light"}
    </Button>
  );
}
