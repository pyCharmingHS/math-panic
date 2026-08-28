import { describe, expect, it } from "vitest";
import { computePoints, SCORING_CONFIG, speedMultiplier, streakMultiplier, TIME_ECONOMY } from "./scoring";

describe("speedMultiplier", () => {
  it("picks the tier matching the response time", () => {
    expect(speedMultiplier(1000)).toBe(1.5);
    expect(speedMultiplier(1500)).toBe(1.5);
    expect(speedMultiplier(1501)).toBe(1.25);
    expect(speedMultiplier(3000)).toBe(1.25);
    expect(speedMultiplier(5000)).toBe(1.0);
    expect(speedMultiplier(50000)).toBe(0.75);
  });
});

describe("streakMultiplier", () => {
  it("picks the tier matching the streak", () => {
    expect(streakMultiplier(0)).toBe(1.0);
    expect(streakMultiplier(2)).toBe(1.0);
    expect(streakMultiplier(3)).toBe(1.15);
    expect(streakMultiplier(5)).toBe(1.3);
    expect(streakMultiplier(10)).toBe(1.6);
    expect(streakMultiplier(15)).toBe(2.0);
    expect(streakMultiplier(1000)).toBe(2.0);
  });
});

describe("computePoints", () => {
  it("matches base x difficulty x speed x streak", () => {
    // level 5, fast (<=1500ms), streak 15+: 100 * 2.0 * 1.5 * 2.0
    expect(computePoints(5, 1000, 15)).toBe(600);
    // level 1, slow (>5000ms), streak 1: 100 * 1.0 * 0.75 * 1.0
    expect(computePoints(1, 6000, 1)).toBe(75);
  });

  it("scales up with difficulty level, all else equal", () => {
    const low = computePoints(1, 1000, 1);
    const high = computePoints(5, 1000, 1);
    expect(high).toBeGreaterThan(low);
  });

  it("is always a non-negative integer", () => {
    for (let level = 1; level <= 5; level++) {
      for (const time of [100, 1500, 3000, 5000, 10000]) {
        for (const streak of [0, 1, 5, 15, 40]) {
          const points = computePoints(level, time, streak);
          expect(Number.isInteger(points)).toBe(true);
          expect(points).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});

describe("SCORING_CONFIG / TIME_ECONOMY", () => {
  it("miss penalty makes blind guessing (25% hit rate) negative expected value", () => {
    // Worst-case (best for the guesser): always fastest tier, level 1, streak resets don't matter much.
    const bestCaseCorrectPoints = computePoints(1, 100, 1);
    const expectedValue = 0.25 * bestCaseCorrectPoints - 0.75 * SCORING_CONFIG.missPenalty;
    expect(expectedValue).toBeLessThan(0);
  });

  it("miss penalty burns more time than a correct answer gains", () => {
    expect(TIME_ECONOMY.incorrectPenaltyMs).toBeGreaterThan(TIME_ECONOMY.correctBonusMs);
  });
});
