"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  filterGlossaryEntries,
  getGlossaryCategoryLabel,
  GLOSSARY_CATEGORY_LABELS,
} from "@/features/reference/glossary-filter";
import type { GlossaryEntry } from "@/lib/content/schemas";

interface GlossaryExplorerProps {
  entries: readonly GlossaryEntry[];
}

export function GlossaryExplorer({ entries }: GlossaryExplorerProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const categories = ["all", ...Object.keys(GLOSSARY_CATEGORY_LABELS)];
  const filtered = filterGlossaryEntries(entries, query, selectedCategory);

  function handleClearFilters() {
    setQuery("");
    setSelectedCategory("all");
    searchInputRef.current?.focus();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[10px] border border-sedp-subtle-border bg-sedp-surface p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-12 md:items-end">
          <div className="md:col-span-6">
            <label htmlFor="glossary-search" className="block text-sm font-semibold text-sedp-ink">
              Cari istilah Inggris atau Indonesia
            </label>
            <input
              ref={searchInputRef}
              id="glossary-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Contoh: BMH, repeater, stasiun pendaratan..."
              className="mt-2 min-h-[44px] w-full rounded-md border border-sedp-control-border bg-sedp-canvas px-3.5 py-2 text-sm text-sedp-ink placeholder:text-sedp-muted"
            />
          </div>

          <div className="md:col-span-6">
            <p className="text-sm font-semibold text-sedp-ink">Filter kategori sistem</p>
            <div
              role="group"
              aria-label="Filter kategori glosarium"
              className="mt-2 flex flex-wrap gap-2"
            >
              {categories.map((cat) => {
                const active = selectedCategory === cat;
                const label = cat === "all" ? "Semua Kategori" : getGlossaryCategoryLabel(cat);
                return (
                  <Button
                    key={cat}
                    type="button"
                    variant={active ? "default" : "outline"}
                    aria-pressed={active}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        <p aria-live="polite" className="mt-3 text-xs text-sedp-muted">
          Menampilkan {filtered.length} dari {entries.length} istilah terverifikasi.
        </p>
      </div>

      {filtered.length === 0 ? (
        <div
          role="status"
          className="rounded-[10px] border border-sedp-control-border bg-sedp-surface p-6 text-sm text-sedp-ink"
        >
          <p className="font-semibold">
            {entries.length === 0 ? "Glosarium belum memiliki entri" : "Istilah tidak ditemukan"}
          </p>
          <p className="mt-1 leading-relaxed text-sedp-muted">
            {entries.length === 0
              ? "Belum ada istilah terverifikasi yang dimuat pada indeks glosarium ini."
              : `Tidak ada istilah cocok untuk "${query || getGlossaryCategoryLabel(selectedCategory)}". Coba ejaan Inggris/Indonesia (mis. 'repeater' atau 'stasiun pendaratan') atau hapus filter.`}
          </p>
          {entries.length > 0 && (
            <div className="mt-4">
              <Button type="button" variant="outline" onClick={handleClearFilters}>
                Hapus Filter
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((entry) => (
            <article
              key={entry.glossary_id}
              id={entry.glossary_id}
              className="rounded-[10px] border border-sedp-subtle-border bg-sedp-surface p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-sedp-subtle-border pb-3">
                <div>
                  <h2 className="font-display text-xl font-bold text-sedp-ink">
                    {entry.abbr ? `${entry.abbr}: ` : ""}
                    {entry.term_en}
                  </h2>
                  <p className="mt-0.5 text-sm font-medium text-sedp-accent">{entry.term_id}</p>
                </div>
                <span className="rounded-sm border border-sedp-subtle-border bg-sedp-inset px-2.5 py-1 text-xs font-medium text-sedp-ink">
                  {getGlossaryCategoryLabel(entry.category)}
                </span>
              </div>

              <p className="mt-3 max-w-[68ch] text-base leading-relaxed text-sedp-ink">
                {entry.definition_id}
              </p>

              {entry.engineering_note_id && (
                <p className="mt-3 max-w-[68ch] rounded-md bg-sedp-inset p-3.5 text-sm leading-relaxed text-sedp-ink">
                  <strong>Catatan teknis:</strong> {entry.engineering_note_id}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-sedp-muted">
                <Link
                  href="/kurikulum/1-3-arsitektur-sistem/arsitektur-ujung-ke-ujung/"
                  className="inline-flex min-h-[44px] items-center font-semibold text-sedp-accent underline underline-offset-4"
                >
                  Pelajari di Pelajaran 1.3-01
                </Link>
                <span>
                  Rujukan: {entry.source_refs.map((ref) => ref.source_id.toUpperCase()).join(", ")}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
