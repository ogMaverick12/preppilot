# skill: coaching_profiler
version: 1.0
created: 2026-05-18

## purpose
Build and maintain a deepening model of the user's thinking patterns,
common mistakes, and explanation preferences over time.

## inputs
- user_id: string
- session_history: all past sessions with scores, solutions, feedback ratings
- current_profile: existing coaching profile (if any)

## profiling_process
1. detect_thinking_patterns:
   - analyze solution structures across sessions
   - identify: brute-force tendency, recursive vs iterative preference
   - track: time-to-solution trends, hint usage patterns

2. track_common_mistakes:
   - categorize errors: off-by-one, missing edge cases, wrong data structure
   - identify recurring patterns across different problem types
   - flag: mistakes that persist despite feedback

3. calibrate_explanation_style:
   - weight styles based on helpfulness ratings (1-5)
   - styles: concise, detailed, analogy-based, step-by-step, code-focused
   - adapt: if ratings drop, try different style

4. identify_success_patterns:
   - which problem types yield highest scores
   - which topics show fastest improvement
   - time-of-day performance correlation

5. map_struggle_patterns:
   - topics with declining scores
   - difficulty levels causing consistent failure
   - concepts that need re-explanation

## output
{
  thinking_patterns: string[],
  common_mistakes: string[],
  preferred_style: string,
  style_weights: {style: float},
  success_areas: string[],
  struggle_areas: string[],
  recommendations: string[]
}

## improvement_log
v1.0: Initial profiler. Basic pattern detection and style calibration.
