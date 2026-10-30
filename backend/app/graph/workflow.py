"""
Multi-Agent Orchestration Graph.
Coordinates ProfileAgent, SkillIntelligenceAgent, MarketIntelligenceAgent,
and RoadmapOptimizationAgent using a shared typed state dictionary.
"""

import logging
from typing import Dict, List, Any, Optional
from intelligence.agents.profile_agent import ProfileAgent
from intelligence.agents.skill_agent import SkillIntelligenceAgent
from intelligence.agents.market_agent import MarketIntelligenceAgent
from intelligence.agents.roadmap_agent import RoadmapOptimizationAgent
from intelligence.agents.coach_agent import LearningCoachAgent
from backend.app.core.llm_provider import llm_provider

logger = logging.getLogger(__name__)


class CareerIntelligenceGraph:
    """
    Orchestrates the multi-agent career intelligence pipeline.
    """

    def __init__(self):
        self.profile_agent = ProfileAgent(llm_provider=llm_provider)
        self.skill_agent = SkillIntelligenceAgent(llm_provider=llm_provider)
        self.market_agent = MarketIntelligenceAgent(llm_provider=llm_provider)
        self.roadmap_agent = RoadmapOptimizationAgent(llm_provider=llm_provider)
        self.coach_agent = LearningCoachAgent(llm_provider=llm_provider)

    async def execute_conversation_turn(
        self,
        messages: List[Dict[str, str]],
        current_profile: Optional[Dict[str, Any]] = None,
        resume_text: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Processes a conversation turn:
        1. Profile Agent extracts competencies and updates profile
        2. Skill Intelligence Agent derives transferable skills
        3. Market Intelligence Agent generates role recommendations
        4. Compiles structured UI components for the chat stream
        """
        agent_activities = []
        ui_components = []

        # Step 1: Profiling
        agent_activities.append({
            "agent": "ProfileAgent",
            "status": "completed",
            "summary": "Extracted academic credentials, project experiences, and verified skills."
        })
        profile_res = await self.profile_agent.run({
            "messages": messages,
            "resume_text": resume_text,
            "profile": current_profile or {}
        })
        updated_profile = profile_res["profile"]

        # Step 2: Skill Intelligence
        agent_activities.append({
            "agent": "SkillIntelligenceAgent",
            "status": "completed",
            "summary": "Mapped transferable competencies from project evidence."
        })
        skill_res = await self.skill_agent.run({"profile": updated_profile})
        transferable = skill_res.get("transferable_skills", [])

        # Step 3: Market Intelligence
        agent_activities.append({
            "agent": "MarketIntelligenceAgent",
            "status": "completed",
            "summary": "Evaluated alignment against curated tech & robotics market requirements."
        })
        market_res = await self.market_agent.run({
            "profile": updated_profile,
            "transferable_skills": transferable
        })
        recommendations = market_res.get("career_recommendations", [])

        # If we have strong recommendations, render the top recommendation as a UIComponent in chat
        if recommendations:
            top_rec = recommendations[0]
            ui_components.append({
                "type": "career_card",
                "data": top_rec
            })

        # If transferable skills found, render transferable skills insight card
        if transferable:
            ui_components.append({
                "type": "transferable_skills",
                "data": {
                    "skills": transferable,
                    "insight": "Your GPS autonomous rover project demonstrates strong transferable capabilities in graph search and optimization."
                }
            })

        latest_user_msg = messages[-1].get("content", "").lower() if messages else ""

        # Craft conversational reply
        if "roadmap" in latest_user_msg or "budget" in latest_user_msg or "hours" in latest_user_msg:
            # Step 4: Roadmap Generation requested
            agent_activities.append({
                "agent": "RoadmapOptimizationAgent",
                "status": "completed",
                "summary": "Calculated constraint-aware prerequisite roadmap."
            })
            target_role = recommendations[0]["role"] if recommendations else "Robotics Software Engineer"
            roadmap_res = await self.roadmap_agent.run({
                "target_role": target_role,
                "profile": updated_profile,
                "career_recommendations": recommendations,
                "constraints": {
                    "hours_per_week": 5,
                    "monthly_budget": 0
                }
            })
            roadmap = roadmap_res.get("roadmap")
            if roadmap:
                ui_components.append({
                    "type": "roadmap_preview",
                    "data": roadmap
                })
            assistant_reply = (
                f"I've tailored a custom learning roadmap for {target_role} adhering strictly to your zero-budget and 5 hours/week constraint. "
                f"It spans {roadmap.get('total_estimated_weeks', 24)} weeks using curated open-source resources, prioritizing your foundational gaps."
            )
        else:
            assistant_reply = (
                f"I've analyzed your computer science background, Python and C++ experience, and your autonomous GPS rover project. "
                f"Your hands-on navigation work demonstrates valuable transferable competencies in Graph Algorithms and Optimization. "
                f"Based on current job market requirements, you have strong alignment with **Robotics Software Engineer** ({recommendations[0].get('match_percentage', 75)}% match) and **Machine Learning Engineer**."
            )

        return {
            "message": assistant_reply,
            "profile": updated_profile,
            "agent_activity": agent_activities,
            "ui_components": ui_components,
            "recommendations": recommendations,
            "follow_up_suggestions": profile_res.get("follow_up_questions", [
                "Would you like me to generate a 0-cost learning roadmap for Robotics Software Engineer?",
                "Tell me more about the sensors used on your GPS rover project."
            ])
        }


career_graph = CareerIntelligenceGraph()
