import type { Metadata } from "next";
import Link from "next/link";
import { FactCheckTable } from "@/components/about/fact-check-table";
import { loadFactChecks } from "@/lib/content/loader";

export const metadata: Metadata = {
  title: "Log Verifikasi Fakta",
  description:
    "Catatan terbuka status verifikasi angka statistik, tanggal RFS kabel, dan batas kedalaman pelindung kabel sebelum dipublikasikan pada pelajaran.",
};

export default function FactCheckLogPage() {
  const records = loadFactChecks();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-sedp-muted">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center px-1.5 hover:text-sedp-accent hover:underline"
            >
              Beranda
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/tentang/"
              className="inline-flex min-h-[44px] items-center px-1.5 hover:text-sedp-accent hover:underline"
            >
              Tentang
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="px-1.5 font-semibold text-sedp-ink">Verifikasi Fakta</li>
        </ol>
      </nav>

      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-sedp-ink sm:text-4xl">
          Log Verifikasi Fakta &amp; Klaim Terbuka
        </h1>
        <p className="mt-3 max-w-[68ch] text-base leading-relaxed text-sedp-muted">
          Daftar berikut mencatat klaim numerik atau tanggal historis yang belum boleh dikutip
          sebagai fakta tetap sebelum pemeriksaan sumber primer selesai pada tahap M4a. Pada
          Pelajaran 1.3-01, klaim batas kedalaman meter (
          <span className="font-mono">fc-armour-depths</span>) sengaja ditahan dan digantikan
          pendekatan kualitatif.
        </p>
      </header>

      <FactCheckTable records={records} />
    </div>
  );
}
