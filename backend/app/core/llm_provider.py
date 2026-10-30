"""
Unified LLM Provider abstraction for Google Gemini and Anthropic Claude.
Provides fallback to demo mode when API keys are not provided.
"""

import json
import logging
from typing import Optional, Dict, Any
from backend.app.core.config import settings

logger = logging.getLogger(__name__)


class LLMProvider:
    """
    Vendor-neutral interface for conversational intelligence and JSON extraction.
    """

    def __init__(self):
        self.provider_type = settings.LLM_PROVIDER.lower()
        self.is_demo = settings.is_demo

        self._client = None
        self._init_client()

    def _init_client(self):
        if self.is_demo:
            logger.info("LLMProvider operating in DEMO MODE.")
            return

        try:
            if self.provider_type == "gemini" and settings.GEMINI_API_KEY:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                model_name = settings.LLM_MODEL_NAME or "gemini-1.5-pro-latest"
                self._client = genai.GenerativeModel(model_name)
                logger.info(f"Initialized Gemini provider with model {model_name}")

            elif self.provider_type == "anthropic" and settings.ANTHROPIC_API_KEY:
                import anthropic
                self._client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
                logger.info("Initialized Anthropic provider")
        except Exception as e:
            logger.warning(f"Failed to initialize external LLM client ({e}). Reverting to demo mode.")
            self.is_demo = True

    async def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """
        Generate raw text response from provider or return demo message.
        """
        if self.is_demo or not self._client:
            return self._get_mock_response(prompt)

        try:
            if self.provider_type == "gemini":
                combined = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
                response = await self._client.generate_content_async(combined)
                return response.text

            elif self.provider_type == "anthropic":
                model_name = settings.LLM_MODEL_NAME or "claude-3-5-sonnet-20241022"
                response = await self._client.messages.create(
                    model=model_name,
                    max_tokens=2048,
                    system=system_prompt or "",
                    messages=[{"role": "user", "content": prompt}]
                )
                return response.content[0].text

        except Exception as e:
            logger.error(f"Error calling {self.provider_type}: {e}. Returning demo response.")
            return self._get_mock_response(prompt)

        return self._get_mock_response(prompt)

    def _get_mock_response(self, prompt: str) -> str:
        """Demo response for offline hackathon testing."""
        return (
            "I've analyzed your computer science background, Python and C++ proficiency, "
            "and your work on the autonomous GPS farm rover project. "
            "Your experience with waypoint navigation and sensor integration demonstrates strong "
            "transferable competencies in graph search, path planning, and embedded control. "
            "Based on market requirements, you are a strong candidate for Robotics Software Engineer and AI Engineer roles!"
        )


llm_provider = LLMProvider()
