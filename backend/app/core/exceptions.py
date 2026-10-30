"""
Custom exceptions and FastAPI exception handlers.
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from typing import Any, Dict, Optional


class PathwiseError(Exception):
    """Base exception for all Pathwise errors."""
    def __init__(self, message: str, code: str = "INTERNAL_ERROR", details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.code = code
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(PathwiseError):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, code="VALIDATION_ERROR", details=details)


class NotFoundError(PathwiseError):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, code="NOT_FOUND", details=details)


class LLMError(PathwiseError):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, code="LLM_ERROR", details=details)


async def pathwise_exception_handler(request: Request, exc: PathwiseError) -> JSONResponse:
    status_map = {
        "VALIDATION_ERROR": status.HTTP_400_BAD_REQUEST,
        "NOT_FOUND": status.HTTP_404_NOT_FOUND,
        "LLM_ERROR": status.HTTP_502_BAD_GATEWAY,
        "INTERNAL_ERROR": status.HTTP_500_INTERNAL_SERVER_ERROR
    }
    http_status = status_map.get(exc.code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    return JSONResponse(
        status_code=http_status,
        content={
            "success": False,
            "data": None,
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details
            },
            "metadata": {
                "path": str(request.url)
            }
        }
    )
