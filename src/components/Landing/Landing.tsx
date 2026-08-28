import type { AnswerMode, GameConfig } from "../../types/game";

interface LandingProps {
  config: GameConfig;
  personalBest: number;
  onStart: () => void;
  onSetAnswerMode: (mode: AnswerMode) => void;
}

export function Landing({ config, personalBest, onStart, onSetAnswerMode }: LandingProps) {
  const isChallenge = config.mode === "challenge";
  const isHardcore = config.answerMode === "typed";

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[#0a0a0f] px-6 text-center text-white">
      {isChallenge && (
        <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-300">
          Challenge Mode
        </span>
      )}
      <h1 className="text-5xl font-black tracking-tight sm:text-6xl">MATH PANIC</h1>
      {isChallenge && config.name && <p className="text-lg text-white/80">{config.name}.</p>}
      <p className="max-w-xs text-lg text-white/60">
        {isChallenge
          ? (config.intro ?? "You've been challenged. Same problems, fixed difficulty — beat their score.")
          : "Think you're good at math?"}
      </p>
      {isChallenge && config.message && <p className="max-w-xs text-sm text-white/50">"{config.message}"</p>}

      {isChallenge ? (
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${
            isHardcore ? "bg-rose-500/20 text-rose-300" : "bg-white/10 text-white/50"
          }`}
        >
          {isHardcore ? "Hardcore — type the answer, no hints" : "Multiple Choice"}
        </span>
      ) : (
        <div className="flex w-full max-w-xs gap-2">
          <button
            type="button"
            onClick={() => onSetAnswerMode("choice")}
            className={`flex-1 rounded-xl border py-2 text-sm font-semibold transition ${
              !isHardcore
                ? "border-indigo-400 bg-indigo-500/20 text-white"
                : "border-white/10 bg-white/5 text-white/50 hover:border-white/25"
            }`}
          >
            Multiple Choice
          </button>
          <button
            type="button"
            onClick={() => onSetAnswerMode("typed")}
            className={`flex-1 rounded-xl border py-2 text-sm font-semibold transition ${
              isHardcore
                ? "border-rose-400 bg-rose-500/20 text-white"
                : "border-white/10 bg-white/5 text-white/50 hover:border-white/25"
            }`}
          >
            Hardcore
          </button>
        </div>
      )}
      {!isChallenge && isHardcore && (
        <p className="max-w-xs text-xs text-white/40">No options. Type the number yourself.</p>
      )}

      <button
        type="button"
        onClick={onStart}
        className="w-full max-w-xs rounded-2xl bg-indigo-500 py-4 text-lg font-bold text-white transition active:scale-95 hover:bg-indigo-400"
      >
        Start
      </button>
      {personalBest > 0 && <p className="text-sm text-white/40">Personal best: {personalBest.toLocaleString()}</p>}
      <p className="text-xs text-white/25">Press Enter or Space to start</p>
    </div>
  );
}
