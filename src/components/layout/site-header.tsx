"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV_ITEMS, UTILITY_NAV_ITEM } from "./nav-links";

function isNavActive(pathname: string, matchPrefix: string): boolean {
  if (matchPrefix === "/") {
    return pathname === "/";
  }
  return pathname === matchPrefix || pathname.startsWith(`${matchPrefix}/`);
}

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  function handleCloseDrawer(restoreFocus = false) {
    setMenuOpen(false);
    if (restoreFocus) {
      window.requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-sedp-subtle-border bg-sedp-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <div className="min-w-0">
          <Link
            href="/"
            className="inline-flex min-h-[44px] flex-col justify-center rounded-sm py-1 text-sedp-ink hover:text-sedp-accent"
          >
            <span className="font-display text-base font-bold tracking-tight sm:text-lg">
              SEDP Learning Hub
            </span>
            <span className="hidden text-xs text-sedp-muted sm:inline lg:hidden xl:inline">
              Catatan Belajar Independen Sistem Kabel Laut
            </span>
          </Link>
        </div>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 lg:flex">
          {[...PRIMARY_NAV_ITEMS, UTILITY_NAV_ITEM].map((item) => {
            const active = isNavActive(pathname, item.matchPrefix);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-[44px] items-center whitespace-nowrap rounded-md border-b-2 px-2 py-2 text-sm font-medium transition-colors xl:px-3",
                  active
                    ? "border-sedp-accent bg-sedp-inset text-sedp-accent font-semibold"
                    : "border-transparent text-sedp-ink hover:bg-sedp-inset hover:text-sedp-accent"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          <Button
            ref={triggerRef}
            type="button"
            variant="outline"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            className="gap-2 bg-sedp-surface text-sedp-ink lg:hidden"
          >
            {menuOpen ? (
              <X className="size-4" aria-hidden="true" />
            ) : (
              <Menu className="size-4" aria-hidden="true" />
            )}
            <span>Menu</span>
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-nav-drawer"
          ref={drawerRef}
          className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-sedp-control-border bg-sedp-surface px-4 py-4 sm:px-6 lg:hidden"
        >
          <nav aria-label="Navigasi seluler" className="flex flex-col gap-2">
            {[...PRIMARY_NAV_ITEMS, UTILITY_NAV_ITEM].map((item) => {
              const active = isNavActive(pathname, item.matchPrefix);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => handleCloseDrawer(false)}
                  className={cn(
                    "flex min-h-[44px] items-center justify-between rounded-md border px-3.5 py-2.5 text-sm font-medium",
                    active
                      ? "border-sedp-accent bg-sedp-inset text-sedp-accent font-semibold"
                      : "border-sedp-subtle-border bg-sedp-canvas text-sedp-ink hover:bg-sedp-inset"
                  )}
                >
                  <span>{item.label}</span>
                  {active && <span className="text-xs font-semibold">Aktif</span>}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-sedp-subtle-border pt-3">
            <div className="sm:hidden">
              <ThemeToggle />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleCloseDrawer(true)}
              className="bg-sedp-surface text-sedp-ink"
            >
              Tutup Menu
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
