"""
Pathwise FastAPI Main Application Entry Point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.exceptions import PathwiseError, pathwise_exception_handler
from backend.app.api import api_router

app = FastAPI(
    title="Pathwise API",
    description="AI-powered career and skill-gap analysis agent backend (Challenge AF-03).",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for Vite frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        settings.FRONTEND_URL,
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register custom exception handlers conforming to contract envelope
app.add_exception_handler(PathwiseError, pathwise_exception_handler)

# Include versioned API endpoints
app.include_router(api_router)


@app.get("/")
async def root_index():
    return {
        "service": "Pathwise API",
        "status": "operational",
        "version": "2.0.0",
        "docs": "/docs",
        "api_v1": "/api/v1"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
