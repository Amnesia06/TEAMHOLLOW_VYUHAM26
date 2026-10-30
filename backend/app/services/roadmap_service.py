"""
Roadmap Service: Coordinates the M0 Multi-Agent Orchestrator (M1-M6),
streaming execution, verification, and persistence.
"""

import json
import asyncio
import logging
from typing import Optional, Dict, Any, List, AsyncGenerator
from contracts.schemas.roadmap import Roadmap
from contracts.schemas.constraints import UserConstraints
from contracts.schemas.gap import Gap
from backend.app.planner.optimizer import DeterministicPlanner
from backend.app.planner.verifier import PlanVerifier
from backend.app.catalog.catalog_db import catalog_db
from backend.app.database.supabase_client import db_client
from backend.app.database.posting_search import SupabasePostingSearch
from intelligence.agents.profile_agent import ProfileAgent
from intelligence.agents.market_agent import MarketIntelligenceAgent
from intelligence.skills.gap_analyzer import GapAnalyzer
from intelligence.agents.explainer_agent import ExplainerAgent
from intelligence.search.tavily_client import TavilySearchAdapter
from intelligence.graph.orchestrator import create_orchestrator

logger = logging.getLogger(__name__)


class RoadmapService:
    def __init__(self):
        self.planner = DeterministicPlanner(catalog=catalog_db)
        self.verifier = PlanVerifier()
        self.posting_search = SupabasePostingSearch()
        self.search_adapter = TavilySearchAdapter()

        self.profile_agent = ProfileAgent()
        self.market_agent = MarketIntelligenceAgent(
            posting_search=self.posting_search,
            search_client=self.search_adapter
        )
        self.gap_analyzer = GapAnalyzer()
        self.explainer_agent = ExplainerAgent()

        self.orchestrator = create_orchestrator(
            profile_agent=self.profile_agent,
            market_agent=self.market_agent,
            gap_analyzer=self.gap_analyzer,
            planner=self.planner,
            verifier=self.verifier,
            explainer=self.explainer_agent
        )
        self._test_cache: Dict[str, Roadmap] = {}

    async def analyze(
        self,
        resume_text: str,
        target_role: Optional[str] = None,
        constraints: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes the full M0 graph synchronously and returns the complete result.
        """
        initial_state = {
            "resume_text": resume_text,
            "target_role": target_role or "",
            "constraints": constraints or {"weekly_hours": 10.0, "max_budget": 0.0, "currency": "USD"},
            "events": [],
            "retry_count": 0
        }

        final_state = await self.orchestrator.ainvoke(initial_state)

        roadmap_obj = final_state.get("roadmap")
        profile_obj = final_state.get("profile")

        if profile_obj and roadmap_obj:
            from backend.app.services.memory_service import memory_service
            u_constraints = final_state.get("user_constraints") or UserConstraints(weekly_hours=10.0, budget=0.0, currency="USD")
            memory_service.save_session(
                user_id="guest",
                profile=profile_obj,
                target_role=final_state.get("target_role", "Full-Stack Developer"),
                constraints=u_constraints,
                roadmap=roadmap_obj,
                gaps=final_state.get("gaps", [])
            )

        return {
            "status": "success",
            "target_role": final_state.get("target_role"),
            "market_source": final_state.get("market_source"),
            "fallback_reason": final_state.get("fallback_reason"),
            "profile": profile_obj.model_dump() if profile_obj else None,
            "requirements": [r.model_dump() for r in final_state.get("requirements", [])],
            "gaps": [g.model_dump() for g in final_state.get("gaps", [])],
            "roadmap": roadmap_obj.model_dump() if roadmap_obj else None,
            "events": final_state.get("events", [])
        }

    async def stream_analysis(
        self,
        resume_text: str,
        target_role: Optional[str] = None,
        constraints: Optional[Dict[str, Any]] = None
    ) -> AsyncGenerator[str, None]:
        """
        Streams SSE progress chunks as each agent in the graph completes,
        culminating in the final full result payload.
        """
        initial_state = {
            "resume_text": resume_text,
            "target_role": target_role or "",
            "constraints": constraints or {"weekly_hours": 10.0, "max_budget": 0.0, "currency": "USD"},
            "events": [],
            "retry_count": 0
        }

        accumulated_state = dict(initial_state)
        reported_event_count = 0

        try:
            async for state_update in self.orchestrator.astream(initial_state):
                for node_name, node_output in state_update.items():
                    if isinstance(node_output, dict):
                        accumulated_state.update(node_output)
                    events = node_output.get("events", []) if isinstance(node_output, dict) else []
                    while reported_event_count < len(events):
                        ev = events[reported_event_count]
                        reported_event_count += 1
                        chunk = {
                            "type": "progress",
                            "step": ev.get("step"),
                            "message": ev.get("message"),
                            "data": ev.get("data")
                        }
                        yield f"event: progress\ndata: {json.dumps(chunk)}\n\n"

            final_state = accumulated_state

            # Send completion event
            if final_state:
                roadmap_obj = final_state.get("roadmap")
                profile_obj = final_state.get("profile")

                if profile_obj and roadmap_obj:
                    from backend.app.services.memory_service import memory_service
                    u_constraints = final_state.get("user_constraints") or UserConstraints(weekly_hours=10.0, budget=0.0, currency="USD")
                    memory_service.save_session(
                        user_id="guest",
                        profile=profile_obj,
                        target_role=final_state.get("target_role", "Full-Stack Developer"),
                        constraints=u_constraints,
                        roadmap=roadmap_obj,
                        gaps=final_state.get("gaps", [])
                    )

                complete_payload = {
                    "type": "complete",
                    "target_role": final_state.get("target_role"),
                    "market_source": final_state.get("market_source"),
                    "fallback_reason": final_state.get("fallback_reason"),
                    "profile": profile_obj.model_dump() if profile_obj else None,
                    "requirements": [r.model_dump() for r in final_state.get("requirements", [])],
                    "gaps": [g.model_dump() for g in final_state.get("gaps", [])],
                    "roadmap": roadmap_obj.model_dump() if roadmap_obj else None,
                    "events": final_state.get("events", [])
                }
                yield f"event: complete\ndata: {json.dumps(complete_payload)}\n\n"
        except Exception as e:
            logger.error(f"Error during stream_analysis: {e}", exc_info=True)
            err_payload = {
                "type": "error",
                "message": f"Career analysis failed: {str(e)}"
            }
            yield f"event: error\ndata: {json.dumps(err_payload)}\n\n"

    def plan_and_verify(
        self,
        gaps: List[Gap],
        constraints: UserConstraints,
        user_skills: List[str]
    ) -> Roadmap:
        roadmap = self.planner.generate_plan(gaps, constraints, user_skills)
        verification = self.verifier.verify_plan(roadmap, constraints)
        roadmap.verifier_status = verification["status"]
        roadmap.violations = verification["violations"]
        return roadmap

    def save_roadmap(self, user_id: str, roadmap: Roadmap) -> None:
        self._test_cache[user_id] = roadmap
        if db_client.is_connected:
            try:
                db_client.client.table("roadmaps").insert({
                    "user_id": user_id,
                    "constraints": {},
                    "items": [item.model_dump() for item in roadmap.items],
                    "status": "active"
                }).execute()
            except Exception as e:
                logger.warning(f"Error persisting roadmap: {e}")

    def get_roadmap(self, user_id: str) -> Optional[Roadmap]:
        if user_id in self._test_cache:
            return self._test_cache[user_id]
        if db_client.is_connected:
            try:
                res = db_client.client.table("roadmaps").select("*").eq("user_id", user_id).execute()
                if res.data:
                    return Roadmap(**res.data[0])
            except Exception as e:
                logger.warning(f"Error reading roadmap: {e}")
        return None


roadmap_service = RoadmapService()
