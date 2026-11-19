import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OpticalBudgetLab } from "@/features/simulators/components/optical-budget-lab";
import { OpticalCapacityLab } from "@/features/simulators/components/optical-capacity-lab";
import { SystemExplorerLab } from "@/features/simulators/components/system-explorer-lab";

interface SimPageProps {
  params: Promise<{ simSlug: string }>;
}

interface ShippedSimSpec {
  shortLabel: string;
  title: string;
  description: string;
}

const SHIPPED_SIMS: Record<string, ShippedSimSpec> = {
  "eksplorer-sistem": {
    shortLabel: "Eksplorer Sistem",
    title: "Eksplorer Arsitektur Sistem Kabel Laut Ujung-ke-Ujung",
    description:
      "Bandingkan jalur optik dan jalur daya listrik DC PFE pada mode Repeatered, Open Cable (ITU-T G.977.1), dan Repeaterless (EDFA / ROPA).",
  },
  "kapasitas-optik": {
    shortLabel: "Kapasitas Optik",
    title: "Kalkulator Kapasitas Optik Sistem Kabel Laut",
    description:
      "Hitung kapasitas per pasangan serat (searah), total kapasitas searah, agregat dua arah, dan okupansi slot DWDM pada pita C maupun C+L.",
  },
  "anggaran-daya": {
    shortLabel: "Anggaran Daya Optik",
    title: "Simulator Redaman & Anggaran Daya Optik (BOL vs EOL)",
    description:
      "Bandingkan penurunan daya serat pasif pada sistem repeaterless terhadap akumulasi derau ASE (OSNR) pada sistem ber-repeater EDFA.",
  },
};

export function generateStaticParams() {
  return Object.keys(SHIPPED_SIMS).map((simSlug) => ({ simSlug }));
}

export async function generateMetadata({ params }: SimPageProps): Promise<Metadata> {
  const { simSlug } = await params;
  const spec = SHIPPED_SIMS[simSlug];
  if (!spec) {
    return { title: "Lab Tidak Ditemukan" };
  }
  return {
    title: spec.title,
    description: spec.description,
  };
}

export default async function SimulatorWorkbenchPage({ params }: SimPageProps) {
  const { simSlug } = await params;
  const spec = SHIPPED_SIMS[simSlug];

  if (!spec) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
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
              href="/lab/"
              className="inline-flex min-h-[44px] items-center px-1.5 hover:text-sedp-accent hover:underline"
            >
              Lab Simulasi
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="px-1.5 font-semibold text-sedp-ink">{spec.shortLabel}</li>
        </ol>
      </nav>

      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-sedp-ink sm:text-3xl">{spec.title}</h1>
        <p className="mt-2 max-w-[68ch] text-base leading-relaxed text-sedp-muted">
          {spec.description}
        </p>
      </header>

      {simSlug === "eksplorer-sistem" && <SystemExplorerLab variant="full" />}
      {simSlug === "kapasitas-optik" && <OpticalCapacityLab />}
      {simSlug === "anggaran-daya" && <OpticalBudgetLab />}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/lab/"
          className="inline-flex min-h-[44px] items-center rounded-md border border-sedp-control-border bg-sedp-surface px-4 py-2 text-sm font-semibold text-sedp-ink hover:bg-sedp-inset"
        >
          Semua Lab Simulasi
        </Link>
        <Link
          href="/kurikulum/1-3-arsitektur-sistem/arsitektur-ujung-ke-ujung/"
          className="inline-flex min-h-[44px] items-center rounded-md border border-sedp-control-border bg-sedp-surface px-4 py-2 text-sm font-semibold text-sedp-ink hover:bg-sedp-inset"
        >
          Pelajaran 1.3-01
        </Link>
        <Link
          href="/latihan/quiz-1.3-01-arch/"
          className="inline-flex min-h-[44px] items-center rounded-md bg-sedp-accent px-5 py-2.5 text-sm font-semibold text-sedp-accent-ink hover:bg-[var(--sedp-accent-hover)]"
        >
          Uji Pemahaman 1.3-01
        </Link>
      </div>
    </div>
  );
}
