import type { Metadata } from "next";
import Link from "next/link";
import "katex/dist/katex.min.css";
import { M0PocIsland } from "@/components/m0-poc-island";
import { ThemeToggle } from "@/components/theme-toggle";
import { compileMdxContent } from "@/lib/content/mdx";

export const metadata: Metadata = {
  title: "SEDP Learning Hub | Uji Kelayakan Teknis M0 (CSP & MDX)",
  description:
    "Rute verifikasi teknis Milestone M0 untuk ekspor statis, KaTeX, hidrasi React 19, dan CSP hash.",
};

const M0_POC_MDX_SOURCE = `
## Verifikasi Kompilasi MDX dan KaTeX Luring

Persamaan contoh berikut dikompilasi saat build dengan \`@mdx-js/mdx\`, \`remark-math\`, dan \`rehype-katex\` tanpa permintaan skrip atau font eksternal:

$$
B_{\\text{optik}} = P_{\\text{tx}} - S_{\\text{rx}} \\quad (\\text{dB})
$$

Semua aset CSS dan woff2 KaTeX dibundel secara lokal di bawah kebijakan \`font-src 'self'\`.
`;

export default async function M0PocPage() {
  const MdxSample = await compileMdxContent(M0_POC_MDX_SOURCE);

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
            <p className="text-sm text-sedp-muted">
              Verifikasi Teknis M0 (Static Export, MDX, KaTeX, CSP)
            </p>
          </div>
          <nav aria-label="Navigasi halaman" className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center rounded-md border border-sedp-control-border bg-sedp-surface px-4 text-sm font-medium text-sedp-ink hover:bg-sedp-inset active:translate-y-px"
            >
              Beranda Verifikasi
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6"
      >
        <article className="rounded-[10px] border border-sedp-subtle-border bg-sedp-surface p-4 sm:p-8">
          <h1 className="font-display text-2xl font-bold leading-tight text-sedp-ink sm:text-3xl">
            Bukti Konsep Deployment M0: Ekspor Statis &amp; CSP
          </h1>

          <div className="mt-4 space-y-4 text-base leading-relaxed text-sedp-ink">
            <MdxSample />
          </div>

          <M0PocIsland />
        </article>
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
