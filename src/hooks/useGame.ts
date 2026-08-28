import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { GameConfig } from "../types/game";
import {
  type EngineState,
  beginCountdown,
  beginPlaying,
  createDefaultConfig,
  createInitialState,
  restart,
  submitAnswer,
  tick,
} from "../game/gameEngine";
import { useTimer } from "./useTimer";
import { recordSessionResult } from "../utils/storage";

type Action =
  | { type: "START_COUNTDOWN" }
  | { type: "BEGIN_PLAYING"; now: number }
  | { type: "TICK"; now: number }
  | { type: "ANSWER"; index: number; now: number }
  | { type: "RESTART"; config: GameConfig };

function reducer(state: EngineState, action: Action): EngineState {
  switch (action.type) {
    case "START_COUNTDOWN":
      return beginCountdown(state);
    case "BEGIN_PLAYING":
      return beginPlaying(state, action.now);
    case "TICK":
      return tick(state, action.now);
    case "ANSWER":
      return submitAnswer(state, action.index, action.now);
    case "RESTART":
      return restart(action.config);
    default:
      return state;
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, undefined, () => createInitialState(createDefaultConfig()));

  const now = useTimer(state.phase === "PLAYING");

  useEffect(() => {
    if (state.phase === "PLAYING") dispatch({ type: "TICK", now });
  }, [now, state.phase]);

  useEffect(() => {
    if (state.phase === "FINISHED") recordSessionResult(state.stats);
    // Only re-run when the phase transitions into FINISHED, not on every stats change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  const start = useCallback(() => dispatch({ type: "START_COUNTDOWN" }), []);
  const beginPlayingAction = useCallback(
    () => dispatch({ type: "BEGIN_PLAYING", now: performance.now() }),
    [],
  );
  const answer = useCallback(
    (index: number) => dispatch({ type: "ANSWER", index, now: performance.now() }),
    [],
  );
  const playAgain = useCallback(
    () => dispatch({ type: "RESTART", config: createDefaultConfig() }),
    [],
  );

  const durationMs = state.config.duration * 1000;
  const remainingMs = useMemo(() => {
    if (state.phase !== "PLAYING" || state.startedAt === null) return durationMs;
    return Math.max(0, durationMs - (now - state.startedAt));
  }, [state.phase, state.startedAt, durationMs, now]);

  return {
    phase: state.phase,
    question: state.question,
    stats: state.stats,
    feedback: state.feedback,
    remainingMs,
    durationMs,
    currentLevel: Math.round(state.difficultyScore),
    actions: { start, beginPlaying: beginPlayingAction, answer, playAgain },
  };
}
