"""
Chat Service: Manages conversational sessions, message persistence,
and triggers the multi-agent graph workflow.
"""

import uuid
from typing import Dict, List, Optional, Any
from backend.app.database.supabase_client import db_client
from backend.app.graph.workflow import career_graph
from backend.app.schemas.chat import (
    ChatRequest, ChatResponse, AgentActivity, UIComponent, ProfileUpdateSummary
)


class ChatService:
    """
    Coordinates chat messages and session history.
    """

    async def process_chat(self, req: ChatRequest) -> ChatResponse:
        session_id = req.session_id or f"sess_{uuid.uuid4().hex[:12]}"
        user_id = req.user_id or "00000000-0000-0000-0000-000000000001"

        # 1. Retrieve session history from db
        history = db_client.get_item("conversations", session_id) or []
        user_profile = db_client.get_item("profiles", user_id) or {}

        # 2. Append new user message
        history.append({"role": "user", "content": req.message})

        # Check for resume attachment
        resume_text = ""
        if req.attachments:
            for att in req.attachments:
                if att.type == "resume":
                    resume_text += f"\n{att.content}"

        # 3. Execute multi-agent graph workflow
        turn_result = await career_graph.execute_conversation_turn(
            messages=history,
            current_profile=user_profile,
            resume_text=resume_text if resume_text else None
        )

        assistant_msg = turn_result["message"]
        updated_profile = turn_result["profile"]
        agent_activities = [
            AgentActivity(**a) for a in turn_result.get("agent_activity", [])
        ]
        ui_components = [
            UIComponent(**u) for u in turn_result.get("ui_components", [])
        ]

        # 4. Save assistant response and update profile in db
        history.append({"role": "assistant", "content": assistant_msg})
        db_client.save_item("conversations", session_id, history)
        db_client.save_item("profiles", user_id, updated_profile)

        # Build profile update summary
        profile_skills = [s.get("name", "") for s in updated_profile.get("skills", [])]
        profile_projects = [p.get("name", "") for p in updated_profile.get("projects", [])]

        return ChatResponse(
            message=assistant_msg,
            session_id=session_id,
            agent_activity=agent_activities,
            profile_update=ProfileUpdateSummary(
                new_skills=profile_skills,
                new_projects=profile_projects,
                completeness=updated_profile.get("completeness", 0.0)
            ),
            ui_components=ui_components,
            follow_up_suggestions=turn_result.get("follow_up_suggestions", [])
        )

    def get_session_history(self, session_id: str) -> List[Dict[str, str]]:
        return db_client.get_item("conversations", session_id) or []


chat_service = ChatService()
