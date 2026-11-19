import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuizRunner } from "@/features/practice/components/quiz-runner";
import { getLessonById, getQuizById, loadQuizzes } from "@/lib/content/loader";

interface QuizPageProps {
  params: Promise<{ quizId: string }>;
}

export function generateStaticParams() {
  return loadQuizzes().map((quiz) => ({ quizId: quiz.quiz_id }));
}

export async function generateMetadata({ params }: QuizPageProps): Promise<Metadata> {
  const { quizId } = await params;
  const quiz = getQuizById(quizId);
  if (!quiz) {
    return { title: "Paket Latihan Tidak Ditemukan" };
  }
  return {
    title: quiz.title_id,
    description: `Latihan ${quiz.questions.length} soal konseptual untuk Pelajaran ${quiz.lesson_id}.`,
  };
}

export default async function QuizRunnerPage({ params }: QuizPageProps) {
  const { quizId } = await params;
  const quiz = getQuizById(quizId);

  if (!quiz) {
    notFound();
  }

  const lesson = getLessonById(quiz.lesson_id);
  const lessonHref = lesson?.href ?? "/kurikulum/1-3-arsitektur-sistem/arsitektur-ujung-ke-ujung/";
  const lessonTitle = lesson?.frontmatter.title ?? `Pelajaran ${quiz.lesson_id}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
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
              href="/latihan/"
              className="inline-flex min-h-[44px] items-center px-1.5 hover:text-sedp-accent hover:underline"
            >
              Latihan
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="px-1.5 font-semibold text-sedp-ink">{quiz.quiz_id}</li>
        </ol>
      </nav>

      <header className="mb-8 rounded-[10px] border border-sedp-subtle-border bg-sedp-surface p-6">
        <p className="font-mono text-xs font-semibold text-sedp-accent">
          {quiz.quiz_id} | {quiz.questions.length} Soal Orisinal
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold text-sedp-ink sm:text-3xl">
          {quiz.title_id}
        </h1>
        <p className="mt-2 text-sm text-sedp-muted">
          Berdasarkan materi{" "}
          <Link
            href={lessonHref}
            className="font-semibold text-sedp-accent underline underline-offset-4"
          >
            {quiz.lesson_id}: {lessonTitle}
          </Link>
          .
        </p>
      </header>

      <QuizRunner quiz={quiz} lessonHref={lessonHref} lessonTitle={lessonTitle} />
    </div>
  );
}
