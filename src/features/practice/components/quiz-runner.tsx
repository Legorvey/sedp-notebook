"use client";

import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { evaluateQuizSubmission, type QuizEvaluationResult } from "@/features/practice/quiz-engine";
import type { QuizFile } from "@/lib/content/schemas";
import { saveQuizProgress } from "@/lib/storage/progress";
import { cn } from "@/lib/utils";

interface QuizRunnerProps {
  quiz: QuizFile;
  lessonHref: string;
  lessonTitle: string;
}

export function QuizRunner({ quiz, lessonHref, lessonTitle }: QuizRunnerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [missingQuestionId, setMissingQuestionId] = useState<string | null>(null);
  const [liveStatusMessage, setLiveStatusMessage] = useState<string>("");
  const [evaluation, setEvaluation] = useState<Extract<
    QuizEvaluationResult,
    { valid: true }
  > | null>(null);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const firstOptionRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function handleOptionChange(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    if (validationError && (missingQuestionId === null || missingQuestionId === questionId)) {
      setValidationError(null);
      setMissingQuestionId(null);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = evaluateQuizSubmission(quiz, answers);
    if (!result.valid) {
      setValidationError(result.errorMessageId);
      setMissingQuestionId(result.firstMissingQuestionId);
      setEvaluation(null);
      const missingInput = firstOptionRefs.current[result.firstMissingQuestionId];
      missingInput?.focus();
      return;
    }

    setValidationError(null);
    setMissingQuestionId(null);
    setEvaluation(result);
    setLiveStatusMessage(
      `Evaluasi selesai: skor Anda ${result.score} dari ${result.total} benar (${result.percentage}%).`
    );
    const saved = saveQuizProgress(quiz.quiz_id, result.score, result.total);
    if (!saved.storageAvailable) {
      setStorageWarning(
        "Penyimpanan lokal peramban tidak aktif. Skor latihan tetap dihitung untuk sesi tab ini saja."
      );
    } else {
      setStorageWarning(null);
    }
  }

  function handleReset() {
    setAnswers({});
    setValidationError(null);
    setMissingQuestionId(null);
    setEvaluation(null);
    setStorageWarning(null);
    setLiveStatusMessage("Jawaban latihan diatur ulang.");
  }

  return (
    <div className="space-y-6">
      {validationError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-md border border-sedp-fault bg-sedp-inset p-4 text-sm text-sedp-ink"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-sedp-fault" aria-hidden="true" />
          <div>
            <p className="font-semibold text-sedp-fault">Jawaban belum lengkap</p>
            <p className="mt-0.5 text-sedp-ink">{validationError}</p>
          </div>
        </div>
      )}

      {storageWarning && (
        <div
          role="status"
          className="rounded-md border border-sedp-partial bg-sedp-inset p-4 text-sm text-sedp-ink"
        >
          <p className="font-semibold text-sedp-partial">Catatan penyimpanan lokal</p>
          <p className="mt-1 text-sedp-muted">{storageWarning}</p>
        </div>
      )}

      {evaluation && (
        <section
          aria-live="polite"
          aria-label="Hasil evaluasi latihan"
          className="rounded-[10px] border border-sedp-control-border bg-sedp-surface p-5 sm:p-6"
        >
          <p className="font-mono text-xs font-semibold text-sedp-accent">Hasil Latihan</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-sedp-ink">
            Skor Anda: {evaluation.score} dari {evaluation.total} benar ({evaluation.percentage}%)
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-sedp-muted">
            Tinjau penjelasan setiap butir soal di bawah ini beserta tautan langsung ke bagian
            materi pada pelajaran <span className="font-semibold text-sedp-ink">{lessonTitle}</span>
            .
          </p>
        </section>
      )}

      <p aria-live="polite" className="sr-only">
        {liveStatusMessage}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {quiz.questions.map((question, qIndex) => {
          const selectedOptionId = answers[question.question_id];
          const questionEval = evaluation?.results.find(
            (item) => item.questionId === question.question_id
          );
          const isUnansweredError =
            validationError !== null &&
            !selectedOptionId &&
            missingQuestionId === question.question_id;
          const questionErrorId = `${question.question_id}-error`;

          return (
            <fieldset
              key={question.question_id}
              aria-invalid={isUnansweredError ? true : undefined}
              aria-describedby={isUnansweredError ? questionErrorId : undefined}
              className={cn(
                "rounded-[10px] border bg-sedp-surface p-5 sm:p-6",
                isUnansweredError ? "border-sedp-fault" : "border-sedp-subtle-border"
              )}
            >
              <legend className="px-1 font-display text-lg font-semibold leading-snug text-sedp-ink">
                <span className="mr-2 font-mono text-xs font-semibold text-sedp-accent">
                  Soal {qIndex + 1} dari {quiz.questions.length}:
                </span>
                {question.prompt_id}
              </legend>

              {isUnansweredError && (
                <p id={questionErrorId} className="mt-2 text-xs font-semibold text-sedp-fault">
                  Pilih salah satu jawaban untuk Soal {qIndex + 1} sebelum memeriksa jawaban.
                </p>
              )}

              <div className="mt-4 space-y-2.5">
                {question.options.map((option, optIndex) => {
                  const checked = selectedOptionId === option.id;
                  const inputId = `${question.question_id}-${option.id}`;
                  const isCorrectOption =
                    questionEval && questionEval.correctOptionId === option.id;
                  const isWrongSelected = questionEval && checked && !questionEval.isCorrect;

                  return (
                    <label
                      key={option.id}
                      htmlFor={inputId}
                      className={cn(
                        "flex min-h-[44px] items-start gap-3 rounded-md border p-3.5 text-sm leading-relaxed transition-colors",
                        checked
                          ? "border-sedp-accent bg-sedp-inset text-sedp-ink"
                          : "border-sedp-control-border bg-sedp-canvas text-sedp-ink hover:bg-sedp-inset",
                        isCorrectOption && "border-sedp-verified",
                        isWrongSelected && "border-sedp-fault"
                      )}
                    >
                      <input
                        ref={(el) => {
                          if (optIndex === 0) {
                            firstOptionRefs.current[question.question_id] = el;
                          }
                        }}
                        id={inputId}
                        type="radio"
                        name={question.question_id}
                        value={option.id}
                        checked={checked}
                        onChange={() => handleOptionChange(question.question_id, option.id)}
                        className="mt-1 size-4 shrink-0 accent-[var(--sedp-accent)]"
                      />
                      <span>
                        <strong className="font-mono uppercase">{option.id}.</strong>{" "}
                        {option.text_id}
                      </span>
                    </label>
                  );
                })}
              </div>

              {questionEval && (
                <div
                  className={cn(
                    "mt-4 rounded-md border p-4 text-sm leading-relaxed",
                    questionEval.isCorrect
                      ? "border-sedp-verified bg-sedp-inset text-sedp-ink"
                      : "border-sedp-fault bg-sedp-inset text-sedp-ink"
                  )}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {questionEval.isCorrect ? (
                      <>
                        <CheckCircle2
                          className="size-4 shrink-0 text-sedp-verified"
                          aria-hidden="true"
                        />
                        <span className="text-sedp-verified">Jawaban Benar</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle
                          className="size-4 shrink-0 text-sedp-fault"
                          aria-hidden="true"
                        />
                        <span className="text-sedp-fault">
                          Perlu Tinjauan (Kunci: {questionEval.correctOptionId.toUpperCase()})
                        </span>
                      </>
                    )}
                  </div>
                  <p className="mt-2 text-sedp-ink">{questionEval.explanationId}</p>
                  <p className="mt-2.5">
                    <Link
                      href={`${lessonHref}${questionEval.lessonSectionAnchor}`}
                      className="inline-flex min-h-[44px] items-center font-semibold text-sedp-accent underline underline-offset-4 hover:opacity-90"
                    >
                      Tinjau Bagian Materi Terkait ({questionEval.lessonSectionAnchor})
                    </Link>
                  </p>
                </div>
              )}
            </fieldset>
          );
        })}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="lg">
            Periksa Jawaban
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={handleReset}>
            Ulangi Latihan
          </Button>
        </div>
      </form>
    </div>
  );
}
