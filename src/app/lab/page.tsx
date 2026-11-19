import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lab Simulasi",
  description:
    "Laboratorium simulasi interaktif sistem kabel laut untuk mengeksplorasi arsitektur ujung-ke-ujung dan prinsip fisika transmisi.",
};

const UPCOMING_V1_LABS = [
  {
    slug: "kapasitas-optik",
    title: "Kalkulator Kapasitas Optik (Fiber Pairs, Spektrum & Efisiensi Spektral)",
    milestone: "M2",
    summary:
      "Menghitung kapasitas per arah, per pasangan serat, serta agregat dua arah pada pita C dan C+L.",
  },
  {
    slug: "anggaran-daya",
    title: "Simulator Redaman & Anggaran Daya Optik (BOL vs EOL)",
    milestone: "M2",
    summary:
      "Membandingkan penurunan daya eksponensial repeaterless terhadap akumulasi OSNR ASE pada sistem ber-repeater.",
  },
  {
    slug: "gangguan-redundansi",
    title: "Simulator Gangguan Rute & Redundansi Topologi",
    milestone: "M2",
    summary:
      "Mengevaluasi ketahanan topologi Point-to-Point, Festoon, Trunk-Branch, dan Ring saat terjadi putus segmen.",
  },
  {
    slug: "linimasa-sejarah",
    title: "Linimasa Evolusi Kapasitas Kabel Laut (1850 - 2025+)",
    milestone: "M2",
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
          Setiap laboratorium berjalan di panel kontras tinggi{" "}
          <span className="font-mono text-sedp-ink">.abyss-bay</span> dengan model matematis
          edukatif yang disederhanakan beserta tabel data sinkron untuk aksesibilitas penuh.
        </p>
      </header>

      <section aria-labelledby="live-labs-heading">
        <h2 id="live-labs-heading" className="font-display text-xl font-bold text-sedp-ink">
          Lab Tersedia (Milestone M1)
        </h2>

        <article className="abyss-bay mt-4 rounded-[10px] border border-sedp-control-border bg-sedp-canvas p-6 text-sedp-ink sm:p-8">
          <p className="font-mono text-xs font-semibold text-sedp-accent">
            Tersedia | Terhubung ke Pelajaran 1.3-01
          </p>
          <h3 className="mt-1 font-display text-2xl font-bold text-sedp-ink">
            Eksplorer Arsitektur Sistem Ujung-ke-Ujung
          </h3>
          <p className="mt-2 max-w-[64ch] text-sm leading-relaxed text-sedp-muted">
            Inspeksi interaktif perangkat dry plant (<span className="font-mono">PoP</span>,{" "}
            <span className="font-mono">CLS</span>, <span className="font-mono">SLTE</span>,{" "}
            <span className="font-mono">PFE</span>), zona pantai (
            <span className="font-mono">BMH</span>
            ), dan wet plant (<span className="font-mono">Repeater</span>,{" "}
            <span className="font-mono">BU</span>, <span className="font-mono">ROPA</span>) dengan
            perbandingan mode Repeatered, Open Cable, dan Repeaterless.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/lab/eksplorer-sistem/"
              className="inline-flex min-h-[44px] items-center rounded-md bg-sedp-accent px-5 py-2.5 text-sm font-semibold text-sedp-accent-ink hover:bg-[var(--sedp-accent-hover)]"
            >
              Buka Eksplorer Sistem
            </Link>
            <Link
              href="/kurikulum/1-3-arsitektur-sistem/arsitektur-ujung-ke-ujung/"
              className="inline-flex min-h-[44px] items-center rounded-md border border-sedp-control-border bg-sedp-surface px-4 py-2 text-sm font-semibold text-sedp-ink hover:bg-sedp-inset"
            >
              Baca Pelajaran 1.3-01
            </Link>
          </div>
        </article>
      </section>

      <section aria-labelledby="upcoming-labs-heading" className="mt-10">
        <h2 id="upcoming-labs-heading" className="font-display text-xl font-bold text-sedp-ink">
          Peta Jalan Lab Berikutnya (Belum Tersedia pada M1)
        </h2>
        <p className="mt-1 text-sm text-sedp-muted">
          Empat simulator V1 berikut dijadwalkan untuk tahap Milestone M2 dan belum memiliki rute
          aktif pada rilis M1 ini.
        </p>

        <ul className="mt-4 space-y-3">
          {UPCOMING_V1_LABS.map((lab) => (
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
