"""
Live Web Search Adapter using Tavily API.
Used for autonomous fallback when role postings in database < MIN_POSTINGS_COUNT.
"""

import os
import logging
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class TavilySearchAdapter:
    """Adapter wrapping tavily-python client to conform to BaseAgent search interface."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("TAVILY_API_KEY")
        self._client = None
        if self.api_key:
            try:
                from tavily import TavilyClient
                self._client = TavilyClient(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize TavilyClient: {e}")

    async def search(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        if not self._client:
            logger.warning("Tavily client is not configured or missing API key.")
            return []
        try:
            res = self._client.search(query=query, max_results=max_results)
            results = res.get("results", [])
            return [
                {
                    "title": item.get("title", ""),
                    "content": item.get("content", ""),
                    "url": item.get("url", "live_search")
                }
                for item in results
            ]
        except Exception as e:
            logger.error(f"Tavily live search error: {e}")
            return []

