import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  extractInlineScriptHashes,
  isExpectedInlineScript,
  normalizeWindowsRscSegmentFiles,
} from "../../scripts/generate-csp-hashes.mjs";
import { compileMdxContent } from "@/lib/content/mdx";
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

describe("M0 Gate A-C content schemas, scanners, and MDX hardening", () => {
  it("accepts CLEARED PublicSource and rejects PENDING status, TBD_DATE, bad URLs, or CITATION media flags", () => {
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
      PublicSourceSchema.safeParse({ ...validSource, media_redistribution_allowed: true }).success
    ).toBe(false);
    expect(
      PublicSourceSchema.safeParse({ ...validSource, external_url: "ftp://example.com/file" })
        .success
    ).toBe(false);
    expect(PublicSourceSchema.safeParse({ ...validSource, checked_at: "TBD_DATE" }).success).toBe(
      false
    );
    expect(PublicSourceSchema.safeParse({ ...validSource, title: "TODO_LATER" }).success).toBe(
      false
    );
    expect(
      PublicSourceSchema.safeParse({ ...validSource, filename: "internal-deck.pdf" }).success
    ).toBe(false);
  });

  it("enforces Gate C media redistribution rules and blocks malformed or unapproved assets", () => {
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
        assets: [{ ...validAsset, asset_path: "/images/other.svg" }],
      }).success
    ).toBe(false);
    expect(
      AssetsManifestSchema.safeParse({
        assets: [{ ...validAsset, asset_path: "/assets/../secret.svg" }],
      }).success
    ).toBe(false);
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

  it("enforces FactCheck null constraints for UNVERIFIED/DISPUTED and checked_at for VERIFIED/RETRACTED", () => {
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
      FactCheckRecordSchema.safeParse({ ...unverified, checked_at: "2026-11-19" }).success
    ).toBe(false);
    expect(
      FactCheckRecordSchema.safeParse({
        ...unverified,
        fact_check_status: "DISPUTED",
        primary_source_id: "src-icpc",
      }).success
    ).toBe(false);
    expect(
      FactCheckRecordSchema.safeParse({
        ...unverified,
        fact_check_status: "RETRACTED",
        checked_at: null,
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
  });

  it("validates lesson frontmatter, blocks Module 1.4/bad slugs, and rejects duplicate quiz options", () => {
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
      LessonFrontmatterSchema.safeParse({ ...validLesson, slug: "Bad Slug/Path" }).success
    ).toBe(false);
    expect(isLabShipped("eksplorer-sistem")).toBe(true);
    expect(isLabShipped("kapasitas-optik")).toBe(true);
    expect(isLabShipped("anggaran-daya")).toBe(true);
    expect(isLabShipped("gangguan-redundansi")).toBe(false);
    expect(isLabShipped("linimasa-sejarah")).toBe(false);
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
        questions: [
          {
            ...validQuiz.questions[0],
            options: [
              { id: "a", text_id: "A1" },
              { id: "a", text_id: "A2" },
            ],
          },
        ],
      }).success
    ).toBe(false);
  });

  it("detects clean prose safely while catching all forbidden patterns including underscore/multiline variants", () => {
    const cleanInd =
      "Panduan Modul 1.3 arsitektur kabel laut repeatered dengan margin optik terukur.";
    expect(scanTextForForbiddenContent("content/clean.mdx", cleanInd)).toEqual([]);
    expect(scanSrcLineForApiV1("src/app/clean.ts", "export const ok = true;")).toEqual([]);
    expect(scanContentBodyForPlaceholders("content/clean.mdx", cleanInd)).toEqual([]);

    const sampleBad = [
      "Em dash \u2014 dan &mdash; dilarang.",
      "Contoh " + "OSM\nBDO dari Internal\nUse Only dan Slides marked confidential [Restricted].",
      "Rujukan Sub" + "Optic 2022 dan contoh Rum" + "pon.",
      "Modul_1.1_A_Journey_Through_Time_Rev2 dan Module 1.3 dan Catatan-SEDP-1 dan PR" +
        "OJECT_BRIEF_SEDP.",
      "NEC " + "Advances serta ref src-" + "sedp-m1-3-arch.",
    ].join("\n");

    const violations = scanTextForForbiddenContent("content/test.mdx", sampleBad);
    const rules = violations.map((v) => v.rule);
    expect(rules).toContain("U+2014 em dash");
    expect(rules).toContain("HTML em dash entity");
    expect(rules).toContain("restricted confidentiality label (multiline)");
    expect(rules).toContain("restricted slides disclaimer");
    expect(rules).toContain("restricted bracket marker");
    expect(rules).toContain("restricted conference proceedings ref");
    expect(rules).toContain("restricted Telkom facility acronym (multiline)");
    expect(rules).toContain("restricted marine structure example");
    expect(rules).toContain("internal slide deck filename");
    expect(rules).toContain("internal notes filename");
    expect(rules).toContain("internal overview brief filename");
    expect(rules).toContain("quarantined NEC PDF reference");
    expect(rules).toContain("private editorial source_id");

    const apiViolation = scanSrcLineForApiV1("src/app/test.ts", 'fetch("/api/' + 'v1/articles")');
    expect(apiViolation).toHaveLength(1);

    const placeholderViolation = scanContentBodyForPlaceholders("content/test.mdx", "Cek TBD_M1");
    expect(placeholderViolation).toHaveLength(1);
  });

  it("blocks MDX JSX/HTML XSS payloads, ESM imports, and adds accessible region attrs to KaTeX display math", async () => {
    const SafeMdx = await compileMdxContent(
      "Rumus:\n\n$$\nP_{\\text{rx}} = P_{\\text{tx}} - L\n$$\n\n[Rujukan](https://www.itu.int/)"
    );
    const rendered = renderToStaticMarkup(createElement(SafeMdx));
    expect(rendered).toContain('tabindex="0"');
    expect(rendered).toContain('role="region"');
    expect(rendered).toContain('aria-label="Persamaan matematika 1"');
    expect(rendered).toContain('rel="noopener noreferrer"');

    await expect(compileMdxContent("<script>alert(1)</script>")).rejects.toThrow();
    await expect(compileMdxContent('<iframe src="https://evil.example" />')).rejects.toThrow();
    await expect(compileMdxContent('<a href="java\tscript:alert(1)">bad</a>')).rejects.toThrow();
    await expect(
      compileMdxContent('[bad](data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>)')
    ).rejects.toThrow();
    await expect(compileMdxContent('<button onClick="alert(1)">bad</button>')).rejects.toThrow();
    await expect(compileMdxContent('import fs from "node:fs";\n\nhi')).rejects.toThrow();
    await expect(compileMdxContent("Nilai: {(() => 1 + 1)()}")).rejects.toThrow();
    await expect(compileMdxContent('<div title={"x" + "y"} />')).rejects.toThrow();
    await expect(
      compileMdxContent('<div dangerouslySetInnerHTML={{ __html: "<b>x</b>" }} />')
    ).rejects.toThrow();
  });

  it("normalizes nested Windows RSC segment files with overwrite and rejects unknown inline scripts", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "sedp-rsc-test-"));
    try {
      const nestedDir = join(tempDir, "kurikulum", "__next.kurikulum", "$d$moduleSlug");
      mkdirSync(nestedDir, { recursive: true });
      writeFileSync(join(nestedDir, "__PAGE__.txt"), "FRESH_RSC_PAYLOAD", "utf8");
      writeFileSync(
        join(tempDir, "kurikulum", "__next.kurikulum.$d$moduleSlug.__PAGE__.txt"),
        "STALE_RSC_PAYLOAD",
        "utf8"
      );

      const writtenCount = normalizeWindowsRscSegmentFiles(tempDir);
      expect(writtenCount).toBe(1);
      expect(
        readFileSync(
          join(tempDir, "kurikulum", "__next.kurikulum.$d$moduleSlug.__PAGE__.txt"),
          "utf8"
        )
      ).toBe("FRESH_RSC_PAYLOAD");

      expect(isExpectedInlineScript('$RC("B:1","S:1")')).toBe(true);
      expect(isExpectedInlineScript("alert(1)")).toBe(false);
      expect(() =>
        extractInlineScriptHashes('<html><script>alert("xss")</script></html>', "/")
      ).toThrow(/Unexpected inline <script>/);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
