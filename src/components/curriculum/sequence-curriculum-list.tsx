"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import type { ModuleManifest } from "@/lib/content/schemas";
import { cn } from "@/lib/utils";

type SequenceMode = "modul" | "hari";

const sequenceListeners = new Set<() => void>();

function subscribeSequence(listener: () => void) {
  sequenceListeners.add(listener);
  if (typeof window === "undefined") {
    return () => {
      sequenceListeners.delete(listener);
    };
  }
  window.addEventListener("popstate", listener);
  return () => {
    sequenceListeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
}

function getSequenceSnapshot(): SequenceMode {
  if (typeof window === "undefined") {
    return "modul";
  }
  const params = new URLSearchParams(window.location.search);
  return params.get("urut") === "hari" ? "hari" : "modul";
}

function getServerSequenceSnapshot(): SequenceMode {
  return "modul";
}

interface LessonSummary {
  lessonId: string;
  title: string;
  moduleCode: string;
  href: string;
  teachingWindow: string;
}

interface SequenceCurriculumListProps {
  modules: readonly ModuleManifest[];
  lessons: readonly LessonSummary[];
}

export function SequenceCurriculumList({ modules, lessons }: SequenceCurriculumListProps) {
  const sequenceMode = useSyncExternalStore(
    subscribeSequence,
    getSequenceSnapshot,
    getServerSequenceSnapshot
  );

  function handleSelectMode(next: SequenceMode) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("urut", next);
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    } catch {
      // Ignore history mutation errors in restricted environments.
    }
    for (const listener of sequenceListeners) {
      listener();
    }
  }

  const orderedModules = [...modules].sort((a, b) =>
    sequenceMode === "modul"
      ? a.canonical_order - b.canonical_order
      : a.delivery_order - b.delivery_order
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[10px] border border-sedp-subtle-border bg-sedp-surface p-4 sm:p-5">
        <div>
          <p className="text-sm font-semibold text-sedp-ink">Pilih Urutan Tampilan Kurikulum</p>
          <p className="mt-1 text-xs leading-relaxed text-sedp-muted">
            {sequenceMode === "modul"
              ? "Urutan Modul mengikuti penomoran kanonik 1.1 hingga 1.5."
              : "Urutan Hari mengikuti kronologi penyampaian sesi (Hari 3 membahas Modul 1.5 sebelum Modul 1.4)."}
          </p>
        </div>

        <div
          role="group"
          aria-label="Urutan jalur belajar"
          className="flex flex-wrap items-center gap-2"
        >
          <Button
            type="button"
            variant={sequenceMode === "modul" ? "default" : "outline"}
            aria-pressed={sequenceMode === "modul"}
            onClick={() => handleSelectMode("modul")}
          >
            Urutan Modul (1.1 - 1.5)
          </Button>
          <Button
            type="button"
            variant={sequenceMode === "hari" ? "default" : "outline"}
            aria-pressed={sequenceMode === "hari"}
            onClick={() => handleSelectMode("hari")}
          >
            Urutan Hari (Hari 1 - 3)
          </Button>
        </div>
      </div>

      <ol className="space-y-4">
        {orderedModules.map((mod) => {
          const modLessons = lessons.filter((item) => item.moduleCode === mod.module_code);
          const statusStyle =
            mod.coverage_status === "UNAVAILABLE"
              ? "border-sedp-fault text-sedp-fault"
              : mod.coverage_status === "PARTIAL"
                ? "border-sedp-partial text-sedp-partial"
                : modLessons.length > 0
                  ? "border-sedp-verified text-sedp-verified"
                  : "border-sedp-control-border text-sedp-muted";

          return (
            <li
              key={mod.module_code}
              className="rounded-[10px] border border-sedp-subtle-border bg-sedp-surface p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-semibold text-sedp-accent">
                    Modul {mod.module_code} | {mod.teaching_window_id}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-bold text-sedp-ink">
                    {mod.title_id}
                  </h2>
                </div>

                <span
                  className={cn(
                    "inline-flex items-center rounded-sm border bg-sedp-inset px-2.5 py-1 text-xs font-semibold",
                    statusStyle
                  )}
                >
                  {mod.availability_badge_id}
                </span>
              </div>

              <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-sedp-muted">
                {mod.summary_id}
              </p>

              {mod.unavailable_reason_id && (
                <p className="mt-3 rounded-md bg-sedp-inset p-3 text-xs leading-relaxed text-sedp-ink">
                  {mod.unavailable_reason_id}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href={`/kurikulum/${mod.module_slug}/`}
                  className="inline-flex min-h-[44px] items-center rounded-md border border-sedp-control-border bg-sedp-canvas px-4 py-2 text-sm font-medium text-sedp-ink hover:bg-sedp-inset"
                >
                  Lihat Ringkasan Modul {mod.module_code}
                </Link>

                {modLessons.map((lesson) => (
                  <Link
                    key={lesson.lessonId}
                    href={lesson.href}
                    className="inline-flex min-h-[44px] items-center rounded-md bg-sedp-accent px-4 py-2 text-sm font-semibold text-sedp-accent-ink hover:bg-[var(--sedp-accent-hover)]"
                  >
                    Buka Pelajaran {lesson.lessonId}
                  </Link>
                ))}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
