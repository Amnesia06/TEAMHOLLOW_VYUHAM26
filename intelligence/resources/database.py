"""
Learning resource database engine.
Provides skill-indexed queries, cost-constrained filtering, and difficulty scoring.
"""

import json
import os
from typing import Dict, List, Optional, Any


class ResourceDatabase:
    """
    Curated resource database supporting query by skill, cost constraints,
    learning format, and difficulty.
    """

    def __init__(self, data_path: Optional[str] = None):
        if not data_path:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            data_path = os.path.join(current_dir, "learning_resources.json")

        self.data_path = data_path
        self._resources: List[Dict[str, Any]] = []
        self._load_data()

    def _load_data(self) -> None:
        try:
            with open(self.data_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self._resources = data.get("resources", [])
        except Exception:
            self._resources = []

    def get_all_resources(self) -> List[Dict[str, Any]]:
        return self._resources

    def get_resource_by_id(self, resource_id: str) -> Optional[Dict[str, Any]]:
        for res in self._resources:
            if res.get("resource_id") == resource_id:
                return res
        return None

    def query(
        self,
        skill: Optional[str] = None,
        difficulty: Optional[str] = None,
        max_cost: Optional[float] = None,
        resource_type: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Filter resources based on user parameters."""
        filtered = self._resources

        if skill:
            skill_lower = skill.lower()
            filtered = [
                r for r in filtered
                if any(skill_lower in s.lower() for s in r.get("skills", []))
            ]

        if difficulty:
            diff_lower = difficulty.lower()
            filtered = [r for r in filtered if r.get("difficulty", "").lower() == diff_lower]

        if max_cost is not None:
            filtered = [r for r in filtered if float(r.get("cost", 0)) <= max_cost]

        if resource_type:
            type_lower = resource_type.lower()
            filtered = [r for r in filtered if r.get("type", "").lower() == type_lower]

        # Prioritize free resources, then by estimated duration
        filtered.sort(key=lambda r: (r.get("cost", 0), r.get("estimated_hours", 0)))
        return filtered[:limit]

    def find_resources_for_skills(
        self,
        skills: List[str],
        max_cost_per_skill: Optional[float] = None
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Return best matching resources mapped per required skill."""
        result = {}
        for s in skills:
            matches = self.query(skill=s, max_cost=max_cost_per_skill, limit=3)
            result[s] = matches
        return result
