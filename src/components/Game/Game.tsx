import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AnswerFeedback, GameMode, GameStats, Question } from "../../types/game";

interface GameProps {
  question: Question;
  stats: GameStats;
  remainingMs: number;
  durationMs: number;
  feedback: AnswerFeedback | null;
  mode: GameMode;
  onAnswer: (index: number) => void;
  onReturnToMenu: () => void;
  onRestart: () => void;
}

export function Game({
  question,
  stats,
  remainingMs,
  durationMs,
  feedback,
  mode,
  onAnswer,
  onReturnToMenu,
  onRestart,
}: GameProps) {
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      const index = ["1", "2", "3", "4"].indexOf(event.key);
      if (index !== -1) onAnswer(index);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onAnswer]);

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
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] tracking-wider ${
            mode === "challenge" ? "bg-indigo-500/20 text-indigo-300" : "bg-white/10 text-white/50"
          }`}
        >
          {mode === "challenge" ? "Challenge" : "Regular"}
        </span>
        <span className="flex items-center gap-1 text-white">
          {stats.streak > 0 && "🔥"} {stats.streak}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-10">
        {/*
          No `mode="wait"` here: the options grid below updates the instant
          `question` changes, with no exit transition of its own. Waiting for
          the old expression to finish fading out before mounting the new one
          left a ~160ms window where old expression text was shown next to
          the new (already-updated) options — visibly mismatched.
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

        <AnimatePresence>
          {feedback && (
            <motion.div
              key={feedback.key}
              initial={{ opacity: 0, y: 0, scale: 0.9 }}
              animate={{ opacity: 1, y: -24, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={`pointer-events-none absolute top-0 text-2xl font-extrabold ${
                feedback.kind === "correct" ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {feedback.pointsAwarded >= 0 ? `+${feedback.pointsAwarded}` : feedback.pointsAwarded}
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
