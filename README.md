# Bat Jump 🦇

A small Halloween web game and a public fixture for testing Buzz remote-agent development. Help Pip fly between the haunted towers. Space, Arrow Up or a tap makes Pip flap; P pauses the flight.

Original HTML, CSS, Canvas and JavaScript. No framework, external assets, analytics, API keys or third-party dependencies. Node.js 22 or newer runs the development tools and tests.

## Run locally

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run build
npm run dev
```

Open http://127.0.0.1:4173. Set `PORT` to use a different port. The static build is in `dist/`; any static HTTP server can host it.

To check the production build instead of the source tree, serve `dist/` on loopback with any static server, for example:

```sh
npm run build
python3 -m http.server 4174 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:4174. For a different dev port, run `PORT=4180 npm run dev`. `npm run dev` serves the source tree on loopback. Opening index.html directly as a file does not load ES modules reliably.

## Agent test fixture

| Ref | Purpose | Commands |
| --- | --- | --- |
| `main` | Playable baseline; all tests pass | `npm test`, `npm run build` |
| `codex/score-edge-fixture` | Deliberate scoring regression; keep this fixture branch unchanged | `npm run test:baseline` passes; `npm run test:regression` fails |

Record the full starting SHA before each attempt. Use a separate checkout and a unique `codex/test/<scenario>/<agent-id>` branch. Do not push to main or the shared fixture branch. Draft bug-fix PRs target `codex/score-edge-fixture`; feature PRs target `main`. Do not merge a test PR.

### Reproduce and fix

On the scoring fixture branch, a tower is counted before the whole bat has cleared its far edge. Reproduce with `npm run test:regression`, inspect `advance()` in `src/physics.mjs`, fix it, then run `npm test` and `npm run build`. Preserve the regression test. The expected score is **0** while part of the bat still overlaps the tower's horizontal range, even when the bat is safely inside the gap.

### Independent feature task

On main, add a best-score indicator that persists across reloads. Keep current score separate. The game must remain playable if browser storage is unavailable. Include suitable behavior coverage and check start, game over, restart and reload. This feature is intentionally absent from the baseline so each agent can implement it on its own branch.

### Read-only analysis task

Trace Space keydown → `fly()` → `flap()` → fixed-step `advance()` → `draw()`. Explain how `advance()` checks the bat circle against both tower rectangles and how a tower scores only once. Cite files and the checked SHA. Do not edit or post a review during this task.

## Structure

- `src/physics.mjs`: deterministic game rules; seed, motion, collision, scoring and pause state.
- `src/game.mjs`: input, browser lifecycle, accessible status and Canvas rendering.
- `tests/`: baseline behavior tests using Node's built-in test runner.
- `regressions/`: exact scoring-boundary regression.
- `scripts/`: dependency-free static build and local development server.

GitHub Actions runs the tests and build on main and pull requests. A manual workflow dispatch can exercise the deliberately failing fixture ref for CI-recovery tests. Keep expected fixture failures distinct from the healthy main baseline.

The wider smoke-test plan and execution records live in the private `HelenTian/buzz-tests` repository. Keep private runtime information, credentials and private-repository evidence out of this public repository.
