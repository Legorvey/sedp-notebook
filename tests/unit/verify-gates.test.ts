import { describe, expect, it } from "vitest";
import {
  AssetsManifestSchema,
  FactCheckRecordSchema,
  GlossaryEntrySchema,
  LessonFrontmatterSchema,
  PublicSourceSchema,
  QuizFileSchema,
} from "@/lib/content/schemas";
import {
  isLabShipped,
  scanContentBodyForPlaceholders,
  scanSrcLineForApiV1,
  scanTextForForbiddenContent,
} from "@/lib/content/validation";

describe("M0 Gate A-C content schemas and security scanners", () => {
  it("accepts a CLEARED PublicSource and rejects PENDING status, TBD date, or unknown audit keys", () => {
    const validSource = {
      source_id: "src-itu-g977-1",
      title: "ITU-T G.977.1",
      source_type: "STANDARD",
      trust_level: "HIGH",
      rights_status: "CLEARED",
      public_reuse_allowed: true,
      reuse_scope: "CITATION_AND_FACT_SYNTHESIS_ONLY",
      media_redistribution_allowed: false,
      ownership: "ITU-T",
      license: "Reference citation only",
      attribution: "ITU-T Recommendation G.977.1",
      external_url: "https://www.itu.int/rec/T-REC-G.977.1",
      checked_at: "2026-11-19",
    };

    expect(PublicSourceSchema.safeParse(validSource).success).toBe(true);
    expect(PublicSourceSchema.safeParse({ ...validSource, rights_status: "PENDING" }).success).toBe(
      false
    );
    expect(
      PublicSourceSchema.safeParse({ ...validSource, public_reuse_allowed: false }).success
    ).toBe(false);
    expect(PublicSourceSchema.safeParse({ ...validSource, checked_at: "TBD" }).success).toBe(false);
    expect(PublicSourceSchema.safeParse({ ...validSource, checked_at: "2026-02-30" }).success).toBe(
      false
    );
    expect(
      PublicSourceSchema.safeParse({ ...validSource, filename: "internal-deck.pdf" }).success
    ).toBe(false);
  });

  it("enforces Gate C media redistribution rules and blocks CITATION_AND_FACT_SYNTHESIS_ONLY assets in public/", () => {
    const validAsset = {
      asset_path: "/assets/diagrams/system-overview.svg",
      source_id: "src-project-original-svg",
      rights_status: "CLEARED",
      reuse_scope: "ORIGINAL_PROJECT_ASSET",
      media_redistribution_allowed: true,
      ownership: "SEDP Learning Hub Contributors",
      license: "Original project SVG",
      attribution: "Diagram original SEDP Learning Hub",
      checked_at: "2026-11-19",
    };

    expect(AssetsManifestSchema.safeParse({ assets: [validAsset] }).success).toBe(true);
    expect(
      AssetsManifestSchema.safeParse({
        assets: [
          {
            ...validAsset,
            reuse_scope: "CITATION_AND_FACT_SYNTHESIS_ONLY",
            media_redistribution_allowed: false,
          },
        ],
      }).success
    ).toBe(false);
  });

  it("enforces FactCheck primary_source_id null constraint while UNVERIFIED/DISPUTED and checked_at on VERIFIED", () => {
    const unverified = {
      fact_check_id: "fc-traffic-share",
      lesson_id: "1.2-01",
      primary_source_id: null,
      claim_text_id: "Lalu lintas internet antarbenua melewati kabel laut.",
      fact_check_status: "UNVERIFIED",
      verification_notes_id: "Menunggu verifikasi sumber primer.",
      checked_at: null,
    };
    expect(FactCheckRecordSchema.safeParse(unverified).success).toBe(true);
    expect(
      FactCheckRecordSchema.safeParse({
        ...unverified,
        primary_source_id: "src-icpc",
      }).success
    ).toBe(false);
    expect(
      FactCheckRecordSchema.safeParse({
        ...unverified,
        fact_check_status: "VERIFIED",
        primary_source_id: "src-icpc",
        checked_at: "2026-11-19",
      }).success
    ).toBe(true);
    expect(
      FactCheckRecordSchema.safeParse({
        ...unverified,
        fact_check_status: "VERIFIED",
        primary_source_id: "src-icpc",
        checked_at: null,
      }).success
    ).toBe(false);
  });

  it("validates lesson frontmatter, blocks Module 1.4, and checks quiz/glossary strict constraints", () => {
    const validLesson = {
      lesson_id: "1.3-01",
      slug: "arsitektur-ujung-ke-ujung",
      module_code: "1.3",
      canonical_order: 8,
      delivery_order: 8,
      teaching_window: "Hari 2-3",
      coverage_status: "COVERED_IN_SOURCE",
      title: "Arsitektur Ujung-ke-Ujung Sistem Kabel Laut",
      summary: "Ringkasan sistem darat dan basah.",
      quiz_id: "quiz-1.3-01-arch",
      related_labs: ["eksplorer-sistem"],
      glossary_ids: ["gls-bmh"],
      rights_status: "CLEARED",
      public_reuse_allowed: true,
      authoring_mode: "clean-room-original-prose",
      source_refs: [{ source_id: "src-itu-g977-1", scope: "Architecture overview" }],
      fact_check_ids: [],
      last_reviewed: "2026-11-19",
    };

    expect(LessonFrontmatterSchema.safeParse(validLesson).success).toBe(true);
    expect(LessonFrontmatterSchema.safeParse({ ...validLesson, module_code: "1.4" }).success).toBe(
      false
    );
    expect(
      LessonFrontmatterSchema.safeParse({
        ...validLesson,
        source_refs: [{ source_id: "src-itu-g977-1", scope: "UNINSPECTED_M1_TODO" }],
      }).success
    ).toBe(false);
    expect(isLabShipped("eksplorer-sistem")).toBe(false);
    expect(isLabShipped("eksplorer-sistem", new Set(["eksplorer-sistem"]))).toBe(true);

    const validGlossary = {
      glossary_id: "gls-bmh",
      term_en: "Beach Manhole",
      abbr: "BMH",
      term_id: "Sumur Transisi Pantai",
      aliases: ["bmh"],
      category: "infrastruktur-darat",
      definition_id: "Ruang transisi kabel pantai menuju darat.",
      related_lesson_ids: ["1.3-01"],
      rights_status: "CLEARED",
      public_reuse_allowed: true,
      source_refs: [{ source_id: "src-itu-g972", scope: "Definition" }],
    };
    expect(GlossaryEntrySchema.safeParse(validGlossary).success).toBe(true);

    const validQuiz = {
      quiz_id: "quiz-1.3-01-arch",
      lesson_id: "1.3-01",
      title_id: "Uji Pemahaman",
      rights_status: "CLEARED",
      public_reuse_allowed: true,
      origin: "clean-room-original",
      source_refs: [{ source_id: "src-itu-g977-1", scope: "Question review" }],
      questions: [
        {
          question_id: "q1",
          prompt_id: "Pertanyaan 1",
          options: [
            { id: "a", text_id: "Opsi A" },
            { id: "b", text_id: "Opsi B" },
          ],
          correct_option_id: "a",
          explanation_id: "Penjelasan A.",
          lesson_section_anchor: "#arsitektur",
        },
      ],
    };
    expect(QuizFileSchema.safeParse(validQuiz).success).toBe(true);
    expect(
      QuizFileSchema.safeParse({
        ...validQuiz,
        questions: [{ ...validQuiz.questions[0], correct_option_id: "z" }],
      }).success
    ).toBe(false);
  });

  it("detects U+2014 em dash, restricted confidentiality leaks, internal source markers, and /api/v1 paths", () => {
    const sampleBad = [
      "Teks dengan em dash \u2014 dilarang.",
      "Contoh " + "OSM " + "BDO dari dek.",
      "File Modul_" + "1.1 dan NEC " + "Advances dilarang.",
      "Ref src-" + "sedp-m1-3-arch terlarang.",
    ].join("\n");

    const violations = scanTextForForbiddenContent("content/test.mdx", sampleBad);
    const rules = violations.map((v) => v.rule);
    expect(rules).toContain("U+2014 em dash");
    expect(rules).toContain("restricted Telkom facility acronym");
    expect(rules).toContain("internal slide deck filename");
    expect(rules).toContain("quarantined NEC PDF reference");
    expect(rules).toContain("private editorial source_id");

    const apiViolation = scanSrcLineForApiV1("src/app/test.ts", 'fetch("/api/' + 'v1/articles")');
    expect(apiViolation).toHaveLength(1);

    const placeholderViolation = scanContentBodyForPlaceholders(
      "content/test.mdx",
      "Cek <verify later>"
    );
    expect(placeholderViolation).toHaveLength(1);
  });
});
