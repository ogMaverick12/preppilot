# PrepPilot — Technical Requirements Document
**Version:** 1.0  
**Stack Decision:** Final  
**Build Target:** Local event build: Next.js + FastAPI + SQLite + WSL Hermes

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACES                          │
│                                                                 │
│   ┌─────────────────┐              ┌─────────────────┐         │
│   │ Local Profiles  │              │  Web Dashboard  │         │
│   │ Email/Password  │              │  (Next.js 14)   │         │
│   └────────┬────────┘              └────────┬────────┘         │
└────────────┼───────────────────────────────┼───────────────────┘
             │                               │
             ▼                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND LAYER                            │
│                                                                 │
│              FastAPI (Python 3.11+) + SQLite                    │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  User        │  │  Problem     │  │  Session / Review    │  │
│  │  Service     │  │  Service     │  │  Service             │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
             │                               
             ▼                               
┌─────────────────────────────────────────────────────────────────┐
│                     HERMES AGENT LAYER                          │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Hermes Agent Core                         │ │
│  │                                                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │ │
│  │  │  Skill:      │  │  Skill:      │  │  Skill:        │  │ │
│  │  │  Problem     │  │  Solution    │  │  Coaching      │  │ │
│  │  │  Selector    │  │  Reviewer    │  │  Profiler      │  │ │
│  │  │  (v1.0+)     │  │  (v1.0+)     │  │  (v1.0+)       │  │ │
│  │  └──────────────┘  └──────────────┘  └────────────────┘  │ │
│  │                                                            │ │
│  │  ┌────────────────────┐  ┌───────────────────────────┐   │ │
│  │  │  Persistent Memory │  │  Honcho User Modeling     │   │ │
│  │  │  (FTS5 + LLM       │  │  (Thinking patterns,      │   │ │
│  │  │   Summarization)   │  │   Style preferences)      │   │ │
│  │  └────────────────────┘  └───────────────────────────┘   │ │
│  │                                                            │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │  Cron Jobs                                          │  │ │
│  │  │  - Daily problem delivery (user-specified time)     │  │ │
│  │  │  - Weekly coaching report (Sunday morning)          │  │ │
│  │  │  - Spaced repetition review scheduler               │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MODEL PROVIDER                             │
│                    Optional OpenRouter Hosted LLM               │
│                   Nous Hermes 3 / Mistral                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

### Frontend
| Layer | Technology | Justification |
|---|---|---|
| Framework | Next.js 14 (App Router) | Strong local DX, app router, dashboard routes |
| Styling | Tailwind CSS | Utility-first, fast to build, consistent |
| Components | shadcn/ui | Accessible, beautiful, unstyled base |
| Charts | Recharts | Flexible, React-native, no license issues |
| Icons | Lucide React | Clean, consistent, MIT |
| State | Zustand | Lightweight, no boilerplate |
| Data Fetching | TanStack Query | Caching, background refetch, loading states |
| Theme | Dark-first (`zinc-950` base) | Developer aesthetic, matches Hermes brand |

### Backend
| Layer | Technology | Justification |
|---|---|---|
| Framework | FastAPI | Async, fast, auto-docs, Python-native for Hermes integration |
| ORM | SQLAlchemy 2.0 | Full-featured, async support |
| Database | SQLite | Local-first event build with profile-isolated memory |
| Migrations | Alembic | SQLAlchemy-native, clean migration history |
| Validation | Pydantic v2 | FastAPI native, fast |
| Task Queue | APScheduler | Lightweight, no Redis needed for v1 |
| Bot | python-telegram-bot v21 | Official, async, well-maintained |

### Agent Layer
| Layer | Technology | Justification |
|---|---|---|
| Agent | Hermes Agent (MIT) | The whole point |
| Model | Hermes skills + optional Nous Hermes 3 via OpenRouter | Runs without hosted key; OpenRouter enables richer AI reviews |
| Memory | Hermes built-in (FTS5) | Zero config, persistent |
| User Modeling | Honcho (via Hermes) | Dialectic preference learning |
| Skills | Custom .md skill files | Version-controlled, readable, evolvable |

### Local Event Runtime
| Service | Use | Runtime |
|---|---|---|
| Windows + WSL Ubuntu | Local Hermes CLI verification | Local machine |
| Next.js dev server | Frontend dashboard and solve workspace | Local process |
| FastAPI dev server | API, Hermes services, SQLite memory | Local process |
| SQLite | Local profiles, sessions, custom problems, stats | Local file |
| OpenRouter | Optional external inference | Not required for local event mode |

---

## 3. Repository Structure

```
prep-pilot/
│
├── frontend/                          # Next.js 14 app
│   ├── app/
│   │   ├── layout.tsx                 # Root layout, theme provider
│   │   ├── page.tsx                   # Landing page
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Main dashboard
│   │   ├── progress/
│   │   │   └── page.tsx              # Progress & history
│   │   ├── problems/
│   │   │   └── page.tsx              # Problem browser
│   │   └── settings/
│   │       └── page.tsx              # User settings
│   ├── components/
│   │   ├── ui/                        # shadcn components
│   │   ├── dashboard/
│   │   │   ├── SkillRadar.tsx        # 12-topic radar chart
│   │   │   ├── ScoreTrend.tsx        # Line chart, 30-day trend
│   │   │   ├── WeekSummary.tsx       # This week's stats card
│   │   │   ├── SkillEvolution.tsx    # Hermes skill version history
│   │   │   └── TodaysProblem.tsx     # Current daily problem card
│   │   ├── progress/
│   │   │   ├── SessionHistory.tsx    # Paginated session list
│   │   │   ├── TopicBreakdown.tsx    # Per-topic deep dive
│   │   │   └── SpacedRepetition.tsx  # Upcoming review schedule
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       └── TopBar.tsx
│   ├── lib/
│   │   ├── api.ts                     # API client (fetch wrapper)
│   │   └── utils.ts
│   └── public/
│       └── prepPilot-logo.svg
│
├── backend/                           # FastAPI app
│   ├── main.py                        # App entry point
│   ├── database.py                    # SQLAlchemy engine + session
│   ├── models/
│   │   ├── user.py
│   │   ├── problem.py
│   │   ├── session.py
│   │   └── skill.py
│   ├── schemas/
│   │   ├── user.py
│   │   ├── problem.py
│   │   └── session.py
│   ├── routers/
│   │   ├── users.py
│   │   ├── problems.py
│   │   ├── sessions.py
│   │   ├── dashboard.py
│   │   └── webhooks.py                # Telegram webhook handler
│   ├── services/
│   │   ├── hermes_service.py          # Hermes Agent integration
│   │   ├── problem_service.py         # Problem selection logic
│   │   ├── coaching_service.py        # Coaching profile management
│   │   ├── review_service.py          # Solution review orchestration
│   │   └── scheduler_service.py      # APScheduler jobs
│   └── requirements.txt
│
├── hermes/                            # Hermes Agent configuration
│   ├── config/
│   │   └── hermes.config.yml
│   ├── skills/
│   │   ├── problem_selector.md        # Self-improving selection algorithm
│   │   ├── solution_reviewer.md       # Self-improving feedback engine
│   │   └── coaching_profiler.md       # User model builder
│   └── scripts/
│       ├── morning_brief.py           # Daily problem delivery
│       └── weekly_report.py           # Sunday report generator
│
├── data/
│   └── problems/
│       └── *.json                     # 208 shared problems plus private custom problems
│
├── docs/
│   ├── PRD.md
│   ├── TRD.md
│   └── HERMES_SKILLS.md
│
├── docker-compose.yml                 # Local dev environment
├── .env.example
└── README.md
```

---

## 4. Database Schema

### users
```sql
CREATE TABLE users (
  id                    TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  telegram_id           TEXT UNIQUE NOT NULL,
  telegram_username     TEXT,
  experience_level      TEXT NOT NULL,    -- 'beginner' | 'intermediate' | 'advanced'
  target_companies      TEXT,             -- JSON array: ["Google", "Meta"]
  weak_areas            TEXT,             -- JSON array: ["graphs", "dp"]
  daily_time_budget     INTEGER DEFAULT 60, -- minutes per day
  preferred_time        TEXT DEFAULT '08:00', -- HH:MM for daily problem
  timezone              TEXT DEFAULT 'UTC',
  explanation_style     TEXT DEFAULT 'balanced', -- 'analogical'|'visual'|'mathematical'|'code-first'|'socratic'
  onboarding_complete   BOOLEAN DEFAULT FALSE,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### problems
```sql
CREATE TABLE problems (
  id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  external_id       TEXT,               -- LeetCode problem number if applicable
  title             TEXT NOT NULL,
  slug              TEXT UNIQUE NOT NULL,
  difficulty        TEXT NOT NULL,      -- 'easy' | 'medium' | 'hard'
  topic             TEXT NOT NULL,      -- maps to 12 core topics
  sub_topic         TEXT,
  description       TEXT NOT NULL,
  examples          TEXT,               -- JSON array
  constraints       TEXT,
  hints             TEXT,               -- JSON array, progressive hints
  solution_approach TEXT,               -- High-level approach (not full solution)
  time_complexity   TEXT,
  space_complexity  TEXT,
  source_url        TEXT,
  tags              TEXT,               -- JSON array
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### sessions
```sql
CREATE TABLE sessions (
  id                    TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id               TEXT NOT NULL REFERENCES users(id),
  problem_id            TEXT NOT NULL REFERENCES problems(id),
  user_solution         TEXT,           -- Raw code pasted by user
  language              TEXT,           -- 'python' | 'javascript' | 'java' | 'cpp'
  hermes_feedback       TEXT,           -- Full feedback from Hermes (markdown)
  score                 INTEGER,        -- 0-100
  score_breakdown       TEXT,           -- JSON: {correctness, complexity, style, edge_cases}
  time_taken_minutes    INTEGER,
  status                TEXT DEFAULT 'sent', -- 'sent'|'attempted'|'solved'|'skipped'
  difficulty_felt       TEXT,           -- 'too_easy'|'right'|'too_hard' (user feedback)
  explanation_helpful   INTEGER,        -- 1-5 rating
  hints_used            INTEGER DEFAULT 0,
  attempt_number        INTEGER DEFAULT 1, -- For spaced repetition revisits
  selected_by_skill_version TEXT,       -- Which skill version selected this problem
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### user_topic_stats
```sql
CREATE TABLE user_topic_stats (
  id                  TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id             TEXT NOT NULL REFERENCES users(id),
  topic               TEXT NOT NULL,
  attempts            INTEGER DEFAULT 0,
  solved              INTEGER DEFAULT 0,
  skipped             INTEGER DEFAULT 0,
  average_score       REAL DEFAULT 0,
  current_difficulty  TEXT DEFAULT 'easy',
  improvement_rate    REAL DEFAULT 0,   -- Score delta over last 5 attempts
  last_practiced      DATETIME,
  next_review         DATETIME,         -- Spaced repetition next date
  UNIQUE(user_id, topic)
);
```

### skill_versions
```sql
CREATE TABLE skill_versions (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  skill_name      TEXT NOT NULL,        -- 'problem_selector' | 'solution_reviewer' | 'coaching_profiler'
  version         TEXT NOT NULL,        -- semver: '1.0', '1.1', etc.
  content         TEXT NOT NULL,        -- Full skill file markdown
  improvement_log TEXT,                 -- What changed in this version
  triggered_by    TEXT,                 -- What observation triggered improvement
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### coaching_profiles
```sql
CREATE TABLE coaching_profiles (
  id                        TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id                   TEXT UNIQUE NOT NULL REFERENCES users(id),
  thinking_patterns         TEXT,       -- JSON: observed patterns in solutions
  common_mistakes           TEXT,       -- JSON: recurring error types
  explanation_style_weights TEXT,       -- JSON: {analogical: 0.7, visual: 0.2, ...}
  successful_problem_types  TEXT,       -- JSON: what they solve well
  struggle_patterns         TEXT,       -- JSON: where they consistently fail
  communication_style       TEXT,       -- How they write solutions
  last_updated              DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. API Endpoints

### Users
```
POST   /api/v1/users/onboard              # Create user from Telegram onboarding
GET    /api/v1/users/{user_id}            # Get user profile
PATCH  /api/v1/users/{user_id}            # Update preferences
GET    /api/v1/users/{user_id}/stats      # Aggregated stats for dashboard
```

### Problems
```
GET    /api/v1/problems                   # List problems (paginated, filterable)
GET    /api/v1/problems/{problem_id}      # Get single problem
GET    /api/v1/problems/today/{user_id}   # Today's selected problem
POST   /api/v1/problems/request           # User requests specific topic
```

### Sessions
```
POST   /api/v1/sessions                   # Create session (problem sent to user)
GET    /api/v1/sessions/{user_id}         # Get session history (paginated)
POST   /api/v1/sessions/{session_id}/submit  # Submit solution for review
PATCH  /api/v1/sessions/{session_id}/feedback  # User rates explanation
GET    /api/v1/sessions/{session_id}      # Get single session with full feedback
```

### Dashboard
```
GET    /api/v1/dashboard/{user_id}        # All dashboard data in one call
GET    /api/v1/dashboard/{user_id}/radar  # Skill radar data
GET    /api/v1/dashboard/{user_id}/trend  # Score trend over time
GET    /api/v1/dashboard/{user_id}/skills # Hermes skill evolution history
```

### Webhooks
```
POST   /api/v1/webhooks/telegram          # Telegram bot webhook receiver
```

---

## 6. Hermes Agent Integration

### 6.1 Skill File: Problem Selector

**Location:** `hermes/skills/problem_selector.md`

This skill evolves to select the right problem for each user each day. It starts with basic rules and improves based on observed outcomes.

**Initial version (v1.0) logic:**
1. Query user's topic stats — find topics with lowest average score
2. Apply spaced repetition — check if any previous problems are due for review
3. Apply difficulty calibration — if last 3 problems scored >80, step up difficulty
4. Filter out recently seen problems (7-day window)
5. Select and return problem ID + selection reasoning

**Improvement triggers:**
- User marks problem as "too easy" → recalibrate difficulty upward for that topic
- User skips 3 problems in a row → investigate and adjust selection strategy
- User's score plateaus for 5+ sessions → change topic focus

### 6.2 Skill File: Solution Reviewer

**Location:** `hermes/skills/solution_reviewer.md`

This skill evolves to provide feedback in the user's preferred explanation style.

**Initial version (v1.0) logic:**
1. Parse submitted solution for language, structure, algorithmic approach
2. Evaluate: correctness (does it solve the problem?), complexity (O-notation), edge cases, code quality
3. Generate feedback using default balanced style
4. Score: 40% correctness + 30% complexity + 20% edge cases + 10% style

**Improvement triggers:**
- User rates explanation helpfulness <3/5 → adjust explanation style weights
- Coaching profiler identifies a recurring mistake → add specific check to reviewer
- User consistently misses same edge case type → add targeted edge case analysis

### 6.3 Skill File: Coaching Profiler

**Location:** `hermes/skills/coaching_profiler.md`

This skill builds and updates the user model by observing solution patterns.

**What it tracks:**
- Variable naming patterns (descriptive vs. single-letter)
- Comment habits (over-commented vs. none)
- Approach patterns (brute-force first vs. optimal first)
- Error types (off-by-one, null checks, overflow, boundary conditions)
- Time distribution (fast start with bugs vs. slow careful)

### 6.4 Hermes Cron Configuration

```yaml
# hermes/config/hermes.config.yml

crons:
  - name: "daily_problem"
    schedule: "user_preferred_time"     # Dynamic per user
    script: "hermes/scripts/morning_brief.py"
    deliver: "telegram"
    
  - name: "weekly_report"
    schedule: "0 9 * * 0"              # Sunday 9AM UTC
    script: "hermes/scripts/weekly_report.py"
    deliver: "telegram"
    
  - name: "spaced_repetition_check"
    schedule: "0 8 * * *"              # Daily 8AM UTC
    script: "hermes/scripts/review_scheduler.py"
    no_agent: true
    deliver: "telegram"

memory:
  provider: "default"
  fts_enabled: true
  
user_modeling:
  provider: "honcho"
  
messaging:
  platforms:
    - telegram
```

---

## 7. UI/UX Design System

### Color Palette
```css
/* Base */
--background: #09090b;        /* zinc-950 */
--surface: #18181b;           /* zinc-900 */
--surface-2: #27272a;         /* zinc-800 */
--border: #3f3f46;            /* zinc-700 */

/* Brand */
--primary: #f59e0b;           /* amber-500 — Hermes gold */
--primary-hover: #d97706;     /* amber-600 */
--primary-muted: #451a03;     /* amber-950 — for backgrounds */

/* Status */
--success: #22c55e;           /* green-500 */
--warning: #f59e0b;           /* amber-500 */
--danger: #ef4444;            /* red-500 */

/* Text */
--text-primary: #fafafa;      /* zinc-50 */
--text-secondary: #a1a1aa;    /* zinc-400 */
--text-muted: #52525b;        /* zinc-600 */

/* Difficulty */
--easy: #22c55e;
--medium: #f59e0b;
--hard: #ef4444;
```

### Typography
```css
--font-sans: 'Inter', system-ui;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Scale */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
```

### Component Patterns

**Skill Radar Chart:**
- 12 axes (one per DSA topic)
- Filled polygon in amber with 20% opacity
- Border in amber-500
- Grid lines in zinc-800
- Labels in zinc-400
- Animate on load

**Score Trend Line Chart:**
- 30-day rolling window
- Line in amber-500
- Area fill: amber-950 to transparent gradient
- Dots on data points, hover tooltip
- Reference line at user's starting score

**Session History Card:**
- Problem title + topic badge
- Score bar (colored by score range: red <50, amber 50-75, green >75)
- Difficulty badge
- Timestamp
- Expandable: shows full Hermes feedback in monospace

**Skill Evolution Panel:**
- Timeline of skill versions
- Each version: version number, date, improvement log entry, trigger
- Expandable to show full skill file diff

---

## 8. Telegram Bot Flow

### Onboarding Conversation
```
Bot: Hey! I'm PrepPilot — your personal interview coach. 
     Before we start, tell me: what's your current experience 
     level with DSA? (Beginner / Intermediate / Advanced)

User: Intermediate

Bot: Got it. Which companies are you targeting? 
     (e.g., Google, Amazon, startups — just type them out)

User: Google, Meta

Bot: What time do you want your daily problem? 
     I'll send it every morning at that time.

User: 8am IST

Bot: Last one — which areas do you already know are weak spots? 
     Don't overthink it. (e.g., "graphs, DP, I hate trees")

User: graphs and dynamic programming

Bot: Perfect. I've got everything I need. 
     
     Your first problem arrives tomorrow at 8AM IST. 
     
     Here's your coaching profile:
     📊 Level: Intermediate
     🎯 Targets: Google, Meta  
     🔴 Focus areas: Graphs, Dynamic Programming
     ⏰ Daily brief: 8:00 AM IST
     
     Check your dashboard: [link]
```

### Daily Problem Delivery
```
🎯 PrepPilot Daily Brief — May 17

[Medium] Number of Islands
Topic: Graphs (BFS/DFS)
Est. time: 25-35 minutes

Given an m x n 2D binary grid which represents a map of '1's 
(land) and '0's (water), return the number of islands.

Example:
Input: grid = [["1","1","0"],["1","1","0"],["0","0","1"]]
Output: 3

When you're done, paste your solution here and I'll review it.
/hint — get a progressive hint
/skip — skip today's problem
```

### Solution Review
```
User: [pastes Python solution]

Bot: 📋 Review Complete — Score: 78/100

✅ Correctness: Passes all test cases
📈 Time Complexity: O(m×n) — optimal
📦 Space Complexity: O(m×n) — could be reduced
⚠️  Edge Cases: Missed empty grid check (line 2)
✨ Style: Clean, good variable names

━━━━━━━━━━━━━━━━━━━━━
Where you can improve:

Your DFS approach is correct and the recursion is clean. 
The one miss: what happens if the grid is empty? Your 
code would throw an index error on line 2. Always check 
that first.

The space complexity comes from your recursion stack — 
for very large grids this could hit Python's recursion 
limit. An iterative BFS with an explicit queue avoids 
this. Want me to show you the iterative version?

━━━━━━━━━━━━━━━━━━━━━
Was this explanation helpful? Rate 1-5: /rate
```

---

## 9. Deployment Guide

### Local Development

```bash
# 1. Clone repo
git clone https://github.com/yourusername/prep-pilot
cd prep-pilot

# 2. Install Hermes Agent
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

# 3. Backend setup
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python seed_problems.py    # Seeds 208 shared problems
uvicorn main:app --reload

# 4. Frontend setup
cd ../frontend
npm install
npm run dev

# 5. Configure Hermes
cp .env.example .env
# Set TELEGRAM_BOT_TOKEN and DATABASE_URL as needed.
# OPENROUTER_API_KEY is optional; leave blank for Hermes heuristic mode.

# 6. Start Hermes Agent
hermes
```

### Local Event Run

**Backend:**
```bash
py -3.10 -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
backend/.venv/Scripts/python.exe -m backend.seed_problems
backend/.venv/Scripts/python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev -- --hostname 127.0.0.1 --port 3000
```

**Hermes status:**
```bash
wsl.exe -d Ubuntu -- bash -lc "command -v hermes && hermes --version"
```

---

## 10. Environment Variables

```env
# Backend
APP_MODE=local
DATABASE_URL=sqlite:///./preppilot.db

# Local auth
NEXTAUTH_URL=http://127.0.0.1:3000
NEXTAUTH_SECRET=local-development-secret-change-me

# Hermes / Model
HERMES_WSL_DISTRO=Ubuntu
HERMES_WSL_COMMAND=/home/sreej/.local/bin/hermes
HERMES_WSL_TIMEOUT_SECONDS=30
OPENROUTER_API_KEY=
TELEGRAM_BOT_TOKEN=

# Frontend
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

---

## 11. Problem Bank Seed Data Structure

```json
{
  "problems": [
    {
      "external_id": "200",
      "title": "Number of Islands",
      "slug": "number-of-islands",
      "difficulty": "medium",
      "topic": "graphs",
      "sub_topic": "bfs_dfs",
      "description": "Given an m x n 2D binary grid...",
      "examples": [
        {
          "input": "grid = [[\"1\",\"1\",\"0\"],[\"0\",\"1\",\"0\"]]",
          "output": "1",
          "explanation": "The islands are connected land cells..."
        }
      ],
      "constraints": ["m == grid.length", "n == grid[i].length"],
      "hints": [
        "Think about how to visit all connected cells",
        "Try a recursive DFS from each unvisited land cell",
        "Mark visited cells to avoid counting them twice"
      ],
      "solution_approach": "Use DFS or BFS from each unvisited '1' cell. Mark visited cells. Count the number of DFS/BFS calls.",
      "time_complexity": "O(m×n)",
      "space_complexity": "O(m×n)",
      "tags": ["graph", "dfs", "bfs", "matrix"]
    }
  ]
}
```

---

## 12. Security Considerations

- Local passwords are stored as salted PBKDF2 hashes, never plaintext
- One email maps to one local profile
- Telegram token is blank/off for the event build unless explicitly configured
- All API routes validate that requesting user matches resource owner
- Code submitted by users is never executed — only analyzed by Hermes
- SQLite database and Hermes coaching memory stay local
