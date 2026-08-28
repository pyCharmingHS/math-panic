import { useState } from "react";
import type { GameConfig, GameStats } from "../../types/game";
import { toChallengePayload } from "../../game/gameEngine";
import { encodeChallenge } from "../../challenge/encode";

interface ResultsProps {
  config: GameConfig;
  stats: GameStats;
  personalBest: number;
  onPlayAgain: () => void;
}

export function Results({ config, stats, personalBest, onPlayAgain }: ResultsProps) {
  const [copied, setCopied] = useState(false);
  const accuracy = stats.totalQuestions > 0 ? Math.round((stats.correct / stats.totalQuestions) * 100) : 0;
  const bestSoFar = Math.max(personalBest, stats.score);
  const isNewBest = stats.score > 0 && stats.score >= personalBest;

  async function handleChallengeFriend() {
    const encoded = encodeChallenge(toChallengePayload(config));
    const url = `${window.location.origin}${window.location.pathname}?c=${encoded}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-[#0a0a0f] px-6 text-center text-white">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-white/50">Time!</p>
        <p className="mt-2 text-6xl font-black tracking-tight">{stats.score.toLocaleString()}</p>
        {isNewBest && <p className="mt-2 text-sm font-semibold text-emerald-400">New personal best!</p>}
      </div>

      <dl className="grid w-full max-w-xs grid-cols-2 gap-x-6 gap-y-4 text-left">
        <Stat label="Correct" value={stats.correct} />
        <Stat label="Accuracy" value={`${accuracy}%`} />
        <Stat label="Best Streak" value={stats.bestStreak} />
        <Stat label="Avg. Speed" value={`${(stats.averageResponseTime / 1000).toFixed(1)}s`} />
        <Stat label="Max Difficulty" value={stats.highestDifficulty} />
        <Stat label="Personal Best" value={bestSoFar.toLocaleString()} />
      </dl>

      <div className="w-full max-w-xs space-y-3">
        <button
          type="button"
          onClick={onPlayAgain}
          className="w-full rounded-2xl bg-indigo-500 py-4 text-lg font-bold text-white transition active:scale-95 hover:bg-indigo-400"
        >
          Play Again
        </button>
        <button
          type="button"
          onClick={handleChallengeFriend}
          className="w-full rounded-2xl border border-white/15 py-4 text-lg font-bold text-white transition active:scale-95 hover:border-white/30 hover:bg-white/5"
        >
          {copied ? "Link copied!" : "Challenge a Friend"}
        </button>
      </div>
      <p className="max-w-xs text-xs text-white/30">
        Sends a link that locks in this exact seed, difficulty ({config.startingDifficulty}), and answer mode (
        {config.answerMode === "typed" ? "Hardcore" : "Multiple Choice"}) — same problems for whoever opens it.
      </p>
      <p className="text-xs text-white/25">Press Enter or Space to play again</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-widest text-white/40">{label}</dt>
      <dd className="text-xl font-bold">{value}</dd>
    </div>
  );
}
