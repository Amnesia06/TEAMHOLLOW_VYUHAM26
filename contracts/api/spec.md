# Pathwise API Specification

> Version: 2.0.0  
> Base URL: `/api/v1`  
> Protocol: HTTP / JSON / SSE (Server-Sent Events)

---

## 1. Common Response Envelope

All API endpoints return responses encapsulated in the standard envelope:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "metadata": {
    "timestamp": "2026-10-30T12:00:00Z",
    "request_id": "req-uuid-or-none"
  }
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description of error",
    "details": { ... }
  },
  "metadata": {
    "timestamp": "2026-10-30T12:00:00Z",
    "request_id": "req-uuid-or-none"
  }
}
```

---

## 2. Standard Error Codes

Carried from the v1 contract with exact HTTP status alignments:

| Code | HTTP Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Invalid request payload or parameters failing schema validation |
| `NOT_FOUND` | 404 | Target resource (roadmap, profile, course, role) does not exist |
| `UNAUTHORIZED` | 401 | Authentication required or Supabase token validation failure |
| `RATE_LIMITED` | 429 | Rate limit exceeded (Gemini, Tavily, or client request throttle) |
| `LLM_ERROR` | 502 | LLM provider (Gemini) error or malformed non-JSON output after retry |
| `SERVICE_UNAVAILABLE` | 503 | External dependency (Supabase, Tavily search) unavailable |
| `INTERNAL_ERROR` | 500 | Unexpected deterministic execution failure |

---

## 3. API Endpoints (README Section 15)

### 3.1 Health Check
- **Endpoint:** `GET /api/v1/health`
- **Purpose:** Service status (database, LLM, search)
- **Response Data:**
  ```json
  {
    "status": "healthy",
    "services": {
      "database": "connected",
      "llm_provider": "available",
      "search": "available"
    }
  }
  ```

### 3.2 Upload Resume
- **Endpoint:** `POST /api/v1/upload-resume`
- **Purpose:** Accepts file upload (PDF/TXT), extracts and returns clean text
- **Request:** `multipart/form-data` with `file`
- **Response Data:**
  ```json
  {
    "filename": "resume.pdf",
    "extracted_text": "...",
    "char_count": 1542
  }
  ```

### 3.3 Analyze
- **Endpoint:** `POST /api/v1/analyze`
- **Purpose:** Full end-to-end pipeline: profile extraction, market requirements, gap prioritization, deterministic planning, verification, and grounded explanation.
- **Request Body:**
  ```json
  {
    "resume_text": "Experienced software engineer with...",
    "constraints": {
      "budget": 0.0,
      "currency": "USD",
      "weekly_hours": 10.0,
      "target_timeline": 12,
      "target_role": "Full-Stack Developer"
    }
  }
  ```
- **Streaming:** Returns Server-Sent Events (`text/event-stream`) streaming `ProgressEvent` items, ending with final `data` payload containing Profile, Gaps, Roadmap, and Explanations.

### 3.4 Suggest Roles (M7)
- **Endpoint:** `POST /api/v1/suggest-roles`
- **Purpose:** Evaluates profile against demo roles when no target role is given
- **Request Body:** `Profile` object
- **Response Data:**
  ```json
  {
    "ranked_roles": [
      {
        "role_title": "Full-Stack Developer",
        "fit_score": 0.88,
        "matching_skills": ["TypeScript", "React", "Node.js"],
        "critical_gaps": ["PostgreSQL"]
      }
    ]
  }
  ```

### 3.5 Market Trends (M8)
- **Endpoint:** `GET /api/v1/market-trends?role={role_title}`
- **Purpose:** Returns timestamped snapshots with rising/declining skill frequencies
- **Response Data:**
  ```json
  {
    "role": "Full-Stack Developer",
    "snapshot_dates": ["2026-08-01", "2026-10-01"],
    "skills": [
      {
        "skill_name": "Next.js",
        "trend": "rising",
        "frequencies": {"2026-08-01": 0.45, "2026-10-01": 0.68}
      }
    ]
  }
  ```

### 3.6 Save Roadmap
- **Endpoint:** `POST /api/v1/roadmaps`
- **Purpose:** Persist a roadmap for an authenticated user
- **Request Body:** `{ "roadmap": { ... } }`

### 3.7 Get Saved Roadmaps
- **Endpoint:** `GET /api/v1/roadmaps`
- **Purpose:** List saved roadmaps for authenticated user

### 3.8 Update Progress
- **Endpoint:** `POST /api/v1/roadmaps/{id}/progress`
- **Purpose:** Mark an item completed and trigger replanning
- **Request Body:** `{ "item_id": "item_1", "status": "completed" }`

### 3.9 Replan
- **Endpoint:** `POST /api/v1/replan`
- **Purpose:** Applies modified budget, weekly hours, or target role and returns an updated roadmap

### 3.10 Generate Quiz (M12)
- **Endpoint:** `POST /api/v1/quiz`
- **Purpose:** Returns a diagnostic quiz for a completed roadmap item grounded in course skills
- **Request Body:** `{ "roadmap_item_id": "item_1", "course_id": "course_react_01" }`
