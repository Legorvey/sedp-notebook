"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function M0PocIsland() {
  const [stepCount, setStepCount] = useState(0);

  return (
    <section
      aria-labelledby="poc-island-heading"
      className="abyss-bay mt-6 rounded-[10px] border border-sedp-control-border bg-sedp-canvas p-4 text-sedp-ink sm:p-6"
    >
      <h2 id="poc-island-heading" className="text-base font-semibold text-sedp-accent">
        PoC Hidrasi Pulau Klien &amp; Primitif Tombol (M0)
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-sedp-muted">
        Komponen ini menguji hidrasi React 19 di bawah kebijakan ekspor statis dan header CSP
        terkunci tanpa eksekusi skrip tak terotorisasi.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={() => setStepCount((prev) => prev + 1)}
          data-testid="poc-increment-btn"
        >
          Uji Interaksi Hidrasi ({stepCount})
        </Button>

        <Button type="button" variant="outline" onClick={() => setStepCount(0)}>
          Atur Ulang Penghitung
        </Button>

        <Button type="button" variant="outline" disabled>
          Status Nonaktif (Disabled)
        </Button>

        <Button type="button" variant="destructive" aria-disabled="true">
          Aksi Terkunci (Aria-Disabled)
        </Button>
      </div>

      <p
        className="mt-3 font-mono text-sm text-sedp-ink"
        aria-live="polite"
        data-testid="poc-live-count"
      >
        Status hitung aktif: {stepCount}
      </p>
    </section>
  );
}
