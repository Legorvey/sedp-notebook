import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import matter from "gray-matter";
import {
  AssetsManifestSchema,
  FactChecksFileSchema,
  GlossaryFileSchema,
  LessonFrontmatterSchema,
  QuizFileSchema,
  SourcesRegistrySchema,
} from "../src/lib/content/schemas";
import {
  isLabShipped,
  scanContentBodyForPlaceholders,
  scanSrcLineForApiV1,
  scanTextForForbiddenContent,
} from "../src/lib/content/validation";

const ROOT = process.cwd();
const SRC_DIR = resolve(ROOT, "src");
const CONTENT_DIR = resolve(ROOT, "content");

const TEXT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".css", ".md", ".mdx", ".json"]);

function walkFiles(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...walkFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

function hasTextExtension(filePath: string): boolean {
  for (const ext of TEXT_EXTENSIONS) {
    if (filePath.endsWith(ext)) {
      return true;
    }
  }
  return false;
}

function main() {
  const errors: string[] = [];

  if (existsSync(resolve(SRC_DIR, "app", "api", "v1"))) {
    errors.push(
      "Phase F violation: src/app/api/v1 directory exists in MVP repository (reserved for deferred Phase F)."
    );
  }

  for (const filePath of walkFiles(SRC_DIR)) {
    if (!hasTextExtension(filePath)) {
      continue;
    }
    const rel = relative(ROOT, filePath).replace(/\\/g, "/");
    const raw = readFileSync(filePath, "utf8");

    for (const v of scanTextForForbiddenContent(rel, raw)) {
      errors.push(`${v.file}:${v.line}: Forbidden content (${v.rule})`);
    }
    for (const v of scanSrcLineForApiV1(rel, raw)) {
      errors.push(`${v.file}:${v.line}: ${v.rule}`);
    }
  }

  const knownSourceIds = new Set<string>();
  const sourcesPath = resolve(CONTENT_DIR, "sources.json");
  if (existsSync(sourcesPath)) {
    try {
      const parsed = SourcesRegistrySchema.parse(JSON.parse(readFileSync(sourcesPath, "utf8")));
      for (const source of parsed.sources) {
        if (knownSourceIds.has(source.source_id)) {
          errors.push(`content/sources.json: duplicate source_id "${source.source_id}"`);
        }
        knownSourceIds.add(source.source_id);
      }
    } catch (err) {
      errors.push(`content/sources.json validation failed: ${(err as Error).message}`);
    }
  }

  const assetsManifestPath = resolve(CONTENT_DIR, "assets-manifest.json");
  if (existsSync(assetsManifestPath)) {
    try {
      const parsed = AssetsManifestSchema.parse(
        JSON.parse(readFileSync(assetsManifestPath, "utf8"))
      );
      const seenPaths = new Set<string>();
      for (const asset of parsed.assets) {
        if (seenPaths.has(asset.asset_path)) {
          errors.push(`content/assets-manifest.json: duplicate asset_path "${asset.asset_path}"`);
        }
        seenPaths.add(asset.asset_path);
        if (knownSourceIds.size > 0 && !knownSourceIds.has(asset.source_id)) {
          errors.push(
            `content/assets-manifest.json: asset "${asset.asset_path}" references missing/uncleared source_id "${asset.source_id}"`
          );
        }
      }
    } catch (err) {
      errors.push(`content/assets-manifest.json validation failed: ${(err as Error).message}`);
    }
  }

  const factChecksPath = resolve(CONTENT_DIR, "fact-checks.json");
  if (existsSync(factChecksPath)) {
    try {
      const parsed = FactChecksFileSchema.parse(JSON.parse(readFileSync(factChecksPath, "utf8")));
      const seenIds = new Set<string>();
      for (const fc of parsed.fact_checks) {
        if (seenIds.has(fc.fact_check_id)) {
          errors.push(`content/fact-checks.json: duplicate fact_check_id "${fc.fact_check_id}"`);
        }
        seenIds.add(fc.fact_check_id);
        if (
          fc.primary_source_id &&
          knownSourceIds.size > 0 &&
          !knownSourceIds.has(fc.primary_source_id)
        ) {
          errors.push(
            `content/fact-checks.json: "${fc.fact_check_id}" references missing/uncleared primary_source_id "${fc.primary_source_id}"`
          );
        }
      }
    } catch (err) {
      errors.push(`content/fact-checks.json validation failed: ${(err as Error).message}`);
    }
  }

  const glossaryPath = resolve(CONTENT_DIR, "glossary.json");
  if (existsSync(glossaryPath)) {
    try {
      const parsed = GlossaryFileSchema.parse(JSON.parse(readFileSync(glossaryPath, "utf8")));
      const seenIds = new Set<string>();
      for (const term of parsed.glossary) {
        if (seenIds.has(term.glossary_id)) {
          errors.push(`content/glossary.json: duplicate glossary_id "${term.glossary_id}"`);
        }
        seenIds.add(term.glossary_id);
        for (const ref of term.source_refs) {
          if (knownSourceIds.size > 0 && !knownSourceIds.has(ref.source_id)) {
            errors.push(
              `content/glossary.json: "${term.glossary_id}" references missing/uncleared source_id "${ref.source_id}"`
            );
          }
        }
      }
    } catch (err) {
      errors.push(`content/glossary.json validation failed: ${(err as Error).message}`);
    }
  }

  const seenQuizIds = new Set<string>();
  for (const quizFile of walkFiles(resolve(CONTENT_DIR, "quizzes"))) {
    if (!quizFile.endsWith(".json")) {
      continue;
    }
    const rel = relative(ROOT, quizFile).replace(/\\/g, "/");
    try {
      const parsed = QuizFileSchema.parse(JSON.parse(readFileSync(quizFile, "utf8")));
      if (seenQuizIds.has(parsed.quiz_id)) {
        errors.push(`${rel}: duplicate quiz_id "${parsed.quiz_id}"`);
      }
      seenQuizIds.add(parsed.quiz_id);
      for (const ref of parsed.source_refs) {
        if (knownSourceIds.size > 0 && !knownSourceIds.has(ref.source_id)) {
          errors.push(`${rel}: references missing/uncleared source_id "${ref.source_id}"`);
        }
      }
    } catch (err) {
      errors.push(`${rel} validation failed: ${(err as Error).message}`);
    }
  }

  const seenLessonIds = new Set<string>();
  const lessonsDir = resolve(CONTENT_DIR, "lessons");
  let lessonCount = 0;

  for (const mdxFile of walkFiles(lessonsDir)) {
    if (!mdxFile.endsWith(".mdx")) {
      continue;
    }
    lessonCount += 1;
    const rel = relative(ROOT, mdxFile).replace(/\\/g, "/");
    const raw = readFileSync(mdxFile, "utf8");
    const { data, content } = matter(raw);

    try {
      const fm = LessonFrontmatterSchema.parse(data);
      if (seenLessonIds.has(fm.lesson_id)) {
        errors.push(`${rel}: duplicate lesson_id "${fm.lesson_id}"`);
      }
      seenLessonIds.add(fm.lesson_id);

      if (fm.module_code === "1.5" && fm.coverage_status !== "COVERED_IN_SOURCE") {
        errors.push(
          `${rel}: Module 1.5 lesson must stay gated until primary Day 3 / M1.5 sources arrive`
        );
      }

      for (const labSlug of fm.related_labs) {
        if (!isLabShipped(labSlug)) {
          errors.push(`${rel}: related_labs references unshipped lab "${labSlug}" (R-24)`);
        }
      }

      for (const ref of fm.source_refs) {
        if (knownSourceIds.size > 0 && !knownSourceIds.has(ref.source_id)) {
          errors.push(`${rel}: references missing/uncleared source_id "${ref.source_id}"`);
        }
      }
    } catch (err) {
      errors.push(`${rel} frontmatter failed: ${(err as Error).message}`);
    }

    for (const v of scanContentBodyForPlaceholders(rel, content)) {
      errors.push(`${v.file}:${v.line}: ${v.rule}`);
    }
  }

  for (const contentFile of walkFiles(CONTENT_DIR)) {
    if (!hasTextExtension(contentFile)) {
      continue;
    }
    const rel = relative(ROOT, contentFile).replace(/\\/g, "/");
    const raw = readFileSync(contentFile, "utf8");
    for (const v of scanTextForForbiddenContent(rel, raw)) {
      errors.push(`${v.file}:${v.line}: Forbidden content (${v.rule})`);
    }
  }

  if (errors.length > 0) {
    console.error("verify:content FAILED with errors:");
    for (const err of errors) {
      console.error(` - ${err}`);
    }
    process.exit(1);
  }

  console.log(
    `verify:content PASSED (src/ scanned cleanly; lessons=${lessonCount}, cleared_sources=${knownSourceIds.size}).`
  );
}

main();
