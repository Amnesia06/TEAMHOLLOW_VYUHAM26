"""
Conversational intelligence endpoints.
"""

from fastapi import APIRouter
from backend.app.schemas.common import APIResponse
from backend.app.schemas.chat import ChatRequest, ChatResponse
from backend.app.services.chat_service import chat_service

router = APIRouter(tags=["Chat"])


@router.post("/chat", response_model=APIResponse[ChatResponse])
async def post_chat_message(request: ChatRequest):
    """
    Accepts a natural language user query, analyzes capabilities,
    orchestrates multi-agent analysis, and streams back explainable recommendations.
    """
    response_data = await chat_service.process_chat(request)
    return APIResponse(data=response_data)
