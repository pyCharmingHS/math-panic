# Math Panic

A fast, competitive, timed math challenge game. Answer as many problems as you can before the clock runs out — difficulty adapts to how well you're doing. Challenge a friend to the exact same set of problems with a shareable link.

## Stack

React + TypeScript + Vite + Tailwind CSS v4 + Framer Motion. Entirely client-side, no backend.

## Development

```bash
npm install
npm run dev         # start the dev server
npm run build       # type-check and build for production
npm run lint         # oxlint
npm run test          # run the test suite once
npm run test:watch     # run the test suite in watch mode
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
  challenge/            # shareable challenge link encode/decode + validation
  hooks/
    useGame.ts          # wraps gameEngine in a React reducer
    useTimer.ts           # timestamp-based timer (not a decrementing counter)
  components/            # Landing, Countdown, Game, Results screens
  utils/storage.ts       # localStorage: personal best, streak history
```

Two modes:
- **Regular** — difficulty adapts to your performance, random seed each run.
- **Challenge** — difficulty is fixed at the link's starting difficulty and the seed is fixed too, so everyone who opens the link gets the exact same question sequence. Generate one from the Results screen ("Challenge a Friend").

Game logic (`game/`, `challenge/`) is unit tested; see `*.test.ts` files alongside the source.

Not yet implemented: a challenge-creator UI (currently a challenge link is only generated from a just-played run) and any backend/leaderboard features.
