"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { markLessonProgress, useLocalProgress } from "@/lib/storage/progress";

interface LessonProgressControlProps {
  lessonId: string;
}

export function LessonProgressControl({ lessonId }: LessonProgressControlProps) {
  const progress = useLocalProgress();
  const [storageNote, setStorageNote] = useState<string | null>(null);
  const currentStatus = progress.lessons[lessonId];

  function handleMark(status: "STARTED" | "COMPLETED") {
    const res = markLessonProgress(lessonId, status);
    if (!res.storageAvailable) {
      setStorageNote(
        "Penyimpanan lokal peramban tidak aktif. Status belajar hanya berlaku pada sesi tab ini."
      );
    } else {
      setStorageNote(null);
    }
  }

  return (
    <div className="rounded-md border border-sedp-subtle-border bg-sedp-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-sedp-ink">Progres Lokal Pelajaran {lessonId}</p>
          <p aria-live="polite" className="mt-0.5 text-xs text-sedp-muted">
            Status saat ini:{" "}
            <span className="font-semibold text-sedp-ink">
              {currentStatus === "COMPLETED"
                ? "Selesai Dibaca"
                : currentStatus === "STARTED"
                  ? "Sedang Dipelajari"
                  : "Belum Ditandai"}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={currentStatus === "COMPLETED" ? "default" : "outline"}
            onClick={() => handleMark("COMPLETED")}
          >
            {currentStatus === "COMPLETED" ? "Sudah Selesai" : "Tandai Selesai"}
          </Button>
          {currentStatus !== "STARTED" && currentStatus !== "COMPLETED" && (
            <Button type="button" variant="outline" onClick={() => handleMark("STARTED")}>
              Tandai Sedang Dipelajari
            </Button>
          )}
        </div>
      </div>

      {storageNote && <p className="mt-2 text-xs text-sedp-partial">{storageNote}</p>}
    </div>
  );
}
