import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AnswerFeedback, AnswerMode, GameMode, GameStats, Question } from "../../types/game";

interface GameProps {
  question: Question;
  stats: GameStats;
  remainingMs: number;
  durationMs: number;
  feedback: AnswerFeedback | null;
  mode: GameMode;
  answerMode: AnswerMode;
  onAnswer: (value: number) => void;
  onReturnToMenu: () => void;
  onRestart: () => void;
}

const MAX_TYPED_LENGTH = 7; // sign + up to 6 digits, comfortably covers this game's number ranges

export function Game({
  question,
  stats,
  remainingMs,
  durationMs,
  feedback,
  mode,
  answerMode,
  onAnswer,
  onReturnToMenu,
  onRestart,
}: GameProps) {
  const isTyped = answerMode === "typed";
  const [typedValue, setTypedValue] = useState("");

  // Clear whatever was typed as soon as a new question comes in — covers
  // both a successful submit and a timeout-driven advance.
  useEffect(() => {
    setTypedValue("");
  }, [question]);

  useEffect(() => {
    if (isTyped) return;
    function handleKey(event: KeyboardEvent) {
      const index = ["1", "2", "3", "4"].indexOf(event.key);
      if (index !== -1) onAnswer(index);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isTyped, onAnswer]);

  function submitTyped() {
    if (typedValue === "" || typedValue === "-") return;
    const parsed = Number(typedValue);
    if (!Number.isFinite(parsed)) return;
    onAnswer(parsed);
  }

  useEffect(() => {
    if (!isTyped) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key >= "0" && event.key <= "9") {
        setTypedValue((v) => (v.length >= MAX_TYPED_LENGTH ? v : v + event.key));
      } else if (event.key === "-") {
        setTypedValue((v) => (v.startsWith("-") ? v.slice(1) : "-" + v));
      } else if (event.key === "Backspace") {
        setTypedValue((v) => v.slice(0, -1));
      } else if (event.key === "Enter") {
        submitTyped();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTyped, typedValue]);

  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const timeRatio = durationMs > 0 ? Math.min(1, remainingMs / durationMs) : 0;
  const lowTime = remainingSeconds <= 10;

  return (
    <div className="flex min-h-svh flex-col items-center justify-between bg-[#0a0a0f] px-6 py-8 text-white">
      <div className="mb-2 flex w-full max-w-md items-center justify-between text-xs font-semibold text-white/40">
        <button type="button" onClick={onReturnToMenu} className="transition hover:text-white/70">
          ← Menu
        </button>
        <button type="button" onClick={onRestart} className="transition hover:text-white/70">
          ↻ Restart
        </button>
      </div>

      <div className="flex w-full max-w-md items-center justify-between text-sm font-semibold uppercase tracking-widest text-white/60">
        <span>
          Score <span className="text-white">{stats.score.toLocaleString()}</span>
        </span>
        <span className="flex gap-1">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] tracking-wider ${
              mode === "challenge" ? "bg-indigo-500/20 text-indigo-300" : "bg-white/10 text-white/50"
            }`}
          >
            {mode === "challenge" ? "Challenge" : "Regular"}
          </span>
          {isTyped && (
            <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-black tracking-wider text-rose-300">
              Hardcore ×1.5
            </span>
          )}
        </span>
        <span className="flex items-center gap-1 text-white">
          {stats.streak > 0 && "🔥"} {stats.streak}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-8">
        {/*
          No `mode="wait"` here: the answer UI below updates the instant
          `question` changes, with no exit transition of its own. Waiting for
          the old expression to finish fading out before mounting the new one
          left a ~160ms window where old expression text was shown next to
          the new (already-updated) answer UI — visibly mismatched.
        */}
        <AnimatePresence>
          <motion.div
            key={question.expression}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12, position: "absolute" }}
            transition={{ duration: 0.16 }}
            className="text-5xl font-black tracking-tight sm:text-6xl"
          >
            {question.expression}
          </motion.div>
        </AnimatePresence>

        {isTyped ? (
          <div className="flex w-full max-w-md flex-col items-center gap-3">
            <div className="w-full rounded-2xl border-2 border-indigo-400/60 bg-white/5 py-4 text-center text-3xl font-bold tabular-nums text-white">
              {typedValue === "" ? <span className="text-white/30">?</span> : typedValue}
            </div>
            <div className="grid w-full grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                <TypedKey
                  key={digit}
                  label={digit}
                  onClick={() =>
                    setTypedValue((v) => (v.length >= MAX_TYPED_LENGTH ? v : v + digit))
                  }
                />
              ))}
              <TypedKey
                label="±"
                onClick={() => setTypedValue((v) => (v.startsWith("-") ? v.slice(1) : "-" + v))}
              />
              <TypedKey label="0" onClick={() => setTypedValue((v) => (v.length >= MAX_TYPED_LENGTH ? v : v + "0"))} />
              <TypedKey label="⌫" onClick={() => setTypedValue((v) => v.slice(0, -1))} />
            </div>
            <button
              type="button"
              onClick={(event) => {
                submitTyped();
                event.currentTarget.blur();
              }}
              className="w-full rounded-2xl bg-indigo-500 py-3 text-lg font-bold text-white transition active:scale-95 hover:bg-indigo-400"
            >
              Enter
            </button>
          </div>
        ) : (
          <div className="grid w-full max-w-md grid-cols-2 gap-3">
            {question.options.map((option, index) => (
              <button
                key={`${question.expression}-${index}`}
                type="button"
                onClick={() => onAnswer(index)}
                className="rounded-2xl border border-white/10 bg-white/5 py-6 text-2xl font-bold text-white transition active:scale-95 hover:border-white/30 hover:bg-white/10"
              >
                {option}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence>
          {feedback && (
            <motion.div
              key={feedback.key}
              initial={{ opacity: 0, y: 0, scale: 0.9 }}
              animate={{ opacity: 1, y: -16, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={`pointer-events-none absolute top-8 flex items-baseline gap-1.5 text-2xl font-extrabold ${
                feedback.kind === "correct" ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              <span>{feedback.pointsAwarded >= 0 ? `+${feedback.pointsAwarded}` : feedback.pointsAwarded}</span>
              {isTyped && feedback.kind === "correct" && (
                <span className="text-sm font-black text-rose-300">×1.5</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-1 flex justify-between text-xs font-semibold text-white/50">
          <span>{remainingSeconds}s</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            animate={{ width: `${timeRatio * 100}%` }}
            transition={{ ease: "linear", duration: 0.1 }}
            className={`h-full rounded-full ${lowTime ? "bg-rose-500" : "bg-indigo-400"}`}
          />
          <AnimatePresence>
            {feedback && (
              <motion.div
                key={feedback.key}
                initial={{ opacity: 0.55 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={`pointer-events-none absolute inset-0 rounded-full ${
                  feedback.timeDeltaMs >= 0 ? "bg-emerald-400" : "bg-rose-500"
                }`}
              />
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {feedback && (
            <motion.div
              key={feedback.key}
              initial={{ opacity: 0, y: 0, scale: 0.85 }}
              animate={{ opacity: 1, y: -20, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={`pointer-events-none absolute -top-1 right-0 text-sm font-bold ${
                feedback.timeDeltaMs >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {feedback.timeDeltaMs >= 0 ? "+" : ""}
              {(feedback.timeDeltaMs / 1000).toFixed(1)}s
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TypedKey({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        onClick();
        // These keys keep the same key= across questions (unlike the choice
        // buttons, which remount each question), so a click leaves one of
        // them focused indefinitely. Without blurring, a later physical
        // Enter press both submits (via the keydown handler below) *and*
        // re-fires this button's native click, leaking a stray digit into
        // the next question's input.
        event.currentTarget.blur();
      }}
      className="rounded-xl border border-white/10 bg-white/5 py-4 text-xl font-bold text-white transition active:scale-95 hover:border-white/30 hover:bg-white/10"
    >
      {label}
    </button>
  );
}
