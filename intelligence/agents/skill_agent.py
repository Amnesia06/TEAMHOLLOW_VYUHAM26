"""
Skill Intelligence Agent: Evaluates proficiency, evidence certainty,
and maps transferable competencies with explicit algorithmic explanations.
"""

from typing import Dict, List, Optional, Any
from intelligence.agents.base_agent import BaseAgent
from intelligence.skills.taxonomy import SkillTaxonomy
from intelligence.skills.mapper import TransferableSkillMapper


class SkillIntelligenceAgent(BaseAgent):
    """
    Evaluates skill depth, verifies supporting evidence,
    and infers transferable capabilities.
    """

    def __init__(self, llm_provider: Optional[Any] = None):
        super().__init__(llm_provider=llm_provider, name="SkillIntelligenceAgent")

    async def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes skill intelligence pipeline.
        Expects state to contain 'profile'.
        """
        profile = state.get("profile", {})
        skills = profile.get("skills", [])
        projects = profile.get("projects", [])

        # 1. Normalize and categorize existing skills
        normalized_skills = []
        for s in skills:
            canonical = SkillTaxonomy.get_skill(s.get("name", ""))
            category = canonical["category"] if canonical else s.get("category", "General")
            normalized_skills.append({
                "name": s.get("name"),
                "category": category,
                "proficiency": s.get("proficiency", "beginner"),
                "evidence": s.get("evidence", []),
                "confidence": self._evaluate_confidence(s.get("evidence", []))
            })

        # 2. Discover transferable skills
        skill_names = [s.get("name") for s in normalized_skills]
        transferable = TransferableSkillMapper.identify_transferable_skills(
            user_skills=skill_names,
            projects=projects
        )

        return {
            "verified_skills": normalized_skills,
            "transferable_skills": transferable,
            "assessment_summary": (
                f"Assessed {len(normalized_skills)} demonstrated skills. "
                f"Discovered {len(transferable)} strong transferable competencies from project evidence."
            )
        }

    def _evaluate_confidence(self, evidence: List[Dict[str, Any]]) -> str:
        """Determines confidence based on evidence quality."""
        if not evidence:
            return "low"
        types = [e.get("type") for e in evidence]
        if "project" in types or "experience" in types:
            return "high"
        if "education" in types:
            return "medium"
        return "low"
