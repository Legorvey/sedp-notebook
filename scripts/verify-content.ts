import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import matter from "gray-matter";
import {
  AssetsManifestSchema,
  FactChecksFileSchema,
  GlossaryFileSchema,
  LessonFrontmatterSchema,
  type PublicSource,
  QuizFileSchema,
  SourcesRegistrySchema,
} from "../src/lib/content/schemas";
import {
  isLabShipped,
  SHIPPED_MODULE_CODES,
  scanContentBodyForPlaceholders,
  scanSrcLineForApiV1,
  scanTextForForbiddenContent,
} from "../src/lib/content/validation";

const ROOT = process.cwd();
const SRC_DIR = resolve(ROOT, "src");
const CONTENT_DIR = resolve(ROOT, "content");

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".mjs",
  ".cjs",
  ".jsx",
  ".css",
  ".md",
  ".mdx",
  ".json",
  ".svg",
  ".yml",
  ".yaml",
]);

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

function findNestedApiV1Dirs(dir: string, errors: string[]): void {
  if (!existsSync(dir)) {
    return;
  }
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (!statSync(fullPath).isDirectory()) {
      continue;
    }
    const rel = relative(SRC_DIR, fullPath).replace(/\\/g, "/");
    if (/(?:^|\/)api\/v1(?:\/|$)/i.test(rel)) {
      errors.push(`Phase F violation: forbidden directory src/${rel} exists in MVP repository.`);
    }
    findNestedApiV1Dirs(fullPath, errors);
  }
}

function hasTextExtension(filePath: string): boolean {
  for (const ext of TEXT_EXTENSIONS) {
    if (filePath.endsWith(ext)) {
      return true;
    }
  }
  return false;
}

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

function main() {
  const errors: string[] = [];

  findNestedApiV1Dirs(resolve(SRC_DIR, "app"), errors);

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

  const sourcesById = new Map<string, PublicSource>();
  const sourcesPath = resolve(CONTENT_DIR, "sources.json");
  const sourcesFileExists = existsSync(sourcesPath);

  if (sourcesFileExists) {
    try {
      const parsed = SourcesRegistrySchema.parse(JSON.parse(readFileSync(sourcesPath, "utf8")));
      for (const source of parsed.sources) {
        if (sourcesById.has(source.source_id)) {
          errors.push(`content/sources.json: duplicate source_id "${source.source_id}"`);
        }
        sourcesById.set(source.source_id, source);
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
      if (parsed.assets.length > 0 && !sourcesFileExists) {
        errors.push("content/assets-manifest.json requires content/sources.json to exist.");
      }
      const seenPaths = new Set<string>();
      for (const asset of parsed.assets) {
        if (seenPaths.has(asset.asset_path)) {
          errors.push(`content/assets-manifest.json: duplicate asset_path "${asset.asset_path}"`);
        }
        seenPaths.add(asset.asset_path);
        const linkedSource = sourcesById.get(asset.source_id);
        if (!linkedSource) {
          errors.push(
            `content/assets-manifest.json: asset "${asset.asset_path}" references missing/uncleared source_id "${asset.source_id}"`
          );
        } else if (
          !linkedSource.media_redistribution_allowed ||
          linkedSource.reuse_scope === "CITATION_AND_FACT_SYNTHESIS_ONLY"
        ) {
          errors.push(
            `content/assets-manifest.json: asset "${asset.asset_path}" source "${asset.source_id}" does not permit Gate C media redistribution`
          );
        }
      }
    } catch (err) {
      errors.push(`content/assets-manifest.json validation failed: ${(err as Error).message}`);
    }
  }

  const factChecksPath = resolve(CONTENT_DIR, "fact-checks.json");
  const knownFactCheckIds = new Set<string>();
  if (existsSync(factChecksPath)) {
    try {
      const parsed = FactChecksFileSchema.parse(JSON.parse(readFileSync(factChecksPath, "utf8")));
      const seenIds = new Set<string>();
      for (const fc of parsed.fact_checks) {
        if (seenIds.has(fc.fact_check_id)) {
          errors.push(`content/fact-checks.json: duplicate fact_check_id "${fc.fact_check_id}"`);
        }
        seenIds.add(fc.fact_check_id);
        knownFactCheckIds.add(fc.fact_check_id);
        if (fc.primary_source_id !== null && !sourcesById.has(fc.primary_source_id)) {
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
  const knownGlossaryIds = new Set<string>();
  if (existsSync(glossaryPath)) {
    try {
      const parsed = GlossaryFileSchema.parse(JSON.parse(readFileSync(glossaryPath, "utf8")));
      if (parsed.glossary.length > 0 && !sourcesFileExists) {
        errors.push("content/glossary.json requires content/sources.json to exist.");
      }
      const seenIds = new Set<string>();
      for (const term of parsed.glossary) {
        if (seenIds.has(term.glossary_id)) {
          errors.push(`content/glossary.json: duplicate glossary_id "${term.glossary_id}"`);
        }
        seenIds.add(term.glossary_id);
        knownGlossaryIds.add(term.glossary_id);
        for (const ref of term.source_refs) {
          if (!sourcesById.has(ref.source_id)) {
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
  const quizLessonById = new Map<string, string>();
  for (const quizFile of walkFiles(resolve(CONTENT_DIR, "quizzes"))) {
    if (!quizFile.endsWith(".json")) {
      continue;
    }
    const rel = relative(ROOT, quizFile).replace(/\\/g, "/");
    try {
      const parsed = QuizFileSchema.parse(JSON.parse(readFileSync(quizFile, "utf8")));
      if (!sourcesFileExists) {
        errors.push(`${rel}: requires content/sources.json to exist.`);
      }
      if (seenQuizIds.has(parsed.quiz_id)) {
        errors.push(`${rel}: duplicate quiz_id "${parsed.quiz_id}"`);
      }
      seenQuizIds.add(parsed.quiz_id);
      quizLessonById.set(parsed.quiz_id, parsed.lesson_id);
      for (const ref of parsed.source_refs) {
        if (!sourcesById.has(ref.source_id)) {
          errors.push(`${rel}: references missing/uncleared source_id "${ref.source_id}"`);
        }
      }
    } catch (err) {
      errors.push(`${rel} validation failed: ${(err as Error).message}`);
    }
  }

  const seenLessonIds = new Set<string>();
  const seenLessonSlugs = new Set<string>();
  const lessonsDir = resolve(CONTENT_DIR, "lessons");
  let lessonCount = 0;

  for (const mdxFile of walkFiles(lessonsDir)) {
    if (!mdxFile.endsWith(".mdx")) {
      continue;
    }
    lessonCount += 1;
    const rel = relative(ROOT, mdxFile).replace(/\\/g, "/");
    const raw = readFileSync(mdxFile, "utf8");

    try {
      const parsedMatter = matter(raw, DISABLED_MATTER_OPTIONS);
      const fm = LessonFrontmatterSchema.parse(parsedMatter.data);

      if (!sourcesFileExists) {
        errors.push(`${rel}: requires content/sources.json to exist.`);
      }
      if (seenLessonIds.has(fm.lesson_id)) {
        errors.push(`${rel}: duplicate lesson_id "${fm.lesson_id}"`);
      }
      if (seenLessonSlugs.has(fm.slug)) {
        errors.push(`${rel}: duplicate slug "${fm.slug}"`);
      }
      seenLessonIds.add(fm.lesson_id);
      seenLessonSlugs.add(fm.slug);

      if (!SHIPPED_MODULE_CODES.has(fm.module_code)) {
        errors.push(
          `${rel}: module_code "${fm.module_code}" is not enabled in SHIPPED_MODULE_CODES`
        );
      }

      if (fm.quiz_id) {
        const linkedLessonId = quizLessonById.get(fm.quiz_id);
        if (!linkedLessonId) {
          errors.push(`${rel}: references missing quiz_id "${fm.quiz_id}"`);
        } else if (linkedLessonId !== fm.lesson_id) {
          errors.push(
            `${rel}: quiz "${fm.quiz_id}" belongs to lesson "${linkedLessonId}", not "${fm.lesson_id}"`
          );
        }
      }

      for (const glossaryId of fm.glossary_ids) {
        if (!knownGlossaryIds.has(glossaryId)) {
          errors.push(`${rel}: references missing glossary_id "${glossaryId}"`);
        }
      }

      for (const factCheckId of fm.fact_check_ids) {
        if (!knownFactCheckIds.has(factCheckId)) {
          errors.push(`${rel}: references missing fact_check_id "${factCheckId}"`);
        }
      }

      for (const labSlug of fm.related_labs) {
        if (!isLabShipped(labSlug)) {
          errors.push(`${rel}: related_labs references unshipped lab "${labSlug}" (R-24)`);
        }
      }

      for (const ref of fm.source_refs) {
        if (!sourcesById.has(ref.source_id)) {
          errors.push(`${rel}: references missing/uncleared source_id "${ref.source_id}"`);
        }
      }

      for (const v of scanContentBodyForPlaceholders(rel, parsedMatter.content)) {
        errors.push(`${v.file}:${v.line}: ${v.rule}`);
      }
    } catch (err) {
      errors.push(`${rel} frontmatter failed: ${(err as Error).message}`);
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
    `verify:content PASSED (src/ scanned cleanly; lessons=${lessonCount}, cleared_sources=${sourcesById.size}).`
  );
}

main();
