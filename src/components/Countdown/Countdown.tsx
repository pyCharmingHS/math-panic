import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const BEATS = ["3", "2", "1", "GO"];
const BEAT_MS = 500;

interface CountdownProps {
  onComplete: () => void;
}

export function Countdown({ onComplete }: CountdownProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= BEATS.length) {
      onComplete();
      return;
    }
    const timer = window.setTimeout(() => setIndex((i) => i + 1), BEAT_MS);
    return () => window.clearTimeout(timer);
  }, [index, onComplete]);

  const label = BEATS[Math.min(index, BEATS.length - 1)];

  return (
    <div className="flex min-h-svh items-center justify-center bg-[#0a0a0f]">
      <AnimatePresence mode="wait">
        <motion.span
          key={label}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.3 }}
          transition={{ duration: 0.18 }}
          className="text-8xl font-black tracking-tight text-white"
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
