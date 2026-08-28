import { useEffect, useMemo } from "react";
import { useGame } from "./hooks/useGame";
import { Landing } from "./components/Landing/Landing";
import { Countdown } from "./components/Countdown/Countdown";
import { Game } from "./components/Game/Game";
import { Results } from "./components/Results/Results";
import { loadRecords } from "./utils/storage";

export default function App() {
  const { phase, question, stats, feedback, remainingMs, durationMs, actions } = useGame();
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
    return <Landing personalBest={personalBest} onStart={actions.start} />;
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
        onAnswer={actions.answer}
      />
    );
  }

  if (phase === "FINISHED") {
    return <Results stats={stats} personalBest={personalBest} onPlayAgain={actions.playAgain} />;
  }

  return null;
}
