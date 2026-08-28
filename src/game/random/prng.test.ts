import { describe, expect, it } from "vitest";
import { createRng, randomSeed } from "./prng";

describe("createRng", () => {
  it("is deterministic: same seed produces the same sequence", () => {
    const a = createRng("seed-1");
    const b = createRng("seed-1");
    const seqA = Array.from({ length: 20 }, () => a.next());
    const seqB = Array.from({ length: 20 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it("different seeds produce different sequences", () => {
    const a = createRng("seed-1");
    const b = createRng("seed-2");
    const seqA = Array.from({ length: 10 }, () => a.next());
    const seqB = Array.from({ length: 10 }, () => b.next());
    expect(seqA).not.toEqual(seqB);
  });

  it("next() stays within [0, 1)", () => {
    const rng = createRng("range-check");
    for (let i = 0; i < 5000; i++) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("nextInt(min, max) is inclusive on both ends and never out of range", () => {
    const rng = createRng("int-range");
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const value = rng.nextInt(1, 5);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(5);
      seen.add(value);
    }
    expect(seen).toEqual(new Set([1, 2, 3, 4, 5]));
  });

  it("pick() only returns items from the given array", () => {
    const rng = createRng("pick-check");
    const items = ["a", "b", "c"];
    for (let i = 0; i < 200; i++) {
      expect(items).toContain(rng.pick(items));
    }
  });
});

describe("randomSeed", () => {
  it("produces non-empty strings that differ across calls", () => {
    const a = randomSeed();
    const b = randomSeed();
    expect(a.length).toBeGreaterThan(0);
    expect(a).not.toBe(b);
  });
});
