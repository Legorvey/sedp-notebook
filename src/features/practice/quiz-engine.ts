import type { QuizFile } from "@/lib/content/schemas";

export interface QuestionEvaluation {
  questionId: string;
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
  explanationId: string;
  lessonSectionAnchor: string;
}

export type QuizEvaluationResult =
  | {
      valid: false;
      firstMissingQuestionNumber: number;
      firstMissingQuestionId: string;
      errorMessageId: string;
    }
  | {
      valid: true;
      score: number;
      total: number;
      percentage: number;
      results: QuestionEvaluation[];
    };

export function evaluateQuizSubmission(
  quiz: QuizFile,
  answers: Record<string, string | undefined>
): QuizEvaluationResult {
  for (let index = 0; index < quiz.questions.length; index += 1) {
    const q = quiz.questions[index];
    const selected = answers[q.question_id];
    if (!selected) {
      return {
        valid: false,
        firstMissingQuestionNumber: index + 1,
        firstMissingQuestionId: q.question_id,
        errorMessageId: `Pilih satu jawaban pada soal nomor ${index + 1}.`,
      };
    }
  }

  let score = 0;
  const results: QuestionEvaluation[] = quiz.questions.map((q) => {
    const selectedOptionId = answers[q.question_id] ?? "";
    const isCorrect = selectedOptionId === q.correct_option_id;
    if (isCorrect) {
      score += 1;
    }
    return {
      questionId: q.question_id,
      selectedOptionId,
      correctOptionId: q.correct_option_id,
      isCorrect,
      explanationId: q.explanation_id,
      lessonSectionAnchor: q.lesson_section_anchor,
    };
  });

  const total = quiz.questions.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return {
    valid: true,
    score,
    total,
    percentage,
    results,
  };
}
