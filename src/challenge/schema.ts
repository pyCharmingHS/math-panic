export const CHALLENGE_VERSION = 1;

export const DURATION_RANGE = { min: 15, max: 300 } as const;
export const DIFFICULTY_RANGE = { min: 1, max: 5 } as const;
export const MAX_TEXT_LENGTH = 40;
export const SEED_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;

export interface ChallengePayload {
  v: number;
  name?: string;
  intro?: string;
  message?: string;
  duration: number;
  startingDifficulty: number;
  seed: string;
}

function isValidOptionalText(value: unknown): value is string | undefined {
  return value === undefined || (typeof value === "string" && value.length <= MAX_TEXT_LENGTH);
}

/** Treats URL-supplied data as untrusted: rejects anything outside expected shape/ranges. */
export function isValidChallengePayload(value: unknown): value is ChallengePayload {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;

  return (
    v.v === CHALLENGE_VERSION &&
    typeof v.duration === "number" &&
    Number.isFinite(v.duration) &&
    v.duration >= DURATION_RANGE.min &&
    v.duration <= DURATION_RANGE.max &&
    typeof v.startingDifficulty === "number" &&
    Number.isInteger(v.startingDifficulty) &&
    v.startingDifficulty >= DIFFICULTY_RANGE.min &&
    v.startingDifficulty <= DIFFICULTY_RANGE.max &&
    typeof v.seed === "string" &&
    SEED_PATTERN.test(v.seed) &&
    isValidOptionalText(v.name) &&
    isValidOptionalText(v.intro) &&
    isValidOptionalText(v.message)
  );
}
