
# PrepPilot

**The local interview coach that gets smarter the more you use it.**

PrepPilot is a local-first technical interview coaching system powered by Hermes Agent. It runs on your machine with Next.js, FastAPI, SQLite, local profile accounts, a full solve workspace, and Hermes skill files that learn from every session.

## What It Does

- Creates separate local profiles with email/password. One email maps to one profile.
- Selects personalized practice problems from a **208-problem shared bank** plus private custom problems.
- Opens problems in a full `/solve` workspace with a problem selector, Monaco editor, hints, examples, submission, Hermes review, score breakdown, and feedback rating.
- Stores sessions, topic stats, assessment progress, coaching profiles, and skill versions in local SQLite.
- Uses Hermes as the core FastAPI intelligence layer: `problem_selector`, `solution_reviewer`, and `coaching_profiler`.
- Verifies the local WSL Hermes CLI in Settings through `/api/v1/hermes/status`.
- Runs without OpenRouter. Optional external inference can be enabled later, but the event build uses local heuristic mode.

## Screenshots

| Local Login | Dashboard |
|---|---|
| ![Local login](docs/images/login_local_profiles.png) | ![Dashboard assessment](docs/images/dashboard_assessment.png) |

| Problem Bank | Solve Workspace |
|---|---|
| ![Problem bank](docs/images/problem_bank_208.png) | ![Solve workspace](docs/images/solve_workspace.png) |

| Hermes Review | Custom Problem | Settings |
|---|---|---|
| ![Hermes review](docs/images/hermes_review.png) | ![Custom problem](docs/images/custom_problem.png) | ![Hermes WSL status](docs/images/settings_hermes_wsl.png) |

## Local Architecture

```text
Local Browser
  -> Next.js dashboard and /solve workspace
  -> FastAPI backend
  -> PrepPilot Hermes layer
       - reads hermes/skills/*.md
       - stores user memory in SQLite
       - reviews code, selects problems, updates profiles
       - checks WSL Ubuntu Hermes CLI status
  -> data/prep_pilot.db
```

Telegram bot/webhook integration is intentionally off for this event build. Telegram username login remains available as an optional local identity shortcut, but the primary path is email/password local profiles.

## Quick Start

```bash
# 1. Install backend dependencies
pip install -r backend/requirements.txt

# 2. Install frontend dependencies
cd frontend
npm install
cd ..

# 3. Configure local environment
copy .env.example .env

# 4. Seed the 208 shared problems
python -m backend.seed_problems

# 5. Start FastAPI
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000

# 6. Start Next.js
cd frontend
npm run dev
```

Open:

- App: [http://127.0.0.1:3000](http://127.0.0.1:3000)
- API health: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

## Local Hermes Check

PrepPilot checks WSL Ubuntu for the Hermes CLI:

```bash
wsl.exe -d Ubuntu -- bash -lc "command -v hermes && hermes --version"
```

The Settings page reports:

- backend connected
- SQLite memory ready
- loaded Hermes skill versions
- WSL Hermes CLI path and version
- heuristic mode when no OpenRouter key is configured
- Telegram off unless a bot token is explicitly provided

## Problem Bank

The shared seed bank contains **208 original practice problems**:

- DSA interview patterns
- GSoC/open-source contribution tasks
- GSSoC-style community tasks
- Unstop-style hiring challenges
- backend, frontend, full stack, and web platform tasks
- data/Kaggle-style tasks
- AI/ML and RAG tasks
- databases, security, and system design basics

Private custom problems are stored with `owner_user_id` and only appear for the profile that created them.

## Core API

| Area | Endpoint | Purpose |
|---|---|---|
| Auth | `POST /api/v1/auth/register` | Create local email/password profile |
| Auth | `POST /api/v1/auth/verify-password` | Sign into local profile |
| Problems | `GET /api/v1/problems/` | List global plus owned custom problems |
| Problems | `POST /api/v1/problems/{problem_id}/start` | Create/reuse an active solve session |
| Problems | `POST /api/v1/problems/custom` | Create private custom problem |
| Sessions | `POST /api/v1/sessions/{session_id}/submit` | Submit code to Hermes |
| Sessions | `PATCH /api/v1/sessions/{session_id}/feedback` | Rate Hermes feedback |
| Hermes | `GET /api/v1/hermes/status` | Local backend, DB memory, skills, WSL CLI, inference, Telegram status |

## Project Structure

```text
frontend/        Next.js app, login, dashboard, problems, /solve, settings
backend/         FastAPI routers, services, models, schemas, migrations
hermes/          Hermes config and self-improving skill files
data/problems/   Seed problem JSON files
docs/images/     Screenshots used in README and submission post
```

## Environment

`.env.example` is local-first:

- `DATABASE_URL=sqlite+aiosqlite:///data/prep_pilot.db`
- `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`
- `HERMES_WSL_DISTRO=Ubuntu`
- `HERMES_WSL_COMMAND=/home/sreej/.local/bin/hermes`
- `OPENROUTER_API_KEY=` stays blank for heuristic mode
- `TELEGRAM_BOT_TOKEN=` stays blank for the event build

## License

MIT License. Built with Hermes Agent, FastAPI, Next.js, SQLite, and a stubborn belief that interview prep should adapt to the person doing it.
>>>>>>> 439609b (Initial commit)
