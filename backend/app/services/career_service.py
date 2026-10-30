"""
Career Service: Generates role recommendations and detailed skill-gap analyses.
"""

from typing import List, Dict, Any, Optional
from intelligence.agents.market_agent import MarketIntelligenceAgent
from intelligence.agents.skill_agent import SkillIntelligenceAgent
from backend.app.core.llm_provider import llm_provider
from backend.app.services.profile_service import profile_service
from backend.app.schemas.career import CareerRecommendation


class CareerService:
    def __init__(self):
        self.market_agent = MarketIntelligenceAgent(llm_provider=llm_provider)
        self.skill_agent = SkillIntelligenceAgent(llm_provider=llm_provider)

    async def get_recommendations(self, user_id: str, limit: int = 5) -> List[CareerRecommendation]:
        user_prof = await profile_service.get_profile(user_id)
        prof_dict = user_prof.model_dump()

        # Derive transferable skills
        skill_res = await self.skill_agent.run({"profile": prof_dict})
        transferable = skill_res.get("transferable_skills", [])

        # Match roles
        recs = self.market_agent.generate_recommendations(
            user_skills=prof_dict.get("skills", []),
            transferable_skills=transferable,
            career_goals=prof_dict.get("career_goals", []),
            limit=limit
        )

        return [CareerRecommendation(**r) for r in recs]

    async def analyze_target_role(self, user_id: str, target_role: str) -> CareerRecommendation:
        recs = await self.get_recommendations(user_id=user_id, limit=10)
        for r in recs:
            if r.role.lower() == target_role.lower():
                return r
        # If not in top list, return first recommendation
        return recs[0] if recs else None


career_service = CareerService()
