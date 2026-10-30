"""
Timeline and constraint calculations (Backend Track M4/M5).
Conforms to README Section 9.8 and 9.9.
"""

import math
from typing import List, Dict, Any, Tuple, Optional
from contracts.schemas.roadmap import RoadmapItem, Roadmap
from contracts.schemas.constraints import UserConstraints
from contracts.schemas.gap import Gap


class TimelineScheduler:
    """
    Computes sequential timeline for roadmap items.
    Weeks for an item = course hours / weekly hours, rounded up.
    Items run sequentially. Total timeline is the sum.
    """

    @classmethod
    def schedule_items(
        cls,
        items: List[RoadmapItem],
        weekly_hours: float
    ) -> float:
        current_week = 1.0
        for item in items:
            duration_weeks = math.ceil(item.hours / weekly_hours)
            item.start_week = round(current_week, 1)
            item.end_week = round(current_week + duration_weeks, 1)
            current_week = item.end_week
        return round(current_week - 1.0, 1)
