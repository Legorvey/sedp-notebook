import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import { M0PocIsland } from "@/components/m0-poc-island";
import { compileMdxContent } from "@/lib/content/mdx";

export const metadata: Metadata = {
  title: "Uji Kelayakan Teknis M0 (CSP & MDX)",
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
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <article className="rounded-[10px] border border-sedp-subtle-border bg-sedp-surface p-4 sm:p-8">
        <h1 className="font-display text-2xl font-bold leading-tight text-sedp-ink sm:text-3xl">
          Bukti Konsep Deployment M0: Ekspor Statis &amp; CSP
        </h1>

        <div className="mt-4 space-y-4 text-base leading-relaxed text-sedp-ink">
          <MdxSample />
        </div>

        <M0PocIsland />
      </article>
    </div>
  );
}
