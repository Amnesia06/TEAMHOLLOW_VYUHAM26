"""
Course Catalog database access (Backend Track M9).
Implements CourseCatalogInterface from intelligence.interfaces.
"""

import json
import os
from typing import List, Optional, Dict, Any
from contracts.schemas.course import Course
from intelligence.interfaces import CourseCatalogInterface


class CatalogDatabase(CourseCatalogInterface):
    """
    Manages course catalog lookup, skill filtering, and prerequisite graphs.
    """

    def __init__(self, data_path: Optional[str] = None):
        if not data_path:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            data_path = os.path.join(current_dir, "learning_resources.json")

        self.data_path = data_path
        self._courses: List[Course] = []
        self._load_data()

    def _load_data(self) -> None:
        if os.path.exists(self.data_path):
            with open(self.data_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                for item in data.get("resources", []):
                    self._courses.append(Course(**item))

    def get_course_by_id(self, course_id: str) -> Optional[Course]:
        for c in self._courses:
            if c.id == course_id:
                return c
        return None

    def find_courses_for_skills(
        self,
        skill_ids: List[str],
        max_cost: Optional[float] = None
    ) -> List[Course]:
        matching = []
        target_set = set(skill_ids)
        for c in self._courses:
            if target_set.intersection(set(c.skills_covered)):
                if max_cost is None or c.cost <= max_cost:
                    matching.append(c)

        # Free-first preference, then duration
        matching.sort(key=lambda c: (c.cost, c.hours))
        return matching

    def get_all_courses(self) -> List[Course]:
        return self._courses


catalog_db = CatalogDatabase()
