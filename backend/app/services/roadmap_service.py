"""
Roadmap Service: Generates and tracks customized, constraint-aware development plans.
"""

from typing import Optional, Dict, Any
from intelligence.agents.roadmap_agent import RoadmapOptimizationAgent
from backend.app.core.llm_provider import llm_provider
from backend.app.database.supabase_client import db_client
from backend.app.services.profile_service import profile_service
from backend.app.services.career_service import career_service
from backend.app.schemas.roadmap import (
    Roadmap, RoadmapConstraints, MilestoneUpdate
)


class RoadmapService:
    def __init__(self):
        self.roadmap_agent = RoadmapOptimizationAgent(llm_provider=llm_provider)

    async def generate_roadmap(
        self,
        user_id: str,
        target_role: str,
        constraints: Optional[RoadmapConstraints] = None
    ) -> Roadmap:
        user_prof = await profile_service.get_profile(user_id)
        prof_dict = user_prof.model_dump()

        # Find gaps for target role
        target_analysis = await career_service.analyze_target_role(user_id, target_role)
        skill_gaps = []
        if target_analysis:
            skill_gaps = [m.model_dump() for m in target_analysis.missing_skills] + [
                p.model_dump() for p in target_analysis.partial_skills
            ]

        constraints_dict = constraints.model_dump() if constraints else {
            "hours_per_week": 5.0,
            "monthly_budget": 0.0
        }

        res = await self.roadmap_agent.run({
            "target_role": target_role,
            "profile": prof_dict,
            "skill_gaps": skill_gaps,
            "constraints": constraints_dict
        })

        roadmap_data = res["roadmap"]
        db_client.save_item("roadmaps", user_id, roadmap_data)
        return Roadmap(**roadmap_data)

    async def get_roadmap(self, user_id: str) -> Roadmap:
        data = db_client.get_item("roadmaps", user_id)
        if not data:
            # Generate default roadmap for demonstration
            return await self.generate_roadmap(
                user_id=user_id,
                target_role="Robotics Software Engineer",
                constraints=RoadmapConstraints(hours_per_week=5.0, monthly_budget=0.0)
            )
        return Roadmap(**data)

    async def update_milestone(
        self, milestone_id: str, updates: MilestoneUpdate, user_id: str = "00000000-0000-0000-0000-000000000001"
    ) -> Optional[Dict[str, Any]]:
        roadmap_data = db_client.get_item("roadmaps", user_id)
        if not roadmap_data:
            return None

        for m in roadmap_data.get("milestones", []):
            if m.get("milestone_id") == milestone_id:
                if updates.status is not None:
                    m["status"] = updates.status
                if updates.progress is not None:
                    m["progress"] = updates.progress
                db_client.save_item("roadmaps", user_id, roadmap_data)
                return m
        return None


roadmap_service = RoadmapService()
