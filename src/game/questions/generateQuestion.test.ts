import { describe, expect, it } from "vitest";
import { createRng } from "../random/prng";
import { generateQuestion } from "./generateQuestion";

describe("generateQuestion", () => {
  it("produces well-formed questions across all 5 levels", () => {
    for (let level = 1; level <= 5; level++) {
      const rng = createRng(`validity-${level}`);
      for (let i = 0; i < 2000; i++) {
        const q = generateQuestion(level, rng);

        expect(q.difficulty).toBe(level);
        expect(q.options).toHaveLength(4);
        expect(new Set(q.options).size).toBe(4); // no duplicate options
        expect(q.options).toContain(q.correctAnswer);
        for (const option of q.options) {
          expect(Number.isInteger(option)).toBe(true);
        }
        expect(Number.isInteger(q.correctAnswer)).toBe(true);
      }
    }
  });

  it("clamps out-of-range levels into [1, 5]", () => {
    const rngLow = createRng("clamp-low");
    expect(generateQuestion(0, rngLow).difficulty).toBe(1);
    expect(generateQuestion(-3, rngLow).difficulty).toBe(1);

    const rngHigh = createRng("clamp-high");
    expect(generateQuestion(6, rngHigh).difficulty).toBe(5);
    expect(generateQuestion(99, rngHigh).difficulty).toBe(5);
  });

  it("is deterministic for a given seed and level sequence", () => {
    const rngA = createRng("determinism-check");
    const rngB = createRng("determinism-check");
    const seqA = Array.from({ length: 30 }, () => generateQuestion(3, rngA).expression);
    const seqB = Array.from({ length: 30 }, () => generateQuestion(3, rngB).expression);
    expect(seqA).toEqual(seqB);
  });

  it("level 1 (easy) never produces a negative result", () => {
    const rng = createRng("easy-nonneg");
    for (let i = 0; i < 1000; i++) {
      expect(generateQuestion(1, rng).correctAnswer).toBeGreaterThanOrEqual(0);
    }
  });
});
