import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lab Simulasi",
  description:
    "Laboratorium simulasi interaktif sistem kabel laut untuk mengeksplorasi arsitektur ujung-ke-ujung, kapasitas optik, dan anggaran daya.",
};

const AVAILABLE_LABS = [
  {
    slug: "eksplorer-sistem",
    milestoneTag: "Tersedia (M1) | Terhubung ke Pelajaran 1.3-01",
    title: "Eksplorer Arsitektur Sistem Ujung-ke-Ujung",
    summary:
      "Inspeksi interaktif perangkat dry plant (PoP, CLS, SLTE, PFE), zona pantai (BMH), dan wet plant (Repeater EDFA, BU, ROPA) dengan perbandingan Repeatered, Open Cable, dan Repeaterless.",
    ctaLabel: "Buka Eksplorer Sistem",
  },
  {
    slug: "kapasitas-optik",
    milestoneTag: "Tersedia (M2-A) | Lab (a) Kapasitas Transmisi",
    title: "Kalkulator Kapasitas Optik (Fiber Pairs, Spektrum & Efisiensi Spektral)",
    summary:
      "Menghitung kapasitas per pasangan serat searah, total kapasitas searah, agregat dua arah penuh, serta batas okupansi slot kanal DWDM pada pita C maupun C+L.",
    ctaLabel: "Buka Kalkulator Kapasitas Optik",
  },
  {
    slug: "anggaran-daya",
    milestoneTag: "Tersedia (M2-A) | Lab (b) Redaman & OSNR ASE",
    title: "Simulator Redaman & Anggaran Daya Optik (BOL vs EOL)",
    summary:
      "Membandingkan penurunan daya serat pasif repeaterless terhadap akumulasi derau ASE (OSNR) pada sistem ber-repeater EDFA beserta peringatan batas model GSNR.",
    ctaLabel: "Buka Simulator Anggaran Daya",
  },
] as const;

const UPCOMING_M2B_LABS = [
  {
    slug: "gangguan-redundansi",
    title: "Simulator Gangguan Rute & Redundansi Topologi",
    milestone: "M2-B",
    summary:
      "Mengevaluasi ketahanan topologi Point-to-Point, Festoon, Trunk-Branch, dan Ring saat terjadi putus segmen.",
  },
  {
    slug: "linimasa-sejarah",
    title: "Linimasa Evolusi Kapasitas Kabel Laut (1850 - 2025+)",
    milestone: "M2-B",
    summary:
      "Menjelajahi lompatan kapasitas dari telegraf, kabel koaksial, satelit, hingga serat optik koheren dan SDM.",
  },
] as const;

export default function LabHubPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-sedp-ink sm:text-4xl">
          Lab Simulasi Interaktif Kabel Laut
        </h1>
        <p className="mt-3 max-w-[66ch] text-base leading-relaxed text-sedp-muted">
          Setiap laboratorium berjalan pada panel instrumen laut dalam berlatar gelap kontras tinggi
          dengan model matematis edukatif yang disederhanakan beserta tabel data sinkron untuk
          aksesibilitas penuh.
        </p>
      </header>

      <section aria-labelledby="live-labs-heading" className="space-y-4">
        <h2 id="live-labs-heading" className="font-display text-xl font-bold text-sedp-ink">
          Lab Tersedia (Milestone M1 &amp; M2-A)
        </h2>

        <div className="space-y-4">
          {AVAILABLE_LABS.map((lab) => (
            <article
              key={lab.slug}
              className="abyss-bay rounded-[10px] border border-sedp-control-border bg-sedp-canvas p-6 text-sedp-ink sm:p-7"
            >
              <p className="font-mono text-xs font-semibold text-sedp-accent">{lab.milestoneTag}</p>
              <h3 className="mt-1 font-display text-xl font-bold text-sedp-ink sm:text-2xl">
                {lab.title}
              </h3>
              <p className="mt-2 max-w-[66ch] text-sm leading-relaxed text-sedp-muted">
                {lab.summary}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/lab/${lab.slug}/`}
                  className="inline-flex min-h-[44px] items-center rounded-md bg-sedp-accent px-5 py-2.5 text-sm font-semibold text-sedp-accent-ink hover:bg-[var(--sedp-accent-hover)]"
                >
                  {lab.ctaLabel}
                </Link>
                <Link
                  href="/kurikulum/1-3-arsitektur-sistem/arsitektur-ujung-ke-ujung/"
                  className="inline-flex min-h-[44px] items-center rounded-md border border-sedp-control-border bg-sedp-surface px-4 py-2 text-sm font-semibold text-sedp-ink hover:bg-sedp-inset"
                >
                  Baca Pelajaran 1.3-01
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="upcoming-labs-heading" className="mt-10">
        <h2 id="upcoming-labs-heading" className="font-display text-xl font-bold text-sedp-ink">
          Peta Jalan Lab Berikutnya (Belum Tersedia pada M2-A)
        </h2>
        <p className="mt-1 text-sm text-sedp-muted">
          Dua simulator berikut dijadwalkan untuk tahap Milestone M2-B beserta pembaruan Hub
          Referensi dan belum memiliki rute aktif pada rilis M2-A ini.
        </p>

        <ul className="mt-4 space-y-3">
          {UPCOMING_M2B_LABS.map((lab) => (
            <li
              key={lab.slug}
              className="rounded-[10px] border border-sedp-subtle-border bg-sedp-surface p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-sedp-ink">{lab.title}</h3>
                <span className="rounded-sm border border-sedp-subtle-border bg-sedp-inset px-2.5 py-0.5 text-xs font-medium text-sedp-muted">
                  Terjadwal {lab.milestone}
                </span>
              </div>
              <p className="mt-1.5 max-w-[66ch] text-sm leading-relaxed text-sedp-muted">
                {lab.summary}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
