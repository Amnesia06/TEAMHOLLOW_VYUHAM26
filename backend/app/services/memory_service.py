"""
Memory and Replanning Service (M10).
Conforms to README Section 12 & Section 21 (Acceptance Test 7):
- Persists user profile, gaps, roadmap, and progress.
- Triggers dynamic replan when progress changes (marking item complete)
  or when constraints change (weekly hours, budget), WITHOUT re-uploading resume.
- Skills mastered from completed courses are merged into user competencies.
"""

import json
import logging
from typing import Dict, Any, List, Optional, Set
from contracts.schemas.profile import Profile
from contracts.schemas.roadmap import Roadmap, RoadmapItem
from contracts.schemas.constraints import UserConstraints
from contracts.schemas.gap import Gap
from backend.app.planner.optimizer import DeterministicPlanner
from backend.app.planner.verifier import PlanVerifier
from backend.app.catalog.catalog_db import catalog_db
from intelligence.agents.explainer_agent import ExplainerAgent
from intelligence.skills.gap_analyzer import GapAnalyzer
from intelligence.agents.market_agent import MarketIntelligenceAgent
from backend.app.database.loaders import get_db_connection

logger = logging.getLogger(__name__)


class UserSession:
    def __init__(
        self,
        user_id: str,
        profile: Profile,
        target_role: str,
        constraints: UserConstraints,
        roadmap: Roadmap,
        gaps: List[Gap],
    ):
        self.user_id = user_id
        self.profile = profile
        self.target_role = target_role
        self.constraints = constraints
        self.roadmap = roadmap
        self.gaps = gaps
        self.completed_item_ids: Set[str] = set()
        self.mastered_skills: Set[str] = set()
        if profile and profile.skills:
            for s in profile.skills:
                self.mastered_skills.add(s.name.lower())
                self.mastered_skills.add(s.skill_id.lower())


class MemoryAndReplanningService:
    """
    M10: Manages state persistence and reactive graph replanning.
    """

    def __init__(self):
        self.planner = DeterministicPlanner(catalog=catalog_db)
        self.verifier = PlanVerifier()
        self.explainer = ExplainerAgent()
        self.gap_analyzer = GapAnalyzer()
        self.sessions: Dict[str, UserSession] = {}

    def save_session(
        self,
        user_id: str,
        profile: Profile,
        target_role: str,
        constraints: UserConstraints,
        roadmap: Roadmap,
        gaps: List[Gap]
    ) -> UserSession:
        session = UserSession(
            user_id=user_id,
            profile=profile,
            target_role=target_role,
            constraints=constraints,
            roadmap=roadmap,
            gaps=gaps
        )
        self.sessions[user_id] = session

        # Persist to database if possible
        try:
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    items_json = json.dumps([item.model_dump() for item in roadmap.items])
                    constraints_json = json.dumps(constraints.model_dump())
                    cur.execute(
                        """
                        INSERT INTO roadmaps (target_role, constraints, items, status)
                        VALUES (%s, %s::jsonb, %s::jsonb, 'active');
                        """,
                        (target_role, constraints_json, items_json)
                    )
        except Exception as e:
            logger.debug(f"Local session active, DB persist note: {e}")

        return session

    def get_session(self, user_id: str) -> Optional[UserSession]:
        return self.sessions.get(user_id)

    async def mark_item_complete(self, user_id: str, item_order: int) -> Roadmap:
        """
        Marks a roadmap item as completed, incorporates its learned skills,
        and replans the remaining gaps without re-uploading the resume (Acceptance Test 7).
        """
        session = self.get_session(user_id)
        if not session:
            raise ValueError(f"No active session found for user '{user_id}'. Analyze profile first.")

        # Find the target item
        completed_item = next((it for it in session.roadmap.items if it.order == item_order), None)
        if not completed_item:
            # Try to match by course id
            completed_item = next((it for it in session.roadmap.items if it.course.id == str(item_order)), None)

        if not completed_item:
            return session.roadmap

        # Mark completed and absorb learned skills
        session.completed_item_ids.add(completed_item.course.id)
        for s in completed_item.course.skills_covered:
            session.mastered_skills.add(s.lower())

        # Filter remaining gaps (remove gaps satisfied by mastered skills)
        remaining_gaps = [
            g for g in session.gaps
            if g.skill_name.lower() not in session.mastered_skills and g.skill_id.lower() not in session.mastered_skills
        ]

        # Re-plan with Deterministic Planner
        new_roadmap = self.planner.generate_plan(
            gaps=remaining_gaps,
            constraints=session.constraints,
            user_skills=list(session.mastered_skills)
        )

        # Verify with Deterministic Verifier
        v_res = self.verifier.verify_plan(new_roadmap, session.constraints)
        new_roadmap.verifier_status = v_res.get("status", "pass")
        new_roadmap.violations = v_res.get("violations", [])

        # Explain with Explainer Agent
        explained_roadmap = await self.explainer.explain_roadmap(
            roadmap=new_roadmap,
            target_role=session.target_role,
            constraints=session.constraints
        )

        session.roadmap = explained_roadmap
        return explained_roadmap

    async def replan_with_constraints(
        self,
        user_id: str,
        new_constraints: UserConstraints
    ) -> Roadmap:
        """
        Replans the roadmap using updated weekly hours or budget without re-uploading the resume.
        """
        session = self.get_session(user_id)
        if not session:
            raise ValueError(f"No active session found for user '{user_id}'. Analyze profile first.")

        session.constraints = new_constraints

        # Re-plan remaining gaps with new constraints
        remaining_gaps = [
            g for g in session.gaps
            if g.skill_name.lower() not in session.mastered_skills and g.skill_id.lower() not in session.mastered_skills
        ]

        new_roadmap = self.planner.generate_plan(
            gaps=remaining_gaps,
            constraints=new_constraints,
            user_skills=list(session.mastered_skills)
        )

        v_res = self.verifier.verify_plan(new_roadmap, new_constraints)
        new_roadmap.verifier_status = v_res.get("status", "pass")
        new_roadmap.violations = v_res.get("violations", [])

        explained_roadmap = await self.explainer.explain_roadmap(
            roadmap=new_roadmap,
            target_role=session.target_role,
            constraints=new_constraints
        )

        session.roadmap = explained_roadmap
        return explained_roadmap


memory_service = MemoryAndReplanningService()

