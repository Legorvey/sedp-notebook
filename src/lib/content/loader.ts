import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import matter from "gray-matter";
import {
  AssetsManifestSchema,
  FactChecksFileSchema,
  GlossaryFileSchema,
  LessonFrontmatterSchema,
  ModulesFileSchema,
  QuizFileSchema,
  SourcesRegistrySchema,
  type FactCheckRecord,
  type GlossaryEntry,
  type LessonFrontmatter,
  type ModuleManifest,
  type PublicAsset,
  type PublicSource,
  type QuizFile,
} from "./schemas";
import { isLabShipped } from "./validation";

const CONTENT_DIR = resolve(process.cwd(), "content");

const DISABLED_MATTER_OPTIONS = {
  engines: {
    js: {
      parse: () => {
        throw new Error("Executable js frontmatter blocks are disallowed");
      },
    },
    javascript: {
      parse: () => {
        throw new Error("Executable javascript frontmatter blocks are disallowed");
      },
    },
  },
};

export interface LoadedLesson {
  frontmatter: LessonFrontmatter;
  body: string;
  moduleSlug: string;
  href: string;
}

function readJsonFile(relativePath: string): unknown {
  const fullPath = resolve(CONTENT_DIR, relativePath);
  if (!existsSync(fullPath)) {
    throw new Error(`Missing content file: content/${relativePath}`);
  }
  return JSON.parse(readFileSync(fullPath, "utf8"));
}

export function loadModules(): ModuleManifest[] {
  const parsed = ModulesFileSchema.parse(readJsonFile("modules.json"));
  return parsed.modules;
}

export function getModuleBySlug(moduleSlug: string): ModuleManifest | undefined {
  return loadModules().find((mod) => mod.module_slug === moduleSlug);
}

export function getModuleByCode(moduleCode: string): ModuleManifest | undefined {
  return loadModules().find((mod) => mod.module_code === moduleCode);
}

export function loadPublicSources(): PublicSource[] {
  const parsed = SourcesRegistrySchema.parse(readJsonFile("sources.json"));
  return parsed.sources;
}

export function loadAssetsManifest(): PublicAsset[] {
  const fullPath = resolve(CONTENT_DIR, "assets-manifest.json");
  if (!existsSync(fullPath)) {
    return [];
  }
  const parsed = AssetsManifestSchema.parse(JSON.parse(readFileSync(fullPath, "utf8")));
  return parsed.assets;
}

export function loadFactChecks(): FactCheckRecord[] {
  const parsed = FactChecksFileSchema.parse(readJsonFile("fact-checks.json"));
  return parsed.fact_checks;
}

export function loadGlossary(): GlossaryEntry[] {
  const parsed = GlossaryFileSchema.parse(readJsonFile("glossary.json"));
  return parsed.glossary;
}

export function loadQuizzes(): QuizFile[] {
  const quizzesDir = resolve(CONTENT_DIR, "quizzes");
  if (!existsSync(quizzesDir)) {
    return [];
  }
  const files = readdirSync(quizzesDir)
    .filter((file) => file.endsWith(".json"))
    .sort();
  return files.map((file) => {
    const raw = JSON.parse(readFileSync(join(quizzesDir, file), "utf8"));
    return QuizFileSchema.parse(raw);
  });
}

export function getQuizById(quizId: string): QuizFile | undefined {
  return loadQuizzes().find((quiz) => quiz.quiz_id === quizId);
}

export function loadLessons(): LoadedLesson[] {
  const lessonsDir = resolve(CONTENT_DIR, "lessons");
  if (!existsSync(lessonsDir)) {
    return [];
  }
  const modules = loadModules();
  const slugByCode = new Map(modules.map((mod) => [mod.module_code, mod.module_slug]));
  const files = readdirSync(lessonsDir)
    .filter((file) => file.endsWith(".mdx"))
    .sort();

  return files.map((file) => {
    const raw = readFileSync(join(lessonsDir, file), "utf8");
    const parsed = matter(raw, DISABLED_MATTER_OPTIONS);
    const frontmatter = LessonFrontmatterSchema.parse(parsed.data);
    const moduleSlug = slugByCode.get(frontmatter.module_code);
    if (!moduleSlug) {
      throw new Error(
        `Lesson ${frontmatter.lesson_id} references unknown module_code "${frontmatter.module_code}"`
      );
    }
    return {
      frontmatter: {
        ...frontmatter,
        related_labs: frontmatter.related_labs.filter((slug) => isLabShipped(slug)),
      },
      body: parsed.content,
      moduleSlug,
      href: `/kurikulum/${moduleSlug}/${frontmatter.slug}/`,
    };
  });
}

export function getLessonByRoute(moduleSlug: string, lessonSlug: string): LoadedLesson | undefined {
  return loadLessons().find(
    (lesson) => lesson.moduleSlug === moduleSlug && lesson.frontmatter.slug === lessonSlug
  );
}

export function getLessonById(lessonId: string): LoadedLesson | undefined {
  return loadLessons().find((lesson) => lesson.frontmatter.lesson_id === lessonId);
}
