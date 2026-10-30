"""
Gemini API HTTP Client.
Direct REST client calling Google Generative Language API via httpx.
Supports JSON mode, system instructions, and automatic model fallback.
"""

import os
import json
import logging
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv
import httpx
from intelligence.config import intelligence_config

load_dotenv()
logger = logging.getLogger(__name__)


class GeminiClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.primary_model = intelligence_config.PRIMARY_LLM_MODEL
        self.fallback_model = intelligence_config.FALLBACK_LLM_MODEL
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        json_mode: bool = False,
        temperature: float = 0.2,
        timeout: float = 20.0
    ) -> str:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set.")

        payload: Dict[str, Any] = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": temperature,
            }
        }

        if system_prompt:
            payload["systemInstruction"] = {
                "parts": [{"text": system_prompt}]
            }

        if json_mode:
            payload["generationConfig"]["responseMimeType"] = "application/json"

        # Try primary model, fallback to secondary models if needed
        models_to_try = [self.primary_model, self.fallback_model, "gemma-4-26b-a4b-it"]

        async with httpx.AsyncClient(timeout=timeout) as client:
            last_err = None
            for model in models_to_try:
                url = f"{self.base_url}/{model}:generateContent?key={self.api_key}"
                try:
                    res = await client.post(url, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        candidates = data.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            parts = candidates[0]["content"].get("parts", [])
                            if parts and "text" in parts[0]:
                                return parts[0]["text"]
                    else:
                        err_body = res.text
                        logger.warning(f"Gemini call to {model} returned status {res.status_code}: {err_body[:200]}")
                        last_err = RuntimeError(f"Gemini API {res.status_code}: {err_body[:200]}")
                except Exception as e:
                    logger.warning(f"Gemini call to {model} failed with exception: {e}")
                    last_err = e

            raise last_err or RuntimeError("Gemini API generation failed across all models.")


# Singleton client instance
gemini_client = GeminiClient()

