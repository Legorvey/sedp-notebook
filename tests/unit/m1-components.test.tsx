import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FactCheckTable } from "@/components/about/fact-check-table";
import { ResetProgressButton } from "@/components/about/reset-progress-button";
import { LessonProgressControl } from "@/components/curriculum/lesson-progress-control";
import { SequenceCurriculumList } from "@/components/curriculum/sequence-curriculum-list";
import { SiteHeader } from "@/components/layout/site-header";
import type {
  FactCheckRecord,
  GlossaryEntry,
  ModuleManifest,
  QuizFile,
} from "@/lib/content/schemas";
import { QuizRunner } from "@/features/practice/components/quiz-runner";
import { GlossaryExplorer } from "@/features/reference/components/glossary-explorer";
import { SystemExplorerLab } from "@/features/simulators/components/system-explorer-lab";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

const SAMPLE_QUIZ: QuizFile = {
  quiz_id: "quiz-1.3-01-arch",
  lesson_id: "1.3-01",
  title_id: "Uji Pemahaman Sampel",
  rights_status: "CLEARED",
  public_reuse_allowed: true,
  origin: "clean-room-original",
  source_refs: [{ source_id: "src-itu-g971", scope: "Test" }],
  questions: [
    {
      question_id: "q1",
      prompt_id: "Pertanyaan satu?",
      options: [
        { id: "a", text_id: "Opsi A" },
        { id: "b", text_id: "Opsi B" },
      ],
      correct_option_id: "a",
      explanation_id: "Penjelasan A.",
      lesson_section_anchor: "#intuisi-utama",
    },
    {
      question_id: "q2",
      prompt_id: "Pertanyaan dua?",
      options: [
        { id: "a", text_id: "Opsi 2A" },
        { id: "b", text_id: "Opsi 2B" },
      ],
      correct_option_id: "b",
      explanation_id: "Penjelasan 2B.",
      lesson_section_anchor: "#sistem-repeaterless-vs-repeatered",
    },
  ],
};

const SAMPLE_GLOSSARY: GlossaryEntry[] = [
  {
    glossary_id: "gls-bmh",
    term_en: "Beach Manhole",
    abbr: "BMH",
    term_id: "Sumur Transisi Pantai",
    aliases: ["bmh", "manhole pantai"],
    category: "infrastruktur-darat",
    definition_id: "Ruang beton bawah tanah dekat pantai.",
    related_lesson_ids: ["1.3-01"],
    rights_status: "CLEARED",
    public_reuse_allowed: true,
    source_refs: [{ source_id: "src-itu-g972", scope: "Definisi" }],
  },
];

const SAMPLE_FACT_CHECKS: FactCheckRecord[] = [
  {
    fact_check_id: "fc-armour-depths",
    lesson_id: "1.3-01",
    primary_source_id: null,
    claim_text_id: "Ambang kedalaman pelindung.",
    fact_check_status: "UNVERIFIED",
    verification_notes_id: "Memakai kategori kualitatif.",
    checked_at: null,
  },
];

describe("M1 interactive client islands", () => {
  it("switches SystemExplorerLab modes, turns off DC PFE in ROPA, and keeps table synchronized", () => {
    render(<SystemExplorerLab />);

    expect(screen.getByRole("img")).toBeInTheDocument();
    expect(screen.getByTestId("explorer-inspector")).toHaveTextContent("Repeater: Repeater EDFA");

    fireEvent.click(screen.getByRole("button", { name: "Repeaterless ROPA" }));

    const inspector = screen.getByTestId("explorer-inspector");
    expect(inspector).toHaveTextContent("ROPA: Remote Optically Pumped Amplifier");
    expect(screen.getByText(/Jalur Daya DC PFE: Nonaktif \(0 V\)/i)).toBeInTheDocument();

    const table = screen.getByRole("table");
    const pfeRow = within(table).getByText("PFE").closest("tr");
    expect(pfeRow).toHaveTextContent("Tidak aktif pada mode repeaterless (0 V daya DC PFE).");

    fireEvent.click(screen.getByRole("button", { name: /Atur Ulang Parameter/i }));
    expect(screen.getByTestId("explorer-inspector")).toHaveTextContent("Repeater: Repeater EDFA");
  });

  it("validates unanswered questions, focuses first missing radio, and scores QuizRunner", () => {
    render(
      <QuizRunner
        quiz={SAMPLE_QUIZ}
        lessonHref="/kurikulum/1-3-arsitektur-sistem/arsitektur-ujung-ke-ujung/"
        lessonTitle="Arsitektur Ujung-ke-Ujung"
      />
    );

    fireEvent.click(screen.getByLabelText(/a\. Opsi A/i));
    fireEvent.click(screen.getByRole("button", { name: "Periksa Jawaban" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Pilih satu jawaban pada soal nomor 2.");
    expect(document.activeElement).toBe(screen.getByLabelText(/a\. Opsi 2A/i));

    fireEvent.click(screen.getByLabelText(/b\. Opsi 2B/i));
    fireEvent.click(screen.getByRole("button", { name: "Periksa Jawaban" }));

    expect(screen.getByText(/Skor Anda: 2 dari 2 benar \(100%\)/i)).toBeInTheDocument();
  });

  it("filters GlossaryExplorer and FactCheckTable with explicit empty recovery", () => {
    render(<GlossaryExplorer entries={SAMPLE_GLOSSARY} />);
    const input = screen.getByLabelText(/Cari istilah Inggris atau Indonesia/i);
    fireEvent.change(input, { target: { value: "zzzz" } });

    expect(screen.getByRole("status")).toHaveTextContent(/Tidak ada istilah cocok/i);
    fireEvent.click(screen.getByRole("button", { name: "Hapus Filter" }));
    expect(screen.getByText(/BMH: Beach Manhole/i)).toBeInTheDocument();

    render(<FactCheckTable records={SAMPLE_FACT_CHECKS} />);
    fireEvent.click(screen.getByRole("button", { name: "Terverifikasi" }));
    expect(screen.getByText(/Tidak ada catatan verifikasi fakta/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tampilkan Semua Status" }));
    expect(screen.getByText("fc-armour-depths")).toBeInTheDocument();
  });

  it("supports Escape focus return on SiteHeader, dual curriculum order, and lesson progress reset", () => {
    render(<SiteHeader />);
    const menuBtn = screen.getByRole("button", { name: /Buka menu navigasi/i });
    fireEvent.click(menuBtn);
    expect(menuBtn).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(menuBtn).toHaveAttribute("aria-expanded", "false");

    const mods: ModuleManifest[] = [
      {
        module_code: "1.4",
        module_slug: "1-4-bisnis-konektivitas",
        title_id: "Bisnis Konektivitas",
        summary_id: "Ringkasan 1.4",
        canonical_order: 4,
        delivery_order: 5,
        teaching_window_id: "Belum Diajarkan",
        coverage_status: "UNAVAILABLE",
        availability_badge_id: "Belum Tersedia",
        unavailable_reason_id: "Belum tersedia",
      },
      {
        module_code: "1.5",
        module_slug: "1-5-siklus-survei-laut",
        title_id: "Siklus Survei",
        summary_id: "Ringkasan 1.5",
        canonical_order: 5,
        delivery_order: 4,
        teaching_window_id: "Hari 3",
        coverage_status: "PARTIAL",
        availability_badge_id: "Sebagian",
        unavailable_reason_id: "Menunggu audit",
      },
    ];

    render(<SequenceCurriculumList modules={mods} lessons={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /Urutan Hari/i }));
    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(headings[0]).toBe("Siklus Survei");

    render(
      <div>
        <LessonProgressControl lessonId="1.3-01" />
        <ResetProgressButton />
      </div>
    );
    fireEvent.click(screen.getByRole("button", { name: "Tandai Selesai" }));
    expect(screen.getByText("Selesai Dibaca")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reset Progres Lokal" }));
    expect(screen.getByText(/Belum ada riwayat latihan tersimpan/i)).toBeInTheDocument();
  });
});
