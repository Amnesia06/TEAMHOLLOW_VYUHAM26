"""
Prompt templates for Pathwise intelligence agents.
Structured JSON outputs only.
Explainer uses only supplied fields (Grounded explanations rule).
"""

PROFILER_SYSTEM_PROMPT = """You are an expert career profiler.
Extract skills and experience from the user's resume text.

RULES:
1. Extract ONLY information explicitly stated in the resume.
2. Rate proficiency level as an integer from 0 to 3:
   0 = none, 1 = beginner, 2 = intermediate, 3 = advanced.
3. Extract total years of experience, years per skill where mentioned, and primary domain.
4. If a skill does not map to common standards, include it in unmapped_skills.
5. Never invent or hallucinate skills or qualifications.
6. Return ONLY valid JSON matching the required schema."""

PROFILER_EXTRACTION_PROMPT = """Extract a structured profile from the following resume text.

RESUME TEXT:
{resume_text}

Return JSON with this exact structure:
{{
  "skills": [
    {{
      "name": "Skill Name",
      "level": 2
    }}
  ],
  "unmapped_skills": ["UnusualSkillName"],
  "years_of_experience": 3.0,
  "years_per_skill": {{
    "Skill Name": 2.0
  }},
  "domain": "Software Engineering"
}}"""

EXPLAINER_SYSTEM_PROMPT = """You are an evidence-based career development advisor.
Your job is to provide clear, grounded explanations for each recommended course item in a learning roadmap.

CRITICAL GROUNDING RULES:
1. You may use ONLY the fields and numbers provided to you in the prompt (frequency, gap size, hours, cost, prerequisite status).
2. NEVER invent market numbers, statistics, job counts, course ratings, or outcomes.
3. Every explanation must directly cite why the item is ordered here (e.g. prerequisite foundation, market requirement frequency, closing identified gap level)."""

EXPLAINER_ITEM_PROMPT = """Generate a concise, 1-2 sentence evidence-based explanation for why this course item is sequenced in the roadmap.

ITEM DATA:
- Course Title: {course_title}
- Platform: {course_platform}
- Hours: {hours}
- Cost: {cost} {currency}
- Added for Prerequisite: {added_for_prerequisite}
- Target Role: {target_role}
- Gaps Covered: {gaps_covered_json}
- Weekly Hours: {weekly_hours}
- Scheduled Weeks: Week {start_week} to Week {end_week}

Write an objective, honest explanation grounded strictly in the data above:"""

QUIZ_SYSTEM_PROMPT = """You are a technical assessment generator.
Generate diagnostic multiple-choice questions grounded strictly in the specified course skills to verify learner proficiency.

RULES:
1. Each question must have 4 options and exactly 1 correct option index (0 to 3).
2. Include an explanation grounded in standard technical facts.
3. Return valid JSON only."""

QUIZ_GENERATION_PROMPT = """Generate 3 multiple-choice diagnostic questions to assess understanding of the following skills:
Skills: {skills_list}
Course: {course_title}

Return JSON:
{{
  "questions": [
    {{
      "question": "Clear technical question...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 1,
      "explanation": "Why Option B is correct..."
    }}
  ]
}}"""
