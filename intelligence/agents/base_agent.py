"""
Base agent class for all Pathwise specialized agents.
Provides unified LLM communication, demo mode fallback, and structured JSON parsing.
"""

import json
import logging
import os
import re
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


class BaseAgent:
    """
    Abstract base agent providing common capabilities:
    - Provider-agnostic LLM invocation
    - Demo mode / offline fallback
    - Safe JSON extraction and validation
    - Error logging and metrics
    """

    def __init__(self, llm_provider: Optional[Any] = None, name: str = "BaseAgent"):
        self.llm_provider = llm_provider
        self.name = name
        self.demo_mode = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")

    async def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main execution method for the agent. Must be implemented by subclasses.
        """
        raise NotImplementedError("Subclasses must implement run()")

    async def _call_llm(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        expected_schema: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Call the configured LLM provider or fallback to mock response in demo mode.
        Safely parses JSON responses.
        """
        if self.demo_mode or not self.llm_provider:
            logger.info(f"[{self.name}] Operating in DEMO_MODE: returning mocked response.")
            return self._get_demo_response(prompt, expected_schema)

        try:
            raw_response = await self.llm_provider.generate(
                prompt=prompt,
                system_prompt=system_prompt,
            )
            return self._extract_json(raw_response)
        except Exception as e:
            logger.warning(
                f"[{self.name}] LLM invocation failed ({e}). Falling back to demo response."
            )
            return self._get_demo_response(prompt, expected_schema)

    def _extract_json(self, text: str) -> Dict[str, Any]:
        """
        Extract and parse JSON from LLM text that might contain markdown fences or surrounding chatter.
        """
        text = text.strip()
        # Look for markdown code fence ```json ... ```
        json_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if json_match:
            text = json_match.group(1).strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Try to locate the outermost curly braces
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1 and end > start:
                try:
                    return json.loads(text[start : end + 1])
                except json.JSONDecodeError:
                    pass
            logger.error(f"[{self.name}] Failed to parse JSON from LLM response: {text[:200]}")
            return {"raw_text": text, "error": "JSON_PARSE_ERROR"}

    def _get_demo_response(
        self, prompt: str, expected_schema: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Subclasses can override to provide specific realistic demo responses.
        """
        return {"status": "demo_completed", "agent": self.name}
