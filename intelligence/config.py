"""
Intelligence configuration parameters (README Section 11 & Section 14).
Model names, rate limits, thresholds, and scoring constants live here, not in env.
"""

from typing import Dict, Any


class IntelligenceConfig:
    # Model parameters (README Section 14)
    PRIMARY_LLM_MODEL: str = "gemini-flash-lite-latest"
    FALLBACK_LLM_MODEL: str = "gemini-3-flash-preview"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION: int = 384

    # Similarity thresholds (README Section 9.2)
    FULL_MATCH_THRESHOLD: float = 0.80
    PARTIAL_MATCH_THRESHOLD: float = 0.60

    # Market Intelligence parameters (README Section 11, M2)
    TOP_K_POSTINGS: int = 15
    MIN_POSTINGS_COUNT: int = 5
    POSTING_SIMILARITY_FALLBACK_THRESHOLD: float = 0.70

    # Priority score factors (README Section 9.5)
    TRANSFER_FACTOR_NONE: float = 1.0
    TRANSFER_FACTOR_PARTIAL: float = 0.5
    TREND_FACTOR_RISING: float = 1.2
    TREND_FACTOR_STABLE: float = 1.0
    TREND_FACTOR_DECLINING: float = 0.9
    TREND_FACTOR_UNKNOWN: float = 1.0

    # Rate limits & retries
    MAX_LLM_RETRIES: int = 1


intelligence_config = IntelligenceConfig()
