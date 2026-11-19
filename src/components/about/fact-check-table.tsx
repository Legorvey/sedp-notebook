"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { FactCheckRecord, PublicSource } from "@/lib/content/schemas";
import { cn } from "@/lib/utils";

interface FactCheckTableProps {
  records: readonly FactCheckRecord[];
  sources?: readonly PublicSource[];
}

type StatusFilter = "ALL" | "VERIFIED" | "UNVERIFIED" | "DISPUTED" | "RETRACTED";

const FILTER_OPTIONS: readonly { id: StatusFilter; label: string }[] = [
  { id: "ALL", label: "Semua Status" },
  { id: "VERIFIED", label: "Terverifikasi" },
  { id: "UNVERIFIED", label: "Belum Diverifikasi" },
  { id: "DISPUTED", label: "Diperdebatkan" },
  { id: "RETRACTED", label: "Ditarik" },
];

function formatStatusLabel(status: FactCheckRecord["fact_check_status"]): string {
  switch (status) {
    case "VERIFIED":
      return "Terverifikasi";
    case "UNVERIFIED":
      return "Belum Diverifikasi";
    case "DISPUTED":
      return "Diperdebatkan";
    case "RETRACTED":
      return "Ditarik";
  }
}

export function FactCheckTable({ records, sources = [] }: FactCheckTableProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const allFilterButtonRef = useRef<HTMLButtonElement | null>(null);

  const sourceById = new Map(sources.map((src) => [src.source_id, src]));

  const filtered =
    statusFilter === "ALL"
      ? records
      : records.filter((item) => item.fact_check_status === statusFilter);

  const activeFilterLabel =
    FILTER_OPTIONS.find((item) => item.id === statusFilter)?.label ?? "Semua Status";

  function handleResetFilter() {
    setStatusFilter("ALL");
    window.requestAnimationFrame(() => {
      allFilterButtonRef.current?.focus();
    });
  }

  return (
    <div className="space-y-5">
      <div
        role="group"
        aria-label="Filter status verifikasi fakta"
        className="flex flex-wrap gap-2"
      >
        {FILTER_OPTIONS.map((option) => {
          const active = statusFilter === option.id;
          return (
            <Button
              key={option.id}
              ref={option.id === "ALL" ? allFilterButtonRef : undefined}
              type="button"
              variant={active ? "default" : "outline"}
              aria-pressed={active}
              onClick={() => setStatusFilter(option.id)}
            >
              {option.label}
            </Button>
          );
        })}
      </div>

      <p aria-live="polite" className="sr-only">
        Filter {activeFilterLabel}: menampilkan {filtered.length} dari {records.length} catatan
        verifikasi fakta.
      </p>

      {filtered.length === 0 ? (
        <div
          role="status"
          className="rounded-[10px] border border-sedp-control-border bg-sedp-surface p-6 text-sm text-sedp-ink"
        >
          <p className="font-semibold">Tidak ada catatan yang cocok</p>
          <p className="mt-1 text-sedp-muted">
            Tidak ada catatan verifikasi fakta untuk filter status atau modul yang dipilih.
          </p>
          <div className="mt-4">
            <Button type="button" variant="outline" onClick={handleResetFilter}>
              Tampilkan Semua Status
            </Button>
          </div>
        </div>
      ) : (
        <div
          tabIndex={0}
          role="region"
          aria-label="Tabel log verifikasi fakta klaim publik"
          className="overflow-x-auto rounded-[10px] border border-sedp-control-border bg-sedp-surface"
        >
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <caption className="border-b border-sedp-subtle-border bg-sedp-inset px-4 py-3 text-left text-xs font-semibold text-sedp-ink">
              Menampilkan {filtered.length} dari {records.length} catatan verifikasi fakta
            </caption>
            <thead>
              <tr className="border-b border-sedp-subtle-border bg-sedp-inset text-sedp-ink">
                <th scope="col" className="px-4 py-3 font-semibold">
                  ID &amp; Pelajaran
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Klaim yang Diaudit
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Rujukan Primer &amp; Tanggal Audit
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Catatan Verifikasi &amp; Cakupan
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const statusColor =
                  item.fact_check_status === "VERIFIED"
                    ? "text-sedp-verified border-sedp-verified"
                    : item.fact_check_status === "DISPUTED" ||
                        item.fact_check_status === "RETRACTED"
                      ? "text-sedp-fault border-sedp-fault"
                      : "text-sedp-partial border-sedp-partial";

                const primarySource = item.primary_source_id
                  ? sourceById.get(item.primary_source_id)
                  : undefined;

                return (
                  <tr
                    key={item.fact_check_id}
                    id={item.fact_check_id}
                    className="scroll-mt-24 border-b border-sedp-subtle-border last:border-b-0"
                  >
                    <th
                      scope="row"
                      className="px-4 py-3.5 align-top font-mono text-xs text-sedp-ink"
                    >
                      <div>{item.fact_check_id}</div>
                      <div className="mt-1 text-sedp-muted">Pelajaran {item.lesson_id}</div>
                    </th>
                    <td className="px-4 py-3.5 align-top text-sedp-ink">{item.claim_text_id}</td>
                    <td className="px-4 py-3.5 align-top">
                      <span
                        className={cn(
                          "inline-block rounded-sm border bg-sedp-inset px-2 py-1 text-xs font-semibold",
                          statusColor
                        )}
                      >
                        {formatStatusLabel(item.fact_check_status)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 align-top text-xs">
                      {item.primary_source_id ? (
                        <div>
                          <Link
                            href={`/tentang/sumber/#${item.primary_source_id}`}
                            className="inline-flex min-h-[44px] flex-col justify-center font-semibold text-sedp-accent underline underline-offset-4"
                          >
                            <span className="font-mono">{item.primary_source_id}</span>
                            {primarySource && (
                              <span className="mt-0.5 font-sans font-normal text-sedp-ink">
                                {primarySource.title}
                              </span>
                            )}
                          </Link>
                          <div className="mt-1 font-mono text-sedp-muted">
                            Diperiksa: {item.checked_at}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-semibold text-sedp-ink">
                            Ditahan / Tanpa Klaim Tunggal
                          </div>
                          <div className="mt-1 text-sedp-muted">
                            Belum ada rujukan primer tunggal
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 align-top leading-relaxed text-sedp-muted">
                      {item.verification_notes_id}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
