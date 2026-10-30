"""
Shared API response envelope and error models.
"""

from datetime import datetime, timezone
from typing import Generic, Optional, TypeVar, Any, Dict
from pydantic import BaseModel, Field

T = TypeVar("T")


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None


class ResponseMetadata(BaseModel):
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    request_id: Optional[str] = None


class APIResponse(BaseModel, Generic[T]):
    """Unified API response wrapper conforming to contracts/api/."""
    success: bool = True
    data: Optional[T] = None
    error: Optional[ErrorDetail] = None
    metadata: ResponseMetadata = Field(default_factory=ResponseMetadata)
