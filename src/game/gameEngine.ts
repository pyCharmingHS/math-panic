import type { AnswerFeedback, GameConfig, GamePhase, GameStats, Question } from "../types/game";
import { createRng, randomSeed, type Rng } from "./random/prng";
import { generateQuestion } from "./questions/generateQuestion";
import { levelFromScore, nextDifficultyScore } from "./difficulty/difficultyEngine";
import { computePoints, SCORING_CONFIG, TIME_ECONOMY } from "./scoring/scoring";

export interface EngineState {
  phase: GamePhase;
  config: GameConfig;
  rng: Rng;
  difficultyScore: number;
  question: Question | null;
  questionStartedAt: number | null;
  startedAt: number | null;
  /** Net ms added (correct) or removed (miss) from the base session duration so far. */
  timeAdjustmentMs: number;
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
    timeAdjustmentMs: 0,
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
  const effectiveDurationMs = state.config.duration * 1000 + state.timeAdjustmentMs;
  const elapsedMs = now - state.startedAt;
  if (elapsedMs >= effectiveDurationMs) {
    return { ...state, phase: "FINISHED", question: null };
  }
  return state;
}

export function submitAnswer(state: EngineState, selectedIndex: number, now: number): EngineState {
  if (state.phase !== "PLAYING" || !state.question || state.questionStartedAt === null || state.startedAt === null) {
    return state;
  }

  const { question } = state;
  const correctIndex = question.options.indexOf(question.correctAnswer);
  const wasCorrect = selectedIndex === correctIndex;
  const responseTimeMs = Math.max(0, now - state.questionStartedAt);

  const newStreak = wasCorrect ? state.stats.streak + 1 : 0;
  const pointsDelta = wasCorrect
    ? computePoints(question.difficulty, responseTimeMs, newStreak)
    : -SCORING_CONFIG.missPenalty;
  const timeDeltaMs = wasCorrect ? TIME_ECONOMY.correctBonusMs : -TIME_ECONOMY.incorrectPenaltyMs;

  const totalQuestions = state.stats.totalQuestions + 1;
  const totalResponseTimeMs = state.totalResponseTimeMs + responseTimeMs;

  const nextStats: GameStats = {
    score: Math.max(0, state.stats.score + pointsDelta),
    correct: state.stats.correct + (wasCorrect ? 1 : 0),
    incorrect: state.stats.incorrect + (wasCorrect ? 0 : 1),
    totalQuestions,
    streak: newStreak,
    bestStreak: Math.max(state.stats.bestStreak, newStreak),
    averageResponseTime: Math.round(totalResponseTimeMs / totalQuestions),
    highestDifficulty: Math.max(state.stats.highestDifficulty, question.difficulty),
  };

  const nextDifficultyScoreValue = nextDifficultyScore(state.difficultyScore, wasCorrect, responseTimeMs);
  const timeAdjustmentMs = Math.min(TIME_ECONOMY.maxBonusMs, state.timeAdjustmentMs + timeDeltaMs);

  const feedback: AnswerFeedback = {
    kind: wasCorrect ? "correct" : "incorrect",
    pointsAwarded: pointsDelta,
    timeDeltaMs,
    selectedIndex,
    correctIndex,
    key: state.feedbackSeq + 1,
  };

  // A miss penalty can push the effective deadline behind "now" — end the
  // run immediately instead of dealing a next question into negative time.
  const effectiveDurationMs = state.config.duration * 1000 + timeAdjustmentMs;
  const elapsedMs = now - state.startedAt;
  if (elapsedMs >= effectiveDurationMs) {
    return {
      ...state,
      phase: "FINISHED",
      difficultyScore: nextDifficultyScoreValue,
      question: null,
      timeAdjustmentMs,
      totalResponseTimeMs,
      stats: nextStats,
      feedback,
      feedbackSeq: state.feedbackSeq + 1,
    };
  }

  const nextQuestion = generateQuestion(levelFromScore(nextDifficultyScoreValue), state.rng);

  return {
    ...state,
    difficultyScore: nextDifficultyScoreValue,
    question: nextQuestion,
    questionStartedAt: now,
    timeAdjustmentMs,
    totalResponseTimeMs,
    stats: nextStats,
    feedback,
    feedbackSeq: state.feedbackSeq + 1,
  };
}

export function restart(config: GameConfig): EngineState {
  return createInitialState(config);
}
