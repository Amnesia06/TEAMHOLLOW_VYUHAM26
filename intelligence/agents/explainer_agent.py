"""
Explainer Agent (M6).
Generates evidence-based explanations for each recommended course in a roadmap.
Conforms to README Section 11 & Section 14 (Grounded Explanations):
Uses only supplied fields (gap size, market frequency, hours, cost, prerequisite status).
Never invents market numbers, statistics, or unverified claims.
Includes deterministic template fallback when LLM is unavailable or times out.
"""

import json
import logging
from typing import Optional, Any, List
from contracts.schemas.roadmap import Roadmap, RoadmapItem
from contracts.schemas.constraints import Constraints
from intelligence.agents.base_agent import BaseAgent
from intelligence.prompts.templates import EXPLAINER_SYSTEM_PROMPT, EXPLAINER_ITEM_PROMPT

logger = logging.getLogger(__name__)


class ExplainerAgent(BaseAgent):
    """
    Evidence-based Explainer Agent (M6).
    Enriches each item in the Roadmap with a clear, verified rationale.
    """

    def __init__(self, llm_client: Optional[Any] = None):
        super().__init__(llm_client=llm_client, name="ExplainerAgent")

    async def explain_roadmap(
        self,
        roadmap: Roadmap,
        target_role: str,
        constraints: Optional[Constraints] = None
    ) -> Roadmap:
        """
        Populates the explanation field on every RoadmapItem in the roadmap.
        """
        weekly_hours = constraints.weekly_hours if constraints else 10.0
        currency = constraints.currency if constraints else "USD"

        for item in roadmap.items:
            explanation = await self._generate_item_explanation(
                item=item,
                target_role=target_role,
                weekly_hours=weekly_hours,
                currency=currency
            )
            item.explanation = explanation

        return roadmap

    async def _generate_item_explanation(
        self,
        item: RoadmapItem,
        target_role: str,
        weekly_hours: float,
        currency: str
    ) -> str:
        """
        Attempts LLM explanation; falls back deterministically to strict grounding.
        """
        # Prepare strictly grounded item data
        gaps_info = [
            {
                "skill": g.skill_name,
                "gap_size": g.gap_size,
                "frequency": g.frequency,
                "priority_score": g.priority_score
            }
            for g in item.gaps_covered
        ]

        # 1. Try LLM if available
        if self.llm_client:
            try:
                prompt = EXPLAINER_ITEM_PROMPT.format(
                    course_title=item.course.title,
                    course_platform=item.course.platform,
                    hours=item.hours,
                    cost=item.cost,
                    currency=currency,
                    added_for_prerequisite="Yes" if item.added_for_prerequisite else "No",
                    target_role=target_role,
                    gaps_covered_json=json.dumps(gaps_info),
                    weekly_hours=weekly_hours,
                    start_week=item.start_week,
                    end_week=item.end_week
                )

                messages = [
                    {"role": "system", "content": EXPLAINER_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ]
                response = await self.llm_client.generate(messages=messages, temperature=0.1)
                text = response.get("content", "").strip() if isinstance(response, dict) else str(response).strip()
                if text and len(text) > 10:
                    return text
            except Exception as e:
                logger.warning(f"LLM explainer call failed or timed out: {e}. Falling back to deterministic grounding.")

        # 2. Deterministic Grounded Template Fallback
        return self._deterministic_explanation(item, target_role, currency)

    def _deterministic_explanation(self, item: RoadmapItem, target_role: str, currency: str) -> str:
        """
        Generates a 100% grounded explanation strictly citing computed fields.
        """
        week_range = f"Weeks {item.start_week:.1f}–{item.end_week:.1f}" if item.start_week != item.end_week else f"Week {item.start_week:.1f}"
        cost_str = "Free" if item.cost == 0 else f"{item.cost:g} {currency}"

        if item.added_for_prerequisite:
            return (
                f"Scheduled for {week_range} ({item.hours:g} hrs, {cost_str}) as a necessary prerequisite course "
                f"covering foundational skills required for subsequent modules in the {target_role} path."
            )

        if item.gaps_covered:
            # Sort gaps by priority
            sorted_gaps = sorted(item.gaps_covered, key=lambda g: g.priority_score, reverse=True)
            top = sorted_gaps[0]
            skills_str = ", ".join(g.skill_name for g in sorted_gaps)
            return (
                f"Sequenced in {week_range} ({item.hours:g} hrs, {cost_str}) to close critical skill gap(s) in {skills_str}. "
                f"Directly addresses {top.skill_name} (market demand frequency: {top.frequency:.0%}, gap: +{top.gap_size} levels)."
            )

        return (
            f"Scheduled for {week_range} ({item.hours:g} hrs, {cost_str}) to build core competence for {target_role}."
        )

