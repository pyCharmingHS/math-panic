import { describe, expect, it } from "vitest";
import { encodeChallenge } from "./encode";
import { decodeChallenge } from "./decode";
import { isValidChallengePayload, type ChallengePayload } from "./schema";

const basePayload: ChallengePayload = {
  v: 1,
  name: "Sarah",
  intro: "Think you're good at math?",
  message: "Beat my score 😈",
  duration: 30,
  startingDifficulty: 3,
  seed: "a83f91",
};

describe("encodeChallenge / decodeChallenge round-trip", () => {
  it("decodes back to exactly the original payload, including unicode", () => {
    const encoded = encodeChallenge(basePayload);
    expect(decodeChallenge(encoded)).toEqual(basePayload);
  });

  it("round-trips a payload with no optional fields", () => {
    const minimal: ChallengePayload = { v: 1, duration: 60, startingDifficulty: 1, seed: "abc123" };
    expect(decodeChallenge(encodeChallenge(minimal))).toEqual(minimal);
  });

  it("produces a URL-safe string (no +, /, or = padding)", () => {
    const encoded = encodeChallenge(basePayload);
    expect(encoded).not.toMatch(/[+/=]/);
  });
});

describe("decodeChallenge rejects untrusted/malformed input", () => {
  it("rejects garbage input", () => {
    expect(decodeChallenge("not-valid-base64-json")).toBeNull();
  });

  it("rejects an empty string", () => {
    expect(decodeChallenge("")).toBeNull();
  });

  it("rejects an overly long payload", () => {
    expect(decodeChallenge("a".repeat(1000))).toBeNull();
  });

  it("rejects an unsupported version", () => {
    const encoded = encodeChallenge({ ...basePayload, v: 2 });
    expect(decodeChallenge(encoded)).toBeNull();
  });
});

describe("isValidChallengePayload", () => {
  it("accepts a well-formed payload", () => {
    expect(isValidChallengePayload(basePayload)).toBe(true);
  });

  it("rejects duration out of range", () => {
    expect(isValidChallengePayload({ ...basePayload, duration: 5 })).toBe(false);
    expect(isValidChallengePayload({ ...basePayload, duration: 10000 })).toBe(false);
  });

  it("rejects startingDifficulty out of range or non-integer", () => {
    expect(isValidChallengePayload({ ...basePayload, startingDifficulty: 0 })).toBe(false);
    expect(isValidChallengePayload({ ...basePayload, startingDifficulty: 6 })).toBe(false);
    expect(isValidChallengePayload({ ...basePayload, startingDifficulty: 2.5 })).toBe(false);
  });

  it("rejects a seed with disallowed characters", () => {
    expect(isValidChallengePayload({ ...basePayload, seed: "not valid!!" })).toBe(false);
  });

  it("rejects text fields that are too long", () => {
    expect(isValidChallengePayload({ ...basePayload, name: "x".repeat(100) })).toBe(false);
  });

  it("rejects non-object input", () => {
    expect(isValidChallengePayload(null)).toBe(false);
    expect(isValidChallengePayload("string")).toBe(false);
    expect(isValidChallengePayload(42)).toBe(false);
  });
});
