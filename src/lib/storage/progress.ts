import { useSyncExternalStore } from "react";
import { z } from "zod";

export const PROGRESS_STORAGE_KEY = "sedp.progress.v1";

export const LessonProgressStatusSchema = z.enum(["STARTED", "COMPLETED"]);

export const QuizProgressEntrySchema = z
  .object({
    score: z.number().int().nonnegative(),
    total: z.number().int().positive(),
    updatedAt: z.string().min(1),
  })
  .strict();

export const LocalProgressSchema = z
  .object({
    version: z.literal(1),
    lessons: z.record(z.string(), LessonProgressStatusSchema),
    quizzes: z.record(z.string(), QuizProgressEntrySchema),
  })
  .strict();

export type LessonProgressStatus = z.infer<typeof LessonProgressStatusSchema>;
export type QuizProgressEntry = z.infer<typeof QuizProgressEntrySchema>;
export type LocalProgress = z.infer<typeof LocalProgressSchema>;

const EMPTY_PROGRESS: LocalProgress = {
  version: 1,
  lessons: {},
  quizzes: {},
};

let memoryFallbackProgress: LocalProgress = EMPTY_PROGRESS;
let cachedRawJson: string | null = null;
let cachedSnapshot: LocalProgress = EMPTY_PROGRESS;

const progressListeners = new Set<() => void>();

function notifyProgressListeners() {
  for (const listener of progressListeners) {
    listener();
  }
}

export function readLocalProgress(): LocalProgress {
  if (typeof window === "undefined") {
    return EMPTY_PROGRESS;
  }
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) {
      cachedRawJson = null;
      cachedSnapshot = memoryFallbackProgress;
      return cachedSnapshot;
    }
    if (raw === cachedRawJson) {
      return cachedSnapshot;
    }
    const parsed = LocalProgressSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      cachedRawJson = raw;
      cachedSnapshot = EMPTY_PROGRESS;
      return cachedSnapshot;
    }
    cachedRawJson = raw;
    cachedSnapshot = parsed.data;
    memoryFallbackProgress = parsed.data;
    return cachedSnapshot;
  } catch {
    return memoryFallbackProgress;
  }
}

function writeLocalProgress(next: LocalProgress): { storageAvailable: boolean } {
  memoryFallbackProgress = next;
  let storageAvailable = true;
  if (typeof window !== "undefined") {
    try {
      const serialized = JSON.stringify(next);
      window.localStorage.setItem(PROGRESS_STORAGE_KEY, serialized);
      cachedRawJson = serialized;
      cachedSnapshot = next;
    } catch {
      storageAvailable = false;
      cachedRawJson = null;
      cachedSnapshot = next;
    }
  }
  notifyProgressListeners();
  return { storageAvailable };
}

export function markLessonProgress(
  lessonId: string,
  status: LessonProgressStatus
): { storageAvailable: boolean } {
  const current = readLocalProgress();
  return writeLocalProgress({
    version: 1,
    lessons: {
      ...current.lessons,
      [lessonId]: status,
    },
    quizzes: current.quizzes,
  });
}

export function saveQuizProgress(
  quizId: string,
  score: number,
  total: number
): { storageAvailable: boolean } {
  const current = readLocalProgress();
  return writeLocalProgress({
    version: 1,
    lessons: current.lessons,
    quizzes: {
      ...current.quizzes,
      [quizId]: {
        score,
        total,
        updatedAt: new Date().toISOString(),
      },
    },
  });
}

export function resetLocalProgress(): { storageAvailable: boolean } {
  memoryFallbackProgress = EMPTY_PROGRESS;
  cachedRawJson = null;
  cachedSnapshot = EMPTY_PROGRESS;
  let storageAvailable = true;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(PROGRESS_STORAGE_KEY);
    } catch {
      storageAvailable = false;
    }
  }
  notifyProgressListeners();
  return { storageAvailable };
}

function subscribeProgress(listener: () => void) {
  progressListeners.add(listener);
  if (typeof window === "undefined") {
    return () => {
      progressListeners.delete(listener);
    };
  }
  function onStorage(event: StorageEvent) {
    if (event.key === PROGRESS_STORAGE_KEY || event.key === null) {
      cachedRawJson = null;
      listener();
    }
  }
  window.addEventListener("storage", onStorage);
  return () => {
    progressListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getServerProgressSnapshot(): LocalProgress {
  return EMPTY_PROGRESS;
}

export function useLocalProgress(): LocalProgress {
  return useSyncExternalStore(subscribeProgress, readLocalProgress, getServerProgressSnapshot);
}
