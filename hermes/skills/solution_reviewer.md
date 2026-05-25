# skill: solution_reviewer
version: 1.0
created: 2026-05-18

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
