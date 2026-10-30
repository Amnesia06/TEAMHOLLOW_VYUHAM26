"""
Integration tests for the 5 specialized AI agents in demo mode.
"""

import pytest
from intelligence.agents.profile_agent import ProfileAgent
from intelligence.agents.skill_agent import SkillIntelligenceAgent
from intelligence.agents.market_agent import MarketIntelligenceAgent
from intelligence.agents.roadmap_agent import RoadmapOptimizationAgent
from intelligence.agents.coach_agent import LearningCoachAgent


@pytest.mark.asyncio
async def test_profile_agent_extraction():
    agent = ProfileAgent()
    state = {
        "messages": [
            {"role": "user", "content": "I'm a computer science graduate interested in AI and robotics. I know Python and C++, and I built an autonomous GPS rover project."}
        ]
    }
    result = await agent.run(state)
    profile = result["profile"]

    assert "skills" in profile
    assert len(profile["skills"]) >= 2
    skills_names = [s["name"] for s in profile["skills"]]
    assert "Python" in skills_names
    assert "C++" in skills_names
    assert profile["completeness"] > 0


@pytest.mark.asyncio
async def test_skill_intelligence_transferable():
    profile_agent = ProfileAgent()
    skill_agent = SkillIntelligenceAgent()

    prof_res = await profile_agent.run({"messages": []})
    skill_res = await skill_agent.run({"profile": prof_res["profile"]})

    transferable = skill_res["transferable_skills"]
    assert len(transferable) > 0
    assert any(t["skill"] == "Graph Algorithms" for t in transferable)


@pytest.mark.asyncio
async def test_market_agent_recommendations():
    market_agent = MarketIntelligenceAgent()
    user_skills = [
        {"name": "Python", "proficiency": "intermediate"},
        {"name": "C++", "proficiency": "intermediate"}
    ]
    transferable = [
        {"skill": "Graph Algorithms", "confidence": "high"}
    ]

    recs = market_agent.generate_recommendations(user_skills, transferable)
    assert len(recs) > 0
    top_rec = recs[0]
    assert "match_score" in top_rec
    assert "match_explanation" in top_rec
    assert len(top_rec["matching_skills"]) > 0


@pytest.mark.asyncio
async def test_roadmap_agent_generation():
    roadmap_agent = RoadmapOptimizationAgent()
    state = {
        "target_role": "Robotics Software Engineer",
        "constraints": {"hours_per_week": 5, "monthly_budget": 0},
        "profile": {
            "skills": [{"name": "Python"}, {"name": "C++"}]
        },
        "skill_gaps": [{"skill": "ROS / ROS 2", "importance": "required"}]
    }

    result = await roadmap_agent.run(state)
    assert "roadmap" in result
    roadmap = result["roadmap"]
    assert roadmap["total_estimated_cost"] == 0
    assert len(roadmap["milestones"]) > 0
