"""
Resource Service: Queries and filters the verified learning resource catalog.
"""

from typing import List, Optional
from intelligence.resources.database import ResourceDatabase
from backend.app.schemas.resource import LearningResource


class ResourceService:
    def __init__(self):
        self.resource_db = ResourceDatabase()

    def query_resources(
        self,
        skill: Optional[str] = None,
        difficulty: Optional[str] = None,
        max_cost: Optional[float] = None,
        resource_type: Optional[str] = None,
        limit: int = 15
    ) -> List[LearningResource]:
        items = self.resource_db.query(
            skill=skill,
            difficulty=difficulty,
            max_cost=max_cost,
            resource_type=resource_type,
            limit=limit
        )
        return [LearningResource(**r) for r in items]


resource_service = ResourceService()
