# Hermes Skill Files - Deep Dive

PrepPilot keeps Hermes as the core intelligence layer inside the FastAPI backend. The frontend, problem bank, custom problems, dashboard submissions, and optional Telegram identity all converge on the same backend session pipeline.

## Local Runtime

The event build is local-only:

- FastAPI loads skill files from `hermes/skills/*.md`.
- SQLite stores sessions, topic stats, coaching profiles, custom problems, and skill versions.
- `/api/v1/hermes/status` checks WSL Ubuntu for the local Hermes CLI.
- OpenRouter is optional and unused by default; heuristic Hermes review remains available without keys.

## The Three Skills

### `problem_selector.md`

Chooses the next useful problem for a local profile. It considers weak topics, recent scores, difficulty calibration, active assessment state, and problem freshness. It can select from the 208 shared problems or from private custom problems owned by the profile.

### `solution_reviewer.md`

Reviews submitted code from `/solve` or any other session submission source. The stored review includes:

- score out of 100
- correctness, complexity, edge case, and style breakdown
- language and time taken
- session status
- feedback text that can be rated by the learner

### `coaching_profiler.md`

Turns repeated submissions into a profile of the learner: explanation style, recurring mistakes, topic strength, pacing, and assessment level. The profile updates after every review and again after helpfulness feedback.

## Skill Evolution

```text
Review completed
  -> profile and topic stats update
  -> helpfulness rating arrives
  -> Hermes checks improvement threshold
  -> skill file content/version is updated
  -> dashboard Skill Evolution shows the version history
```

Skill improvements are guarded so the same session threshold does not trigger duplicate improvements.

## Why This Matters

The skill files are not decorative prompts. They are the readable contract for how PrepPilot coaches:

- the selector decides what to solve next
- the reviewer decides how to score and explain
- the profiler decides what Hermes remembers about the learner

That makes the learning loop visible, testable, and local.
