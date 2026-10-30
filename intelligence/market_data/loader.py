"""
Market Data Loader for reading, searching, and filtering job role requirements.
"""

import json
import os
from typing import Dict, List, Optional, Any


class MarketDataLoader:
    """
    Loads and searches role requirements from curated market datasets.
    """

    def __init__(self, data_path: Optional[str] = None):
        if not data_path:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            data_path = os.path.join(current_dir, "job_roles.json")

        self.data_path = data_path
        self._roles: List[Dict[str, Any]] = []
        self._load_data()

    def _load_data(self) -> None:
        try:
            with open(self.data_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self._roles = data.get("roles", [])
        except Exception as e:
            # Fallback to empty if file missing
            self._roles = []

    def get_all_roles(self) -> List[Dict[str, Any]]:
        """Return all curated roles."""
        return self._roles

    def get_role_by_id(self, role_id: str) -> Optional[Dict[str, Any]]:
        """Fetch a specific role by ID."""
        for role in self._roles:
            if role.get("role_id") == role_id:
                return role
        return None

    def get_role_by_title(self, title: str) -> Optional[Dict[str, Any]]:
        """Fetch role by title matching (case-insensitive substring)."""
        title_lower = title.lower()
        for role in self._roles:
            if role.get("title", "").lower() == title_lower:
                return role
        for role in self._roles:
            if title_lower in role.get("title", "").lower():
                return role
        return None

    def search_roles_by_skills(self, skills: List[str]) -> List[Dict[str, Any]]:
        """Find roles that require any of the provided skills."""
        skills_set = {s.lower() for s in skills}
        matches = []
        for role in self._roles:
            role_skills = {req["name"].lower() for req in role.get("required_skills", [])}
            overlap = skills_set.intersection(role_skills)
            if overlap:
                matches.append({
                    "role": role,
                    "matched_skills_count": len(overlap),
                    "matched_skills": list(overlap)
                })
        matches.sort(key=lambda x: x["matched_skills_count"], reverse=True)
        return [m["role"] for m in matches]
