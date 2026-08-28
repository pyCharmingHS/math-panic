/**
 * Central, tunable scoring config. Points = base × difficulty × speed × streak.
 * Nothing about the formula is final — tune the numbers here as the game
 * gets playtested, without touching call sites.
 */
export const SCORING_CONFIG = {
  basePoints: 100,
  difficultyMultiplierStep: 0.25,
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

export function speedMultiplier(responseTimeMs: number): number {
  const tier = SCORING_CONFIG.speedTiers.find((t) => responseTimeMs <= t.maxMs);
  return tier?.multiplier ?? 1;
}

export function streakMultiplier(streak: number): number {
  const tier = SCORING_CONFIG.streakTiers.find((t) => streak >= t.min);
  return tier?.multiplier ?? 1;
}

/** `streak` should be the streak count *after* this correct answer. */
export function computePoints(level: number, responseTimeMs: number, streak: number): number {
  const difficultyMult = 1 + (level - 1) * SCORING_CONFIG.difficultyMultiplierStep;
  const speedMult = speedMultiplier(responseTimeMs);
  const streakMult = streakMultiplier(streak);
  return Math.round(SCORING_CONFIG.basePoints * difficultyMult * speedMult * streakMult);
}
