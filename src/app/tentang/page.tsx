import type { Metadata } from "next";
import Link from "next/link";
import { ResetProgressButton } from "@/components/about/reset-progress-button";

export const metadata: Metadata = {
  title: "Tentang, Penafian & Privasi",
  description:
    "Informasi independensi proyek SEDP Learning Hub, metodologi penulisan materi, kebijakan privasi tanpa pelacak, serta tautan ke daftar sumber dan audit fakta.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-sedp-ink sm:text-4xl">
          Tentang SEDP Learning Hub
        </h1>
        <p className="mt-3 max-w-[66ch] text-base leading-relaxed text-sedp-muted">
          Catatan belajar publik independen berbahasa Indonesia mengenai rekayasa sistem komunikasi
          kabel laut, disusun agar konsep teknis yang kompleks mudah dipahami mahasiswa maupun
          praktisi telekomunikasi.
        </p>
      </header>

      <div className="space-y-8">
        <section
          id="penafian"
          aria-labelledby="disclaimer-heading"
          className="rounded-[10px] border border-sedp-control-border bg-sedp-surface p-6"
        >
          <h2 id="disclaimer-heading" className="font-display text-xl font-bold text-sedp-ink">
            Penafian Independensi dan Non-Afiliasi
          </h2>
          <p className="mt-3 max-w-[66ch] text-sm leading-relaxed text-sedp-ink">
            SEDP Learning Hub adalah proyek edukasi publik yang dikelola secara independen. Situs
            ini <strong>bukan produk resmi</strong>, tidak berafiliasi, tidak disponsori, dan tidak
            mewakili program SEDP, CONNEXUS, Telkom University, Infranexia, ASKALSI, NEC, ASN,
            SubCom, TeleGeography, maupun operator jaringan kabel laut mana pun.
          </p>
          <p className="mt-3 max-w-[66ch] text-sm leading-relaxed text-sedp-muted">
            Seluruh uraian materi dan soal latihan ditulis secara orisinal dalam bahasa Indonesia
            berdasarkan standar terbuka serta literatur rujukan publik. Kami tidak mendistribusikan
            ulang salindia internal, dokumen tertutup vendor, tangkapan layar kuliah, maupun bank
            soal ujian tertutup.
          </p>
        </section>

        <section
          id="metodologi"
          aria-labelledby="methodology-heading"
          className="rounded-[10px] border border-sedp-subtle-border bg-sedp-surface p-6"
        >
          <h2 id="methodology-heading" className="font-display text-xl font-bold text-sedp-ink">
            Metodologi Belajar &amp; Audit Tiga Gerbang
          </h2>
          <p className="mt-3 max-w-[66ch] text-sm leading-relaxed text-sedp-muted">
            Setiap pelajaran disusun melalui alur lima tahap (Intuisi Utama, Diagram Terjangkar,
            Pendalaman Teknis, Kasus Nyata Bersumber, dan Uji Pemahaman) dan harus melewati tiga
            gerbang verifikasi yang terpisah:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-sedp-ink">
            <li>
              <strong>Gerbang A (Verifikasi Fakta):</strong> Klaim angka atau status proyek ditandai
              belum terverifikasi sampai rujukan publik primer diperiksa langsung dengan tanggal
              audit eksplisit.
            </li>
            <li>
              <strong>Gerbang B (Sitasi &amp; Sintesis Orisinal):</strong> Standar publik atau buku
              teks yang dicatat pada Daftar Sumber hanya digunakan sebagai rujukan konsep dan
              bibliografi, bukan disalin teks penuhnya.
            </li>
            <li>
              <strong>Gerbang C (Hak Media):</strong> Diagram teknis pada situs ini digambar secara
              orisinal sebagai komponen vektor yang aksesibel tanpa menyalin gambar atau peta berhak
              cipta milik pihak ketiga.
            </li>
          </ul>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/tentang/sumber/"
              className="inline-flex min-h-[44px] items-center rounded-md bg-sedp-accent px-4 py-2 text-sm font-semibold text-sedp-accent-ink hover:bg-[var(--sedp-accent-hover)]"
            >
              Lihat Daftar Sumber Publik
            </Link>
            <Link
              href="/tentang/verifikasi-fakta/"
              className="inline-flex min-h-[44px] items-center rounded-md border border-sedp-control-border bg-sedp-canvas px-4 py-2 text-sm font-semibold text-sedp-ink hover:bg-sedp-inset"
            >
              Periksa Log Verifikasi Fakta
            </Link>
          </div>
        </section>

        <section
          id="privasi"
          aria-labelledby="privacy-heading"
          className="space-y-4 rounded-[10px] border border-sedp-subtle-border bg-sedp-surface p-6"
        >
          <h2 id="privacy-heading" className="font-display text-xl font-bold text-sedp-ink">
            Kebijakan Privasi &amp; Penyimpanan Lokal
          </h2>
          <p className="max-w-[66ch] text-sm leading-relaxed text-sedp-muted">
            Situs ini 100% dapat diakses secara anonim tanpa login, tanpa akun pengguna, tanpa
            cookie pelacak, dan tanpa skrip analitik pihak ketiga. Preferensi tema (
            <span className="font-mono text-sedp-ink">sedp.theme</span>) dan progres latihan lokal (
            <span className="font-mono text-sedp-ink">sedp.progress.v1</span>) hanya disimpan di{" "}
            <span className="font-mono text-sedp-ink">localStorage</span> peramban Anda sendiri.
          </p>

          <ResetProgressButton />
        </section>
      </div>
    </div>
  );
}
