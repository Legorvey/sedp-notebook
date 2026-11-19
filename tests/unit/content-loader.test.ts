import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  getLessonByRoute,
  getQuizById,
  loadFactChecks,
  loadGlossary,
  loadLessons,
  loadModules,
  loadPublicSources,
} from "@/lib/content/loader";
import { compileMdxContent, extractLessonHeadings } from "@/lib/content/mdx";

describe("M1 vertical slice content pipeline and provenance", () => {
  it("loads all 5 module manifests with honest 1.4 UNAVAILABLE and 1.5 PARTIAL status", () => {
    const modules = loadModules();
    expect(modules).toHaveLength(5);

    const mod14 = modules.find((m) => m.module_code === "1.4");
    const mod15 = modules.find((m) => m.module_code === "1.5");
    expect(mod14?.coverage_status).toBe("UNAVAILABLE");
    expect(mod15?.coverage_status).toBe("PARTIAL");
    expect(mod15?.delivery_order).toBeLessThan(mod14!.delivery_order);
  });

  it("loads CLEARED public sources, 8 glossary terms, and 12 audited fact-check entries", () => {
    const sources = loadPublicSources();
    expect(sources.length).toBeGreaterThanOrEqual(7);
    for (const src of sources) {
      expect(src.rights_status).toBe("CLEARED");
      expect(src.public_reuse_allowed).toBe(true);
      expect(src.media_redistribution_allowed).toBe(false);
    }

    const glossary = loadGlossary();
    expect(glossary).toHaveLength(8);
    expect(glossary.map((g) => g.glossary_id).sort()).toEqual([
      "gls-bmh",
      "gls-bu",
      "gls-cls",
      "gls-edfa",
      "gls-pfe",
      "gls-pop",
      "gls-ropa",
      "gls-slte",
    ]);

    const factChecks = loadFactChecks();
    expect(factChecks).toHaveLength(12);
    for (const fc of factChecks) {
      expect(["UNVERIFIED", "DISPUTED"]).toContain(fc.fact_check_status);
      expect(fc.primary_source_id).toBeNull();
      expect(fc.checked_at).toBeNull();
    }
  });

  it("compiles real MDX Lesson 1.3-01 with KaTeX, GFM table, heading IDs, and quiz anchor parity", async () => {
    const lessons = loadLessons();
    expect(lessons).toHaveLength(1);

    const lesson = getLessonByRoute("1-3-arsitektur-sistem", "arsitektur-ujung-ke-ujung");
    expect(lesson).toBeDefined();
    expect(lesson!.frontmatter.lesson_id).toBe("1.3-01");
    expect(lesson!.frontmatter.related_labs).toEqual(["eksplorer-sistem"]);

    const headings = extractLessonHeadings(lesson!.body);
    const headingIds = new Set(headings.map((h) => h.id));
    expect(headingIds.has("intuisi-utama")).toBe(true);
    expect(headingIds.has("diagram-arsitektur-ujung-ke-ujung")).toBe(true);
    expect(headingIds.has("pendalaman-jalur-optik-vs-listrik")).toBe(true);
    expect(headingIds.has("sistem-repeaterless-vs-repeatered")).toBe(true);
    expect(headingIds.has("kasus-konteks-indonesia")).toBe(true);
    expect(headingIds.has("uji-pemahaman")).toBe(true);

    const quiz = getQuizById("quiz-1.3-01-arch");
    expect(quiz).toBeDefined();
    expect(quiz!.questions).toHaveLength(5);
    for (const q of quiz!.questions) {
      expect(headingIds.has(q.lesson_section_anchor.slice(1))).toBe(true);
    }

    const MdxComponent = await compileMdxContent(lesson!.body);
    const html = renderToStaticMarkup(
      createElement(MdxComponent, {
        components: {
          SystemExplorerBay: () =>
            createElement("div", { "data-testid": "explorer-stub" }, "Explorer"),
        },
      })
    );

    expect(html).toContain('id="intuisi-utama"');
    expect(html).toContain('id="sistem-repeaterless-vs-repeatered"');
    expect(html).toContain("<table>");
    expect(html).toContain('class="katex-display"');
    expect(html).toContain('data-testid="explorer-stub"');
  });
});
