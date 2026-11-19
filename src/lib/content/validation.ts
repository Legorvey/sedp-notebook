import {
  type FactCheckRecord,
  type GlossaryEntry,
  type LessonFrontmatter,
  PlaceholderPattern,
  type PublicSource,
  type QuizFile,
} from "./schemas";

export const SHIPPED_LAB_SLUGS = new Set<string>([
  "eksplorer-sistem",
  "kapasitas-optik",
  "anggaran-daya",
]);
export const SHIPPED_MODULE_CODES = new Set<string>(["1.1", "1.2", "1.3"]);

export function isLabShipped(slug: string, shippedSlugs: Set<string> = SHIPPED_LAB_SLUGS): boolean {
  return shippedSlugs.has(slug);
}

export interface RestrictedRule {
  label: string;
  pattern: RegExp;
}

export const FORBIDDEN_TEXT_RULES: readonly RestrictedRule[] = [
  { label: "U+2014 em dash", pattern: /\u2014/u },
  { label: "HTML em dash entity", pattern: /(?:&[m]dash;|&#[8]212;|&#[x]2014;)/i },
  { label: "restricted confidentiality label", pattern: /\binternal\s+use\s+only\b/i },
  { label: "restricted slides disclaimer", pattern: /\bslides\s+marked\s+confidential\b/i },
  { label: "restricted bracket marker", pattern: /\[restricted\]/i },
  {
    label: "restricted conference proceedings ref",
    pattern: /(?<![a-z0-9])sub[o]ptic\s+2022(?![a-z0-9])/i,
  },
  { label: "restricted Telkom facility acronym", pattern: /(?<![a-z0-9])osm\s+bdo(?![a-z0-9])/i },
  { label: "restricted marine structure example", pattern: /(?<![a-z0-9])rum[p]on(?![a-z0-9])/i },
  {
    label: "internal slide deck filename",
    pattern:
      /(?<![a-z0-9])(?:modul_1\.[123]|module[-_\s]+1\.[123]|modul[-_\s]+1\.2\s+(?:the\s+global|revisi)|a[_ ]journey[_ ]through[_ ]time|submarine[_ ]cable[_ ]system[_ ]architecture[_ ]compressed)(?![0-9])/i,
  },
  { label: "quarantined NEC PDF reference", pattern: /(?<![a-z0-9])nec\s+advances(?![a-z0-9])/i },
  { label: "internal notes filename", pattern: /(?<![a-z0-9])catatan[-_\s]+sedp-1(?![0-9])/i },
  {
    label: "internal overview brief filename",
    pattern: /(?<![a-z0-9])pr[o]ject[-_\s]?brief(?![a-z0-9])/i,
  },
  { label: "private editorial source_id", pattern: /(?<![a-z0-9])src-(?:sedp|nec|owner)-/i },
];

export interface TextViolation {
  file: string;
  rule: string;
  line: number;
}

export function scanTextForForbiddenContent(file: string, content: string): TextViolation[] {
  const violations: TextViolation[] = [];
  const matchedPerRule = new Set<string>();
  const lines = content.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const lineText = lines[index];
    for (const rule of FORBIDDEN_TEXT_RULES) {
      if (rule.pattern.test(lineText)) {
        matchedPerRule.add(rule.label);
        violations.push({
          file,
          rule: rule.label,
          line: index + 1,
        });
      }
    }
  }

  const normalizedMultiline = content.replace(/\r?\n\s*/g, " ");
  for (const rule of FORBIDDEN_TEXT_RULES) {
    if (!matchedPerRule.has(rule.label) && rule.pattern.test(normalizedMultiline)) {
      violations.push({
        file,
        rule: `${rule.label} (multiline)`,
        line: 1,
      });
    }
  }

  return violations;
}

export function scanSrcLineForApiV1(file: string, content: string): TextViolation[] {
  const violations: TextViolation[] = [];
  const apiV1Pattern = new RegExp("/api/" + "v1\\b", "i");
  const lines = content.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    if (apiV1Pattern.test(lines[index])) {
      violations.push({
        file,
        rule: "Phase F reserved REST prefix in src/",
        line: index + 1,
      });
    }
  }

  if (violations.length === 0) {
    const collapsed = content.replace(/\r?\n\s*/g, "");
    if (apiV1Pattern.test(collapsed)) {
      violations.push({
        file,
        rule: "Phase F reserved REST prefix in src/ (multiline)",
        line: 1,
      });
    }
  }

  return violations;
}

export function scanContentBodyForPlaceholders(file: string, body: string): TextViolation[] {
  const violations: TextViolation[] = [];
  const lines = body.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    if (PlaceholderPattern.test(lines[index])) {
      violations.push({
        file,
        rule: "unresolved placeholder/UNINSPECTED marker in content body",
        line: index + 1,
      });
    }
  }

  return violations;
}

export interface ContentCrossReferenceInput {
  sources: readonly PublicSource[];
  factChecks: readonly FactCheckRecord[];
  glossary?: readonly GlossaryEntry[];
  quizzes?: readonly QuizFile[];
  lessons?: readonly LessonFrontmatter[];
}

export function validateContentCrossReferences(input: ContentCrossReferenceInput): string[] {
  const errors: string[] = [];
  const clearedSources = new Map<string, PublicSource>();

  for (const src of input.sources) {
    if (clearedSources.has(src.source_id)) {
      errors.push(`content/sources.json: duplicate source_id "${src.source_id}"`);
    }
    if (src.rights_status === "CLEARED" && src.public_reuse_allowed) {
      clearedSources.set(src.source_id, src);
    }
  }

  const factChecksById = new Map<string, FactCheckRecord>();
  for (const fc of input.factChecks) {
    if (factChecksById.has(fc.fact_check_id)) {
      errors.push(`content/fact-checks.json: duplicate fact_check_id "${fc.fact_check_id}"`);
    }
    factChecksById.set(fc.fact_check_id, fc);

    if (fc.primary_source_id !== null && !clearedSources.has(fc.primary_source_id)) {
      errors.push(
        `content/fact-checks.json: "${fc.fact_check_id}" references missing or uncleared primary_source_id "${fc.primary_source_id}"`
      );
    }
  }

  for (const term of input.glossary ?? []) {
    for (const ref of term.source_refs) {
      if (!clearedSources.has(ref.source_id)) {
        errors.push(
          `content/glossary.json: "${term.glossary_id}" references missing or uncleared source_id "${ref.source_id}"`
        );
      }
    }
  }

  for (const quiz of input.quizzes ?? []) {
    for (const ref of quiz.source_refs) {
      if (!clearedSources.has(ref.source_id)) {
        errors.push(
          `content/quizzes/${quiz.quiz_id}.json: references missing or uncleared source_id "${ref.source_id}"`
        );
      }
    }
  }

  for (const lesson of input.lessons ?? []) {
    for (const ref of lesson.source_refs) {
      if (!clearedSources.has(ref.source_id)) {
        errors.push(
          `lesson "${lesson.lesson_id}": references missing or uncleared source_id "${ref.source_id}"`
        );
      }
    }
    for (const fcId of lesson.fact_check_ids) {
      const linkedFc = factChecksById.get(fcId);
      if (!linkedFc) {
        errors.push(`lesson "${lesson.lesson_id}": references missing fact_check_id "${fcId}"`);
      } else if (linkedFc.fact_check_status === "RETRACTED") {
        errors.push(`lesson "${lesson.lesson_id}": references RETRACTED fact_check_id "${fcId}"`);
      }
    }
  }

  return errors;
}
