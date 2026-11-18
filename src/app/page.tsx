import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Lewati ke konten utama
      </a>

      <header className="border-b border-sedp-subtle-border bg-sedp-surface">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="font-display text-lg font-bold tracking-tight text-sedp-ink">
              SEDP Learning Hub
            </p>
            <p className="text-sm text-sedp-muted">Sumber belajar independen sistem kabel laut</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6"
      >
        <section
          aria-labelledby="phase-status-heading"
          className="rounded-[10px] border border-sedp-subtle-border bg-sedp-surface p-6 sm:p-8"
        >
          <h1
            id="phase-status-heading"
            className="font-display text-2xl font-bold leading-tight text-sedp-ink sm:text-3xl"
          >
            Fondasi Lingkungan Phase 0A Siap untuk Perencanaan
          </h1>
          <p className="mt-3 max-w-[68ch] text-base leading-relaxed text-sedp-muted">
            Halaman ini adalah cangkang verifikasi awal untuk memastikan kerangka kerja, token
            desain, kontras tema terang/gelap, dan jalur pengujian berjalan sebelum penyusunan
            arsitektur konten pada Phase 0B.
          </p>

          <section
            aria-labelledby="abyss-check-heading"
            className="abyss-bay mt-8 rounded-[10px] border border-sedp-control-border bg-sedp-canvas p-5 text-sedp-ink"
          >
            <h2 id="abyss-check-heading" className="text-sm font-semibold text-sedp-accent">
              Verifikasi Token Ruang Abyssal
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-sedp-muted">
              Panel simulasi dan diagram sistem kabel laut nantinya berjalan di ruang kontras tinggi
              berlatar <code className="font-mono text-sedp-ink">#081826</code> dengan aksen jalur
              optik <code className="font-mono text-sedp-accent">#35D0BA</code>.
            </p>
          </section>
        </section>
      </main>

      <footer className="border-t border-sedp-subtle-border bg-sedp-surface">
        <div className="mx-auto max-w-4xl px-4 py-5 text-sm text-sedp-muted sm:px-6">
          <p>
            SEDP Learning Hub adalah proyek edukasi publik independen dan bukan produk resmi SEDP,
            Telkom University, NEC, maupun operator komersial mana pun.
          </p>
        </div>
      </footer>
    </>
  );
}
