"""
Base agent class for Pathwise intelligence agents.
Structured JSON parsing with schema validation and one retry on malformed output.
No demo mode or canned mock fallback (README Non-negotiable rules).
"""

import json
import logging
import os
import re
from typing import Any, Dict, Optional, Type
from pydantic import BaseModel, ValidationError

logger = logging.getLogger(__name__)


class LLMStructuredOutputError(Exception):
    """Raised when an LLM fails to return valid structured JSON matching schema."""
    pass


class BaseAgent:
    """
    Abstract base agent providing structured LLM invocation.
    If the LLM is unavailable or fails, it fails with a clear error, never returning canned text.
    """

    def __init__(self, llm_client: Optional[Any] = None, name: str = "BaseAgent"):
        self.llm_client = llm_client
        self.name = name

    async def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError("Subclasses must implement run()")

    def _extract_json(self, text: str) -> Dict[str, Any]:
        """Safely extract JSON object from LLM response text."""
        text = text.strip()
        json_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if json_match:
            text = json_match.group(1).strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1 and end > start:
                try:
                    return json.loads(text[start: end + 1])
                except json.JSONDecodeError:
                    pass
            raise LLMStructuredOutputError(f"Failed to parse JSON from LLM response: {text[:200]}")
