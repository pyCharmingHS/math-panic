import { describe, expect, it } from "vitest";
import { DIFFICULTY_MAX, DIFFICULTY_MIN, levelFromScore, nextDifficultyScore } from "./difficultyEngine";

describe("nextDifficultyScore", () => {
  it("increases on a correct answer", () => {
    const next = nextDifficultyScore(2, true, 4000);
    expect(next).toBeGreaterThan(2);
  });

  it("increases more for a fast correct answer than a slow one", () => {
    const fast = nextDifficultyScore(2, true, 500);
    const slow = nextDifficultyScore(2, true, 4000);
    expect(fast).toBeGreaterThan(slow);
  });

  it("decreases on an incorrect answer", () => {
    const next = nextDifficultyScore(3, false, 1000);
    expect(next).toBeLessThan(3);
  });

  it("never exceeds DIFFICULTY_MAX even after many correct answers", () => {
    let score = DIFFICULTY_MIN;
    for (let i = 0; i < 200; i++) {
      score = nextDifficultyScore(score, true, 100);
    }
    expect(score).toBeLessThanOrEqual(DIFFICULTY_MAX);
  });

  it("never drops below DIFFICULTY_MIN even after many wrong answers", () => {
    let score = DIFFICULTY_MAX;
    for (let i = 0; i < 200; i++) {
      score = nextDifficultyScore(score, false, 5000);
    }
    expect(score).toBeGreaterThanOrEqual(DIFFICULTY_MIN);
  });
});

describe("levelFromScore", () => {
  it("rounds to the nearest integer level", () => {
    expect(levelFromScore(2.4)).toBe(2);
    expect(levelFromScore(2.6)).toBe(3);
  });

  it("clamps into [DIFFICULTY_MIN, DIFFICULTY_MAX]", () => {
    expect(levelFromScore(-5)).toBe(DIFFICULTY_MIN);
    expect(levelFromScore(0)).toBe(DIFFICULTY_MIN);
    expect(levelFromScore(99)).toBe(DIFFICULTY_MAX);
  });
});
