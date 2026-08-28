# Math Panic

A fast, competitive, timed math challenge game. Answer as many problems as you can before the clock runs out — difficulty adapts to how well you're doing.

## Stack

React + TypeScript + Vite + Tailwind CSS v4 + Framer Motion. Entirely client-side, no backend.

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check and build for production
npm run lint      # oxlint
```

## Architecture

Game logic is kept separate from UI:

```
src/
  game/
    random/         # seeded PRNG
    questions/       # question + distractor generation, per difficulty level
    difficulty/       # adaptive difficulty engine
    scoring/           # scoring formula (tunable in one place)
    gameEngine.ts       # explicit state machine: IDLE → COUNTDOWN → PLAYING → FINISHED
  hooks/
    useGame.ts          # wraps gameEngine in a React reducer
    useTimer.ts           # timestamp-based timer (not a decrementing counter)
  components/            # Landing, Countdown, Game, Results screens
  utils/storage.ts       # localStorage: personal best, streak history
```

Not yet implemented: shareable seeded challenge URLs, a challenge-creator UI, and any backend/leaderboard features.
