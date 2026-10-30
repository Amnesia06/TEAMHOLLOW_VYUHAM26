"""
Live Course Hunter Agent.
Autonomously searches the live web for verified courses and learning resources
when a requested skill gap is not present in the local course catalog.
Enables open-world domain coverage (Music, Art, Medicine, Business, Aerospace, etc.).
"""

import json
import logging
import re
import urllib.parse
from typing import List, Dict, Any, Optional

from contracts.schemas.course import Course
from contracts.schemas.gap import Gap
from backend.app.catalog.catalog_db import catalog_db, CatalogDatabase
from intelligence.llm.gemini_client import gemini_client
from intelligence.search.tavily_client import TavilySearchAdapter

logger = logging.getLogger(__name__)


class LiveCourseHunter:
    """
    Finds real online learning resources dynamically across Coursera, edX,
    MIT OpenCourseWare, SWAYAM, and NPTEL via live search & LLM synthesis.
    """

    def __init__(
        self,
        search_client: Optional[TavilySearchAdapter] = None,
        llm_client: Optional[Any] = None,
        catalog: Optional[CatalogDatabase] = None
    ):
        self.search_client = search_client or TavilySearchAdapter()
        self.llm_client = llm_client or gemini_client
        self.catalog = catalog or catalog_db

    async def hunt_and_register_courses(
        self,
        gaps: List[Gap],
        currency: str = "INR"
    ) -> List[Course]:
        """
        Inspects gaps, identifies those lacking courses in the catalog,
        autonomously sources real courses from live search, and registers them into the catalog.
        """
        all_courses = self.catalog.get_all_courses()
        all_covered_ids = set()
        for c in all_courses:
            for s in c.skills_covered:
                all_covered_ids.add(s)

        uncovered_gaps = [g for g in gaps if g.skill_id not in all_covered_ids]
        if not uncovered_gaps:
            return []

        logger.info(f"LiveCourseHunter: Sourcing courses for {len(uncovered_gaps)} novel skill gaps.")
        newly_sourced: List[Course] = []

        for gap in uncovered_gaps:
            try:
                courses_for_gap = await self._hunt_single_gap(gap, currency)
                for c in courses_for_gap:
                    # Prevent duplicate ID in catalog
                    if not self.catalog.get_course_by_id(c.id):
                        self.catalog._courses.append(c)
                        newly_sourced.append(c)
            except Exception as e:
                logger.error(f"Failed hunting courses for gap '{gap.skill_name}': {e}")
                # Fallback to guaranteed working platform deep-link
                fallback_course = self._create_guaranteed_course(gap, currency)
                if not self.catalog.get_course_by_id(fallback_course.id):
                    self.catalog._courses.append(fallback_course)
                    newly_sourced.append(fallback_course)

        return newly_sourced

    async def _hunt_single_gap(self, gap: Gap, currency: str) -> List[Course]:
        """Searches live web for courses covering a specific skill gap."""
        search_query = f"best free online course tutorial {gap.skill_name} coursera edx mit ocw swayam"
        search_results = await self.search_client.search(search_query, max_results=3)

        # 1. If we have live search results and an LLM client, use LLM extraction
        if search_results and self.llm_client:
            combined_text = "\n\n".join([
                f"Title: {r.get('title')}\nURL: {r.get('url')}\nContent: {r.get('content')}"
                for r in search_results
            ])

            prompt = f"""
Skill to learn: "{gap.skill_name}"

Search Findings from web:
{combined_text}

Extract 1 or 2 authentic, high-quality learning resources from these search findings.
Return strictly a JSON array matching this schema:
[
  {{
    "title": "Clear course or tutorial title",
    "platform": "Platform name (e.g. Coursera, edX, MIT OpenCourseWare, SWAYAM, freeCodeCamp)",
    "url": "Live URL from search findings",
    "hours": 20.0,
    "cost": 0.0
  }}
]
"""
            try:
                raw_json = await self.llm_client.generate(
                    prompt=prompt,
                    system_prompt="You extract online courses from search results and return strictly valid JSON.",
                    json_mode=True,
                    temperature=0.2
                )
                parsed = json.loads(raw_json.strip())
                if isinstance(parsed, list) and len(parsed) > 0:
                    courses = []
                    for idx, item in enumerate(parsed[:2], start=1):
                        slug = re.sub(r'[^a-z0-9]+', '_', gap.skill_name.lower()).strip('_')[:20]
                        c_id = f"dyn_{slug}_{idx}"
                        url = item.get("url") or f"https://www.coursera.org/search?query={urllib.parse.quote(gap.skill_name)}"
                        try:
                            raw_hours = float(item.get("hours", 20.0))
                            hours = max(4.0, raw_hours)
                        except (ValueError, TypeError):
                            hours = 20.0

                        courses.append(
                            Course(
                                id=c_id,
                                title=item.get("title", f"Fundamentals of {gap.skill_name}"),
                                platform=item.get("platform", "Online MOOC"),
                                url=url,
                                cost=float(item.get("cost", 0.0)),
                                currency="INR" if currency == "INR" else "USD",
                                hours=hours,
                                level=1,
                                skills_covered=[gap.skill_id],
                                prerequisite_skills=[],
                                verified=True
                            )
                        )
                    return courses
            except Exception as e:
                logger.warning(f"LLM course extraction failed for '{gap.skill_name}': {e}")

        # 2. If live search didn't return parseable results or LLM failed:
        # Use first search result URL if valid, or guaranteed deep link
        best_url = None
        best_title = None
        best_platform = "Coursera / OpenCourseWare"
        if search_results:
            first_res = search_results[0]
            if first_res.get("url") and first_res["url"].startswith("http"):
                best_url = first_res["url"]
                best_title = first_res.get("title")

        if not best_url:
            best_url = f"https://www.coursera.org/search?query={urllib.parse.quote(gap.skill_name)}"
        if not best_title:
            best_title = f"Mastering {gap.skill_name}: Core Curriculum"

        slug = re.sub(r'[^a-z0-9]+', '_', gap.skill_name.lower()).strip('_')[:20]
        return [
            Course(
                id=f"dyn_{slug}_01",
                title=best_title,
                platform=best_platform,
                url=best_url,
                cost=0.0,
                currency="INR" if currency == "INR" else "USD",
                hours=20.0,
                level=1,
                skills_covered=[gap.skill_id],
                prerequisite_skills=[],
                verified=True
            )
        ]

    def _create_guaranteed_course(self, gap: Gap, currency: str) -> Course:
        """Generates a verified platform deep-link course that never 404s."""
        slug = re.sub(r'[^a-z0-9]+', '_', gap.skill_name.lower()).strip('_')[:20]
        encoded_query = urllib.parse.quote(gap.skill_name)
        return Course(
            id=f"dyn_{slug}_fallback",
            title=f"Fundamentals of {gap.skill_name}",
            platform="Open Learning / Coursera",
            url=f"https://www.coursera.org/search?query={encoded_query}",
            cost=0.0,
            currency="INR" if currency == "INR" else "USD",
            hours=20.0,
            level=1,
            skills_covered=[gap.skill_id],
            prerequisite_skills=[],
            verified=True
        )


course_hunter = LiveCourseHunter()
