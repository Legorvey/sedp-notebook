import { z } from "zod";

export const RightsStatusSchema = z.enum(["UNKNOWN", "PENDING", "CLEARED", "REJECTED"]);

export const SourceTypeSchema = z.enum([
  "OFFICIAL_MODULE",
  "VENDOR_SLIDES",
  "OWNER_NOTES",
  "PUBLIC_PAPER",
  "STANDARD",
  "NEWS",
  "WEBSITE",
  "OTHER",
]);

export const TrustLevelSchema = z.enum(["HIGH", "MEDIUM", "LOW"]);

export const FactCheckStatusSchema = z.enum(["UNVERIFIED", "VERIFIED", "DISPUTED", "RETRACTED"]);

export const ReuseScopeSchema = z.enum([
  "CITATION_AND_FACT_SYNTHESIS_ONLY",
  "ORIGINAL_PROJECT_ASSET",
  "EXPLICIT_OPEN_LICENSE",
]);

export const PlaceholderPattern =
  /(?<![a-z0-9])(TBD|TODO|FIXME|placeholder)(?![a-z0-9])|<verify|UNINSPECTED/i;

export function hasPlaceholderText(value: string): boolean {
  return PlaceholderPattern.test(value);
}

const NonPlaceholderString = z
  .string()
  .trim()
  .min(1)
  .refine((val) => !hasPlaceholderText(val), {
    message: "Contains forbidden placeholder or UNINSPECTED marker",
  });

export const IsoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD date")
  .refine((val) => {
    const [year, month, day] = val.split("-").map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.getUTCFullYear() === year &&
      parsed.getUTCMonth() === month - 1 &&
      parsed.getUTCDate() === day
    );
  }, "Invalid calendar date");

export const SourceRefSchema = z
  .object({
    source_id: NonPlaceholderString,
    scope: NonPlaceholderString,
    role: NonPlaceholderString.optional(),
  })
  .strict();

export const PublicSourceSchema = z
  .object({
    source_id: NonPlaceholderString,
    title: NonPlaceholderString,
    source_type: SourceTypeSchema,
    trust_level: TrustLevelSchema,
    rights_status: z.literal("CLEARED"),
    public_reuse_allowed: z.literal(true),
    reuse_scope: ReuseScopeSchema,
    media_redistribution_allowed: z.boolean(),
    ownership: NonPlaceholderString,
    license: NonPlaceholderString,
    attribution: NonPlaceholderString,
    external_url: z
      .string()
      .url()
      .refine((url) => /^https?:\/\//i.test(url), "external_url must use http:// or https://"),
    checked_at: IsoDateSchema,
  })
  .strict()
  .superRefine((src, ctx) => {
    if (
      src.reuse_scope === "CITATION_AND_FACT_SYNTHESIS_ONLY" &&
      src.media_redistribution_allowed
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["media_redistribution_allowed"],
        message:
          "media_redistribution_allowed must be false when reuse_scope is CITATION_AND_FACT_SYNTHESIS_ONLY",
      });
    }
  });

export const SourcesRegistrySchema = z
  .object({
    sources: z.array(PublicSourceSchema),
  })
  .strict();

export const PublicAssetSchema = z
  .object({
    asset_path: NonPlaceholderString.refine(
      (val) =>
        val.startsWith("/assets/") &&
        !val.includes("..") &&
        !val.includes("?") &&
        !val.includes("#") &&
        !val.includes("\\") &&
        !/\s/.test(val),
      {
        message: "Asset path must be a normalized relative path starting with /assets/",
      }
    ),
    source_id: NonPlaceholderString,
    rights_status: z.literal("CLEARED"),
    reuse_scope: z.enum(["ORIGINAL_PROJECT_ASSET", "EXPLICIT_OPEN_LICENSE"]),
    media_redistribution_allowed: z.literal(true),
    ownership: NonPlaceholderString,
    license: NonPlaceholderString,
    attribution: NonPlaceholderString,
    checked_at: IsoDateSchema,
  })
  .strict();

export const AssetsManifestSchema = z
  .object({
    assets: z.array(PublicAssetSchema),
  })
  .strict();

export const FactCheckRecordSchema = z
  .object({
    fact_check_id: NonPlaceholderString,
    lesson_id: NonPlaceholderString,
    primary_source_id: NonPlaceholderString.nullable(),
    claim_text_id: NonPlaceholderString,
    fact_check_status: FactCheckStatusSchema,
    verification_notes_id: NonPlaceholderString,
    checked_at: IsoDateSchema.nullable(),
  })
  .strict()
  .superRefine((item, ctx) => {
    const unresolved =
      item.fact_check_status === "UNVERIFIED" || item.fact_check_status === "DISPUTED";

    if (unresolved) {
      if (item.primary_source_id !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["primary_source_id"],
          message:
            "primary_source_id must be null while fact_check_status is UNVERIFIED or DISPUTED",
        });
      }
      if (item.checked_at !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["checked_at"],
          message: "checked_at must be null while fact_check_status is UNVERIFIED or DISPUTED",
        });
      }
    }

    if (item.fact_check_status === "VERIFIED" || item.fact_check_status === "RETRACTED") {
      if (item.fact_check_status === "VERIFIED" && item.primary_source_id === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["primary_source_id"],
          message: "Verified fact-check requires non-null primary_source_id",
        });
      }
      if (item.checked_at === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["checked_at"],
          message: "Verified or retracted fact-check requires non-null YYYY-MM-DD checked_at date",
        });
      }
    }
  });

export const FactChecksFileSchema = z
  .object({
    fact_checks: z.array(FactCheckRecordSchema),
  })
  .strict();

export const GlossaryEntrySchema = z
  .object({
    glossary_id: NonPlaceholderString,
    term_en: NonPlaceholderString,
    abbr: NonPlaceholderString.optional(),
    term_id: NonPlaceholderString,
    aliases: z.array(NonPlaceholderString).min(1),
    category: NonPlaceholderString,
    definition_id: NonPlaceholderString,
    engineering_note_id: NonPlaceholderString.optional(),
    related_lesson_ids: z.array(NonPlaceholderString),
    rights_status: z.literal("CLEARED"),
    public_reuse_allowed: z.literal(true),
    source_refs: z.array(SourceRefSchema).min(1),
  })
  .strict();

export const GlossaryFileSchema = z
  .object({
    glossary: z.array(GlossaryEntrySchema),
  })
  .strict();

export const QuizOptionSchema = z
  .object({
    id: NonPlaceholderString,
    text_id: NonPlaceholderString,
  })
  .strict();

export const QuizQuestionSchema = z
  .object({
    question_id: NonPlaceholderString,
    prompt_id: NonPlaceholderString,
    options: z.array(QuizOptionSchema).min(2),
    correct_option_id: NonPlaceholderString,
    explanation_id: NonPlaceholderString,
    lesson_section_anchor: NonPlaceholderString.refine((val) => val.startsWith("#"), {
      message: "lesson_section_anchor must start with '#'",
    }),
  })
  .strict()
  .superRefine((q, ctx) => {
    const optionIds = new Set<string>();
    for (let i = 0; i < q.options.length; i += 1) {
      const optId = q.options[i].id;
      if (optionIds.has(optId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["options", i, "id"],
          message: `Duplicate option id "${optId}"`,
        });
      }
      optionIds.add(optId);
    }
    if (!optionIds.has(q.correct_option_id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["correct_option_id"],
        message: `correct_option_id "${q.correct_option_id}" does not match any option id`,
      });
    }
  });

export const QuizFileSchema = z
  .object({
    quiz_id: NonPlaceholderString,
    lesson_id: NonPlaceholderString,
    title_id: NonPlaceholderString,
    rights_status: z.literal("CLEARED"),
    public_reuse_allowed: z.literal(true),
    origin: z.literal("clean-room-original"),
    source_refs: z.array(SourceRefSchema).min(1),
    questions: z.array(QuizQuestionSchema).min(1),
  })
  .strict()
  .superRefine((quiz, ctx) => {
    const seenQuestionIds = new Set<string>();
    for (let i = 0; i < quiz.questions.length; i += 1) {
      const qid = quiz.questions[i].question_id;
      if (seenQuestionIds.has(qid)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["questions", i, "question_id"],
          message: `Duplicate question_id "${qid}"`,
        });
      }
      seenQuestionIds.add(qid);
    }
  });

export const LessonFrontmatterSchema = z
  .object({
    lesson_id: NonPlaceholderString,
    slug: NonPlaceholderString.refine((val) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val), {
      message: "slug must be lowercase kebab-case",
    }),
    module_code: z.enum(["1.1", "1.2", "1.3", "1.5"]),
    canonical_order: z.number().int().positive(),
    delivery_order: z.number().int().positive(),
    teaching_window: NonPlaceholderString,
    coverage_status: z.enum(["COVERED_IN_SOURCE", "PARTIAL_SOURCE"]),
    title: NonPlaceholderString,
    summary: NonPlaceholderString,
    quiz_id: NonPlaceholderString.optional(),
    related_labs: z.array(NonPlaceholderString),
    glossary_ids: z.array(NonPlaceholderString),
    rights_status: z.literal("CLEARED"),
    public_reuse_allowed: z.literal(true),
    authoring_mode: z.literal("clean-room-original-prose"),
    source_refs: z.array(SourceRefSchema).min(1),
    fact_check_ids: z.array(NonPlaceholderString),
    last_reviewed: IsoDateSchema,
  })
  .strict();

export type PublicSource = z.infer<typeof PublicSourceSchema>;
export type PublicAsset = z.infer<typeof PublicAssetSchema>;
export type FactCheckRecord = z.infer<typeof FactCheckRecordSchema>;
export type GlossaryEntry = z.infer<typeof GlossaryEntrySchema>;
export type QuizFile = z.infer<typeof QuizFileSchema>;
export type LessonFrontmatter = z.infer<typeof LessonFrontmatterSchema>;
