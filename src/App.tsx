import { useEffect, useMemo, useState } from "react";
import { useGame } from "./hooks/useGame";
import { Landing } from "./components/Landing/Landing";
import { Countdown } from "./components/Countdown/Countdown";
import { Game } from "./components/Game/Game";
import { Results } from "./components/Results/Results";
import { loadRecords } from "./utils/storage";
import { createChallengeConfig } from "./game/gameEngine";
import { decodeChallenge } from "./challenge/decode";
import type { GameConfig } from "./types/game";

function readInitialConfig(): GameConfig | undefined {
  const encoded = new URLSearchParams(window.location.search).get("c");
  if (!encoded) return undefined;
  const payload = decodeChallenge(encoded);
  return payload ? createChallengeConfig(payload) : undefined;
}

export default function App() {
  // Computed once at mount — the URL's challenge param shouldn't be re-read
  // as the player answers questions or plays subsequent rounds.
  const [initialConfig] = useState(readInitialConfig);
  const { phase, config, question, stats, feedback, remainingMs, durationMs, actions } = useGame(initialConfig);

  // Re-read from localStorage whenever the phase changes (e.g. after a FINISHED
  // session writes a new best) — `phase` is a trigger, not a data dependency.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const personalBest = useMemo(() => loadRecords().personalBest, [phase]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key !== " " && event.key !== "Enter") return;
      if (phase === "IDLE") {
        event.preventDefault();
        actions.start();
      } else if (phase === "FINISHED") {
        event.preventDefault();
        actions.playAgain();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, actions]);

  if (phase === "IDLE") {
    return <Landing config={config} personalBest={personalBest} onStart={actions.start} />;
  }

  if (phase === "COUNTDOWN") {
    return <Countdown onComplete={actions.beginPlaying} />;
  }

  if (phase === "PLAYING" && question) {
    return (
      <Game
        question={question}
        stats={stats}
        remainingMs={remainingMs}
        durationMs={durationMs}
        feedback={feedback}
        mode={config.mode}
        onAnswer={actions.answer}
      />
    );
  }

  if (phase === "FINISHED") {
    return <Results config={config} stats={stats} personalBest={personalBest} onPlayAgain={actions.playAgain} />;
  }

  return null;
}
