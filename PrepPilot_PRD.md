# PrepPilot — Product Requirements Document
**Version:** 1.0  
**Author:** Vi-Bit Technologies  
**Status:** Ready for Build

---

## 1. Executive Summary

PrepPilot is a self-improving technical interview coaching system powered by Hermes Agent. Unlike generic platforms (LeetCode, NeetCode, AlgoExpert), PrepPilot builds a persistent, evolving model of the individual developer — their thinking patterns, their weak areas, their explanation preferences — and uses that model to deliver increasingly personalized coaching over time.

The primary event interface is the local web dashboard and full `/solve` workspace. Telegram remains optional/off for the local build. The intelligence layer is entirely Hermes Agent inside FastAPI. Every session makes the coaching smarter. This is not a quiz app. It is an adaptive learning system.

---

## 2. Problem Statement

### The Current State
Technical interview preparation is broken in three specific ways:

**1. It's generic.** LeetCode serves 10 million users the same problems in the same order. It has no idea that you already know binary search cold but collapse under any graph problem. You waste 60% of your prep time on things you don't need.

**2. It doesn't remember you.** Every session starts from zero. You have to manually track what you've done, what you've struggled with, what you want to focus on. The tool doesn't accumulate. You do all the maintenance work.

**3. The feedback is static.** When you submit a wrong solution, you get a pre-written editorial. It doesn't know that you consistently make the same off-by-one error, or that you understand algorithms better when explained through physical analogies rather than pseudocode.

### The Cost
Developers spend 3-6 months grinding LeetCode before interviews. Most go into interviews still weak in the same areas they started with because the tool never helped them identify the pattern in their mistakes. Interview failure rates at top companies are high not because developers are incapable — but because their prep was untargeted.

### The Opportunity
A coaching system that remembers you, identifies your patterns, adapts its explanations to how you think, and gets measurably better at guiding you over time — that's a different category of tool entirely.

---

## 3. User Personas

### Primary: The Job-Seeking Developer
- Experience: 2-5 years, targeting FAANG or high-growth startups
- Problem: Has limited time (1-2 hours/day) and needs maximum efficiency
- Current tool: LeetCode Premium ($35/month), but frustrated by the generic experience
- Key need: "Tell me what to work on, not everything at once"

### Secondary: The CS Student
- Experience: Final year, first job hunt
- Problem: Has more time but less experience; overwhelmed by the scope of DSA
- Current tool: Free LeetCode + YouTube tutorials
- Key need: Structured progression with explanations that match their learning style

### Tertiary: The Career Switcher
- Experience: 3-8 years in a non-CS field, transitioning into tech
- Problem: Starting from near-zero on DSA; needs confidence building, not just content
- Current tool: Bootcamp materials, ad-hoc practice
- Key need: Patient, adaptive coaching that doesn't assume prior CS knowledge

---

## 4. Core Features

### P0 — Must Ship (MVP)

**F1: Intelligent Onboarding**
- Local email/password profile setup plus Settings profile
- Collects: experience level, target companies/programs, known weak areas, daily time budget, preferred explanation style
- Stored in Hermes persistent memory + Honcho user model
- Produces initial coaching profile

**F2: Daily Problem Selection**
- One focused problem selected for the local dashboard profile
- Problem selected based on: current weak areas, recent performance, spaced repetition schedule, difficulty calibration
- Problem brief includes: title, difficulty, topic, hints toggle, estimated completion time

**F3: Solution Review**
- User writes or pastes a solution into the full `/solve` workspace
- Hermes Agent reviews: correctness, time complexity, space complexity, edge cases missed, code style
- Feedback adapts to user's coaching profile (explanation style, detail level)
- Score generated: 0-100 with breakdown
- Hermes updates user model based on what it observed in the solution

**F4: Skill Tracking Dashboard**
- Web dashboard (Next.js)
- Radar chart: skill level across 12 DSA topics
- Progress timeline: score trend over time
- Session history: every problem attempted with score and feedback summary
- Weak area spotlight: top 3 areas needing focus this week

**F5: Hermes Skill Self-Improvement**
- The problem selection skill evolves based on observed outcomes
- The solution review skill evolves to match the user's explanation preferences
- Skill version history visible in dashboard
- Improvement log shows what changed and why

### P1 — Ship Within 2 Weeks

**F6: Weekly Coaching Report**
- Local dashboard report surface
- Metrics: problems attempted, solved, skipped; score trend; strongest topic this week; focus area for next week
- Narrative coaching message in adapted style
- Goal setting for the coming week

**F7: Problem Browser**
- Web dashboard: browse all problems in the PrepPilot problem bank
- Filter by topic, difficulty, status (attempted/solved/unseen)
- Request a specific problem outside the daily schedule

**F8: Spaced Repetition Engine**
- Problems you've struggled with come back at increasing intervals
- Problems you've mastered rotate out
- Visible in dashboard: "Due for review: 3 problems"

### P2 — Future Roadmap

**F9: Mock Interview Mode**
- Timed session (45 minutes)
- Two problems, Hermes acts as interviewer
- Post-interview debrief with hiring bar assessment

**F10: Company-Specific Preparation**
- Hermes researches company-specific interview patterns
- Adjusts problem selection and focus areas to match target company

**F11: Voice Mode**
- Use Hermes's voice mode to do oral problem walkthroughs
- Simulates phone screen interviews

**F12: Peer Comparison (Anonymous)**
- See how your score in each topic compares to other PrepPilot users at your stated experience level

---

## 5. User Stories

### Onboarding
- As a new user, I want to tell PrepPilot my experience level and weak areas in natural language so I don't have to fill out a form
- As a new user, I want to set what time I receive my daily problem so it fits my schedule

### Daily Practice
- As a user, I want to receive one problem every morning that I know is targeted at my specific weak areas, not random
- As a user, I want to write my solution in the browser workspace and get detailed feedback without leaving the app
- As a user, I want feedback that explains things the way I understand them, not in a generic editorial style

### Progress Tracking
- As a user, I want to see a visual breakdown of my skill level across all DSA topics so I know exactly where I stand
- As a user, I want to see my score trend over time to know whether I'm actually improving
- As a user, I want my weekly report to tell me something actionable, not just show me numbers

### Coaching Quality
- As a user, I want the coaching to get better the longer I use it — the explanations should feel more personalized over time
- As a user, I want to be able to see that the system is learning — visible skill file versions, improvement logs

---

## 6. Success Metrics

### User-Level
- Average score improvement over 4 weeks: target >25%
- Daily active usage rate: target >70% (user sends solution on days they receive problem)
- Week 4 retention: target >60%

### System-Level
- Skill file improvement rate: skill version should advance at least once per 7 user sessions
- Coaching personalization accuracy: user-reported satisfaction with explanation style >4/5 after week 2
- Problem targeting accuracy: % of problems where user reports "this was the right difficulty for me" — target >75%

### Product-Level
- DEV.to challenge: win Build category
- GitHub stars post-launch: target meaningful traction after the local event release
- "Would recommend" rate: target >80%

---

## 7. Non-Goals (v1.0)

- PrepPilot is NOT a problem bank builder — it sources problems from existing public datasets and LeetCode discussions
- PrepPilot is NOT a job application tracker
- PrepPilot is NOT a system design coach (v1 covers DSA only)
- PrepPilot does NOT generate novel problems — it selects and adapts from existing ones
- PrepPilot is NOT a community platform — no social features in v1

---

## 8. DSA Topic Coverage

**12 core topics, all tracked independently:**

| Topic | Sub-areas |
|---|---|
| Arrays & Strings | Two pointers, sliding window, prefix sum |
| Linked Lists | Reversal, cycle detection, merge |
| Stacks & Queues | Monotonic stack, queue-based BFS |
| Trees | Traversal, BST, path problems |
| Graphs | BFS, DFS, topological sort, shortest path |
| Dynamic Programming | 1D, 2D, knapsack, subsequence |
| Binary Search | Standard, on answer, rotated |
| Heaps | Top-K, merge K sorted, scheduling |
| Backtracking | Permutations, combinations, N-Queens |
| Greedy | Interval scheduling, jump game |
| Tries | Prefix search, word problems |
| Bit Manipulation | XOR tricks, bit masking |

---

## 9. Explanation Style Taxonomy

PrepPilot's coaching profile tracks which explanation style works for each user:

- **Analogical** — explains through real-world metaphors ("think of the stack like a stack of plates")
- **Visual** — explains through ASCII diagrams and step-by-step state changes
- **Mathematical** — explains through formal definitions, proofs, and complexity analysis
- **Code-first** — explains through annotated code before prose
- **Socratic** — explains through questions that lead the user to the answer

The coaching skill evolves the style weighting based on observed user responses.
