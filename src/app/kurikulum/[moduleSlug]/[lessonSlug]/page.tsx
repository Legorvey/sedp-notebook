import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import "katex/dist/katex.min.css";
import { LessonProgressControl } from "@/components/curriculum/lesson-progress-control";
import { createLessonMdxComponents } from "@/components/mdx/mdx-components";
import {
  getLessonByRoute,
  getModuleByCode,
  loadGlossary,
  loadLessons,
  loadPublicSources,
} from "@/lib/content/loader";
import { compileMdxContent, extractLessonHeadings } from "@/lib/content/mdx";

interface LessonPageProps {
  params: Promise<{ moduleSlug: string; lessonSlug: string }>;
}

export function generateStaticParams() {
  return loadLessons().map((lesson) => ({
    moduleSlug: lesson.moduleSlug,
    lessonSlug: lesson.frontmatter.slug,
  }));
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { moduleSlug, lessonSlug } = await params;
  const lesson = getLessonByRoute(moduleSlug, lessonSlug);
  if (!lesson) {
    return { title: "Pelajaran Tidak Ditemukan" };
  }
  return {
    title: `${lesson.frontmatter.lesson_id}: ${lesson.frontmatter.title}`,
    description: lesson.frontmatter.summary,
  };
}

export default async function LessonReaderPage({ params }: LessonPageProps) {
  const { moduleSlug, lessonSlug } = await params;
  const lesson = getLessonByRoute(moduleSlug, lessonSlug);

  if (!lesson) {
    notFound();
  }

  const mod = getModuleByCode(lesson.frontmatter.module_code);
  const headings = extractLessonHeadings(lesson.body);
  const MdxComponent = await compileMdxContent(lesson.body);
  const allGlossary = loadGlossary();
  const lessonGlossary = allGlossary.filter((entry) =>
    lesson.frontmatter.glossary_ids.includes(entry.glossary_id)
  );
  const allSources = loadPublicSources();
  const lessonSources = allSources.filter((src) =>
    lesson.frontmatter.source_refs.some((ref) => ref.source_id === src.source_id)
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
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
              href="/kurikulum/"
              className="inline-flex min-h-[44px] items-center px-1.5 hover:text-sedp-accent hover:underline"
            >
              Kurikulum
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/kurikulum/${lesson.moduleSlug}/`}
              className="inline-flex min-h-[44px] items-center px-1.5 hover:text-sedp-accent hover:underline"
            >
              Modul {lesson.frontmatter.module_code}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="px-1.5 font-semibold text-sedp-ink">{lesson.frontmatter.lesson_id}</li>
        </ol>
      </nav>

      <header className="rounded-[10px] border border-sedp-subtle-border bg-sedp-surface p-6 sm:p-8">
        <p className="font-mono text-xs font-semibold text-sedp-accent">
          Pelajaran {lesson.frontmatter.lesson_id} | {mod?.title_id ?? "Kurikulum"} |{" "}
          {lesson.frontmatter.teaching_window}
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold leading-tight text-sedp-ink sm:text-4xl">
          {lesson.frontmatter.title}
        </h1>
        <p className="mt-3 max-w-[68ch] text-base leading-relaxed text-sedp-muted">
          {lesson.frontmatter.summary}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-sedp-muted">
          <span>
            Status hak &amp; audit:{" "}
            <strong className="text-sedp-verified">Terverifikasi (Clean-Room)</strong>
          </span>
          <span>Ditinjau: {lesson.frontmatter.last_reviewed}</span>
        </div>

        <div className="mt-5">
          <LessonProgressControl lessonId={lesson.frontmatter.lesson_id} />
        </div>
      </header>

      <div className="mt-6 lg:hidden">
        <details className="rounded-[10px] border border-sedp-control-border bg-sedp-surface p-4">
          <summary className="min-h-[44px] py-2 text-sm font-semibold text-sedp-accent">
            Daftar Isi &amp; Glosarium Terkait ({headings.length} bagian, {lessonGlossary.length}{" "}
            istilah)
          </summary>
          <div className="mt-3 space-y-4 border-t border-sedp-subtle-border pt-3">
            <nav aria-label="Daftar isi pelajaran seluler" className="space-y-2">
              {headings.map((h) => (
                <a
                  key={h.id}
                  href={`#${h.id}`}
                  className="flex min-h-[44px] items-center rounded-sm px-2 text-sm text-sedp-ink hover:bg-sedp-inset hover:text-sedp-accent"
                >
                  {h.text}
                </a>
              ))}
            </nav>

            <div className="border-t border-sedp-subtle-border pt-3">
              <p className="px-2 text-xs font-semibold text-sedp-muted">Istilah Kunci</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {lessonGlossary.map((term) => (
                  <li key={term.glossary_id}>
                    <Link
                      href={`/referensi/glosarium/#${term.glossary_id}`}
                      className="inline-flex min-h-[44px] items-center rounded-md border border-sedp-subtle-border bg-sedp-inset px-3 py-1.5 font-mono text-xs font-semibold text-sedp-accent hover:bg-sedp-canvas"
                    >
                      {term.abbr ?? term.term_en}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </details>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <article className="min-w-0 lg:col-span-8">
          <div className="sedp-prose">
            <MdxComponent components={createLessonMdxComponents()} />
          </div>

          <section
            aria-labelledby="lesson-actions-heading"
            className="mt-10 rounded-[10px] border border-sedp-control-border bg-sedp-surface p-6"
          >
            <h2
              id="lesson-actions-heading"
              className="font-display text-xl font-bold text-sedp-ink"
            >
              Lanjutkan Praktik &amp; Uji Pemahaman
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-sedp-muted">
              Latih pemahaman konsep dry plant, wet plant, jalur optik, dan pencatuan daya PFE
              melalui lab dan paket soal asli di bawah ini.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {lesson.frontmatter.quiz_id && (
                <Link
                  href={`/latihan/${lesson.frontmatter.quiz_id}/`}
                  className="inline-flex min-h-[44px] items-center rounded-md bg-sedp-accent px-5 py-2.5 text-sm font-semibold text-sedp-accent-ink hover:bg-[var(--sedp-accent-hover)]"
                >
                  Uji Pemahaman {lesson.frontmatter.lesson_id}
                </Link>
              )}
              {lesson.frontmatter.related_labs.map((labSlug) => (
                <Link
                  key={labSlug}
                  href={`/lab/${labSlug}/`}
                  className="inline-flex min-h-[44px] items-center rounded-md border border-sedp-control-border bg-sedp-canvas px-4 py-2 text-sm font-semibold text-sedp-ink hover:bg-sedp-inset"
                >
                  Buka Lab Eksplorer Sistem
                </Link>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="lesson-sources-heading"
            className="mt-8 rounded-[10px] border border-sedp-subtle-border bg-sedp-surface p-6"
          >
            <h2
              id="lesson-sources-heading"
              className="font-display text-lg font-bold text-sedp-ink"
            >
              Rujukan Standar &amp; Publikasi Terverifikasi
            </h2>
            <ul className="mt-3 space-y-2.5 text-sm">
              {lessonSources.map((src) => (
                <li
                  key={src.source_id}
                  className="rounded-md border border-sedp-subtle-border bg-sedp-canvas p-3"
                >
                  <p className="font-semibold text-sedp-ink">{src.title}</p>
                  <p className="mt-1 text-xs text-sedp-muted">
                    {src.ownership} | Diperiksa: {src.checked_at}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              <Link
                href="/tentang/sumber/"
                className="inline-flex min-h-[44px] items-center text-sm font-semibold text-sedp-accent underline underline-offset-4"
              >
                Lihat Daftar Lengkap Sumber Publik
              </Link>
            </p>
          </section>
        </article>

        <aside
          aria-label="Navigasi bagian dan glosarium pelajaran"
          className="hidden lg:col-span-4 lg:block"
        >
          <div className="sticky top-24 space-y-6">
            <nav
              aria-label="Daftar isi pelajaran"
              className="rounded-[10px] border border-sedp-subtle-border bg-sedp-surface p-5"
            >
              <h2 className="font-display text-base font-bold text-sedp-ink">Daftar Isi Bagian</h2>
              <ul className="mt-3 space-y-2">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a
                      href={`#${h.id}`}
                      className="flex min-h-[44px] items-center rounded-sm px-2 py-1 text-sm text-sedp-muted hover:bg-sedp-inset hover:text-sedp-accent"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <section
              aria-labelledby="sidebar-glossary-heading"
              className="rounded-[10px] border border-sedp-subtle-border bg-sedp-surface p-5"
            >
              <h2
                id="sidebar-glossary-heading"
                className="font-display text-base font-bold text-sedp-ink"
              >
                Istilah Kunci ({lessonGlossary.length})
              </h2>
              <ul className="mt-3 space-y-2">
                {lessonGlossary.map((term) => (
                  <li key={term.glossary_id}>
                    <Link
                      href={`/referensi/glosarium/#${term.glossary_id}`}
                      className="flex min-h-[44px] items-center justify-between rounded-sm px-2 py-1 text-sm text-sedp-ink hover:bg-sedp-inset hover:text-sedp-accent"
                    >
                      <span className="font-mono text-xs font-semibold text-sedp-accent">
                        {term.abbr ?? term.term_en}
                      </span>
                      <span className="truncate pl-2 text-xs text-sedp-muted">{term.term_en}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
