"""
Roadmap Optimization Agent: Combines deterministic graph scheduling with
contextual LLM commentary to create actionable, time- and budget-aware roadmaps.
"""

from typing import Dict, List, Optional, Any
from intelligence.agents.base_agent import BaseAgent
from intelligence.roadmap.optimizer import RoadmapOptimizer


class RoadmapOptimizationAgent(BaseAgent):
    """
    Coordinates deterministic scheduling with explainable guidance.
    """

    def __init__(self, llm_provider: Optional[Any] = None, optimizer: Optional[RoadmapOptimizer] = None):
        super().__init__(llm_provider=llm_provider, name="RoadmapOptimizationAgent")
        self.optimizer = optimizer or RoadmapOptimizer()

    async def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes roadmap generation.
        Expects state to contain 'target_role', 'skill_gaps' or 'recommendation',
        and 'constraints' (hours_per_week, monthly_budget, etc.).
        """
        target_role = state.get("target_role", "Machine Learning Engineer")
        constraints = state.get("constraints", {})
        profile = state.get("profile", {})

        user_skills = [s.get("name") for s in profile.get("skills", [])]
        skill_gaps = state.get("skill_gaps", [])

        # If skill_gaps wasn't provided directly, pull missing & partial from recommendations
        if not skill_gaps and state.get("career_recommendations"):
            for rec in state.get("career_recommendations", []):
                if rec.get("role", "").lower() == target_role.lower():
                    skill_gaps = rec.get("missing_skills", []) + rec.get("partial_skills", [])
                    break

        roadmap = self.optimizer.generate_roadmap(
            target_role=target_role,
            skill_gaps=skill_gaps,
            user_skills=user_skills,
            hours_per_week=float(constraints.get("hours_per_week", 5.0)),
            monthly_budget=float(constraints.get("monthly_budget", 0.0)),
            desired_timeline_months=constraints.get("desired_timeline_months"),
            preferred_format=constraints.get("preferred_format")
        )

        return {"roadmap": roadmap}
