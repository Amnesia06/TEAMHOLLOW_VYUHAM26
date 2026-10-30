"""
Taxonomy Lookup Wrapper.
Conforms strictly to README Section 7.3: interacts through TaxonomyLookupInterface,
never directly accessing the backend database.
"""

import json
import os
from typing import Dict, List, Optional, Any
from intelligence.interfaces import TaxonomyLookupInterface


class SkillTaxonomy:
    """
    Taxonomy wrapper providing canonical skill normalization,
    prerequisite lookup, and vector-backed candidate retrieval.
    """

    def __init__(self, backend_lookup: Optional[TaxonomyLookupInterface] = None):
        self._backend_lookup = backend_lookup
        self._local_cache: Dict[str, Dict[str, Any]] = {}
        self._name_to_id: Dict[str, str] = {}
        self._load_local_contracts_taxonomy()

    def _load_local_contracts_taxonomy(self) -> None:
        """Load from shared contracts/taxonomy/skills.json."""
        root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        tax_path = os.path.join(root_dir, "contracts", "taxonomy", "skills.json")
        if os.path.exists(tax_path):
            with open(tax_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                for item in data.get("skills", []):
                    s_id = item["id"]
                    self._local_cache[s_id] = item
                    self._name_to_id[item["canonical_name"].lower()] = s_id
                    for alias in item.get("aliases", []):
                        self._name_to_id[alias.lower()] = s_id

    def get_skill_by_id(self, skill_id: str) -> Optional[Dict[str, Any]]:
        if self._backend_lookup:
            return self._backend_lookup.get_skill_by_id(skill_id)
        return self._local_cache.get(skill_id)

    def get_skill_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        if self._backend_lookup:
            return self._backend_lookup.get_skill_by_name(name)
        s_id = self._name_to_id.get(name.strip().lower())
        if s_id:
            return self._local_cache.get(s_id)
        return None

    def search_skills_by_vector(self, query_vector: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
        if self._backend_lookup:
            return self._backend_lookup.search_skills_by_vector(query_vector, top_k=top_k)
        # In-memory fake fallback when backend is not supplied
        return list(self._local_cache.values())[:top_k]

    def get_prerequisites(self, skill_id_or_name: str) -> List[str]:
        skill = self.get_skill_by_id(skill_id_or_name) or self.get_skill_by_name(skill_id_or_name)
        if skill:
            return skill.get("prerequisites", [])
        return []

    def get_all_skills(self) -> List[Dict[str, Any]]:
        if self._backend_lookup:
            return self._backend_lookup.get_all_skills()
        return list(self._local_cache.values())
