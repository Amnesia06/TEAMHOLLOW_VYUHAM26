# Pathwise API Contract

> **Version:** 1.0.0  
> **Base URL:** `/api/v1`  
> **Last Updated:** 2026-10-30

## Overview

This document defines the shared data contracts between the frontend, backend, and intelligence modules. All API endpoints, request schemas, response schemas, and data structures are documented here.

The Pydantic models in `backend/app/schemas/` are the authoritative source. This document serves as the human-readable reference.

---

## Authentication

Guest mode is supported for demonstration purposes. Authenticated endpoints require a Bearer token in the `Authorization` header.

```
Authorization: Bearer <token>
```

---

## Common Response Envelope

All API responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "metadata": {
    "timestamp": "2026-10-30T12:00:00Z",
    "request_id": "uuid"
  }
}
```

Error responses:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": { ... }
  },
  "metadata": { ... }
}
```

---

## Endpoints

### Health Check

#### `GET /api/v1/health`

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "llm_provider": "available",
    "search": "available"
  },
  "demo_mode": true
}
```

---

### Chat

#### `POST /api/v1/chat`

Send a user message and receive an AI response with optional structured data.

**Request Body:**
```json
{
  "message": "I'm a CS graduate interested in AI...",
  "session_id": "uuid | null",
  "user_id": "uuid | null",
  "attachments": [
    {
      "type": "resume",
      "content": "extracted text content",
      "filename": "resume.pdf"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "AI response text...",
    "session_id": "uuid",
    "agent_activity": [
      {
        "agent": "profile_agent",
        "status": "completed",
        "summary": "Extracted 5 skills from conversation"
      }
    ],
    "profile_update": {
      "new_skills": ["Python", "C++"],
      "new_experience": ["GPS rover project"],
      "completeness": 0.45
    },
    "ui_components": [
      {
        "type": "career_card",
        "data": { }
      }
    ],
    "follow_up_suggestions": [
      "Tell me more about your rover project",
      "What programming frameworks have you used?"
    ]
  }
}
```

---

### Profile

#### `POST /api/v1/profile/analyze`

Analyze resume text or profile information.

**Request Body:**
```json
{
  "user_id": "uuid | null",
  "resume_text": "Full resume text...",
  "additional_context": "Optional additional info..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "education": [],
      "skills": [],
      "experience": [],
      "projects": [],
      "interests": [],
      "career_goals": []
    },
    "confidence": 0.75,
    "missing_fields": ["work_experience", "certifications"],
    "follow_up_questions": []
  }
}
```

#### `GET /api/v1/profile/{user_id}`

Retrieve the user's structured profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "education": [
      {
        "degree": "B.Tech Computer Science",
        "institution": "University Name",
        "year": 2024,
        "gpa": null
      }
    ],
    "skills": [
      {
        "skill_id": "uuid",
        "name": "Python",
        "category": "Programming Languages",
        "proficiency": "intermediate",
        "evidence": [
          {
            "type": "project",
            "description": "Built autonomous GPS rover",
            "confidence": "high"
          }
        ],
        "is_inferred": false,
        "last_updated": "2026-10-30T12:00:00Z"
      }
    ],
    "experience": [],
    "projects": [
      {
        "name": "Autonomous GPS Farm Rover",
        "description": "...",
        "technologies": ["Python", "C++", "GPS"],
        "skills_demonstrated": []
      }
    ],
    "interests": ["AI", "Robotics"],
    "career_goals": ["AI Engineer"],
    "learning_preferences": {
      "hours_per_week": null,
      "budget_monthly": null,
      "preferred_format": null
    },
    "completeness": 0.65,
    "last_updated": "2026-10-30T12:00:00Z"
  }
}
```

#### `PATCH /api/v1/profile/{user_id}`

Update user-approved profile fields.

**Request Body:**
```json
{
  "education": [],
  "skills": [],
  "experience": [],
  "career_goals": [],
  "learning_preferences": { }
}
```

---

### Career Recommendations

#### `GET /api/v1/careers/recommendations`

**Query Parameters:**
- `user_id` (required): User ID
- `limit` (optional, default=5): Number of recommendations

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "role": "Machine Learning Engineer",
        "match_score": 0.72,
        "match_explanation": "Your Python skills and ML project experience...",
        "matching_skills": [
          {"skill": "Python", "relevance": "core requirement"}
        ],
        "transferable_skills": [
          {
            "skill": "Path Planning (A*)",
            "transfers_to": "Graph Algorithms / Search",
            "explanation": "Your A* implementation demonstrates..."
          }
        ],
        "partial_skills": [
          {"skill": "Machine Learning", "current_level": "beginner", "required_level": "intermediate"}
        ],
        "missing_skills": [
          {"skill": "MLOps", "importance": "preferred", "priority": "medium"}
        ],
        "confidence": 0.70,
        "data_source": "curated_dataset",
        "last_updated": "2026-10-30"
      }
    ]
  }
}
```

#### `POST /api/v1/careers/analyze`

**Request Body:**
```json
{
  "user_id": "uuid",
  "target_role": "Machine Learning Engineer"
}
```

**Response:** Detailed skill-gap analysis for the target role (same structure as recommendations but with full gap analysis).

---

### Roadmap

#### `POST /api/v1/roadmap/generate`

**Request Body:**
```json
{
  "user_id": "uuid",
  "target_role": "Machine Learning Engineer",
  "constraints": {
    "hours_per_week": 5,
    "monthly_budget": 0,
    "desired_timeline_months": 6,
    "preferred_format": ["video", "interactive"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "roadmap_id": "uuid",
    "target_role": "Machine Learning Engineer",
    "total_estimated_weeks": 24,
    "total_estimated_cost": 0,
    "feasibility": {
      "is_feasible": true,
      "notes": "Timeline achievable with 5hrs/week"
    },
    "milestones": [
      {
        "milestone_id": "uuid",
        "order": 1,
        "title": "Strengthen Mathematical Foundations",
        "description": "...",
        "skills_covered": ["Linear Algebra", "Statistics"],
        "estimated_hours": 20,
        "estimated_weeks": 4,
        "estimated_cost": 0,
        "prerequisites": [],
        "resources": [
          {
            "resource_id": "uuid",
            "title": "3Blue1Brown: Essence of Linear Algebra",
            "provider": "YouTube",
            "url": "https://...",
            "type": "video",
            "cost": 0,
            "estimated_hours": 4
          }
        ],
        "priority_explanation": "Linear algebra is foundational for ML...",
        "status": "not_started",
        "progress": 0
      }
    ],
    "explanation": "This roadmap prioritizes..."
  }
}
```

#### `GET /api/v1/roadmap/{user_id}`

Retrieve the current roadmap.

#### `PATCH /api/v1/roadmap/milestones/{milestone_id}`

**Request Body:**
```json
{
  "status": "in_progress",
  "progress": 50,
  "notes": "Completed first 3 chapters"
}
```

---

### Resources

#### `GET /api/v1/resources`

**Query Parameters:**
- `skill` (optional): Filter by skill name
- `difficulty` (optional): Filter by difficulty (beginner, intermediate, advanced)
- `max_cost` (optional): Maximum cost filter
- `type` (optional): Resource type filter
- `limit` (optional, default=10)

**Response:**
```json
{
  "success": true,
  "data": {
    "resources": [
      {
        "resource_id": "uuid",
        "title": "Python for Everybody",
        "provider": "freeCodeCamp",
        "url": "https://...",
        "topic": "Python Programming",
        "skills": ["Python", "Data Structures"],
        "cost": 0,
        "currency": "USD",
        "difficulty": "beginner",
        "estimated_hours": 40,
        "prerequisites": [],
        "type": "course",
        "last_verified": "2026-10-01"
      }
    ]
  }
}
```

---

## Data Types

### Proficiency Levels
- `beginner` — Limited or no practical experience
- `intermediate` — Practical experience, can work independently
- `advanced` — Deep expertise, can teach others
- `expert` — Industry-leading knowledge

### Evidence Types
- `self_reported` — User stated this skill
- `project` — Demonstrated through a project
- `experience` — Demonstrated through work experience
- `education` — Learned through formal education
- `certification` — Verified through certification
- `assessment` — Verified through Pathwise assessment

### Confidence Levels
- `low` — Insufficient evidence
- `medium` — Some supporting evidence
- `high` — Strong supporting evidence

### Skill Importance
- `required` — Must-have for the role
- `preferred` — Nice-to-have, improves candidacy
- `emerging` — Increasingly requested in recent listings

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `NOT_FOUND` | 404 | Resource not found |
| `UNAUTHORIZED` | 401 | Authentication required |
| `RATE_LIMITED` | 429 | Too many requests |
| `LLM_ERROR` | 502 | LLM provider error |
| `SERVICE_UNAVAILABLE` | 503 | External service unavailable |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

