export interface Rng {
  next(): number;
  nextInt(min: number, max: number): number;
  pick<T>(items: T[]): T;
}

/** xmur3 string hash — turns an arbitrary seed string into a 32-bit int. */
function hashSeed(seed: string): number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^ (h >>> 16)) >>> 0;
}

/** mulberry32 — small, fast, deterministic PRNG. */
export function createRng(seed: string): Rng {
  let state = hashSeed(seed) || 1;

  function next(): number {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function nextInt(min: number, max: number): number {
    return Math.floor(next() * (max - min + 1)) + min;
  }

  function pick<T>(items: T[]): T {
    return items[nextInt(0, items.length - 1)];
  }

  return { next, nextInt, pick };
}

export function randomSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}
