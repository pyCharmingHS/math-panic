import type { GameStats } from "../types/game";

const STORAGE_KEY = "mathPanic.records.v1";
const MAX_RECENT_SCORES = 10;

export interface StoredSettings {
  reducedMotion: boolean;
}

export interface StoredRecords {
  personalBest: number;
  bestStreak: number;
  recentScores: number[];
  settings: StoredSettings;
}

function defaultRecords(): StoredRecords {
  return { personalBest: 0, bestStreak: 0, recentScores: [], settings: { reducedMotion: false } };
}

export function loadRecords(): StoredRecords {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultRecords();
    const parsed = JSON.parse(raw);
    return { ...defaultRecords(), ...parsed, settings: { ...defaultRecords().settings, ...parsed?.settings } };
  } catch {
    return defaultRecords();
  }
}

function save(records: StoredRecords) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // localStorage unavailable (e.g. private browsing) — records just won't persist.
  }
}

export function recordSessionResult(stats: GameStats): StoredRecords {
  const current = loadRecords();
  const next: StoredRecords = {
    ...current,
    personalBest: Math.max(current.personalBest, stats.score),
    bestStreak: Math.max(current.bestStreak, stats.bestStreak),
    recentScores: [stats.score, ...current.recentScores].slice(0, MAX_RECENT_SCORES),
  };
  save(next);
  return next;
}
