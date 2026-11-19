import type { Metadata } from "next";
import { SequenceCurriculumList } from "@/components/curriculum/sequence-curriculum-list";
import { loadLessons, loadModules } from "@/lib/content/loader";

export const metadata: Metadata = {
  title: "Daftar Kurikulum",
  description:
    "Daftar modul dan pelajaran sistem kabel laut dengan pilihan Urutan Modul (1.1-1.5) dan Urutan Hari (Hari 1-3).",
};

export default function CurriculumIndexPage() {
  const modules = loadModules();
  const lessons = loadLessons().map((item) => ({
    lessonId: item.frontmatter.lesson_id,
    title: item.frontmatter.title,
    moduleCode: item.frontmatter.module_code,
    href: item.href,
    teachingWindow: item.frontmatter.teaching_window,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-sedp-ink sm:text-4xl">
          Daftar Kurikulum Sistem Kabel Laut
        </h1>
        <p className="mt-3 max-w-[66ch] text-base leading-relaxed text-sedp-muted">
          Telusuri seluruh modul pembelajaran berdasarkan penomoran kanonik atau urutan hari
          penyampaian. Pelajaran yang belum memiliki verifikasi sumber publik penuh ditandai secara
          terbuka.
        </p>
      </header>

      <SequenceCurriculumList modules={modules} lessons={lessons} />
    </div>
  );
}
