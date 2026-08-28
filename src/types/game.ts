export type GamePhase = "IDLE" | "COUNTDOWN" | "PLAYING" | "FINISHED";

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
  name?: string;
  intro?: string;
  message?: string;
  duration: number;
  startingDifficulty: number;
  seed: string;
}

export interface AnswerFeedback {
  kind: "correct" | "incorrect";
  pointsAwarded: number;
  selectedIndex: number;
  correctIndex: number;
  key: number;
}
