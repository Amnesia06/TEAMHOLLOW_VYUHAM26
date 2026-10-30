"""
Abstract interfaces defined by intelligence and implemented by backend (README Section 7.3).
"""

from typing import Protocol, List, Dict, Any, Optional
from contracts.schemas.course import Course
from contracts.schemas.gap import Gap
from contracts.schemas.roadmap import Roadmap, RoadmapItem
from contracts.schemas.constraints import UserConstraints


class PlannerInterface(Protocol):
    """Planner (M4) interface implemented by Backend."""
    def generate_plan(
        self,
        gaps: List[Gap],
        constraints: UserConstraints,
        user_skills: List[str]
    ) -> Roadmap:
        ...


class VerifierInterface(Protocol):
    """Verifier (M5) interface implemented by Backend."""
    def verify_plan(
        self,
        roadmap: Roadmap,
        constraints: UserConstraints
    ) -> Dict[str, Any]:
        ...


class CourseCatalogInterface(Protocol):
    """Course lookup (M9) interface implemented by Backend."""
    def get_course_by_id(self, course_id: str) -> Optional[Course]:
        ...

    def find_courses_for_skills(
        self,
        skill_ids: List[str],
        max_cost: Optional[float] = None
    ) -> List[Course]:
        ...

    def get_all_courses(self) -> List[Course]:
        ...


class JobPostingSearchInterface(Protocol):
    """Job posting search by vector interface implemented by Backend."""
    def search_postings(
        self,
        role: str,
        query_vector: List[float],
        top_k: int = 15
    ) -> List[Dict[str, Any]]:
        ...


class TaxonomyLookupInterface(Protocol):
    """Taxonomy lookup interface implemented by Backend database access."""
    def search_skills_by_vector(
        self,
        query_vector: List[float],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        ...

    def get_skill_by_id(self, skill_id: str) -> Optional[Dict[str, Any]]:
        ...

    def get_skill_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        ...

    def get_all_skills(self) -> List[Dict[str, Any]]:
        ...


class MarketSnapshotInterface(Protocol):
    """Snapshot read and write interface implemented by Backend."""
    def get_latest_snapshots(
        self,
        role: str,
        limit: int = 2
    ) -> List[Dict[str, Any]]:
        ...

    def save_snapshot(
        self,
        snapshot: Dict[str, Any]
    ) -> None:
        ...
