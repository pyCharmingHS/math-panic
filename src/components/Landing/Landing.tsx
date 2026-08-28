import type { GameConfig } from "../../types/game";

interface LandingProps {
  config: GameConfig;
  personalBest: number;
  onStart: () => void;
}

export function Landing({ config, personalBest, onStart }: LandingProps) {
  const isChallenge = config.mode === "challenge";

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
        {isChallenge ? (config.intro ?? "You've been challenged. Same problems, fixed difficulty — beat their score.") : "Think you're good at math?"}
      </p>
      {isChallenge && config.message && <p className="max-w-xs text-sm text-white/50">"{config.message}"</p>}
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
