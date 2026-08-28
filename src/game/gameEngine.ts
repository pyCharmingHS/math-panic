import type { AnswerFeedback, GameConfig, GamePhase, GameStats, Question } from "../types/game";
import { createRng, randomSeed, type Rng } from "./random/prng";
import { generateQuestion } from "./questions/generateQuestion";
import { levelFromScore, nextDifficultyScore } from "./difficulty/difficultyEngine";
import { computePoints } from "./scoring/scoring";

export interface EngineState {
  phase: GamePhase;
  config: GameConfig;
  rng: Rng;
  difficultyScore: number;
  question: Question | null;
  questionStartedAt: number | null;
  startedAt: number | null;
  totalResponseTimeMs: number;
  stats: GameStats;
  feedback: AnswerFeedback | null;
  feedbackSeq: number;
}

function emptyStats(): GameStats {
  return {
    score: 0,
    correct: 0,
    incorrect: 0,
    totalQuestions: 0,
    streak: 0,
    bestStreak: 0,
    averageResponseTime: 0,
    highestDifficulty: 0,
  };
}

export function createDefaultConfig(overrides: Partial<GameConfig> = {}): GameConfig {
  return {
    version: 1,
    duration: 60,
    startingDifficulty: 1,
    seed: randomSeed(),
    ...overrides,
  };
}

export function createInitialState(config: GameConfig): EngineState {
  return {
    phase: "IDLE",
    config,
    rng: createRng(config.seed),
    difficultyScore: config.startingDifficulty,
    question: null,
    questionStartedAt: null,
    startedAt: null,
    totalResponseTimeMs: 0,
    stats: emptyStats(),
    feedback: null,
    feedbackSeq: 0,
  };
}

export function beginCountdown(state: EngineState): EngineState {
  if (state.phase !== "IDLE") return state;
  return { ...state, phase: "COUNTDOWN" };
}

export function beginPlaying(state: EngineState, now: number): EngineState {
  if (state.phase !== "COUNTDOWN") return state;
  const question = generateQuestion(levelFromScore(state.difficultyScore), state.rng);
  return { ...state, phase: "PLAYING", question, questionStartedAt: now, startedAt: now };
}

export function tick(state: EngineState, now: number): EngineState {
  if (state.phase !== "PLAYING" || state.startedAt === null) return state;
  const elapsedMs = now - state.startedAt;
  if (elapsedMs >= state.config.duration * 1000) {
    return { ...state, phase: "FINISHED", question: null };
  }
  return state;
}

export function submitAnswer(state: EngineState, selectedIndex: number, now: number): EngineState {
  if (state.phase !== "PLAYING" || !state.question || state.questionStartedAt === null) return state;

  const { question } = state;
  const correctIndex = question.options.indexOf(question.correctAnswer);
  const wasCorrect = selectedIndex === correctIndex;
  const responseTimeMs = Math.max(0, now - state.questionStartedAt);

  const newStreak = wasCorrect ? state.stats.streak + 1 : 0;
  const points = wasCorrect ? computePoints(question.difficulty, responseTimeMs, newStreak) : 0;

  const totalQuestions = state.stats.totalQuestions + 1;
  const totalResponseTimeMs = state.totalResponseTimeMs + responseTimeMs;

  const nextStats: GameStats = {
    score: state.stats.score + points,
    correct: state.stats.correct + (wasCorrect ? 1 : 0),
    incorrect: state.stats.incorrect + (wasCorrect ? 0 : 1),
    totalQuestions,
    streak: newStreak,
    bestStreak: Math.max(state.stats.bestStreak, newStreak),
    averageResponseTime: Math.round(totalResponseTimeMs / totalQuestions),
    highestDifficulty: Math.max(state.stats.highestDifficulty, question.difficulty),
  };

  const nextDifficultyScoreValue = nextDifficultyScore(state.difficultyScore, wasCorrect, responseTimeMs);
  const nextQuestion = generateQuestion(levelFromScore(nextDifficultyScoreValue), state.rng);

  const feedback: AnswerFeedback = {
    kind: wasCorrect ? "correct" : "incorrect",
    pointsAwarded: points,
    selectedIndex,
    correctIndex,
    key: state.feedbackSeq + 1,
  };

  return {
    ...state,
    difficultyScore: nextDifficultyScoreValue,
    question: nextQuestion,
    questionStartedAt: now,
    totalResponseTimeMs,
    stats: nextStats,
    feedback,
    feedbackSeq: state.feedbackSeq + 1,
  };
}

export function restart(config: GameConfig): EngineState {
  return createInitialState(config);
}
