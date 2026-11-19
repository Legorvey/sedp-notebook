import type { Metadata } from "next";
import Link from "next/link";
import { loadGlossary } from "@/lib/content/loader";

export const metadata: Metadata = {
  title: "Pusat Referensi",
  description:
    "Pusat rujukan cepat istilah teknik sistem kabel laut dwibahasa Indonesia dan Inggris.",
};

export default function ReferenceHubPage() {
  const glossary = loadGlossary();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-sedp-ink sm:text-4xl">
          Pusat Referensi Teknis
        </h1>
        <p className="mt-3 max-w-[66ch] text-base leading-relaxed text-sedp-muted">
          Rujukan cepat istilah rekayasa sistem kabel laut yang seluruhnya tertaut pada standar
          publik terverifikasi.
        </p>
      </header>

      <section aria-labelledby="active-ref-heading" className="space-y-4">
        <h2 id="active-ref-heading" className="font-display text-xl font-bold text-sedp-ink">
          Rujukan Tersedia (M1)
        </h2>

        <article className="rounded-[10px] border border-sedp-control-border bg-sedp-surface p-6">
          <p className="font-mono text-xs font-semibold text-sedp-verified">
            Tersedia | {glossary.length} Istilah Inti Arsitektur
          </p>
          <h3 className="mt-1 font-display text-2xl font-bold text-sedp-ink">
            Glosarium Istilah Kabel Laut (Inggris - Indonesia)
          </h3>
          <p className="mt-2 max-w-[64ch] text-sm leading-relaxed text-sedp-muted">
            Cari definisi dan catatan rekayasa untuk PoP, CLS, BMH, SLTE, PFE, Repeater EDFA, ROPA,
            dan Branching Unit dengan pencarian alias dwibahasa.
          </p>
          <div className="mt-5">
            <Link
              href="/referensi/glosarium/"
              className="inline-flex min-h-[44px] items-center rounded-md bg-sedp-accent px-5 py-2.5 text-sm font-semibold text-sedp-accent-ink hover:bg-[var(--sedp-accent-hover)]"
            >
              Buka Glosarium ({glossary.length} Istilah)
            </Link>
          </div>
        </article>
      </section>

      <section aria-labelledby="planned-ref-heading" className="mt-10 space-y-3">
        <h2 id="planned-ref-heading" className="font-display text-xl font-bold text-sedp-ink">
          Rujukan Terjadwal Milestone M2
        </h2>
        <p className="text-sm text-sedp-muted">
          Halaman Lembar Rumus KaTeX dan Linimasa Sejarah Kabel Laut dijadwalkan pada rilis M2
          bersamaan dengan peluncuran empat simulator fisika V1.
        </p>
        <ul className="space-y-2.5">
          <li className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-sedp-subtle-border bg-sedp-surface px-4 py-3 text-sm">
            <span className="font-semibold text-sedp-ink">
              Lembar Rumus Rekayasa Kabel Laut (KaTeX, Satuan &amp; Batas Model)
            </span>
            <span className="rounded-sm bg-sedp-inset px-2 py-0.5 text-xs text-sedp-muted">
              Terjadwal M2
            </span>
          </li>
          <li className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-sedp-subtle-border bg-sedp-surface px-4 py-3 text-sm">
            <span className="font-semibold text-sedp-ink">
              Linimasa Sejarah Komunikasi Bawah Laut (1850 - 2025+)
            </span>
            <span className="rounded-sm bg-sedp-inset px-2 py-0.5 text-xs text-sedp-muted">
              Terjadwal M2
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
