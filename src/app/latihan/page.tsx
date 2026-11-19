import type { Metadata } from "next";
import Link from "next/link";
import { ResetProgressButton } from "@/components/about/reset-progress-button";
import { loadLessons, loadQuizzes } from "@/lib/content/loader";

export const metadata: Metadata = {
  title: "Latihan Soal",
  description:
    "Bank latihan soal orisinal untuk menguji pemahaman arsitektur sistem kabel laut dengan umpan balik diagnostik dan tautan balik ke materi.",
};

export default function PracticeIndexPage() {
  const quizzes = loadQuizzes();
  const lessons = loadLessons();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-sedp-ink sm:text-4xl">
          Latihan &amp; Uji Pemahaman
        </h1>
        <p className="mt-3 max-w-[66ch] text-base leading-relaxed text-sedp-muted">
          Semua soal disusun secara orisinal tanpa akun wajib. Skor disimpan secara opsional di
          peramban lokal Anda saja dan dapat dihapus kapan saja.
        </p>
      </header>

      <section aria-label="Ringkasan progres lokal" className="mb-8">
        <ResetProgressButton />
      </section>

      <section aria-labelledby="quiz-list-heading" className="space-y-4">
        <h2 id="quiz-list-heading" className="font-display text-xl font-bold text-sedp-ink">
          Paket Latihan Tersedia
        </h2>

        {quizzes.map((quiz) => {
          const linkedLesson = lessons.find(
            (lesson) => lesson.frontmatter.lesson_id === quiz.lesson_id
          );

          return (
            <article
              key={quiz.quiz_id}
              className="rounded-[10px] border border-sedp-control-border bg-sedp-surface p-6"
            >
              <p className="font-mono text-xs font-semibold text-sedp-accent">
                Paket {quiz.quiz_id} | {quiz.questions.length} Soal Pilihan Ganda
              </p>
              <h3 className="mt-1 font-display text-xl font-bold text-sedp-ink">{quiz.title_id}</h3>
              {linkedLesson && (
                <p className="mt-2 text-sm text-sedp-muted">
                  Terkait pelajaran:{" "}
                  <Link
                    href={linkedLesson.href}
                    className="font-medium text-sedp-accent underline underline-offset-4"
                  >
                    {linkedLesson.frontmatter.lesson_id}: {linkedLesson.frontmatter.title}
                  </Link>
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/latihan/${quiz.quiz_id}/`}
                  className="inline-flex min-h-[44px] items-center rounded-md bg-sedp-accent px-5 py-2.5 text-sm font-semibold text-sedp-accent-ink hover:bg-[var(--sedp-accent-hover)]"
                >
                  Mulai Latihan ({quiz.questions.length} Soal)
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
