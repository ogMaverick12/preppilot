---
title: I Built a Local Interview Coach That Learns From Every Submission With Hermes Agent
published: true
tags: hermesagentchallenge, devchallenge, agents, ai
---

*This is a submission for the [Hermes Agent Challenge](https://dev.to/challenges/hermes-agent-2026-05-15)*

---

> **TL;DR:** PrepPilot is a local Hermes Agent-powered interview coach that remembers how you solve, reviews code in a full browser workspace, updates your profile after every submission, and visibly evolves its own skill files. It runs locally: Next.js, FastAPI, SQLite, 208 original shared problems, private custom problems, and Hermes verified from WSL Ubuntu on my machine.

---

## What I Built

Every developer I know has the same complaint about interview prep.

LeetCode does not know you. It does not know that you can solve array problems half asleep but freeze when a graph problem uses recursion. It does not know that a visual explanation helps you more than a formal proof. It does not remember that you keep missing the same edge case.

PrepPilot is my attempt to fix that.

It is a local-first interview coach where each learner creates a local email/password profile, solves problems in a full dashboard workspace, gets reviewed by Hermes, rates the feedback, and watches the coaching model adapt. One email means one profile. Each profile has separate sessions, custom problems, assessment progress, stats, and Hermes memory.

The important bit: Hermes is not a decorative wrapper around the app. Hermes is the core intelligence layer. The dashboard, problem bank, custom problems, and session history all flow into the same FastAPI submission pipeline, and that pipeline calls Hermes skills.

That was the line I did not want to fake. If the app claims to learn, the learning path should be visible in the product and stored in the local system, not hidden behind a demo prompt.

---

## The Working App

### Local Profiles

![Local email password profiles](docs/images/login_local_profiles.png)

For the event build, I dropped the deployment/auth complexity. No Google OAuth. No GitHub OAuth. No external auth wall. You run it locally and create as many local profiles as you want, one per email.

Telegram remains available as an optional username identity shortcut, but the main path is local email/password profiles because that is what makes sense when the database is on your own machine.

### Dashboard And Assessment

![Dashboard with assessment](docs/images/dashboard_assessment.png)

The dashboard is where Hermes becomes visible:

- current assessment progress
- score trend
- topic map
- active problem
- skill evolution timeline
- local profile data

New users go through a 3-problem calibration assessment. Hermes reviews those submissions and assigns a starting level like `foundation`, `interview-ready`, or `advanced`.

### Expanded Problem Bank

![Expanded problem bank](docs/images/problem_bank_208.png)

The app now ships with **208 original shared problems**, not scraped statements. The bank covers:

- classic DSA patterns
- GSoC and open-source contribution tasks
- GSSoC-style community tasks
- Unstop-style hiring challenges
- backend, frontend, full stack, and web platform problems
- data/Kaggle-style tasks
- AI/ML and RAG tasks
- database, security, and system design basics

Users can also create private custom problems. Those stay attached to that local profile only.

### Problem Card To Solve Flow

![Problem card solve flow](docs/images/problem_card_solve.png)

Clicking a problem is now a real flow, not a dead card. The card opens with the problem statement, examples, constraints, hints, status, and a `Solve` button. That button creates or reuses a PrepPilot session and sends the learner into the full `/solve` workspace.

### Full Solve Workspace

![Full solve workspace](docs/images/solve_workspace.png)

The small modal is gone. Solving now happens in `/solve`, a full-page workspace that fills the app like a serious practice tab:

- Problem Selector tab
- Solve tab
- problem statement, examples, constraints, hints
- Monaco editor
- language selector
- submit button
- Hermes review output
- score breakdown
- 1-5 helpfulness rating

### Hermes Review

![Hermes review](docs/images/hermes_review.png)

When a solution is submitted, Hermes stores the code, language, time taken, score, score breakdown, status, and feedback. Then it updates topic stats and the coaching profile.

After the learner rates the feedback, Hermes can update the skill file itself. That is the loop I care about most: feedback does not disappear into a black box. It changes the coach.

### Custom Problems

![Custom problem flow](docs/images/custom_problem.png)

If a learner wants to bring their own problem, they can. Custom problems use the exact same pipeline as seeded problems:

`custom problem -> session -> submit code -> Hermes review -> stats/profile update -> feedback rating -> skill evolution check`

That keeps the system honest. There is not one "real" path and one demo path.

### Local Hermes Status

![Settings with Hermes WSL status](docs/images/settings_hermes_wsl.png)

The Settings page shows whether the local foundation is actually connected:

- FastAPI backend
- SQLite memory
- loaded Hermes skill versions
- WSL Ubuntu Hermes CLI
- heuristic or optional external inference mode
- Telegram configured or off

On my machine, Hermes is installed in WSL Ubuntu:

```bash
/home/sreej/.local/bin/hermes
Hermes Agent v0.12.0
```

That status is surfaced in the app itself through `GET /api/v1/hermes/status`.

---

## How Hermes Is Used

PrepPilot has three core Hermes skills.

### `problem_selector.md`

This chooses what you should solve next. It looks at weak topics, recent scores, difficulty, assessment state, and problem freshness. It can pick from the 208 shared problems or from custom problems owned by the profile.

### `solution_reviewer.md`

This reviews your code. The review is structured:

- correctness: 40 points
- complexity: 30 points
- edge cases: 20 points
- style: 10 points

The feedback is personalized by the profile Hermes has built about you.

### `coaching_profiler.md`

This is the memory layer. It watches repeated submissions and updates the learner profile:

- recurring mistakes
- explanation style preference
- topic strengths
- weak areas
- pacing
- calibration level

That profile feeds back into both the problem selector and reviewer.

---

## The Learning Loop

```text
User solves a problem
  -> FastAPI session submission endpoint
  -> Hermes solution_reviewer
  -> score and feedback stored
  -> topic stats update
  -> coaching profile update
  -> user rates helpfulness
  -> Hermes checks whether a skill should improve
  -> new skill version appears in Skill Evolution
```

The whole point is compounding context. A generic prep platform starts fresh every time. PrepPilot should feel like it remembers what happened last week.

---

## Architecture

```text
Local Browser
  -> Next.js dashboard and /solve workspace
  -> FastAPI backend
  -> Hermes core layer
       - problem_selector
       - solution_reviewer
       - coaching_profiler
       - skill evolution
  -> SQLite memory
  -> WSL Ubuntu Hermes CLI status check
```

The Telegram bot code exists, but for this event build I am intentionally keeping the demo local. That removes deployment risk, auth-provider setup, webhooks, and cloud database problems. The local product is the thing I want judges to run and feel.

---

## Quick Start

```bash
# Backend
py -3.10 -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
backend/.venv/Scripts/python.exe -m backend.seed_problems
backend/.venv/Scripts/python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

Then open:

```text
http://127.0.0.1:3000
```

Create a local profile, solve three calibration problems, and then check Settings to see the local Hermes connection.

---

## What I Tested Locally

For the final event build I tested:

- local email/password profile creation
- duplicate email protection
- two profiles with separate progress
- expanded 208-problem bank
- problem card -> `/solve`
- code submission -> Hermes review
- resubmission after Hermes review
- feedback rating -> profile/skill path
- private custom problem creation and solving
- Settings Hermes status with WSL Ubuntu Hermes CLI
- no OpenRouter key required
- Telegram off unless explicitly configured

---

## Where I Would Push Back

The learning loop takes time to become impressive. On day one, the selector is mostly a thoughtful rule engine. Around session 8-10, the interesting behavior starts: difficulty changes, explanation style shifts, and problem choice begins to reflect the mistakes you keep making.

That is also why I wanted the skill files visible. If the app claims it is learning, the learner should be able to inspect what changed.

---

## What I Would Build Next

**Mock interview mode:** a timed two-problem round where Hermes behaves like an interviewer and writes a post-interview assessment.

**Company/program tracks:** GSoC, GSSoC, Unstop, backend interviews, frontend interviews, data roles, and system design foundations.

**Deployment later:** I deliberately removed deployment from this build so the event demo is stable. Later, the same FastAPI backend can be packaged with a persistent database and webhook setup.

---

## Final Take

There are a hundred interview prep tools. Most of them give you more problems.

PrepPilot tries to give you a coach that notices patterns.

It runs locally. It stores your history locally. It lets you solve real problems in a real editor. It reviews your code through Hermes. It updates its model of you. And then the next problem is not random anymore.

That is the part I built this for.

---

**Links:**

- GitHub: `github.com/sreejit-/prep-pilot`
- Hermes Agent: `https://hermes-agent.nousresearch.com`

---

*Built on Hermes Agent by Nous Research. Local runtime: FastAPI, SQLite, Next.js 14, WSL Ubuntu Hermes CLI. Event build: local-only, no cloud auth required, no external inference key required.*
