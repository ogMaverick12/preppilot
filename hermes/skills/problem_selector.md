# skill: problem_selector
version: 1.0
created: 2026-05-18

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
