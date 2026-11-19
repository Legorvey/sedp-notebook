import type { Metadata } from "next";
import Link from "next/link";
import { GlossaryExplorer } from "@/features/reference/components/glossary-explorer";
import { loadGlossary } from "@/lib/content/loader";

export const metadata: Metadata = {
  title: "Glosarium Kabel Laut",
  description:
    "Glosarium istilah teknik sistem komunikasi kabel laut dwibahasa Inggris dan Indonesia untuk PoP, CLS, BMH, SLTE, PFE, Repeater, ROPA, dan BU.",
};

export default function GlossaryPage() {
  const glossary = loadGlossary();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-sedp-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-sedp-accent hover:underline">
              Beranda
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/referensi/" className="hover:text-sedp-accent hover:underline">
              Referensi
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-semibold text-sedp-ink">Glosarium</li>
        </ol>
      </nav>

      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-sedp-ink sm:text-4xl">
          Glosarium Istilah Sistem Kabel Laut
        </h1>
        <p className="mt-3 max-w-[66ch] text-base leading-relaxed text-sedp-muted">
          Daftar {glossary.length} istilah inti arsitektur ujung-ke-ujung yang telah melalui audit
          sumber standar publik ITU-T dan literatur rujukan.
        </p>
      </header>

      <GlossaryExplorer entries={glossary} />
    </div>
  );
}
