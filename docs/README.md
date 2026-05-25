# PrepPilot Documentation

PrepPilot is a local-first Hermes-powered interview coach. The event build runs on this machine with Next.js, FastAPI, SQLite, local email/password profiles, and WSL Ubuntu Hermes verification.

## Start Here

- [Quick Start](../README.md#quick-start) - run the local app
- [Local Hermes Check](../README.md#local-hermes-check) - verify WSL Hermes status
- [Core API](../README.md#core-api) - endpoint summary
- [Hermes Skills](./hermes-skills.md) - how the coaching layer learns

## Current Product Shape

- **Local profiles:** one email/password profile per learner, with isolated sessions, stats, assessment, custom problems, and Hermes memory.
- **Problem bank:** 208 shared seeded problems plus private custom problems.
- **Solve workspace:** `/solve` contains the problem selector, problem statement, hints, Monaco editor, Hermes review, score breakdown, and feedback rating.
- **Hermes core:** FastAPI routes call the shared submission pipeline, which reviews through `solution_reviewer`, updates topic stats, updates coaching profile, and triggers skill evolution from feedback.
- **Telegram:** bot/webhook delivery is off for the event build; Telegram username login is only an optional local identity shortcut.

## Improvement Loop

```text
Session submitted
  -> Hermes solution_reviewer scores and explains
  -> Session stores score, breakdown, status, language, time
  -> Topic stats update
  -> Coaching profile updates
  -> User rates helpfulness
  -> Hermes checks whether a skill improvement is due
  -> Skill version is stored in SQLite and shown in the dashboard
```

## Dashboard Surfaces

| Surface | Data Source | Purpose |
|---|---|---|
| Dashboard | `GET /api/v1/dashboard/{user_id}` | profile summary, assessment, today problem, trend, skills |
| Problems | `GET /api/v1/problems/?user_id=...` | shared bank plus owned custom problems |
| Solve | `GET /api/v1/sessions/detail/{session_id}` | active problem and review state |
| Settings | `GET /api/v1/hermes/status` | local backend, SQLite memory, skills, WSL Hermes, Telegram off |
| Progress | `GET /api/v1/sessions/{user_id}` | history, scores, feedback |

## Screenshot Assets

The submission post uses real local screenshots from:

- `docs/images/login_local_profiles.png`
- `docs/images/dashboard_assessment.png`
- `docs/images/problem_bank_208.png`
- `docs/images/problem_card_solve.png`
- `docs/images/solve_workspace.png`
- `docs/images/hermes_review.png`
- `docs/images/custom_problem.png`
- `docs/images/settings_hermes_wsl.png`

---

<p align="center">
  <sub>PrepPilot Documentation - Vi-Bit Technologies - 2026</sub>
</p>
