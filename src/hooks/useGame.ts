import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { GameConfig } from "../types/game";
import {
  type EngineState,
  beginCountdown,
  beginPlaying,
  createDefaultConfig,
  createInitialState,
  quickRestart,
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
  | { type: "RESTART"; config: GameConfig }
  | { type: "QUICK_RESTART"; config: GameConfig }
  | { type: "RETURN_TO_MENU" };

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
    case "QUICK_RESTART":
      return quickRestart(action.config);
    case "RETURN_TO_MENU":
      return restart(state.config);
    default:
      return state;
  }
}

export function useGame(initialConfig?: GameConfig) {
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    createInitialState(initialConfig ?? createDefaultConfig()),
  );

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

  // Challenge mode retries the identical seed — that's the point of a shared
  // link. Regular mode gets a fresh random seed for the next run.
  const nextRunConfig = useCallback(
    () => (state.config.mode === "challenge" ? state.config : createDefaultConfig()),
    [state.config],
  );

  const playAgain = useCallback(
    () => dispatch({ type: "RESTART", config: nextRunConfig() }),
    [nextRunConfig],
  );
  const restartNow = useCallback(
    () => dispatch({ type: "QUICK_RESTART", config: nextRunConfig() }),
    [nextRunConfig],
  );
  const returnToMenu = useCallback(() => dispatch({ type: "RETURN_TO_MENU" }), []);

  // `durationMs` is the base session length — used as the timer bar's fixed
  // visual scale. `remainingMs` is computed against the *effective* deadline
  // (base + time bonuses/penalties from answers so far), so it can exceed
  // durationMs; the bar clamps its width but the numeric readout doesn't.
  const durationMs = state.config.duration * 1000;
  const remainingMs = useMemo(() => {
    if (state.phase !== "PLAYING" || state.startedAt === null) return durationMs;
    const effectiveDurationMs = durationMs + state.timeAdjustmentMs;
    return Math.max(0, effectiveDurationMs - (now - state.startedAt));
  }, [state.phase, state.startedAt, state.timeAdjustmentMs, durationMs, now]);

  return {
    phase: state.phase,
    config: state.config,
    question: state.question,
    stats: state.stats,
    feedback: state.feedback,
    remainingMs,
    durationMs,
    currentLevel: Math.round(state.difficultyScore),
    actions: { start, beginPlaying: beginPlayingAction, answer, playAgain, restartNow, returnToMenu },
  };
}
