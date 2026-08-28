export type GamePhase = "IDLE" | "COUNTDOWN" | "PLAYING" | "FINISHED";

/**
 * "regular": difficulty adapts to performance, seed is random each run.
 * "challenge": difficulty is fixed at startingDifficulty and the seed is
 * fixed too, so two players see the exact same question sequence — what
 * makes a shared challenge link a fair head-to-head instead of two
 * different (adaptively-diverging) runs that just started the same way.
 */
export type GameMode = "regular" | "challenge";

export type QuestionType =
  | "addition"
  | "subtraction"
  | "multiplication"
  | "division"
  | "percentage"
  | "mixed"
  | "order-of-operations"
  | "power"
  | "negative"
  | "fraction"
  | "multi-step";

export interface Question {
  expression: string;
  correctAnswer: number;
  options: number[];
  difficulty: number;
  type: QuestionType;
}

export interface GameStats {
  score: number;
  correct: number;
  incorrect: number;
  totalQuestions: number;
  streak: number;
  bestStreak: number;
  averageResponseTime: number;
  highestDifficulty: number;
}

export interface GameConfig {
  version: number;
  mode: GameMode;
  name?: string;
  intro?: string;
  message?: string;
  duration: number;
  startingDifficulty: number;
  seed: string;
}

export interface AnswerFeedback {
  kind: "correct" | "incorrect";
  /** Signed — negative on a miss. */
  pointsAwarded: number;
  /** Signed ms added/removed from the clock for this answer. */
  timeDeltaMs: number;
  selectedIndex: number;
  correctIndex: number;
  key: number;
}
