"""
Unit tests for specialized intelligence agents using fake clients (labeled as fake-client test).
"""

import pytest
from intelligence.agents.profile_agent import ProfileAgent
from intelligence.agents.market_agent import MarketIntelligenceAgent
from intelligence.fakes import FakeTaxonomyLookup, FakeJobPostingSearch


class FakeLLMClient:
    async def generate(self, prompt: str, system_prompt: str = "") -> str:
        return """{
            "skills": [
                {"name": "TypeScript", "level": 2},
                {"name": "React", "level": 2}
            ],
            "unmapped_skills": ["InternalCompanyTool"],
            "years_of_experience": 3.0,
            "years_per_skill": {"TypeScript": 2.0},
            "domain": "Full-Stack Web Development"
        }"""


@pytest.mark.asyncio
async def test_m1_profiler_agent_fake_client():
    """fake-client test: Profiler extraction with canonical taxonomy mapping."""
    fake_llm = FakeLLMClient()
    fake_tax = FakeTaxonomyLookup()
    agent = ProfileAgent(llm_client=fake_llm, taxonomy=fake_tax)

    res = await agent.run({"resume_text": "Software developer with 3 years experience in TypeScript and React."})
    profile = res["profile"]

    assert len(profile.skills) == 2
    assert profile.skills[0].skill_id == "skill_typescript"
    assert "InternalCompanyTool" in profile.unmapped_skills
    assert profile.years_of_experience == 3.0


@pytest.mark.asyncio
async def test_m2_market_intelligence_cached_postings_fake_client():
    """fake-client test: Market intelligence retrieval for common role."""
    fake_search = FakeJobPostingSearch()
    agent = MarketIntelligenceAgent(posting_search=fake_search)

    res = await agent.get_role_requirements(role="Full-Stack Developer")
    assert res["source"] == "cache"
    assert res["posting_count"] >= 5
