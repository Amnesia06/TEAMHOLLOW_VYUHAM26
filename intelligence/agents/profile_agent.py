"""
Profile Agent: Extracts structured career profiles from conversational dialogue and resumes.
Maintains confidence scores, evidence indicators, and generates contextual follow-up questions.
"""

import json
from typing import Dict, List, Optional, Any
from intelligence.agents.base_agent import BaseAgent
from intelligence.prompts.templates import PROFILE_SYSTEM_PROMPT, PROFILE_EXTRACTION_PROMPT


class ProfileAgent(BaseAgent):
    """
    Extracts and updates user profile data from chat history or resumes.
    """

    def __init__(self, llm_provider: Optional[Any] = None):
        super().__init__(llm_provider=llm_provider, name="ProfileAgent")

    async def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes profiling on current state.
        Expects state to contain 'messages' (list of chat messages) or 'resume_text'.
        """
        messages = state.get("messages", [])
        resume_text = state.get("resume_text", "")
        existing_profile = state.get("profile", {})

        # Prepare context
        convo_history = "\n".join([
            f"{m.get('role', 'user')}: {m.get('content', '')}"
            for m in messages
        ])

        if resume_text:
            convo_history += f"\n\n[Uploaded Resume Text]:\n{resume_text}"

        resume_section = f"RESUME:\n{resume_text}" if resume_text else "RESUME: None"
        prompt = PROFILE_EXTRACTION_PROMPT.format(
            conversation_history=convo_history or "No previous history",
            resume_section=resume_section
        )

        extracted = await self._call_llm(
            prompt=prompt,
            system_prompt=PROFILE_SYSTEM_PROMPT
        )

        # Merge with existing profile
        merged_profile = self._merge_profile(existing_profile, extracted.get("profile", extracted))
        completeness = self._calculate_completeness(merged_profile)
        merged_profile["completeness"] = completeness

        return {
            "profile": merged_profile,
            "missing_fields": extracted.get("missing_fields", []),
            "follow_up_questions": extracted.get("follow_up_questions", [])
        }

    def _get_demo_response(
        self, prompt: str, expected_schema: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Deterministic, realistic demo profile representing the hackathon showcase scenario:
        Computer science graduate, Python, C++, GPS autonomous rover project, AI & robotics interests.
        """
        return {
            "profile": {
                "education": [
                    {
                        "degree": "Bachelor of Technology in Computer Science",
                        "institution": "State University",
                        "year": 2025,
                        "field": "Computer Science & Engineering"
                    }
                ],
                "skills": [
                    {
                        "name": "Python",
                        "category": "Programming Languages",
                        "proficiency": "intermediate",
                        "evidence": [
                            {
                                "type": "project",
                                "description": "Developed autonomous GPS rover telemetry and control scripts in Python.",
                                "confidence": "high"
                            }
                        ],
                        "is_inferred": False
                    },
                    {
                        "name": "C++",
                        "category": "Programming Languages",
                        "proficiency": "intermediate",
                        "evidence": [
                            {
                                "type": "project",
                                "description": "Implemented low-level motor drivers and micro-controller communication for GPS rover.",
                                "confidence": "high"
                            }
                        ],
                        "is_inferred": False
                    },
                    {
                        "name": "Data Structures",
                        "category": "Computer Science Foundations",
                        "proficiency": "intermediate",
                        "evidence": [
                            {
                                "type": "education",
                                "description": "Core computer science curriculum coursework and academic projects.",
                                "confidence": "high"
                            }
                        ],
                        "is_inferred": False
                    },
                    {
                        "name": "Algorithms",
                        "category": "Computer Science Foundations",
                        "proficiency": "intermediate",
                        "evidence": [
                            {
                                "type": "education",
                                "description": "Graph search, sorting, complexity analysis from CS degree.",
                                "confidence": "high"
                            }
                        ],
                        "is_inferred": False
                    },
                    {
                        "name": "Path Planning (A*)",
                        "category": "Robotics & Embedded",
                        "proficiency": "intermediate",
                        "evidence": [
                            {
                                "type": "project",
                                "description": "Designed waypoint tracking and obstacle avoidance navigation on the autonomous farm rover.",
                                "confidence": "high"
                            }
                        ],
                        "is_inferred": False
                    },
                    {
                        "name": "Machine Learning Fundamentals",
                        "category": "Data Science & ML",
                        "proficiency": "beginner",
                        "evidence": [
                            {
                                "type": "self_reported",
                                "description": "Basic familiarity with supervised learning models and linear regressions.",
                                "confidence": "medium"
                            }
                        ],
                        "is_inferred": False
                    }
                ],
                "experience": [],
                "projects": [
                    {
                        "name": "Autonomous GPS Farm Rover",
                        "description": "Built an unmanned ground rover equipped with GPS waypoint navigation, obstacle detection, and remote telemetry logging.",
                        "technologies": ["Python", "C++", "GPS", "Serial Communication"],
                        "skills_demonstrated": ["Path Planning (A*)", "Sensor Integration", "Embedded C++"]
                    }
                ],
                "interests": ["Artificial Intelligence", "Robotics", "Autonomous Systems", "Machine Learning"],
                "career_goals": ["Robotics Software Engineer", "Machine Learning Engineer", "AI Engineer"],
                "learning_preferences": {
                    "hours_per_week": 5,
                    "budget_monthly": 0.0,
                    "preferred_format": "interactive & open-source"
                }
            },
            "missing_fields": ["work_experience", "certifications", "desired_timeline"],
            "follow_up_questions": [
                "Did you implement the path planning algorithm (e.g. A* or Dijkstra) from scratch on your rover, or use ROS/Nav2?",
                "Are you aiming for hardware-integrated robotics (C++/ROS) or software-centric AI/ML engineering as your primary target?"
            ]
        }

    def _merge_profile(self, old: Dict[str, Any], new: Dict[str, Any]) -> Dict[str, Any]:
        """Merges new extracted fields without overwriting verified details with empty lists."""
        merged = dict(old)
        for key, val in new.items():
            if not val:
                continue
            if isinstance(val, list):
                if key == "skills":
                    # Deduplicate skills by name
                    existing_names = {s.get("name", "").lower() for s in merged.get("skills", [])}
                    curr_skills = list(merged.get("skills", []))
                    for item in val:
                        if item.get("name", "").lower() not in existing_names:
                            curr_skills.append(item)
                            existing_names.add(item.get("name", "").lower())
                    merged["skills"] = curr_skills
                else:
                    merged[key] = val
            elif isinstance(val, dict):
                merged[key] = {**merged.get(key, {}), **val}
            else:
                merged[key] = val
        return merged

    def _calculate_completeness(self, profile: Dict[str, Any]) -> float:
        """Calculate profile completeness fraction between 0.0 and 1.0."""
        score = 0.0
        if profile.get("education"):
            score += 0.20
        if profile.get("skills") and len(profile.get("skills")) >= 3:
            score += 0.35
        elif profile.get("skills"):
            score += 0.15
        if profile.get("projects"):
            score += 0.25
        if profile.get("interests"):
            score += 0.10
        if profile.get("career_goals"):
            score += 0.10
        return round(min(1.0, score), 2)

