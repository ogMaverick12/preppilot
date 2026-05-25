// lib/mock-data.ts — Realistic demo data for PrepPilot

export const MOCK_USER = {
  id: 'usr_01',
  name: 'Sreejit',
  telegram_username: '@sreejit_',
  experience_level: 'intermediate',
  target_companies: ['Google', 'Meta', 'Stripe'],
  preferred_time: '08:00',
  timezone: 'Asia/Kolkata',
  explanation_style: 'analogical',
  streak: 7,
  longest_streak: 12,
  joined: '2026-04-28',
}

export const TOPIC_META: Record<string, { label: string; color: string; bg: string }> = {
  arrays:       { label: 'Arrays & Strings',  color: '#3b82f6', bg: 'rgba(59,130,246,0.1)'  },
  linkedlists:  { label: 'Linked Lists',       color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)'  },
  stacks:       { label: 'Stacks & Queues',    color: '#ec4899', bg: 'rgba(236,72,153,0.1)'  },
  trees:        { label: 'Trees',              color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
  graphs:       { label: 'Graphs',             color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  dp:           { label: 'Dynamic Programming',color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
  binarysearch: { label: 'Binary Search',      color: '#06b6d4', bg: 'rgba(6,182,212,0.1)'   },
  heaps:        { label: 'Heaps',              color: '#f97316', bg: 'rgba(249,115,22,0.1)'  },
  backtracking: { label: 'Backtracking',       color: '#a855f7', bg: 'rgba(168,85,247,0.1)'  },
  greedy:       { label: 'Greedy',             color: '#84cc16', bg: 'rgba(132,204,22,0.1)'  },
  tries:        { label: 'Tries',              color: '#14b8a6', bg: 'rgba(20,184,166,0.1)'  },
  bitmanip:     { label: 'Bit Manipulation',   color: '#6366f1', bg: 'rgba(99,102,241,0.1)'  },
  backend:      { label: 'Backend',            color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)'  },
  frontend:     { label: 'Frontend',           color: '#eab308', bg: 'rgba(234,179,8,0.1)'   },
  fullstack:    { label: 'Full Stack',         color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
  web:          { label: 'Web Platform',       color: '#f43f5e', bg: 'rgba(244,63,94,0.1)'   },
  aiml:         { label: 'AI/ML',              color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)'  },
  data:         { label: 'Data & Kaggle',      color: '#06b6d4', bg: 'rgba(6,182,212,0.1)'   },
  opensource:   { label: 'Open Source',        color: '#84cc16', bg: 'rgba(132,204,22,0.1)'  },
  systemdesign: { label: 'System Design',      color: '#f97316', bg: 'rgba(249,115,22,0.1)'  },
  databases:    { label: 'Databases',          color: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
  security:     { label: 'Security',           color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
  custom:       { label: 'Custom',             color: '#a1a1aa', bg: 'rgba(161,161,170,0.1)' },
}

export const MOCK_RADAR_DATA = [
  { topic: 'Arrays',        key: 'arrays',       score: 82, attempts: 18, difficulty: 'hard'   },
  { topic: 'Linked Lists',  key: 'linkedlists',  score: 74, attempts: 9,  difficulty: 'medium' },
  { topic: 'Stacks',        key: 'stacks',       score: 79, attempts: 11, difficulty: 'medium' },
  { topic: 'Trees',         key: 'trees',        score: 68, attempts: 14, difficulty: 'medium' },
  { topic: 'Graphs',        key: 'graphs',       score: 58, attempts: 12, difficulty: 'medium' },
  { topic: 'DP',            key: 'dp',           score: 51, attempts: 10, difficulty: 'easy'   },
  { topic: 'Binary Search', key: 'binarysearch', score: 88, attempts: 8,  difficulty: 'hard'   },
  { topic: 'Heaps',         key: 'heaps',        score: 63, attempts: 7,  difficulty: 'medium' },
  { topic: 'Backtracking',  key: 'backtracking', score: 55, attempts: 6,  difficulty: 'easy'   },
  { topic: 'Greedy',        key: 'greedy',       score: 71, attempts: 9,  difficulty: 'medium' },
  { topic: 'Tries',         key: 'tries',        score: 45, attempts: 4,  difficulty: 'easy'   },
  { topic: 'Bit Manip',     key: 'bitmanip',     score: 60, attempts: 5,  difficulty: 'easy'   },
]

export const MOCK_SCORE_TREND = [
  { date: 'Apr 28', score: 54, topic: 'Arrays'  },
  { date: 'Apr 29', score: 58, topic: 'Graphs'  },
  { date: 'Apr 30', score: 52, topic: 'DP'      },
  { date: 'May 01', score: 61, topic: 'Trees'   },
  { date: 'May 02', score: 65, topic: 'Arrays'  },
  { date: 'May 03', score: 58, topic: 'Graphs'  },
  { date: 'May 04', score: 67, topic: 'Stacks'  },
  { date: 'May 05', score: 72, topic: 'DP'      },
  { date: 'May 06', score: 69, topic: 'Trees'   },
  { date: 'May 07', score: 74, topic: 'Arrays'  },
  { date: 'May 08', score: 71, topic: 'Graphs'  },
  { date: 'May 09', score: 78, topic: 'Binary Search' },
  { date: 'May 10', score: 75, topic: 'DP'      },
  { date: 'May 11', score: 80, topic: 'Heaps'   },
  { date: 'May 12', score: 76, topic: 'Graphs'  },
  { date: 'May 13', score: 82, topic: 'Arrays'  },
  { date: 'May 14', score: 79, topic: 'Trees'   },
  { date: 'May 15', score: 85, topic: 'Binary Search' },
  { date: 'May 16', score: 81, topic: 'DP'      },
  { date: 'May 17', score: 74, topic: 'Graphs'  },
]

export const MOCK_TODAY_PROBLEM = {
  id: 'prob_graphs_01',
  title: 'Course Schedule',
  difficulty: 'medium' as const,
  topic: 'graphs',
  sub_topic: 'Topological Sort',
  estimated_minutes: '30–40',
  status: 'sent',
  sent_at: '08:02 AM',
  selection_reason: 'Focusing on Graphs today. Your score dropped 14 points across your last 3 graph sessions.',
}

export const MOCK_WEEK_SUMMARY = {
  problems_sent: 7,
  problems_solved: 5,
  problems_skipped: 1,
  avg_score: 78,
  avg_score_last_week: 69,
  best_topic: 'Binary Search',
  focus_topic: 'Dynamic Programming',
  score_delta: +9,
}

export const MOCK_SKILL_VERSIONS = [
  {
    skill: 'problem_selector',
    version: '1.4',
    date: 'May 14, 2026',
    summary: 'Added problem_type_weighting after observing consistent DFS recursion failures.',
    trigger: 'Score pattern analysis',
    trigger_detail: 'User failed 3 consecutive DFS-recursive problems while succeeding on BFS variants.',
    isLatest: true,
    content: `# skill: problem_selector
version: 1.4
last_improved: 2026-05-14

## task
Select the single most valuable problem for the user to practice today.

## selection_algorithm
1. identify_focus_area:
   - find topics with average_score < 65
   - apply recency bias: prefer topics not seen in 3+ days
   - weight by recency of score drop (not just current level)

2. determine_difficulty:
   - if last 3 scores in topic > 80: step up difficulty
   - if last 2 consecutive scores < 50: step down AND switch sub-topic
   - detect plateau: score unchanged across 4+ sessions → change approach

3. spaced_repetition:
   - score 50–70: review in 3 days
   - score < 50: review in 1 day
   - score > 85: review in 7 days

4. problem_type_weighting:
   - user profile: succeeds on BFS, struggles on DFS recursion depth
   - prefer iterative graph problems for this user
   - when introducing new graph problem: start with BFS variant

## improvement_log
v1.0: Basic weak-area selection, flat difficulty calibration.
v1.1: Added recency bias — stopped repeating same topic 3 days running.
v1.2: Added plateau detection — was stuck at same difficulty for weeks.
v1.3: Added spaced repetition intervals calibrated by score band.
v1.4: Added problem_type_weighting after observing DFS recursion issues.`
  },
  {
    skill: 'problem_selector',
    version: '1.3',
    date: 'May 10, 2026',
    summary: 'Added spaced repetition intervals calibrated by score band (50-70 → 3d, <50 → 1d, >85 → 7d).',
    trigger: 'Plateau detected',
    trigger_detail: 'User\'s DP score unchanged at 51 across 5 consecutive sessions.',
    isLatest: false,
    content: '',
  },
  {
    skill: 'problem_selector',
    version: '1.2',
    date: 'May 06, 2026',
    summary: 'Added plateau detection. Previous version was recycling same difficulty indefinitely.',
    trigger: 'Skill self-audit',
    trigger_detail: 'Hermes detected that difficulty hadn\'t changed across 4 consecutive weeks.',
    isLatest: false,
    content: '',
  },
  {
    skill: 'problem_selector',
    version: '1.1',
    date: 'May 02, 2026',
    summary: 'Added recency bias — stopped re-selecting the same topic 3 days in a row.',
    trigger: 'User feedback',
    trigger_detail: 'User skipped 2 consecutive graph problems after solving 5 graph problems prior week.',
    isLatest: false,
    content: '',
  },
  {
    skill: 'problem_selector',
    version: '1.0',
    date: 'Apr 28, 2026',
    summary: 'Initial algorithm. Basic weak-area detection and difficulty calibration.',
    trigger: 'Created on onboarding',
    trigger_detail: 'First session. Default skill generated from user profile.',
    isLatest: false,
    content: `# skill: problem_selector
version: 1.0
created: 2026-04-28

## task
Select the most relevant problem for the user today.

## steps
1. Find topics with lowest average score
2. Apply current difficulty setting
3. Return problem not seen in last 7 days

## improvement_log
v1.0: Initial version.`,
  },
]

export const MOCK_SESSIONS: Session[] = [
  {
    id: 's1',
    problem: { title: 'Course Schedule', difficulty: 'medium', topic: 'graphs', slug: 'course-schedule' },
    score: 71, status: 'attempted', date: 'May 17, 2026', time_taken: 38, language: 'python',
    score_breakdown: { correctness: 28, complexity: 23, edge_cases: 14, style: 6 },
    feedback: `Score: 71/100

✅ Correctness: 28/40 — Passes 9/10 test cases
📈 Complexity: 23/30 — O(V+E), near-optimal
⚠️  Edge Cases: 14/20 — Missed: empty prerequisites list
✨ Style: 6/10 — Clean variable names, redundant loop on line 12

Your BFS structure is correct and queue management is clean. 
The miss: an empty prerequisites list should return True immediately.
Your code iterates the adjacency list unnecessarily.

One thing to fix: add an early-return guard at the top.
if not prerequisites: return True`
  },
  {
    id: 's2',
    problem: { title: 'Search in Rotated Sorted Array', difficulty: 'medium', topic: 'binarysearch', slug: 'search-rotated' },
    score: 91, status: 'solved', date: 'May 16, 2026', time_taken: 22, language: 'python',
    score_breakdown: { correctness: 38, complexity: 29, edge_cases: 18, style: 6 },
    feedback: `Score: 91/100

✅ Correctness: 38/40 — All test cases pass
📈 Complexity: 29/30 — O(log n), optimal
✅ Edge Cases: 18/20 — Handled pivot and single element
✨ Style: 6/10 — One minor: rename 'l' and 'r' to 'left' and 'right'

Clean binary search implementation. The pivot detection logic 
is clear and correct. Only minor improvement: variable naming 
convention — single letters are a habit to break before your interview.`
  },
  {
    id: 's3',
    problem: { title: 'Coin Change', difficulty: 'medium', topic: 'dp', slug: 'coin-change' },
    score: 58, status: 'attempted', date: 'May 15, 2026', time_taken: 45, language: 'python',
    score_breakdown: { correctness: 22, complexity: 18, edge_cases: 12, style: 6 },
    feedback: `Score: 58/100

✅ Correctness: 22/40 — Passes 6/10 test cases (fails on amount=0 and large coins)
📈 Complexity: 18/30 — O(n×amount) but suboptimal initialization
⚠️  Edge Cases: 12/20 — Missed amount=0 returns 0, not -1
✨ Style: 6/10 — Good

Think of the DP table as a row of boxes. Each box asks: 
"what's the fewest coins to fill a bag of exactly this size?"
You fill each box by looking back at previous boxes.

The bug: dp[0] should be 0 (zero coins for amount zero), 
not float('inf'). This is why large amounts fail too.`
  },
  {
    id: 's4',
    problem: { title: 'Binary Tree Level Order Traversal', difficulty: 'medium', topic: 'trees', slug: 'bt-level-order' },
    score: 84, status: 'solved', date: 'May 14, 2026', time_taken: 28, language: 'python',
    score_breakdown: { correctness: 36, complexity: 27, edge_cases: 16, style: 5 },
    feedback: `Score: 84/100

✅ Correctness: 36/40 — Passes all standard cases
📈 Complexity: 27/30 — O(n) time, O(n) space
✅ Edge Cases: 16/20 — Handled null root
✨ Style: 5/10 — deque import not used (you used a list as queue)

Good BFS structure. The level tracking with a size variable 
is exactly right. Minor: using collections.deque instead of 
a list for the queue gives O(1) popleft vs O(n).`
  },
  {
    id: 's5',
    problem: { title: 'Maximum Subarray', difficulty: 'medium', topic: 'arrays', slug: 'maximum-subarray' },
    score: 95, status: 'solved', date: 'May 13, 2026', time_taken: 15, language: 'python',
    score_breakdown: { correctness: 40, complexity: 30, edge_cases: 19, style: 6 },
    feedback: `Score: 95/100

✅ Correctness: 40/40 — All test cases pass, including edge cases
📈 Complexity: 30/30 — O(n) time, O(1) space — optimal Kadane's
✅ Edge Cases: 19/20 — Caught all-negative array, single element
✨ Style: 6/10 — Minor: variable name 'cur' could be 'current_sum'

Nearly perfect. Kadane's algorithm implemented cleanly with 
correct handling of the all-negative case. This is interview-ready.`
  },
]

export type Session = {
  id: string
  problem: { title: string; difficulty: 'easy' | 'medium' | 'hard'; topic: string; slug: string }
  score: number
  status: 'solved' | 'attempted' | 'skipped'
  date: string
  time_taken: number
  language: string
  score_breakdown: { correctness: number; complexity: number; edge_cases: number; style: number }
  feedback: string
}

export const MOCK_PROBLEMS = [
  { id: 'p1',  title: 'Two Sum',                    difficulty: 'easy',   topic: 'arrays',       slug: 'two-sum',            est_min: '10–15', your_score: 95, status: 'solved'   },
  { id: 'p2',  title: 'Course Schedule',             difficulty: 'medium', topic: 'graphs',       slug: 'course-schedule',    est_min: '30–40', your_score: 71, status: 'attempted'},
  { id: 'p3',  title: 'Coin Change',                 difficulty: 'medium', topic: 'dp',           slug: 'coin-change',        est_min: '35–45', your_score: 58, status: 'attempted'},
  { id: 'p4',  title: 'Search in Rotated Array',     difficulty: 'medium', topic: 'binarysearch', slug: 'search-rotated',     est_min: '20–30', your_score: 91, status: 'solved'   },
  { id: 'p5',  title: 'Maximum Subarray',            difficulty: 'medium', topic: 'arrays',       slug: 'maximum-subarray',   est_min: '15–20', your_score: 95, status: 'solved'   },
  { id: 'p6',  title: 'Number of Islands',           difficulty: 'medium', topic: 'graphs',       slug: 'number-of-islands',  est_min: '25–35', your_score: null, status: 'unseen'},
  { id: 'p7',  title: 'Climbing Stairs',             difficulty: 'easy',   topic: 'dp',           slug: 'climbing-stairs',    est_min: '10–15', your_score: null, status: 'unseen'},
  { id: 'p8',  title: 'LRU Cache',                   difficulty: 'medium', topic: 'linkedlists',  slug: 'lru-cache',          est_min: '35–45', your_score: 77, status: 'solved'   },
  { id: 'p9',  title: 'Valid Parentheses',            difficulty: 'easy',   topic: 'stacks',       slug: 'valid-parentheses',  est_min: '10–15', your_score: 100, status: 'solved'  },
  { id: 'p10', title: 'Binary Tree Level Order',     difficulty: 'medium', topic: 'trees',        slug: 'bt-level-order',     est_min: '25–35', your_score: 84, status: 'solved'   },
  { id: 'p11', title: 'Merge K Sorted Lists',        difficulty: 'hard',   topic: 'heaps',        slug: 'merge-k-sorted',     est_min: '40–55', your_score: null, status: 'unseen'},
  { id: 'p12', title: 'Word Search',                 difficulty: 'medium', topic: 'backtracking', slug: 'word-search',        est_min: '30–40', your_score: null, status: 'unseen'},
  { id: 'p13', title: 'Longest Consecutive Sequence',difficulty: 'medium', topic: 'arrays',       slug: 'longest-consecutive',est_min: '25–35', your_score: 88, status: 'solved'   },
  { id: 'p14', title: 'Implement Trie',              difficulty: 'medium', topic: 'tries',        slug: 'implement-trie',     est_min: '30–40', your_score: 45, status: 'attempted'},
  { id: 'p15', title: 'Jump Game',                   difficulty: 'medium', topic: 'greedy',       slug: 'jump-game',          est_min: '20–25', your_score: 79, status: 'solved'   },
  { id: 'p16', title: 'Single Number',               difficulty: 'easy',   topic: 'bitmanip',     slug: 'single-number',      est_min: '10–15', your_score: 90, status: 'solved'   },
  { id: 'p17', title: 'Reverse Linked List',         difficulty: 'easy',   topic: 'linkedlists',  slug: 'reverse-linked-list',est_min: '10–15', your_score: 100, status: 'solved'  },
  { id: 'p18', title: 'Kth Largest Element',         difficulty: 'medium', topic: 'heaps',        slug: 'kth-largest',        est_min: '20–30', your_score: 63, status: 'attempted'},
]
