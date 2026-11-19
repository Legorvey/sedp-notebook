import Link from "next/link";
import type { ReactNode } from "react";

interface LabWorkbenchShellProps {
  shortLabel: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function LabWorkbenchShell({
  shortLabel,
  title,
  description,
  children,
}: LabWorkbenchShellProps) {
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
          <li className="px-1.5 font-semibold text-sedp-ink">{shortLabel}</li>
        </ol>
      </nav>

      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-sedp-ink sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-[68ch] text-base leading-relaxed text-sedp-muted">{description}</p>
      </header>

      {children}

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
