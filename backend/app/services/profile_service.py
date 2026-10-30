"""
Profile Service: Manages persistence and retrieval of canonical profiles.
"""

from typing import Dict, Any, Optional
from contracts.schemas.profile import Profile
from backend.app.database.supabase_client import db_client


class ProfileService:
    """
    Manages persistence of user profiles in Supabase.
    """

    def __init__(self):
        self._test_cache: Dict[str, Profile] = {}

    def get_profile(self, user_id: str) -> Optional[Profile]:
        if user_id in self._test_cache:
            return self._test_cache[user_id]
        if db_client.is_connected:
            res = db_client.client.table("profiles").select("*").eq("user_id", user_id).execute()
            if res.data:
                return Profile(**res.data[0])
        return None

    def save_profile(self, user_id: str, profile: Profile) -> None:
        self._test_cache[user_id] = profile
        if db_client.is_connected:
            db_client.client.table("profiles").upsert({
                "user_id": user_id,
                "skills": [s.model_dump() for s in profile.skills],
                "years_of_experience": profile.years_of_experience,
                "years_per_skill": profile.years_per_skill,
                "domain": profile.domain
            }).execute()


profile_service = ProfileService()
