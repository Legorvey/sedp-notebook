"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { resetLocalProgress, useLocalProgress } from "@/lib/storage/progress";

export function ResetProgressButton() {
  const progress = useLocalProgress();
  const [feedback, setFeedback] = useState<string | null>(null);

  const lessonCount = Object.keys(progress.lessons).length;
  const quizCount = Object.keys(progress.quizzes).length;
  const hasData = lessonCount > 0 || quizCount > 0;

  function handleReset() {
    const res = resetLocalProgress();
    if (res.storageAvailable) {
      setFeedback("Seluruh progres belajar dan skor latihan lokal telah dihapus.");
    } else {
      setFeedback("Progres sesi aktif telah dibersihkan (penyimpanan lokal peramban tidak aktif).");
    }
  }

  return (
    <div className="rounded-[10px] border border-sedp-subtle-border bg-sedp-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-sedp-ink">Riwayat Progres Lokal Peramban</p>
          <p className="mt-1 text-xs leading-relaxed text-sedp-muted">
            {hasData
              ? `Tersimpan secara lokal: ${lessonCount} status pelajaran dan ${quizCount} riwayat latihan.`
              : "Belum ada riwayat latihan tersimpan di peramban ini. Pilih paket latihan untuk mulai."}
          </p>
        </div>

        <Button type="button" variant="outline" disabled={!hasData} onClick={handleReset}>
          Reset Progres Lokal
        </Button>
      </div>

      {feedback && (
        <p aria-live="polite" className="mt-3 text-xs font-medium text-sedp-verified">
          {feedback}
        </p>
      )}
    </div>
  );
}
