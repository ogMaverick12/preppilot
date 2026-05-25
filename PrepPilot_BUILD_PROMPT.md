# PrepPilot — Master Build Prompt
# Use this with: Anthropic Opus 4.6 (Anthropic Console) or OpenAI Codex (GPT-5.5)
# This is a single-shot prompt. Feed it the entire content below.

---

You are a senior full-stack engineer building **PrepPilot** — a self-improving technical interview coaching system powered by Hermes Agent. Build the complete, production-ready codebase described below. Write every file. Do not summarize or abbreviate. Every file should be complete and immediately runnable.

---

## PROJECT OVERVIEW

PrepPilot is an AI-powered technical interview prep coach that:
- Delivers one personalized problem every morning via Telegram
- Reviews user solutions and gives adaptive feedback
- Builds a deepening model of the user's thinking patterns over time
- Gets measurably smarter the longer you use it (via Hermes Agent's skill self-improvement loop)
- Shows progress on a beautiful dark-themed web dashboard

The entire intelligence layer runs through **Hermes Agent** (MIT licensed). The primary user interface is **Telegram**. The secondary interface is a **Next.js web dashboard**.

---

## TECH STACK — USE EXACTLY THIS, NO SUBSTITUTIONS

**Frontend:**
- Next.js 14 with App Router and TypeScript
- Tailwind CSS
- shadcn/ui (use the CLI to add components as needed)
- Recharts for all data visualization
- Zustand for state management
- TanStack Query for data fetching
- Lucide React for icons
- Dark theme only — background is zinc-950 (#09090b)

**Backend:**
- Python 3.11+ with FastAPI
- SQLAlchemy 2.0 (async) with SQLite
- Alembic for migrations
- Pydantic v2 for schemas
- python-telegram-bot v21 (async) for Telegram bot
- APScheduler for background jobs

**Agent Layer:**
- Hermes Agent (already installed by user, MIT license)
- Hermes skill files (.md format)
- Cron configuration via hermes.config.yml

---

## DESIGN SYSTEM — FOLLOW EXACTLY

```css
Colors:
  --background: #09090b;      /* zinc-950 */
  --surface: #18181b;         /* zinc-900 */
  --surface-2: #27272a;       /* zinc-800 */
  --border: #3f3f46;          /* zinc-700 */
  --primary: #f59e0b;         /* amber-500 — Hermes brand gold */
  --primary-hover: #d97706;   /* amber-600 */
  --primary-muted: #451a03;   /* amber-950 */
  --success: #22c55e;         /* green-500 */
  --warning: #f59e0b;         /* amber-500 */
  --danger: #ef4444;          /* red-500 */
  --text-primary: #fafafa;    /* zinc-50 */
  --text-secondary: #a1a1aa;  /* zinc-400 */
  --text-muted: #52525b;      /* zinc-600 */
  --easy: #22c55e;
  --medium: #f59e0b;
  --hard: #ef4444;

Typography:
  Font: Inter (sans), JetBrains Mono (code)
  Use monospace font for all code output and Hermes skill files
```

The dashboard must feel premium, dark, and developer-native. Every card should have subtle border in zinc-800. No white backgrounds anywhere. Amber is the accent color for CTAs, active states, and progress indicators.

---

## FILE STRUCTURE — BUILD ALL OF THESE

```
prep-pilot/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Landing page with hero, features, CTA
│   │   ├── dashboard/page.tsx          # Main dashboard
│   │   ├── progress/page.tsx           # Full progress history
│   │   ├── problems/page.tsx           # Problem browser
│   │   └── settings/page.tsx          # User settings
│   ├── components/
│   │   ├── ui/                         # shadcn components
│   │   ├── dashboard/
│   │   │   ├── SkillRadar.tsx
│   │   │   ├── ScoreTrend.tsx
│   │   │   ├── WeekSummary.tsx
│   │   │   ├── SkillEvolution.tsx
│   │   │   └── TodaysProblem.tsx
│   │   ├── progress/
│   │   │   ├── SessionHistory.tsx
│   │   │   └── TopicBreakdown.tsx
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       └── TopBar.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   └── utils.ts
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── package.json
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── problem.py
│   │   ├── session.py
│   │   └── skill.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── problem.py
│   │   └── session.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── users.py
│   │   ├── problems.py
│   │   ├── sessions.py
│   │   ├── dashboard.py
│   │   └── webhooks.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── hermes_service.py
│   │   ├── problem_service.py
│   │   ├── coaching_service.py
│   │   ├── review_service.py
│   │   └── scheduler_service.py
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   │       └── 001_initial.py
│   ├── seed_problems.py
│   ├── alembic.ini
│   └── requirements.txt
│
├── hermes/
│   ├── config/
│   │   └── hermes.config.yml
│   ├── skills/
│   │   ├── problem_selector.md
│   │   ├── solution_reviewer.md
│   │   └── coaching_profiler.md
│   └── scripts/
│       ├── morning_brief.py
│       └── weekly_report.py
│
├── data/
│   └── problems/
│       └── *.json                      # 208 original shared problems across tracks
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## DATABASE SCHEMA — IMPLEMENT EXACTLY THIS

```python
# models/user.py
class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    telegram_id = Column(String, unique=True, nullable=False)
    telegram_username = Column(String)
    experience_level = Column(String, nullable=False)  # beginner|intermediate|advanced
    target_companies = Column(String)   # JSON array
    weak_areas = Column(String)         # JSON array
    daily_time_budget = Column(Integer, default=60)
    preferred_time = Column(String, default="08:00")
    timezone = Column(String, default="UTC")
    explanation_style = Column(String, default="balanced")
    onboarding_complete = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# models/problem.py
class Problem(Base):
    __tablename__ = "problems"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    external_id = Column(String)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    difficulty = Column(String, nullable=False)  # easy|medium|hard
    topic = Column(String, nullable=False)
    sub_topic = Column(String)
    description = Column(Text, nullable=False)
    examples = Column(Text)      # JSON
    constraints = Column(Text)   # JSON
    hints = Column(Text)         # JSON array, progressive
    solution_approach = Column(Text)
    time_complexity = Column(String)
    space_complexity = Column(String)
    source_url = Column(String)
    tags = Column(String)        # JSON
    created_at = Column(DateTime, default=datetime.utcnow)

# models/session.py
class Session(Base):
    __tablename__ = "sessions"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    problem_id = Column(String, ForeignKey("problems.id"), nullable=False)
    user_solution = Column(Text)
    language = Column(String)
    hermes_feedback = Column(Text)
    score = Column(Integer)
    score_breakdown = Column(String)   # JSON: {correctness, complexity, style, edge_cases}
    time_taken_minutes = Column(Integer)
    status = Column(String, default="sent")  # sent|attempted|solved|skipped
    difficulty_felt = Column(String)   # too_easy|right|too_hard
    explanation_helpful = Column(Integer)  # 1-5
    hints_used = Column(Integer, default=0)
    attempt_number = Column(Integer, default=1)
    selected_by_skill_version = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

# models/skill.py
class SkillVersion(Base):
    __tablename__ = "skill_versions"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    skill_name = Column(String, nullable=False)
    version = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    improvement_log = Column(Text)
    triggered_by = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class CoachingProfile(Base):
    __tablename__ = "coaching_profiles"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    thinking_patterns = Column(Text)
    common_mistakes = Column(Text)
    explanation_style_weights = Column(Text)
    successful_problem_types = Column(Text)
    struggle_patterns = Column(Text)
    last_updated = Column(DateTime, default=datetime.utcnow)

class UserTopicStat(Base):
    __tablename__ = "user_topic_stats"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    topic = Column(String, nullable=False)
    attempts = Column(Integer, default=0)
    solved = Column(Integer, default=0)
    skipped = Column(Integer, default=0)
    average_score = Column(Float, default=0)
    current_difficulty = Column(String, default="easy")
    improvement_rate = Column(Float, default=0)
    last_practiced = Column(DateTime)
    next_review = Column(DateTime)
```

---

## API ROUTES — IMPLEMENT ALL OF THESE

### Users Router (`/api/v1/users`)
- `POST /onboard` — Create user from Telegram onboarding data
- `GET /{user_id}` — Get user profile
- `PATCH /{user_id}` — Update preferences
- `GET /{user_id}/stats` — Aggregated stats

### Problems Router (`/api/v1/problems`)
- `GET /` — List all problems (paginated, filter by topic/difficulty/status)
- `GET /{problem_id}` — Get single problem
- `GET /today/{user_id}` — Get today's selected problem for user
- `POST /request` — User requests specific topic

### Sessions Router (`/api/v1/sessions`)
- `POST /` — Create session
- `GET /{user_id}` — Get session history (paginated)
- `POST /{session_id}/submit` — Submit solution (triggers Hermes review)
- `PATCH /{session_id}/feedback` — Rate explanation helpfulness
- `GET /{session_id}` — Get session with full feedback

### Dashboard Router (`/api/v1/dashboard`)
- `GET /{user_id}` — All dashboard data in one call
- `GET /{user_id}/radar` — Skill radar data (12 topics, 0-100 score each)
- `GET /{user_id}/trend` — Score over time (30 days)
- `GET /{user_id}/skills` — Skill version evolution history

### Webhooks Router (`/api/v1/webhooks`)
- `POST /telegram` — Handle all incoming Telegram messages

---

## FRONTEND PAGES — BUILD ALL WITH FULL FUNCTIONALITY

### Landing Page (`/`)
Dark hero section. PrepPilot logo (amber P icon). Tagline: "The interview coach that gets smarter the more you use it." Three feature cards below hero:
1. "Personalized Daily Problems" — adapts to your weak areas
2. "Adaptive Feedback" — learns how you think  
3. "Self-Improving AI" — Hermes skills evolve with every session

CTA button: "Start on Telegram" → opens Telegram bot link. Secondary: "View Dashboard Demo".

### Dashboard (`/dashboard`)
Left sidebar with navigation. Main content area with:

**Top row — 3 stat cards:**
- "This Week" — problems attempted / solved / score average
- "Streak" — current daily streak + longest streak
- "Overall Score" — total average score + trend arrow

**Middle row:**
- Left (60%): Skill Radar Chart (12 axes, amber filled polygon on dark grid)
- Right (40%): "Today's Problem" card (problem title, difficulty badge, topic, time estimate, "View Problem" button)

**Bottom row:**
- Left: Score Trend (30-day line chart, amber line on dark grid)
- Right: Skill Evolution Panel (shows Hermes skill version history with improvement logs)

### Progress (`/progress`)
Full session history with:
- Filterable by topic, difficulty, date range, score range
- Each session card: problem title, topic badge (colored by topic), difficulty badge, score bar, date, expandable feedback
- Topic Breakdown accordion: click any topic to see all sessions for that topic

### Problems (`/problems`)
Problem browser:
- Filter bar: topic dropdown, difficulty (Easy/Medium/Hard pills), status (All/Unseen/Attempted/Solved)
- Grid of problem cards: title, difficulty badge, topic, your score if attempted
- Click problem: modal with full description, your past attempts, option to request as tomorrow's problem

### Settings (`/settings`)
- Experience level (radio)
- Target companies (tag input)
- Daily problem time (time picker)
- Timezone (select)
- Preferred explanation style (radio with descriptions)
- Notification preferences
- Save button

---

## HERMES SKILL FILES — WRITE COMPLETE VERSIONS

### `hermes/skills/problem_selector.md`

```markdown
# skill: problem_selector
version: 1.0
created: [DATE]

## purpose
Select the single most valuable problem for a given user to practice today.

## inputs
- user_id: string
- user_profile: {experience_level, weak_areas, daily_time_budget}
- topic_stats: {topic: {average_score, attempts, current_difficulty, last_practiced}}
- recent_sessions: last 10 sessions with scores

## selection_algorithm
1. identify_focus_area:
   - find topics with average_score < 60
   - if none below 60: find topics with fewest recent attempts
   - apply recency bias: prefer topics not practiced in last 3 days

2. determine_difficulty:
   - if last 3 scores in topic > 80: step up difficulty
   - if last 3 scores in topic < 50: step down difficulty  
   - otherwise: maintain current difficulty

3. apply_spaced_repetition:
   - check if any problems are due for review (next_review <= today)
   - if yes: prioritize review over new content

4. select_problem:
   - query problem bank filtered by: topic, difficulty, not-seen-in-7-days
   - exclude problems user marked as "too easy"
   - return problem_id + selection_reasoning

## output
{
  problem_id: string,
  topic: string,
  difficulty: string,
  selection_reason: string  # shown to user: "Focusing on graphs today because your score dropped 15 points last session"
}

## improvement_log
v1.0: Initial algorithm. Basic weak-area detection and difficulty calibration.
```

### `hermes/skills/solution_reviewer.md`

```markdown
# skill: solution_reviewer
version: 1.0
created: [DATE]

## purpose
Review a user's submitted code solution and provide personalized, adaptive feedback.

## inputs
- user_solution: string (raw code)
- problem: {title, description, examples, time_complexity, space_complexity}
- user_profile: {experience_level, explanation_style, coaching_profile}
- session_history: recent feedback interactions + helpfulness ratings

## review_process
1. parse_solution:
   - detect language (Python, JavaScript, Java, C++)
   - extract: algorithmic approach, data structures used, loop patterns

2. evaluate_correctness:
   - trace through examples manually
   - check edge cases: empty input, single element, negative numbers, large input
   - score: 0-40 points

3. evaluate_complexity:
   - derive time complexity from loop/recursion structure
   - derive space complexity from data structure usage
   - compare to optimal known solution
   - score: 0-30 points

4. evaluate_edge_cases:
   - check: null/empty checks, boundary conditions, overflow handling
   - score: 0-20 points

5. evaluate_code_quality:
   - variable naming, readability, unnecessary operations
   - score: 0-10 points

6. generate_feedback:
   - apply explanation_style weights from coaching_profile
   - highlight the SINGLE most important improvement (not everything at once)
   - end with one actionable next step

## output_format
Score: {total}/100
Breakdown: {correctness}/40 | {complexity}/30 | {edge_cases}/20 | {style}/10

[Feedback in user's preferred style]

[Single most important improvement]

[One concrete next step]

## improvement_log
v1.0: Initial reviewer. Balanced explanation style. Full breakdown scoring.
```

---

## TELEGRAM BOT — IMPLEMENT COMPLETE CONVERSATION FLOW

The Telegram bot handles these conversation states:

1. **ONBOARDING** (new user, 4 steps)
2. **IDLE** (no active session)
3. **PROBLEM_SENT** (waiting for solution or command)
4. **REVIEWING** (Hermes is processing solution)
5. **FEEDBACK_REQUESTED** (waiting for explanation rating)

Commands:
- `/start` — begin onboarding or show dashboard link if already onboarded
- `/hint` — get next progressive hint for today's problem
- `/skip` — skip today's problem
- `/stats` — quick stat summary in Telegram
- `/problem` — get a link to today's problem in web dashboard
- `/dashboard` — get dashboard link

Message flow for solution submission:
1. User sends code (raw text, no formatting required)
2. Bot replies: "Reviewing your solution... 🔍 (this takes about 15 seconds)"
3. Hermes processes via solution_reviewer skill
4. Bot sends formatted review with score breakdown
5. Bot asks: "Was this explanation helpful? Reply 1-5"
6. Bot updates coaching profile based on rating

---

## HERMES CONFIG — WRITE THIS EXACTLY

```yaml
# hermes/config/hermes.config.yml

agent:
  name: "PrepPilot Coach"
  description: "A self-improving technical interview coaching agent"

model:
  # Optional hosted inference provider. The app must run without
  # OPENROUTER_API_KEY by using Hermes heuristic/demo mode.
  provider: openrouter
  model: "nousresearch/hermes-3-llama-3.1-70b"

memory:
  provider: default
  fts_enabled: true
  cross_session: true

user_modeling:
  provider: honcho
  enabled: true

messaging:
  platforms:
    - telegram

skills:
  directory: "./skills"
  auto_improve: true
  improvement_threshold: 10  # improve skill after every 10 sessions

crons:
  - name: "weekly_report"
    schedule: "0 9 * * 0"
    script: "./scripts/weekly_report.py"
    deliver: telegram
```

---

## MORNING BRIEF SCRIPT — IMPLEMENT THIS

```python
# hermes/scripts/morning_brief.py
# This script is called by Hermes cron every morning per user
# It calls the backend API to get today's problem and sends it via Telegram

import asyncio
import httpx
import os

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

async def send_morning_brief(user_id: str, telegram_id: str):
    async with httpx.AsyncClient() as client:
        # Get today's problem from backend (which uses problem_selector skill)
        response = await client.get(f"{BACKEND_URL}/api/v1/problems/today/{user_id}")
        problem = response.json()
        
        # Format and send via Telegram
        message = format_problem_message(problem)
        await client.post(f"{BACKEND_URL}/api/v1/webhooks/send", json={
            "telegram_id": telegram_id,
            "message": message
        })

def format_problem_message(problem: dict) -> str:
    difficulty_emoji = {"easy": "🟢", "medium": "🟡", "hard": "🔴"}
    return f"""🎯 PrepPilot Daily Brief

{difficulty_emoji[problem['difficulty']]} [{problem['difficulty'].capitalize()}] {problem['title']}
📚 Topic: {problem['topic'].replace('_', ' ').title()}
⏱ Est. time: {problem['estimated_minutes']} minutes

{problem['description'][:500]}{'...' if len(problem['description']) > 500 else ''}

When you're done, paste your solution here and I'll review it.

/hint — get a progressive hint
/skip — skip today's problem
"""

if __name__ == "__main__":
    asyncio.run(send_morning_brief(
        user_id=os.getenv("USER_ID"),
        telegram_id=os.getenv("TELEGRAM_ID")
    ))
```

---

## SEED DATA - GENERATE ORIGINAL PROBLEMS

Generate original problem JSON files for the local event bank:
- 208 shared problems across DSA, open-source, web, backend, frontend, data, AI/ML, security, databases, and system design
- Mix of easy/medium/hard in each topic
- Do not copy proprietary statements; use original prompts and attribution/inspiration labels only where useful
- Include: title, slug, difficulty, topic, sub_topic, description, examples (1-2), constraints (2-3), hints (3 progressive), solution_approach, time_complexity, space_complexity, tags

Topics to cover: arrays_strings, linked_lists, stacks_queues, trees, graphs, dynamic_programming, binary_search, heaps, backtracking, greedy, tries, bit_manipulation

---

## README — WRITE A COMPELLING ONE

Include:
- What PrepPilot is (one paragraph)
- How it works (3 bullet points)
- How Hermes Agent powers it (the 6 capabilities)
- Quick start (5 commands)
- Screenshot placeholders
- Tech stack badges
- License: MIT

---

## WHAT MAKES THIS SPECIAL — MAKE SURE THIS IS VISIBLE IN THE UI

The dashboard must have a **"Skill Evolution" panel** that shows:
- The current version of the problem_selector skill (e.g., "v1.4")
- The improvement log entries in a timeline
- What triggered each improvement ("User scored <50 on 3 consecutive graph problems")
- A "View Full Skill File" button that opens a modal with the complete skill markdown

This is the most important feature to make visible in the UI. It's the thing that makes PrepPilot different from every other prep tool — the AI is visibly learning. Make sure it's prominent on the dashboard.

---

## FINAL REQUIREMENTS

1. Every TypeScript file must have full type definitions — no `any`
2. Every async operation must have error handling
3. All API calls from frontend must handle loading and error states
4. The dashboard must be responsive (works on mobile)
5. Telegram bot messaging is optional/off for the event build
6. The seed script must be runnable with `python -m backend.seed_problems` and should print progress
7. The README must include a copy-paste quickstart that actually works
8. All environment variables must be in `.env.example` with descriptions

Build everything. Write every file completely. Start with the backend models and database, then the API routes, then the Hermes skills and config, then the Telegram bot, then the frontend.
