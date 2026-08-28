import { describe, expect, it } from "vitest";
import {
  beginCountdown,
  beginPlaying,
  createChallengeConfig,
  createDefaultConfig,
  createInitialState,
  quickRestart,
  restart,
  submitAnswer,
  tick,
} from "./gameEngine";
import type { ChallengePayload } from "../challenge/schema";

function start(config = createDefaultConfig({ seed: "engine-test" })) {
  let state = createInitialState(config);
  expect(state.phase).toBe("IDLE");
  state = beginCountdown(state);
  expect(state.phase).toBe("COUNTDOWN");
  state = beginPlaying(state, 0);
  expect(state.phase).toBe("PLAYING");
  return state;
}

describe("state machine transitions", () => {
  it("goes IDLE -> COUNTDOWN -> PLAYING and generates a first question", () => {
    const state = start();
    expect(state.question).not.toBeNull();
    expect(state.startedAt).toBe(0);
  });

  it("beginCountdown is a no-op outside IDLE", () => {
    const state = start();
    expect(beginCountdown(state)).toBe(state);
  });

  it("beginPlaying is a no-op outside COUNTDOWN", () => {
    const idle = createInitialState(createDefaultConfig());
    expect(beginPlaying(idle, 0)).toBe(idle);
  });

  it("tick transitions PLAYING -> FINISHED once the effective duration elapses", () => {
    let state = start(createDefaultConfig({ seed: "tick-test", duration: 30 }));
    state = tick(state, 29_999);
    expect(state.phase).toBe("PLAYING");
    state = tick(state, 30_000);
    expect(state.phase).toBe("FINISHED");
    expect(state.question).toBeNull();
  });

  it("submitAnswer is a no-op when not PLAYING", () => {
    const idle = createInitialState(createDefaultConfig());
    expect(submitAnswer(idle, 0, 0)).toBe(idle);
  });
});

describe("submitAnswer scoring and stats", () => {
  it("awards points and advances the question on a correct answer", () => {
    let state = start();
    const correctIndex = state.question!.options.indexOf(state.question!.correctAnswer);
    state = submitAnswer(state, correctIndex, 500);

    expect(state.stats.correct).toBe(1);
    expect(state.stats.incorrect).toBe(0);
    expect(state.stats.streak).toBe(1);
    expect(state.stats.score).toBeGreaterThan(0);
    expect(state.feedback?.kind).toBe("correct");
    expect(state.feedback?.pointsAwarded).toBeGreaterThan(0);
    expect(state.feedback?.timeDeltaMs).toBeGreaterThan(0);
    expect(state.question).not.toBeNull();
    expect(state.question!.options).toContain(state.question!.correctAnswer);
  });

  it("penalizes and resets streak on a wrong answer, but never drops score below 0", () => {
    let state = start();
    const correctIndex = state.question!.options.indexOf(state.question!.correctAnswer);
    const wrongIndex = (correctIndex + 1) % 4;
    state = submitAnswer(state, wrongIndex, 500);

    expect(state.stats.incorrect).toBe(1);
    expect(state.stats.streak).toBe(0);
    expect(state.stats.score).toBe(0); // started at 0, penalty would go negative -> clamped
    expect(state.feedback?.kind).toBe("incorrect");
    expect(state.feedback?.pointsAwarded).toBeLessThan(0);
    expect(state.feedback?.timeDeltaMs).toBeLessThan(0);
  });

  it("tracks bestStreak and highestDifficulty across multiple answers", () => {
    let state = start();
    for (let i = 0; i < 5; i++) {
      const correctIndex = state.question!.options.indexOf(state.question!.correctAnswer);
      state = submitAnswer(state, correctIndex, state.questionStartedAt! + 500);
    }
    expect(state.stats.streak).toBe(5);
    expect(state.stats.bestStreak).toBe(5);
    expect(state.stats.highestDifficulty).toBeGreaterThanOrEqual(1);
  });

  it("ends the run immediately if a miss penalty exhausts the remaining time", () => {
    // Short duration so a single miss (2s penalty) can push it past the deadline.
    let state = start(createDefaultConfig({ seed: "short-run", duration: 1 }));
    const correctIndex = state.question!.options.indexOf(state.question!.correctAnswer);
    const wrongIndex = (correctIndex + 1) % 4;
    state = submitAnswer(state, wrongIndex, 500);
    expect(state.phase).toBe("FINISHED");
    expect(state.question).toBeNull();
  });
});

describe("regular vs challenge mode", () => {
  it("regular mode: difficulty adapts after correct answers", () => {
    let state = start(createDefaultConfig({ seed: "adapt-test" }));
    const initialScore = state.difficultyScore;
    for (let i = 0; i < 10; i++) {
      const correctIndex = state.question!.options.indexOf(state.question!.correctAnswer);
      state = submitAnswer(state, correctIndex, state.questionStartedAt! + 200);
    }
    expect(state.difficultyScore).toBeGreaterThan(initialScore);
  });

  it("challenge mode: difficulty stays fixed at startingDifficulty regardless of answers", () => {
    const payload: ChallengePayload = { v: 1, duration: 60, startingDifficulty: 3, seed: "fixed-diff" };
    let state = start(createChallengeConfig(payload));
    for (let i = 0; i < 10; i++) {
      // Deliberately answer wrong every time.
      const correctIndex = state.question!.options.indexOf(state.question!.correctAnswer);
      const wrongIndex = (correctIndex + 1) % 4;
      state = submitAnswer(state, wrongIndex, state.questionStartedAt! + 200);
      if (state.phase !== "PLAYING") break;
      expect(state.question!.difficulty).toBe(3);
    }
    expect(state.difficultyScore).toBe(3);
  });

  it("challenge mode: same seed produces the same question sequence regardless of how you answer", () => {
    const payload: ChallengePayload = { v: 1, duration: 60, startingDifficulty: 3, seed: "shared-seed" };

    function play(answerCorrectly: boolean) {
      let state = start(createChallengeConfig(payload));
      const sequence: string[] = [];
      for (let i = 0; i < 15 && state.phase === "PLAYING"; i++) {
        sequence.push(state.question!.expression);
        const correctIndex = state.question!.options.indexOf(state.question!.correctAnswer);
        const chosen = answerCorrectly ? correctIndex : (correctIndex + 1) % 4;
        state = submitAnswer(state, chosen, state.questionStartedAt! + 200);
      }
      return sequence;
    }

    expect(play(true)).toEqual(play(false));
  });
});

describe("restart / quickRestart", () => {
  it("restart resets to a fresh IDLE state with the given config", () => {
    let state = start();
    state = submitAnswer(state, 0, 500);
    const restarted = restart(state.config);
    expect(restarted.phase).toBe("IDLE");
    expect(restarted.stats.score).toBe(0);
    expect(restarted.config).toBe(state.config);
  });

  it("quickRestart skips straight to COUNTDOWN", () => {
    let state = start();
    state = submitAnswer(state, 0, 500);
    const restarted = quickRestart(state.config);
    expect(restarted.phase).toBe("COUNTDOWN");
    expect(restarted.stats.score).toBe(0);
  });
});
