"""
Market Data Loader for reading cleaned job postings and seed data.
"""

import json
import os
from typing import Dict, List, Optional, Any


class MarketDataLoader:
    """
    Loads baseline job postings dataset and seed role definitions.
    """

    def __init__(self, data_path: Optional[str] = None):
        if not data_path:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            data_path = os.path.join(current_dir, "job_roles.json")

        self.data_path = data_path
        self._roles: List[Dict[str, Any]] = []
        self._load_data()

    def _load_data(self) -> None:
        if os.path.exists(self.data_path):
            try:
                with open(self.data_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self._roles = data.get("roles", [])
            except Exception:
                self._roles = []

    def get_all_roles(self) -> List[Dict[str, Any]]:
        return self._roles
