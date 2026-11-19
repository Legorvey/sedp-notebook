"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

export const THEME_STORAGE_KEY = "sedp.theme";

const listeners = new Set<() => void>();

function notifyThemeListeners() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribeTheme(listener: () => void) {
  listeners.add(listener);

  if (typeof window === "undefined") {
    return () => {
      listeners.delete(listener);
    };
  }

  const observer = new MutationObserver(() => {
    listener();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  function onStorage(event: StorageEvent) {
    if (event.key === THEME_STORAGE_KEY || event.key === null) {
      const nextDark = event.newValue === "dark";
      document.documentElement.classList.toggle("dark", nextDark);
      listener();
    }
  }

  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    observer.disconnect();
    window.removeEventListener("storage", onStorage);
  };
}

function getThemeSnapshot(): boolean {
  if (typeof document === "undefined") {
    return false;
  }
  return document.documentElement.classList.contains("dark");
}

function getServerThemeSnapshot(): boolean {
  return false;
}

export function applyThemePreference(nextDark: boolean) {
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", nextDark);
  }
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextDark ? "dark" : "light");
  } catch {
    // Graceful no-op when browser storage is restricted or unavailable.
  }
  notifyThemeListeners();
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);

  function handleToggle() {
    applyThemePreference(!isDark);
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleToggle}
      aria-pressed={isDark}
      className="gap-2 bg-sedp-surface text-sedp-ink hover:bg-sedp-inset hover:text-sedp-ink"
    >
      <span>Mode Abyssal Dark</span>
      <span className="rounded-sm bg-sedp-inset px-1.5 py-0.5 font-mono text-xs text-sedp-ink">
        {isDark ? "Aktif" : "Nonaktif"}
      </span>
    </Button>
  );
}
