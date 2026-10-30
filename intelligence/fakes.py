"""
Fake implementations of external dependencies for unit tests (README Section 7.3 & Section 18).
Labeled strictly as fake clients.
"""

import json
import os
from typing import Dict, List, Optional, Any
from contracts.schemas.course import Course
from contracts.schemas.gap import Gap
from contracts.schemas.roadmap import Roadmap, RoadmapItem
from contracts.schemas.constraints import UserConstraints
from intelligence.interfaces import (
    PlannerInterface,
    VerifierInterface,
    CourseCatalogInterface,
    JobPostingSearchInterface,
    TaxonomyLookupInterface,
    MarketSnapshotInterface
)


class FakeTaxonomyLookup(TaxonomyLookupInterface):
    """Fake taxonomy lookup serving contracts/taxonomy/skills.json."""
    def __init__(self):
        root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        tax_path = os.path.join(root_dir, "contracts", "taxonomy", "skills.json")
        self.skills = []
        if os.path.exists(tax_path):
            with open(tax_path, "r", encoding="utf-8") as f:
                self.skills = json.load(f).get("skills", [])

    def search_skills_by_vector(self, query_vector: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
        return self.skills[:top_k]

    def get_skill_by_id(self, skill_id: str) -> Optional[Dict[str, Any]]:
        for s in self.skills:
            if s["id"] == skill_id:
                return s
        return None

    def get_skill_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        n = name.strip().lower()
        for s in self.skills:
            if s["canonical_name"].lower() == n or n in [a.lower() for a in s.get("aliases", [])]:
                return s
        return None

    def get_all_skills(self) -> List[Dict[str, Any]]:
        return self.skills


class FakeJobPostingSearch(JobPostingSearchInterface):
    """Fake job posting search returning deterministic mock postings."""
    def search_postings(self, role: str, query_vector: List[float], top_k: int = 15) -> List[Dict[str, Any]]:
        return [
            {
                "id": f"posting_{i}",
                "role": role,
                "text": f"Seeking a {role} skilled in Python, SQL, PostgreSQL, Docker, Git.",
                "source": "curated_dataset",
                "similarity": 0.88
            }
            for i in range(min(top_k, 10))
        ]


class FakeCourseCatalog(CourseCatalogInterface):
    """Fake course catalog access."""
    def __init__(self):
        root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        course_path = os.path.join(root_dir, "contracts", "examples", "course.json")
        self.courses = []
        if os.path.exists(course_path):
            with open(course_path, "r", encoding="utf-8") as f:
                self.courses.append(Course(**json.load(f)))

    def get_course_by_id(self, course_id: str) -> Optional[Course]:
        for c in self.courses:
            if c.id == course_id:
                return c
        return None

    def find_courses_for_skills(self, skill_ids: List[str], max_cost: Optional[float] = None) -> List[Course]:
        results = []
        for c in self.courses:
            if any(s in c.skills_covered for s in skill_ids):
                if max_cost is None or c.cost <= max_cost:
                    results.append(c)
        return results

    def get_all_courses(self) -> List[Course]:
        return self.courses


class FakePlanner(PlannerInterface):
    """Fake planner returning sample roadmap."""
    def generate_plan(self, gaps: List[Gap], constraints: UserConstraints, user_skills: List[str]) -> Roadmap:
        root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        roadmap_path = os.path.join(root_dir, "contracts", "examples", "roadmap.json")
        with open(roadmap_path, "r", encoding="utf-8") as f:
            return Roadmap(**json.load(f))


class FakeVerifier(VerifierInterface):
    """Fake verifier validating plans."""
    def verify_plan(self, roadmap: Roadmap, constraints: UserConstraints) -> Dict[str, Any]:
        return {
            "status": "pass",
            "violations": []
        }


class FakeMarketSnapshot(MarketSnapshotInterface):
    """Fake market snapshot store."""
    def get_latest_snapshots(self, role: str, limit: int = 2) -> List[Dict[str, Any]]:
        return [
            {"role": role, "snapshot_date": "2026-08-01", "frequencies": {"skill_pg_04": 0.50}},
            {"role": role, "snapshot_date": "2026-10-01", "frequencies": {"skill_pg_04": 0.82}}
        ]

    def save_snapshot(self, snapshot: Dict[str, Any]) -> None:
        pass
