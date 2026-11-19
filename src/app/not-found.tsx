import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <section
        aria-labelledby="not-found-heading"
        className="rounded-[10px] border border-sedp-control-border bg-sedp-surface p-6 sm:p-8"
      >
        <p className="font-mono text-xs font-semibold text-sedp-fault">
          404 | Rute Tidak Ditemukan
        </p>
        <h1
          id="not-found-heading"
          className="mt-2 font-display text-2xl font-bold text-sedp-ink sm:text-3xl"
        >
          Halaman Pelajaran atau Modul Tidak Ditemukan
        </h1>
        <p className="mt-3 max-w-[60ch] text-base leading-relaxed text-sedp-muted">
          Halaman pelajaran atau modul tidak ditemukan. Periksa alamat atau pilih modul pada Daftar
          Kurikulum.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/kurikulum/"
            className="inline-flex min-h-[44px] items-center rounded-md bg-sedp-accent px-5 py-2.5 text-sm font-semibold text-sedp-accent-ink hover:bg-[var(--sedp-accent-hover)]"
          >
            Buka Daftar Kurikulum
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center rounded-md border border-sedp-control-border bg-sedp-canvas px-5 py-2.5 text-sm font-semibold text-sedp-ink hover:bg-sedp-inset"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </section>
    </div>
  );
}
