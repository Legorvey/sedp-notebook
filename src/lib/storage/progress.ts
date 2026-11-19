import { useSyncExternalStore } from "react";

export const PROGRESS_STORAGE_KEY = "sedp.progress.v1";

export type LessonProgressStatus = "STARTED" | "COMPLETED";

export interface QuizProgressEntry {
  score: number;
  total: number;
  updatedAt: string;
}

export interface LocalProgress {
  version: 1;
  lessons: Record<string, LessonProgressStatus>;
  quizzes: Record<string, QuizProgressEntry>;
}

const RESERVED_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseLocalProgress(raw: unknown): LocalProgress | null {
  if (!isPlainRecord(raw)) {
    return null;
  }
  const allowedTop = new Set(["version", "lessons", "quizzes"]);
  for (const key of Object.keys(raw)) {
    if (!allowedTop.has(key)) {
      return null;
    }
  }
  if (raw.version !== 1 || !isPlainRecord(raw.lessons) || !isPlainRecord(raw.quizzes)) {
    return null;
  }

  const lessons: Record<string, LessonProgressStatus> = {};
  for (const [lessonId, status] of Object.entries(raw.lessons)) {
    if (RESERVED_KEYS.has(lessonId) || (status !== "STARTED" && status !== "COMPLETED")) {
      return null;
    }
    lessons[lessonId] = status;
  }

  const quizzes: Record<string, QuizProgressEntry> = {};
  for (const [quizId, entry] of Object.entries(raw.quizzes)) {
    if (RESERVED_KEYS.has(quizId) || !isPlainRecord(entry)) {
      return null;
    }
    for (const k of Object.keys(entry)) {
      if (k !== "score" && k !== "total" && k !== "updatedAt") {
        return null;
      }
    }
    if (
      typeof entry.score !== "number" ||
      !Number.isInteger(entry.score) ||
      entry.score < 0 ||
      typeof entry.total !== "number" ||
      !Number.isInteger(entry.total) ||
      entry.total <= 0 ||
      typeof entry.updatedAt !== "string" ||
      entry.updatedAt.length === 0
    ) {
      return null;
    }
    quizzes[quizId] = {
      score: entry.score,
      total: entry.total,
      updatedAt: entry.updatedAt,
    };
  }

  return { version: 1, lessons, quizzes };
}

const EMPTY_PROGRESS: LocalProgress = {
  version: 1,
  lessons: {},
  quizzes: {},
};

let memoryFallbackProgress: LocalProgress = EMPTY_PROGRESS;
let cachedRawJson: string | null = null;
let cachedSnapshot: LocalProgress = EMPTY_PROGRESS;
let storageWriteFailed = false;

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
      if (storageWriteFailed) {
        return memoryFallbackProgress;
      }
      memoryFallbackProgress = EMPTY_PROGRESS;
      cachedSnapshot = EMPTY_PROGRESS;
      return cachedSnapshot;
    }
    if (raw === cachedRawJson) {
      return cachedSnapshot;
    }
    const parsed = parseLocalProgress(JSON.parse(raw));
    if (!parsed) {
      cachedRawJson = raw;
      cachedSnapshot = EMPTY_PROGRESS;
      return cachedSnapshot;
    }
    cachedRawJson = raw;
    cachedSnapshot = parsed;
    memoryFallbackProgress = parsed;
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
      storageWriteFailed = false;
      cachedRawJson = serialized;
      cachedSnapshot = next;
    } catch {
      storageAvailable = false;
      storageWriteFailed = true;
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
  storageWriteFailed = false;
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
