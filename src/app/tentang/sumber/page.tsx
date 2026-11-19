import type { Metadata } from "next";
import Link from "next/link";
import { loadModules, loadPublicSources } from "@/lib/content/loader";

export const metadata: Metadata = {
  title: "Daftar Sumber Publik Terverifikasi",
  description:
    "Registri sumber rujukan publik standar ITU-T, literatur teknis, dan regulasi Indonesia yang digunakan pada materi SEDP Learning Hub.",
};

export default function SourcesPage() {
  const sources = loadPublicSources();
  const modules = loadModules();
  const gatedModules = modules.filter((m) => m.coverage_status !== "COVERED_IN_SOURCE");

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
          <li className="px-1.5 font-semibold text-sedp-ink">Sumber Publik</li>
        </ol>
      </nav>

      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-sedp-ink sm:text-4xl">
          Daftar Sumber Publik Terverifikasi
        </h1>
        <p className="mt-3 max-w-[66ch] text-base leading-relaxed text-sedp-muted">
          Halaman ini hanya mencantumkan standar publik, buku rujukan, dan regulasi yang telah
          diperiksa serta memenuhi syarat sitasi bibliografis dan sintesis konsep orisinal. Akses
          publik terhadap suatu standar tidak berarti izin untuk mendistribusikan ulang naskah atau
          gambar aslinya.
        </p>
      </header>

      <div
        tabIndex={0}
        role="region"
        aria-label="Tabel daftar sumber publik terverifikasi"
        className="overflow-x-auto rounded-[10px] border border-sedp-control-border bg-sedp-surface"
      >
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <caption className="border-b border-sedp-subtle-border bg-sedp-inset px-4 py-3 text-left text-xs font-semibold text-sedp-ink">
            {sources.length} sumber publik berstatus CLEARED dalam registri rujukan terverifikasi
          </caption>
          <thead>
            <tr className="border-b border-sedp-subtle-border bg-sedp-inset text-sedp-ink">
              <th scope="col" className="px-4 py-3 font-semibold">
                Kode &amp; Jenis
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Judul Rujukan &amp; Pemegang Hak
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Cakupan Izin
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Diperiksa
              </th>
            </tr>
          </thead>
          <tbody>
            {sources.map((src) => (
              <tr
                key={src.source_id}
                id={src.source_id}
                className="scroll-mt-24 border-b border-sedp-subtle-border last:border-b-0"
              >
                <th scope="row" className="px-4 py-4 align-top font-mono text-xs text-sedp-ink">
                  <div className="font-semibold text-sedp-accent">{src.source_id}</div>
                  <div className="mt-1 text-sedp-muted">{src.source_type}</div>
                </th>
                <td className="px-4 py-4 align-top">
                  <p className="font-semibold text-sedp-ink">{src.title}</p>
                  <p className="mt-1 text-xs text-sedp-muted">{src.ownership}</p>
                  <p className="mt-1 text-xs text-sedp-ink">{src.attribution}</p>
                  <p className="mt-2">
                    <a
                      href={src.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center gap-1 text-xs font-semibold text-sedp-accent underline underline-offset-4"
                    >
                      <span>Buka Tautan Rujukan Resmi</span>
                      <span aria-hidden="true">↗</span>
                      <span className="sr-only">(buka di tab baru)</span>
                    </a>
                  </p>
                </td>
                <td className="px-4 py-4 align-top text-xs leading-relaxed text-sedp-muted">
                  <span className="inline-block rounded-sm border border-sedp-verified bg-sedp-inset px-2 py-0.5 font-semibold text-sedp-verified">
                    Sitasi &amp; Sintesis Konsep
                  </span>
                  <p className="mt-1.5">{src.license}</p>
                </td>
                <td className="px-4 py-4 align-top font-mono text-xs text-sedp-ink">
                  {src.checked_at}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section aria-labelledby="missing-sources-heading" className="mt-10 space-y-3">
        <h2 id="missing-sources-heading" className="font-display text-xl font-bold text-sedp-ink">
          Status Modul yang Masih Tertahan Audit Sumber
        </h2>
        <p className="text-sm text-sedp-muted">
          Sesuai kebijakan transparansi kami, modul berikut belum diterbitkan hingga sumber primer
          lengkap tersedia untuk diaudit.
        </p>

        <ul className="space-y-3">
          {gatedModules.map((mod) => (
            <li
              key={mod.module_code}
              className="rounded-md border border-sedp-subtle-border bg-sedp-surface p-4 text-sm"
            >
              <p className="font-semibold text-sedp-ink">
                Modul {mod.module_code}: {mod.title_id} ({mod.availability_badge_id})
              </p>
              {mod.unavailable_reason_id && (
                <p className="mt-1 text-sedp-muted">{mod.unavailable_reason_id}</p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
