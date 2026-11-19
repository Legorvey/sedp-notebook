import { afterEach, describe, expect, it, vi } from "vitest";
import { loadGlossary, loadQuizzes } from "@/lib/content/loader";
import {
  markLessonProgress,
  PROGRESS_STORAGE_KEY,
  readLocalProgress,
  resetLocalProgress,
  saveQuizProgress,
} from "@/lib/storage/progress";
import { evaluateQuizSubmission } from "@/features/practice/quiz-engine";
import {
  filterGlossaryEntries,
  getGlossaryCategoryLabel,
} from "@/features/reference/glossary-filter";
import {
  getDefaultNodeForMode,
  getExplorerSummaryRows,
  getModeSpec,
} from "@/features/simulators/engine/system-explorer";

afterEach(() => {
  window.localStorage.clear();
  resetLocalProgress();
  vi.restoreAllMocks();
});

describe("M1 pure domain engines & local progress store", () => {
  it("models repeatered vs repeaterless DC PFE path and keeps SVG/table rows synchronized", () => {
    const rep = getModeSpec("repeatered");
    const open = getModeSpec("repeatered-open");
    const rlessEdfa = getModeSpec("repeaterless-edfa");
    const rlessRopa = getModeSpec("repeaterless-ropa");

    expect(rep.dcPfeActive).toBe(true);
    expect(rep.seaEarthActive).toBe(true);
    expect(open.openCableDisaggregated).toBe(true);
    expect(open.dcPfeActive).toBe(true);
    expect(rlessEdfa.dcPfeActive).toBe(false);
    expect(rlessRopa.dcPfeActive).toBe(false);
    expect(rlessRopa.seaEarthActive).toBe(false);

    expect(getDefaultNodeForMode("repeaterless-ropa")).toBe("ropa");
    expect(getDefaultNodeForMode("repeatered")).toBe("repeater");

    const rowsRopa = getExplorerSummaryRows("repeaterless-ropa", "pesisir-dangkal-buried");
    expect(rowsRopa).toHaveLength(9);
    const pfeRow = rowsRopa.find((r) => r.nodeId === "pfe");
    const clsRowRopa = rowsRopa.find((r) => r.nodeId === "cls");
    const ropaRow = rowsRopa.find((r) => r.nodeId === "ropa");
    const shoreRow = rowsRopa.find((r) => r.nodeId === "shore");
    expect(pfeRow?.isActiveInMode).toBe(false);
    expect(pfeRow?.electricalFunctionId).toContain("0 V daya DC PFE");
    expect(clsRowRopa?.electricalFunctionId).toContain("Tidak ada pemisahan daya DC PFE");
    expect(ropaRow?.isActiveInMode).toBe(true);
    expect(shoreRow?.componentLabelId).toContain("Double Armour");

    const rowsOpen = getExplorerSummaryRows("repeatered-open", "transisi-paparan-kontinental");
    expect(rowsOpen.find((r) => r.nodeId === "shore")?.componentLabelId).toContain("Single Armour");
    const rowsEdfa = getExplorerSummaryRows("repeaterless-edfa", "laut-dalam-stabil");
    expect(rowsEdfa.find((r) => r.nodeId === "shore")?.componentLabelId).toContain("Light Weight");
    expect(rowsEdfa.find((r) => r.nodeId === "bu")?.isActiveInMode).toBe(false);
  });

  it("validates unanswered questions and grades all 5 quiz questions accurately", () => {
    const [quiz] = loadQuizzes();
    expect(quiz).toBeDefined();

    const incomplete = evaluateQuizSubmission(quiz, {
      "q-1.3-01-01": "a",
    });
    expect(incomplete.valid).toBe(false);
    if (!incomplete.valid) {
      expect(incomplete.firstMissingQuestionNumber).toBe(2);
      expect(incomplete.firstMissingQuestionId).toBe("q-1.3-01-02");
      expect(incomplete.errorMessageId).toContain("nomor 2");
    }

    const allCorrectAnswers = Object.fromEntries(
      quiz.questions.map((q) => [q.question_id, q.correct_option_id])
    );
    const graded = evaluateQuizSubmission(quiz, allCorrectAnswers);
    expect(graded.valid).toBe(true);
    if (graded.valid) {
      expect(graded.score).toBe(5);
      expect(graded.total).toBe(5);
      expect(graded.percentage).toBe(100);
    }
  });

  it("filters glossary entries by Indonesian/English aliases and category", () => {
    const glossary = loadGlossary();
    expect(getGlossaryCategoryLabel("wet-plant")).toContain("Wet Plant");

    const beachMatches = filterGlossaryEntries(glossary, "manhole pantai", "all");
    expect(beachMatches.map((g) => g.glossary_id)).toEqual(["gls-bmh"]);

    const ropaMatches = filterGlossaryEntries(glossary, "remote optically pumped", "wet-plant");
    expect(ropaMatches.map((g) => g.glossary_id)).toEqual(["gls-ropa"]);

    const emptyMatches = filterGlossaryEntries(glossary, "istilah-tidak-ada", "all");
    expect(emptyMatches).toEqual([]);
  });

  it("persists and resets anonymous local progress safely even when localStorage throws", () => {
    const r1 = markLessonProgress("1.3-01", "STARTED");
    expect(r1.storageAvailable).toBe(true);
    expect(readLocalProgress().lessons["1.3-01"]).toBe("STARTED");

    saveQuizProgress("quiz-1.3-01-arch", 4, 5);
    expect(readLocalProgress().quizzes["quiz-1.3-01-arch"]?.score).toBe(4);
    expect(window.localStorage.getItem(PROGRESS_STORAGE_KEY)).toContain("1.3-01");

    resetLocalProgress();
    expect(readLocalProgress().lessons).toEqual({});
    expect(readLocalProgress().quizzes).toEqual({});

    window.localStorage.setItem(PROGRESS_STORAGE_KEY, "{corrupt-json");
    expect(readLocalProgress()).toEqual({ version: 1, lessons: {}, quizzes: {} });
    window.localStorage.removeItem(PROGRESS_STORAGE_KEY);
    expect(readLocalProgress()).toEqual({ version: 1, lessons: {}, quizzes: {} });

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    const fallback = saveQuizProgress("quiz-1.3-01-arch", 5, 5);
    expect(fallback.storageAvailable).toBe(false);
    expect(readLocalProgress().quizzes["quiz-1.3-01-arch"]?.score).toBe(5);
  });
});
