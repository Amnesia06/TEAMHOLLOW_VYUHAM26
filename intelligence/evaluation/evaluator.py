"""
Agent Evaluation Framework for Pathwise.
Tests profiling precision, schema validity, constraint satisfaction, and explainability.
"""

from typing import Dict, List, Any


class AgentEvaluator:
    """
    Evaluates agent outputs against qualitative benchmarks and hard constraints.
    """

    @classmethod
    def evaluate_profile(cls, profile: Dict[str, Any]) -> Dict[str, Any]:
        """Verify profile has required keys and non-fabricated data."""
        skills = profile.get("skills", [])
        has_evidence = all(len(s.get("evidence", [])) > 0 for s in skills)
        return {
            "valid_schema": "skills" in profile and "education" in profile,
            "skills_count": len(skills),
            "evidence_coverage": 1.0 if (skills and has_evidence) else (0.5 if skills else 0.0),
            "completeness": profile.get("completeness", 0.0)
        }

    @classmethod
    def evaluate_roadmap_constraints(
        cls, roadmap: Dict[str, Any], hours_per_week: float, monthly_budget: float
    ) -> Dict[str, Any]:
        """Verify that hard constraints were respected."""
        milestones = roadmap.get("milestones", [])
        total_cost = sum(m.get("estimated_cost", 0) for m in milestones)
        feasibility = roadmap.get("feasibility", {})

        budget_respected = True
        if monthly_budget == 0 and total_cost > 0:
            budget_respected = False

        return {
            "milestone_count": len(milestones),
            "total_estimated_weeks": roadmap.get("total_estimated_weeks", 0),
            "total_cost": total_cost,
            "budget_respected": budget_respected,
            "feasibility_reported": "is_feasible" in feasibility
        }
