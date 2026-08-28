export const DIFFICULTY_MIN = 1;
export const DIFFICULTY_MAX = 5;

const CORRECT_BASE_INCREMENT = 0.18;
const FAST_ANSWER_THRESHOLD_MS = 2500;
const FAST_ANSWER_BONUS = 0.12;
const INCORRECT_PENALTY = 0.35;

/**
 * Continuous difficulty score in [1, 5]. Correct answers push it up (faster
 * answers push harder); incorrect answers pull it back down. This is what
 * keeps the player "near the edge of their ability" instead of difficulty
 * simply ramping with elapsed time.
 */
export function nextDifficultyScore(current: number, wasCorrect: boolean, responseTimeMs: number): number {
  let next = current;
  if (wasCorrect) {
    next += CORRECT_BASE_INCREMENT;
    if (responseTimeMs < FAST_ANSWER_THRESHOLD_MS) {
      next += FAST_ANSWER_BONUS;
    }
  } else {
    next -= INCORRECT_PENALTY;
  }
  return Math.min(DIFFICULTY_MAX, Math.max(DIFFICULTY_MIN, next));
}

export function levelFromScore(score: number): number {
  return Math.min(DIFFICULTY_MAX, Math.max(DIFFICULTY_MIN, Math.round(score)));
}
