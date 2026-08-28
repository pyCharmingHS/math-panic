/**
 * Central, tunable scoring config. Points = base × difficulty × speed ×
 * streak × hardcore. Nothing about the formula is final — tune the numbers
 * here as the game gets playtested, without touching call sites.
 */
export const SCORING_CONFIG = {
  basePoints: 100,
  difficultyMultiplierStep: 0.25,
  // Flat deduction on a wrong answer. Set high enough that blind guessing
  // (~25% hit rate across 4 options) has clearly negative expected value even
  // at the fastest speed tier — otherwise mashing one button forever is free.
  // Typed mode doesn't need this to be higher: guessing a specific number
  // out of an effectively unbounded range is already a near-zero-odds bet.
  missPenalty: 80,
  // Reward for playing without hints — no options to eliminate against, you
  // have to actually compute the answer.
  hardcoreMultiplier: 1.5,
  speedTiers: [
    { maxMs: 1500, multiplier: 1.5 },
    { maxMs: 3000, multiplier: 1.25 },
    { maxMs: 5000, multiplier: 1.0 },
    { maxMs: Infinity, multiplier: 0.75 },
  ],
  streakTiers: [
    { min: 15, multiplier: 2.0 },
    { min: 10, multiplier: 1.6 },
    { min: 5, multiplier: 1.3 },
    { min: 3, multiplier: 1.15 },
    { min: 0, multiplier: 1.0 },
  ],
};

/**
 * Time added/removed from the clock on each answer, in ms. Penalty > bonus
 * so guessing also burns through the run faster, on top of the point loss.
 * `maxBonusMs` caps how much total time a run can gain — without it, a
 * player answering faster than correctBonusMs every time never runs out
 * of clock at all.
 */
export const TIME_ECONOMY = {
  correctBonusMs: 1500,
  incorrectPenaltyMs: 2000,
  maxBonusMs: 30_000,
};

export function speedMultiplier(responseTimeMs: number): number {
  const tier = SCORING_CONFIG.speedTiers.find((t) => responseTimeMs <= t.maxMs);
  return tier?.multiplier ?? 1;
}

export function streakMultiplier(streak: number): number {
  const tier = SCORING_CONFIG.streakTiers.find((t) => streak >= t.min);
  return tier?.multiplier ?? 1;
}

/** `streak` should be the streak count *after* this correct answer. */
export function computePoints(
  level: number,
  responseTimeMs: number,
  streak: number,
  isHardcore = false,
): number {
  const difficultyMult = 1 + (level - 1) * SCORING_CONFIG.difficultyMultiplierStep;
  const speedMult = speedMultiplier(responseTimeMs);
  const streakMult = streakMultiplier(streak);
  const hardcoreMult = isHardcore ? SCORING_CONFIG.hardcoreMultiplier : 1;
  return Math.round(SCORING_CONFIG.basePoints * difficultyMult * speedMult * streakMult * hardcoreMult);
}
