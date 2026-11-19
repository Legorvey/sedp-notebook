import type { Metadata } from "next";
import Link from "next/link";
import { FactCheckTable } from "@/components/about/fact-check-table";
import { loadFactChecks, loadPublicSources } from "@/lib/content/loader";

export const metadata: Metadata = {
  title: "Log Verifikasi Fakta",
  description:
    "Catatan terbuka status verifikasi angka statistik, tanggal RFS kabel, dan batas kedalaman pelindung kabel terhadap sumber primer publik.",
};

export default function FactCheckLogPage() {
  const records = loadFactChecks();
  const sources = loadPublicSources();

  const verifiedCount = records.filter((item) => item.fact_check_status === "VERIFIED").length;
  const disputedCount = records.filter((item) => item.fact_check_status === "DISPUTED").length;
  const unverifiedCount = records.filter((item) => item.fact_check_status === "UNVERIFIED").length;
  const retractedCount = records.filter((item) => item.fact_check_status === "RETRACTED").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-sedp-muted">
        <ol className="flex flex-wrap items-center gap-2">
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
          Setiap klaim numerik, statistik gangguan, dan tanggal operasi komersial (RFS) pada SEDP
          Learning Hub diaudit langsung terhadap sumber primer publik (ITU-T, ICPC, TeleGeography,
          Kemenkeu KPBU, Kominfo/IndonesiaBaik, APJII, dan rilis resmi operator). Kami tidak pernah
          memaksakan klaim yang memiliki perbedaan cakupan atau belum memiliki dokumen primer
          menjadi status terverifikasi.
        </p>

        <dl
          aria-label="Ringkasan status verifikasi fakta"
          className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="rounded-[10px] border border-sedp-subtle-border bg-sedp-surface p-4">
            <dt className="text-xs font-semibold text-sedp-verified">Terverifikasi</dt>
            <dd className="mt-1 font-mono text-2xl font-bold text-sedp-ink">{verifiedCount}</dd>
            <p className="mt-1 text-xs text-sedp-muted">
              Didukung langsung oleh dokumen primer publik beserta satuan, tahun, dan penyebutnya.
            </p>
          </div>
          <div className="rounded-[10px] border border-sedp-subtle-border bg-sedp-surface p-4">
            <dt className="text-xs font-semibold text-sedp-fault">Diperdebatkan</dt>
            <dd className="mt-1 font-mono text-2xl font-bold text-sedp-ink">{disputedCount}</dd>
            <p className="mt-1 text-xs text-sedp-muted">
              Sumber primer menunjukkan perbedaan edisi, jadwal RFS, atau sub-klaim komersial
              tertutup.
            </p>
          </div>
          <div className="rounded-[10px] border border-sedp-subtle-border bg-sedp-surface p-4">
            <dt className="text-xs font-semibold text-sedp-partial">Belum Diverifikasi</dt>
            <dd className="mt-1 font-mono text-2xl font-bold text-sedp-ink">{unverifiedCount}</dd>
            <p className="mt-1 text-xs text-sedp-muted">
              Angka spesifik proyek ditahan atau diajarkan secara kualitatif karena ketiadaan
              standar tunggal.
            </p>
          </div>
          <div className="rounded-[10px] border border-sedp-subtle-border bg-sedp-surface p-4">
            <dt className="text-xs font-semibold text-sedp-muted">Ditarik</dt>
            <dd className="mt-1 font-mono text-2xl font-bold text-sedp-ink">{retractedCount}</dd>
            <p className="mt-1 text-xs text-sedp-muted">
              Klaim yang terbukti keliru dan dilarang digunakan pada seluruh pelajaran maupun
              simulator.
            </p>
          </div>
        </dl>
      </header>

      <FactCheckTable records={records} sources={sources} />
    </div>
  );
}
