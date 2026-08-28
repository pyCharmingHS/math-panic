interface LandingProps {
  personalBest: number;
  onStart: () => void;
}

export function Landing({ personalBest, onStart }: LandingProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[#0a0a0f] px-6 text-center text-white">
      <h1 className="text-5xl font-black tracking-tight sm:text-6xl">MATH PANIC</h1>
      <p className="max-w-xs text-lg text-white/60">Think you're good at math?</p>
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
