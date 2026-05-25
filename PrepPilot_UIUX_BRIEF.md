# PrepPilot — UI/UX Design Brief
**Version:** 1.0  
**Design Direction:** Premium Developer Tool — Refined Dark Minimalism  
**Reference Aesthetic:** Premium local developer tool + Raycast-like command clarity  

---

## 1. Design Philosophy

### The Core Idea
PrepPilot's entire value proposition is that **something is watching, learning, and adapting to you**. The design must make that invisible process visible. Every screen should reinforce the feeling: *this tool knows me, and it's getting better at knowing me.*

This means the Skill Evolution panel isn't a sidebar feature — it's a design statement. The version numbers, the improvement logs, the glowing timeline of an AI building a model of you — that's the thing people will screenshot and share. That's the "one thing someone will remember."

### Design Principles

**1. Earned Density**
Information is dense but never cluttered. Every element on screen earns its place. Generous spacing around important elements (score, radar chart, skill version) — tighter spacing for supporting data. The hierarchy is never ambiguous.

**2. Amber Means Alive**
Amber (#f59e0b) is the only color that moves, glows, or pulses. Static elements are zinc and white. When something is active, learning, or important — it's amber. This trains the user's eye: wherever amber is, something is happening.

**3. The Terminal Aesthetic**
Code feedback, skill file contents, improvement logs — everything from Hermes should feel like it came from a beautiful terminal. Monospace font, subtle green for correct code, red for errors, amber for warnings. The dashboard is polished; the agent's output is raw and technical. The contrast is intentional.

**4. Progress Should Feel Physical**
Score trends, radar charts, streak counters — these must feel visceral, not abstract. A score going from 58 to 74 should feel like something moved, not just a number changed. Use animations that make improvement tangible.

**5. Zero Decorative UI**
No illustrations. No stock graphics. No icon packs used decoratively. Every visual element either displays data or communicates system state. If it doesn't earn its place, it doesn't exist.

---

## 2. Visual Identity

### Logo
A minimal **P** lettermark in amber-500, constructed from geometric forms suggesting both a letter and an upward trajectory. The counter of the P is slightly open — suggesting forward momentum. Works at 16px (favicon) through 64px (hero).

Wordmark: **PrepPilot** in `Space Grotesk` weight 600. The two Ps create a subtle visual rhythm. "Prep" in zinc-50, "Pilot" in amber-500.

> Note: Space Grotesk is used ONLY for the wordmark/display contexts. The main UI uses `IBM Plex Sans` (body) and `JetBrains Mono` (code/terminal). This pairing is unexpected and precise — avoids the overused Inter.

### Typography System

```
Display / Hero:        Space Grotesk, 700 — landing page hero only
UI Labels / Body:      IBM Plex Sans, 400/500/600
Code / Terminal:       JetBrains Mono, 400/500
Data / Numbers:        IBM Plex Mono, 600 — scores, stats, version numbers
Caption / Meta:        IBM Plex Sans, 400, zinc-400
```

**Type Scale:**
```
--text-xs:    0.6875rem  (11px) — badges, meta labels
--text-sm:    0.8125rem  (13px) — secondary body, captions
--text-base:  0.9375rem  (15px) — primary body (slightly smaller than 16 — feels tighter, more app-like)
--text-lg:    1.0625rem  (17px) — section headers
--text-xl:    1.25rem    (20px) — card titles
--text-2xl:   1.5rem     (24px) — page headers
--text-3xl:   2rem       (32px) — dashboard main stats
--text-hero:  3.5rem     (56px) — landing hero only
```

### Color System — Complete Token Set

```css
/* ─── Backgrounds ─── */
--color-bg-base:      #09090b;   /* zinc-950 — main page background */
--color-bg-surface:   #111113;   /* slightly lighter — card backgrounds */
--color-bg-raised:    #1c1c1f;   /* zinc-900 — hover states, popovers */
--color-bg-overlay:   #27272a;   /* zinc-800 — tooltips, dropdowns */
--color-bg-input:     #18181b;   /* input fields */

/* ─── Borders ─── */
--color-border-subtle:  #27272a; /* zinc-800 — card borders, dividers */
--color-border-default: #3f3f46; /* zinc-700 — input borders, active dividers */
--color-border-strong:  #52525b; /* zinc-600 — emphasized borders */

/* ─── Brand (Amber — Hermes Gold) ─── */
--color-amber-50:   #fffbeb;
--color-amber-100:  #fef3c7;
--color-amber-400:  #fbbf24;
--color-amber-500:  #f59e0b;   /* PRIMARY — buttons, active states, focus rings */
--color-amber-600:  #d97706;   /* hover */
--color-amber-900:  #78350f;   /* deep tint */
--color-amber-950:  #451a03;   /* background tints for amber-highlighted areas */

/* ─── Text ─── */
--color-text-primary:   #fafafa;   /* zinc-50 */
--color-text-secondary: #a1a1aa;   /* zinc-400 */
--color-text-muted:     #71717a;   /* zinc-500 */
--color-text-disabled:  #3f3f46;   /* zinc-700 */
--color-text-amber:     #f59e0b;   /* amber-500 — for emphasis */
--color-text-code:      #e4e4e7;   /* zinc-200 — monospace text */

/* ─── Status ─── */
--color-success:        #22c55e;   /* green-500 */
--color-success-bg:     #052e16;   /* green-950 */
--color-warning:        #f59e0b;   /* amber-500 */
--color-warning-bg:     #451a03;   /* amber-950 */
--color-danger:         #ef4444;   /* red-500 */
--color-danger-bg:      #450a0a;   /* red-950 */
--color-info:           #3b82f6;   /* blue-500 */
--color-info-bg:        #172554;   /* blue-950 */

/* ─── Difficulty Colors ─── */
--color-easy:           #22c55e;   /* green-500 */
--color-easy-bg:        #052e16;   /* green-950 */
--color-medium:         #f59e0b;   /* amber-500 */
--color-medium-bg:      #451a03;   /* amber-950 */
--color-hard:           #ef4444;   /* red-500 */
--color-hard-bg:        #450a0a;   /* red-950 */

/* ─── Topic Colors (12 topics, distinct hues) ─── */
--topic-arrays:         #3b82f6;   /* blue */
--topic-linked-lists:   #8b5cf6;   /* violet */
--topic-stacks:         #ec4899;   /* pink */
--topic-trees:          #22c55e;   /* green */
--topic-graphs:         #f59e0b;   /* amber */
--topic-dp:             #ef4444;   /* red */
--topic-binary-search:  #06b6d4;   /* cyan */
--topic-heaps:          #f97316;   /* orange */
--topic-backtracking:   #a855f7;   /* purple */
--topic-greedy:         #84cc16;   /* lime */
--topic-tries:          #14b8a6;   /* teal */
--topic-bit-manip:      #6366f1;   /* indigo */
```

### Spacing System
```css
/* 4px base grid */
--space-1:   0.25rem  (4px)
--space-2:   0.5rem   (8px)
--space-3:   0.75rem  (12px)
--space-4:   1rem     (16px)
--space-5:   1.25rem  (20px)
--space-6:   1.5rem   (24px)
--space-8:   2rem     (32px)
--space-10:  2.5rem   (40px)
--space-12:  3rem     (48px)
--space-16:  4rem     (64px)
--space-20:  5rem     (80px)
```

### Border Radius
```css
--radius-sm:   4px    /* badges, small chips */
--radius-md:   8px    /* buttons, inputs */
--radius-lg:   12px   /* cards */
--radius-xl:   16px   /* modals, panels */
--radius-full: 9999px /* pills, avatars */
```

### Shadow System
```css
/* Glow effects for amber elements (the "alive" indicators) */
--glow-amber-sm: 0 0 8px rgba(245, 158, 11, 0.3);
--glow-amber-md: 0 0 16px rgba(245, 158, 11, 0.25), 0 0 32px rgba(245, 158, 11, 0.1);
--glow-amber-lg: 0 0 24px rgba(245, 158, 11, 0.4), 0 0 48px rgba(245, 158, 11, 0.15);

/* Elevation shadows (very subtle on dark backgrounds) */
--shadow-sm:  0 1px 2px rgba(0,0,0,0.4);
--shadow-md:  0 4px 12px rgba(0,0,0,0.5);
--shadow-lg:  0 8px 24px rgba(0,0,0,0.6);
--shadow-xl:  0 16px 48px rgba(0,0,0,0.7);
```

---

## 3. Component Library

### Card
The foundational container. Used everywhere.

```
Visual spec:
- Background: --color-bg-surface (#111113)
- Border: 1px solid --color-border-subtle (#27272a)
- Border radius: --radius-lg (12px)
- Padding: 20px 24px
- Hover state: border-color transitions to --color-border-default (#3f3f46)
- Transition: border-color 150ms ease, box-shadow 150ms ease

Variants:
  Default      — standard surface card
  Amber        — amber-950 background, amber-900 border (for highlighted content)
  Ghost        — transparent bg, visible border only
  Interactive  — hover lifts with shadow-md
```

### Button

```
Primary:
  bg: amber-500, text: zinc-950 (dark text on amber)
  hover: amber-600
  active: amber-700
  focus: 2px ring amber-500, 2px offset
  border-radius: --radius-md (8px)
  padding: 10px 20px
  font: IBM Plex Sans 500, 14px
  
Secondary:
  bg: zinc-800, text: zinc-50
  border: 1px solid zinc-700
  hover: zinc-700 bg
  
Ghost:
  bg: transparent, text: zinc-400
  hover: zinc-800 bg, text: zinc-50
  
Danger:
  bg: red-950, text: red-400
  border: 1px solid red-900
  hover: red-500 text, red-900 border

Size variants: sm (8px 14px), md (10px 20px), lg (12px 24px)
```

### Badge / Topic Chip

```
Topic chip:
  Small pill with topic color as left border (3px) 
  OR: bg is topic-color at 10% opacity, text is topic-color
  border-radius: --radius-sm (4px)
  padding: 2px 8px
  font: IBM Plex Sans 500, 11px

Difficulty badge:
  Easy:   bg green-950, text green-400, border green-900
  Medium: bg amber-950, text amber-400, border amber-900
  Hard:   bg red-950, text red-400, border red-900
  
Status badge:
  Solved:    bg green-950, text green-400 — "Solved"
  Attempted: bg blue-950, text blue-400 — "Attempted"
  Skipped:   bg zinc-900, text zinc-500 — "Skipped"
  Pending:   bg amber-950, text amber-400 — "Due Today"
```

### Score Bar

```
A horizontal progress bar representing score 0-100.

Track: bg zinc-800, height 6px, border-radius full
Fill: 
  0-49:  linear-gradient(90deg, red-700 → red-500)
  50-74: linear-gradient(90deg, amber-700 → amber-500)
  75-89: linear-gradient(90deg, green-600 → green-400)
  90-100: linear-gradient(90deg, green-400 → emerald-300)

Above the bar: score number in IBM Plex Mono, 600 weight
Animation: fill animates from 0 on mount (600ms ease-out)
```

### Skill Version Badge

```
This is the "alive" indicator — use amber glow.

Container:
  bg: amber-950
  border: 1px solid amber-900
  border-radius: radius-sm
  padding: 3px 10px
  display: inline-flex, align-items: center, gap: 6px

Dot indicator:
  8px circle, bg amber-500
  pulse animation: keyframes scale 1→1.15→1, 2s infinite

Text:
  "v1.4" in IBM Plex Mono 500, amber-400, 12px

Glow on the container: --glow-amber-sm
```

### Input Field

```
bg: zinc-900
border: 1px solid zinc-700
border-radius: radius-md
padding: 10px 14px
font: IBM Plex Sans 400, 14px, zinc-50
placeholder: zinc-600

focus:
  border-color: amber-500
  box-shadow: 0 0 0 3px rgba(245,158,11,0.15)
  outline: none

error:
  border-color: red-500
  box-shadow: 0 0 0 3px rgba(239,68,68,0.15)
```

### Sidebar Navigation Item

```
Default:
  padding: 8px 12px
  border-radius: radius-md
  color: zinc-400
  font: IBM Plex Sans 400, 14px
  display: flex, gap: 10px, align-items: center
  
Active:
  bg: amber-950
  color: amber-400
  border-left: 2px solid amber-500
  font-weight: 500
  
Hover:
  bg: zinc-900
  color: zinc-200
  transition: 100ms
```

---

## 4. Information Architecture

```
PrepPilot
│
├── / (Landing)
│   ├── Hero section
│   ├── How it works (3 steps)
│   ├── Feature showcase
│   ├── Skill Evolution preview
│   └── CTA → Telegram
│
├── /dashboard (Main Dashboard)
│   ├── Stat bar (weekly summary)
│   ├── Skill Radar (12 topics)
│   ├── Today's Problem card
│   ├── Score Trend (30 days)
│   └── Skill Evolution panel
│
├── /progress (Full History)
│   ├── Topic filter + difficulty filter
│   ├── Session history list
│   └── Per-topic breakdown accordion
│
├── /problems (Problem Browser)
│   ├── Filter bar
│   ├── Problem grid
│   └── Problem detail modal
│
└── /settings (User Preferences)
    ├── Profile section
    ├── Schedule section
    ├── Coaching style section
    └── Notification section
```

**Sidebar always visible** on desktop. Collapses to icon-only on tablet. Bottom tab bar on mobile.

---

## 5. Screen Designs — Detailed Specifications

---

### 5.1 Landing Page (`/`)

**Overall layout:** Full-viewport sections, vertical scroll. Dark throughout.

**Section 1 — Hero**

```
Background: zinc-950 with subtle radial gradient behind hero text
  radial-gradient(ellipse 800px 500px at 50% 30%, rgba(245,158,11,0.06), transparent)

Layout: Centered, max-width 800px

Elements (top to bottom):
  1. PrepPilot wordmark — 20px, centered
  2. Eyebrow label — "Powered by Hermes Agent" — amber-500 dot + text, zinc-500 small caps
  3. Hero headline — Space Grotesk 700, 56px, zinc-50:
     "The interview coach
      that learns how you think."
     Line 2: "learns" in amber-500
  4. Subheadline — IBM Plex Sans 400, 18px, zinc-400, max-width 560px:
     "PrepPilot builds a model of your thinking patterns, 
      adapts to your weak areas, and gets better every session. 
      No resets. No one-size-fits-all."
  5. CTA row — gap 12px:
     Primary button: "Start on Telegram" → telegram bot link
     Ghost button: "View Dashboard" → /dashboard
  6. Social proof — "Built on Hermes Agent · MIT License · $0 to run"
     IBM Plex Sans 400, 13px, zinc-600, centered
```

**Section 2 — How It Works (3 steps)**

```
Layout: 3 columns, max-width 960px, gap 24px

Each step card:
  bg: zinc-900
  border: 1px solid zinc-800
  border-radius: 16px
  padding: 28px
  
Step number: IBM Plex Mono, 600, 11px, amber-500, letter-spacing 0.1em
Step title: IBM Plex Sans, 600, 18px, zinc-50
Step body: IBM Plex Sans, 400, 14px, zinc-400, line-height 1.6

Steps:
  01 — "Telegram delivers your problem"
       "Every morning at your chosen time. One problem, 
        targeted to your current weak spot. No login required."
  
  02 — "Paste your solution. Get adaptive feedback."
       "Hermes reviews your code in 15 seconds. Feedback adapts 
        to your explanation style — not a generic editorial."
  
  03 — "Watch the AI learn your patterns."
       "Skills evolve. Version numbers increment. The coaching 
        gets sharper with every session you complete."
```

**Section 3 — Skill Evolution Preview (THE differentiator — make this beautiful)**

```
Heading: "The AI that shows its work"
Subhead: "Most tools give you content. PrepPilot shows you how it's learning."

Main visual: A side-by-side code diff showing skill file v1.0 vs v1.4
  Container: zinc-900, border zinc-800, border-radius 16px, overflow hidden

  Left panel header: 
    "problem_selector.md" + "v1.0 — Day 1" badge (zinc version)
    
  Right panel header:
    "problem_selector.md" + "v1.4 — Day 14" badge (amber glow version)
  
  Code content:
    Left (v1.0): sparse, 12 lines, zinc-400 monospace
    Right (v1.4): dense, 60 lines, with amber highlights on new lines
    
    New/changed lines in right panel have:
      amber-950 background
      amber-500 left border (2px)
      text in zinc-200 (slightly brighter than unchanged)
  
  Below the diff: improvement log timeline (3 entries)
    Each entry: amber dot + version + "triggered by" text
    
Amber glow effect behind the right panel to emphasize it's "alive"
```

**Section 4 — Feature Grid**

```
6 cards in 3×2 grid (or 2×3 on tablet), max-width 960px

Each card:
  bg: zinc-900, border zinc-800, border-radius 12px, padding 24px
  Icon: Lucide icon in amber-500, 20px
  Title: IBM Plex Sans 600, 16px, zinc-50
  Body: IBM Plex Sans 400, 14px, zinc-400

Cards:
  1. "Self-Improving Skills" — sparkles icon
     "Three Hermes skills evolve independently. Version history visible in your dashboard."
  
  2. "Persistent Memory" — database icon
     "Every session stored. Hermes knows what you've attempted, struggled with, and solved."
  
  3. "Adaptive Feedback" — message-square icon
     "Explanation style adjusts to your preferences. Rates high → gets reinforced."
  
  4. "Parallel Subagents" — git-branch icon
     "Correctness, complexity, and pattern analysis run in parallel. Review in 15 seconds."
  
  5. "Full Solve Workspace" — code icon
     "Problem selector, private custom problems, Monaco editor, Hermes review, and feedback rating in one browser workspace."
  
  6. "Fully Open Source" — github icon
     "MIT licensed. Runs locally. Costs $0. You own everything it learns about you."
```

**Section 5 — CTA Footer**

```
bg: very subtle amber tint (zinc-950 with amber-950 overlay at 20%)
border-top: 1px solid amber-950

Centered content:
  "Ready to start?" — Space Grotesk 700, 36px
  "Your first problem arrives tomorrow morning." — zinc-400, 16px
  Primary button: "Open PrepPilot on Telegram"
  
  Small text below: "No account needed · Works with any Telegram · Free forever"
```

---

### 5.2 Dashboard (`/dashboard`)

**Layout: Fixed left sidebar (220px) + scrollable main content**

**Sidebar**
```
Width: 220px
bg: zinc-950
border-right: 1px solid zinc-900
padding: 20px 12px

Top: PrepPilot wordmark (16px version)

Navigation items:
  📊 Dashboard      (active: amber)
  📈 Progress
  📚 Problems
  ⚙️  Settings

Bottom section (pinned):
  Current streak: "🔥 7 days" — amber, small
  Hermes status: green pulse dot + "Agent active"
  
  Small: "v1.4" amber badge — clicking opens Skill Evolution modal
```

**Top Stat Bar (3 cards, full width)**
```
Layout: 3 equal columns, gap 16px, margin-bottom 24px

Card 1 — "This Week"
  Label: "This Week" — zinc-500, 11px caps
  Value: "8 / 10" — IBM Plex Mono 600, 32px, zinc-50
         "problems solved" — zinc-400, 13px
  Trend: green arrow up + "vs last week"
  Progress bar: 80% filled in green-500

Card 2 — "Average Score"
  Value: "74" — IBM Plex Mono 600, 40px, zinc-50
  Subtitle: "+16 pts from Week 1" — green-400, 13px
  Score bar visual below the number

Card 3 — "Streak"
  Value: "7" — IBM Plex Mono 600, 40px, amber-500 with glow
  Subtitle: "day streak 🔥"
  Small: "Best: 12 days" — zinc-500, 12px
```

**Main Content Grid (2 columns)**

**Left column (60%)**

```
SKILL RADAR CHART
  Card container, full width
  Header: "Skill Levels" label + "12 topics" zinc-500 badge

  Recharts RadarChart:
    Size: 400×400px, centered
    Background: transparent
    Polar grid: zinc-800 strokes
    Polar angle axis: topic names in IBM Plex Sans 12px zinc-400
    
    Data fill: 
      Fill: rgba(245,158,11,0.15)  — amber at 15% opacity
      Stroke: amber-500, stroke-width 2px
    
    On hover of a topic point:
      Tooltip: card bg zinc-800, shows:
        Topic name
        Score: XX/100
        Attempts: N
        Current difficulty: Easy/Medium/Hard badge
      
    Animation: radarShape draws from center outward, 800ms ease-out
  
  Below chart: 12 topic pills in 4-column grid
    Each pill: topic color left border, name, score, difficulty badge
    Clicking a pill scrolls to that topic in /progress

SCORE TREND
  Card, full width, below radar
  Header: "Score Trend" + date range picker (7d / 30d / All)
  
  Recharts LineChart:
    Height: 180px
    Line: amber-500, stroke-width 2px, tension 0.4
    Area below line: linear gradient amber-500→transparent (vertical)
    Dots: 6px amber-500, visible, hover tooltip
    Grid: horizontal only, zinc-800 strokes
    X-axis: dates in zinc-500, 11px
    Y-axis: 0–100, zinc-500, 11px
    
    Reference line at user's starting score:
      Dashed, zinc-600, labeled "Start (58)"
    
    Tooltip on hover:
      Date, Score, Topic practiced
```

**Right column (40%)**

```
TODAY'S PROBLEM CARD
  bg: amber-950
  border: 1px solid amber-900
  border-radius: 12px
  padding: 24px

  Top row: difficulty badge + topic chip
  
  Problem title: IBM Plex Sans 600, 18px, zinc-50
  
  "Est. 30-40 min" — clock icon + zinc-400, 13px
  
  "Selection reason" — italic, zinc-500, 13px:
    "Focusing on graphs today. Your score dropped 
     12 points in the last 3 graph sessions."
  
  Progress row (if already received today):
    "Sent at 8:02 AM · Awaiting solution"
    OR "Solved · Score: 74"
  
  CTA button:
    Primary amber: "View Problem Details"
    Ghost: "Request Different Topic"

SKILL EVOLUTION PANEL
  Card, fills remaining right column height
  Header row: 
    "Skill Evolution" label
    amber "v1.4" badge with pulse dot
    "View full file →" ghost button

  Timeline of versions (newest first):
    Each entry:
      Left: amber dot (for latest) or zinc dot (older), connected by zinc-800 line
      Right:
        Version + date: "v1.4 — May 14" — IBM Plex Mono 500, 12px, amber-400/zinc-500
        Improvement: IBM Plex Sans 400, 13px, zinc-300, 2 lines max
        Trigger: italic zinc-500, 12px — "Triggered by: plateau detected across 4 sessions"
  
  Show 4 most recent versions. "View all versions →" at bottom.
  
  Clicking any version → opens Skill Evolution Modal (see section 5.5)
```

---

### 5.3 Progress Page (`/progress`)

**Full session history with deep filtering.**

**Filter Bar (sticky top)**
```
bg: zinc-950, border-bottom: 1px solid zinc-900, padding: 16px 24px

Row 1: filter chips
  Topic: "All Topics" dropdown → opens popover with 12 topic checkboxes (colored dots)
  Difficulty: [All] [Easy] [Medium] [Hard] — pill toggle group
  Status: [All] [Solved] [Attempted] [Skipped] — pill toggle group
  Date: "Last 30 days" dropdown

Row 2: results meta
  "Showing 34 sessions" — zinc-500, 13px
  Sort: "Newest first" dropdown
```

**Session History List**

```
Each session card:
  Layout: horizontal, full width
  bg: zinc-900 (default), zinc-950 hover with amber-950 left border
  border: 1px solid zinc-800
  border-radius: 10px
  padding: 16px 20px
  
  Left section (flex-1):
    Row 1: [Difficulty badge] [Topic chip] [Status badge]
    Row 2: Problem title — IBM Plex Sans 500, 16px, zinc-50
    Row 3: "May 14 · 32 minutes · Attempt 1" — zinc-500, 12px
  
  Center section:
    Score display: large number + score bar
    IBM Plex Mono 600, 28px
    Score bar below: 120px wide, 6px tall
  
  Right section:
    Expand icon (chevron-down)
    On expand: full hermes feedback in monospace, styled like terminal
    Feedback block:
      bg: zinc-950, border: 1px solid zinc-800, border-radius 8px
      padding: 16px
      font: JetBrains Mono, 13px
      
      Score breakdown section in amber
      "✅ Correctness..." in green
      "⚠️  Edge Cases..." in amber  
      "❌ Missed..." in red
      
      Feedback body in zinc-300
      
      Bottom: "Was this helpful? Rate 1-5" row
        5 stars in zinc-600, hover amber-500
```

**Topic Breakdown Accordion**

```
Below the session list, collapsible section:
  "Topic Breakdown" header with expand icon

Expanded: 12 topic rows
  Each row:
    Topic name + colored dot
    Score bar (average for this topic)
    "N attempts · M solved" — zinc-500
    "Last practiced: May 14" — zinc-500
    Difficulty badge (current)
    "→ View sessions" link → filters list to this topic
```

---

### 5.4 Problems Page (`/problems`)

**Filter bar same pattern as Progress.**

**Problem Grid**

```
3-column grid on desktop, 2 on tablet, 1 on mobile
gap: 16px

Each problem card:
  bg: zinc-900, border: zinc-800, border-radius: 12px, padding: 20px
  
  Top row: [Difficulty badge] [Status badge — if attempted]
  
  Problem title: IBM Plex Sans 600, 16px, zinc-50, 2 lines max
  
  Topic chip below title
  
  Bottom row:
    Left: time estimate — clock icon + "30-40 min" zinc-400 12px
    Right: your score if attempted — IBM Plex Mono, small, colored

  Hover state:
    border-color: zinc-700
    bg: zinc-800
    Title color: zinc-50 (slightly brighter)
    Subtle shadow-md lift
  
  Clicking card → opens Problem Detail Modal
```

**Problem Detail Modal**

```
Overlay: rgba(0,0,0,0.7) blur(4px)
Modal: 
  bg: zinc-900, border: 1px solid zinc-800, border-radius: 16px
  max-width: 720px, max-height: 85vh, overflow-y: auto
  padding: 32px

Header:
  [Difficulty badge] [Topic chip]
  Title: IBM Plex Sans 700, 24px, zinc-50
  "Est. 30-40 minutes" + close button (X top right)

Tabs: [Problem] [Your Attempts] [Solution Approach]

Problem tab:
  Description in IBM Plex Sans 400, 15px, zinc-300, line-height 1.7
  
  Examples section:
    Each example in monospace code block:
      bg: zinc-950, border: zinc-800, padding: 16px, radius: 8px
      
  Constraints: bulleted list, zinc-400

  Hints accordion (progressive — clicking reveals one at a time):
    "Hint 1" → click → reveals hint text in amber tint card
    "Hint 2" → (locked until Hint 1 revealed)

Your Attempts tab:
  Timeline of all sessions for this problem
  Each: date, score, status badge, expand for feedback

Solution Approach tab:
  High-level algorithm description (no full solution)
  "O(n) time, O(n) space" complexity
  Key insight highlighted in amber card

Bottom action bar:
  "Request as tomorrow's problem" — ghost button
  "Practice now" — (shows instructions to go to Telegram)
```

---

### 5.5 Skill Evolution Modal

```
This is the show-stopping screen. The one that makes PrepPilot unforgettable.

Trigger: clicking any version badge or "View full file" in dashboard

Overlay: rgba(0,0,0,0.85) blur(8px)
Modal:
  bg: zinc-900, border: 1px solid amber-900 (amber border — this is special)
  border-radius: 20px
  max-width: 900px
  width: 90vw
  max-height: 90vh
  
  Subtle amber glow on the border: box-shadow: 0 0 0 1px amber-900, --glow-amber-md

Header:
  Left: "Skill Evolution" — IBM Plex Sans 600, 20px, zinc-50
  Center: skill selector tabs — [Problem Selector] [Solution Reviewer] [Coaching Profiler]
  Right: close button, current version badge with pulse dot

Three-pane layout inside:

LEFT PANE (30%) — Version Timeline
  Scrollable list of all versions
  Each version entry:
    Selected: bg amber-950, border amber-900, amber text
    Default: bg zinc-950, zinc-700 border, zinc-400 text
    
    Version number: IBM Plex Mono 500, 14px
    Date: zinc-500, 12px
    Improvement summary: zinc-400, 12px, 2 lines
    Trigger tag: amber chip — "plateau detected" / "user feedback" / "score drop"
    
  Timeline connector: vertical line zinc-800 between entries
  Latest version has amber pulse dot

RIGHT PANE (70%) — Skill File Viewer
  Header: filename + selected version badge + "Compare to previous" toggle
  
  Code display:
    bg: zinc-950
    border: 1px solid zinc-800
    border-radius: 12px
    font: JetBrains Mono, 13px
    line-height: 1.6
    padding: 20px
    overflow-y: auto
    
    Syntax highlighting for the .md structure:
      ## headers: amber-400
      Keys (version:, created:): blue-400
      Values: zinc-200
      Comments: zinc-600 italic
    
    When "Compare to previous" is ON:
      New/changed lines: amber-950 bg, amber-500 left border (3px)
      Removed lines: red-950 bg, strikethrough, red-600 text
      Unchanged: default
  
  Bottom strip — "What triggered this improvement":
    bg: zinc-950, border-top: zinc-800, padding: 16px
    icon: zap icon (amber)
    Text: "User scored below 50 on 3 consecutive graph problems → 
           difficulty stepped down and graph frequency increased"
```

---

### 5.6 Settings Page (`/settings`)

```
Max-width: 640px, left-aligned, padded

Sections separated by zinc-800 dividers with section labels in zinc-500 small caps

Profile Section:
  Experience Level: radio group (Beginner / Intermediate / Advanced)
    Cards, not radio buttons — each option is a selectable card
    Active: amber-950 bg, amber-900 border, amber-500 dot
  
  Target Companies: tag input
    Type company name → press Enter → creates tag chip
    Tag: zinc-800 bg, zinc-600 text, × to remove
  
Schedule Section:
  Daily Problem Time: time picker — custom styled, not native
    Large time display: "08:00 AM" — IBM Plex Mono, amber-500
    Timezone selector below
  
Coaching Style Section:
  "How do you learn best?" — select one
  
  5 option cards in grid (2+2+1):
    Analogical: "Through real-world metaphors and examples"
    Visual: "Through diagrams and step-by-step state changes"  
    Mathematical: "Through formal analysis and proofs"
    Code-first: "Through annotated code before prose"
    Balanced: "Adapt based on my responses"
  
  Each card: icon, label, description — same amber selection pattern

Save Button:
  Full-width on mobile, auto-width on desktop
  "Save Preferences" — primary amber button
  Shows "Saved ✓" confirmation state for 2 seconds after save
```

---

## 6. Motion & Animation Specification

### Page Load Animations

```
Sidebar: slides in from left, 200ms ease-out (already mounted, no delay)

Dashboard cards: staggered fade-up
  Card 1 (stat bar): 0ms delay, fade + translateY(8px→0), 300ms
  Card 2 (radar):   80ms delay
  Card 3 (today):   120ms delay
  Card 4 (trend):   160ms delay
  Card 5 (skills):  200ms delay

Radar chart: draws from center outward, 800ms ease-out, 300ms after mount

Score bars: animate width from 0 to target, 600ms ease-out, staggered 50ms per bar
```

### Micro-interactions

```
Button press: scale(0.97), 100ms
Card hover: translateY(-2px) + shadow, 150ms ease-out
Sidebar item: bg color transition, 100ms
Version badge pulse: keyframes {0%: scale(1), 50%: scale(1.2), 100%: scale(1)}, 2s infinite
Skill pane transition: cross-fade, 200ms ease
Modal open: scale(0.96→1) + opacity(0→1), 200ms ease-out
Modal close: scale(1→0.97) + opacity(1→0), 150ms ease-in
```

### Meaningful Transitions

```
Score update (after solution review):
  Old score fades out (200ms)
  New score counts up from old to new value (800ms ease-out)
  Score bar animates to new width (600ms)
  If score improved: brief green flash overlay (200ms), then fades
  
Skill version update notification:
  Toast appears bottom-right:
    "Skill updated → v1.5" with amber glow
    Stays 4 seconds, slide-out right
    
New problem delivered:
  Dashboard "Today's Problem" card: 
    Amber border pulses once (attention signal)
    Content updates with fade (300ms)
```

---

## 7. Responsive Design

### Breakpoints
```
Mobile:  < 768px
Tablet:  768px – 1199px
Desktop: ≥ 1200px
```

### Layout Shifts

**Desktop (≥1200px):**
Fixed sidebar 220px + main content. Dashboard: 60/40 two-column.

**Tablet (768-1199px):**
Sidebar collapses to icon-only (60px) with tooltips. Dashboard: single column, radar and trend side by side.

**Mobile (<768px):**
No sidebar. Bottom tab bar (5 tabs: Dashboard, Progress, Problems, Settings, +). 
Dashboard: single column, full-width cards.
Radar: 300×300px, smaller topic labels.
Today's Problem card: full width, prominent.

### Mobile-Specific Adjustments
```
Bottom tab bar:
  bg: zinc-900, border-top: zinc-800
  height: 60px
  5 tabs: icons only (with labels on active)
  Active tab: amber-500 icon + amber dot indicator above
  
Touch targets: minimum 44×44px on all interactive elements
Scroll: main content scrolls, tab bar fixed
```

---

## 8. Loading States

```
Initial page load (data fetching):
  Cards show skeleton loaders — pulsing zinc-800 blocks
  Skeleton animation: shimmer effect (gradient sweep left to right)
  Duration: 1.5s cycle

Radar chart loading:
  Grey placeholder circle with pulsing, then animates in

Hermes processing (solution review):
  Replace "Review Complete" area with:
    Animated amber dots (3 dots, sequential pulse)
    "Reviewing your solution..." in zinc-400
    Estimated time: "~15 seconds"
    
  Progress indication:
    "Analyzing correctness..." → check ✓
    "Checking complexity..." → check ✓  
    "Reading your patterns..." → check ✓
    "Generating feedback..." → amber spinner
```

---

## 9. Empty States

```
No sessions yet (new user):
  Dashboard radar: dimmed placeholder with "Practice your first problem to see your skill levels"
  Timeline: single card — "Your first problem arrives tomorrow at 8AM"
  CTA: "Open Telegram to get started"

No problems match filter:
  Centered icon (search-x, zinc-600) + "No problems found" + "Clear filters" button

Skill evolution (Day 1):
  Single v1.0 entry with:
  "v1.0 — This is where it starts. Come back after 10 sessions."
  Amber card below: "Skills improve automatically. Check back in a week."
```

---

## 10. Accessibility

```
Color contrast:
  All text meets WCAG AA minimum (4.5:1 for normal, 3:1 for large)
  Amber-500 on zinc-950: 6.2:1 ✓
  Zinc-400 on zinc-950: 4.8:1 ✓

Focus states:
  All interactive elements: 2px amber-500 ring, 2px offset
  Visible in keyboard navigation mode
  
ARIA:
  Radar chart: aria-label with text description of top 3 topics
  Score bars: aria-valuenow, aria-valuemin, aria-valuemax
  Modal: role="dialog", aria-modal, focus trap
  Toast: role="status", aria-live="polite"

Motion:
  All animations respect prefers-reduced-motion
  Reduced: instant transitions, no pulse animations, no shimmer
```

---

## 11. Handoff Notes for Developer

**Priority implementation order:**
1. Design tokens (CSS variables) — set once, used everywhere
2. Core components: Card, Button, Badge, Input
3. Sidebar + navigation shell
4. Dashboard page (this is what judges see first)
5. Skill Evolution panel + modal (this is the differentiator)
6. Progress page
7. Problems page
8. Settings page
9. Landing page

**The non-negotiables:**
- The Skill Evolution panel must have the amber glow and pulse dot — this is the signature visual
- Score bars must animate on mount — static scores feel wrong
- The radar chart must draw on mount — it's the most visual proof of progress
- JetBrains Mono for all Hermes output — the terminal aesthetic is identity
- No white backgrounds anywhere — ever

**Files to create first:**
```
frontend/
├── app/globals.css          ← all CSS variables, base styles
├── tailwind.config.ts       ← custom colors, font families
└── components/
    ├── ui/card.tsx
    ├── ui/button.tsx
    ├── ui/badge.tsx
    └── dashboard/SkillEvolution.tsx   ← build this early, it's the star
```
