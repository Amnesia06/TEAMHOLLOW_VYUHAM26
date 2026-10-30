"""
Profile Service: Retrieves, updates, and analyzes user career profiles.
"""

from typing import Dict, Any, Optional
from backend.app.database.supabase_client import db_client
from intelligence.agents.profile_agent import ProfileAgent
from backend.app.core.llm_provider import llm_provider
from backend.app.schemas.profile import UserProfile, ProfileUpdate


class ProfileService:
    def __init__(self):
        self.profile_agent = ProfileAgent(llm_provider=llm_provider)

    async def get_profile(self, user_id: str) -> UserProfile:
        data = db_client.get_item("profiles", user_id)
        if not data:
            # Seed demo profile for guest user
            demo_resp = self.profile_agent._get_demo_response("")
            data = demo_resp["profile"]
            data["user_id"] = user_id
            db_client.save_item("profiles", user_id, data)

        data["user_id"] = user_id
        return UserProfile(**data)

    async def update_profile(self, user_id: str, updates: ProfileUpdate) -> UserProfile:
        existing = await self.get_profile(user_id)
        existing_dict = existing.model_dump()

        update_dict = updates.model_dump(exclude_unset=True)
        for k, v in update_dict.items():
            if v is not None:
                existing_dict[k] = v

        # Recalculate completeness
        completeness = self.profile_agent._calculate_completeness(existing_dict)
        existing_dict["completeness"] = completeness

        db_client.save_item("profiles", user_id, existing_dict)
        return UserProfile(**existing_dict)

    async def analyze_text(self, resume_text: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        result = await self.profile_agent.run({
            "resume_text": resume_text,
            "profile": {}
        })
        profile_data = result["profile"]
        if user_id:
            db_client.save_item("profiles", user_id, profile_data)
        return result


profile_service = ProfileService()
