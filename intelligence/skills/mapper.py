"""
Transferable Skill Mapper.
Identifies transferable competencies based on demonstrated projects,
underlying mathematical/algorithmic foundations, and domain analogies.
"""

from typing import Dict, List, Any
from intelligence.skills.taxonomy import SkillTaxonomy


class TransferableSkillMapper:
    """
    Analyzes a user's demonstrated capabilities and infers transferable skills
    with explicit reasoning and confidence metrics.
    """

    # Transferable rule base: source capabilities -> target skills with rationale & transfer coefficient
    TRANSFER_RULES: List[Dict[str, Any]] = [
        {
            "source_pattern": ["path planning", "a*", "dijkstra", "autonomous rover", "robot navigation"],
            "transfers_to": "Graph Algorithms",
            "confidence": "high",
            "transfer_ratio": 0.85,
            "explanation": "Implementing heuristic path planning (such as A* or Dijkstra) directly exercises graph representation, priority queues, and state-space search fundamentals."
        },
        {
            "source_pattern": ["path planning", "a*", "rover", "robotics"],
            "transfers_to": "Mathematical Optimization",
            "confidence": "medium",
            "transfer_ratio": 0.70,
            "explanation": "Trajectory generation and obstacle avoidance rely on cost function minimization and geometric constraints."
        },
        {
            "source_pattern": ["gps rover", "sensor fusion", "gps integration", "telemetry"],
            "transfers_to": "Probability & Statistics",
            "confidence": "medium",
            "transfer_ratio": 0.75,
            "explanation": "Working with noisy GPS telemetry and sensor drift provides practical intuition for stochastic processes, error distribution, and Kalman filtering."
        },
        {
            "source_pattern": ["c++", "embedded systems", "microcontroller", "rover"],
            "transfers_to": "Computer Architecture",
            "confidence": "medium",
            "transfer_ratio": 0.75,
            "explanation": "Embedded C++ development requires direct awareness of memory allocation, pointer arithmetic, CPU cycles, and bus latency."
        },
        {
            "source_pattern": ["python", "data structures", "algorithms"],
            "transfers_to": "Machine Learning Fundamentals",
            "confidence": "high",
            "transfer_ratio": 0.80,
            "explanation": "Solid programming in Python combined with algorithmic fluency reduces ML engineering barrier to learning matrix transformations and loss functions."
        },
        {
            "source_pattern": ["computer science", "software engineering"],
            "transfers_to": "System Design",
            "confidence": "medium",
            "transfer_ratio": 0.65,
            "explanation": "Foundational CS degree principles (modular design, concurrency, caching, data layers) form the building blocks of distributed system design."
        }
    ]

    @classmethod
    def identify_transferable_skills(
        cls,
        user_skills: List[str],
        projects: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Analyze user's known skills and projects to discover latent transferable skills.
        """
        results: List[Dict[str, Any]] = []
        user_skills_lower = {s.lower() for s in user_skills}

        # Build composite project text tokens
        project_text = " ".join([
            f"{p.get('name', '')} {p.get('description', '')} {' '.join(p.get('technologies', []))}"
            for p in projects
        ]).lower()

        for rule in cls.TRANSFER_RULES:
            target = rule["transfers_to"]
            # Skip if user already explicitly has this skill
            if target.lower() in user_skills_lower:
                continue

            matched_triggers = []
            for pattern in rule["source_pattern"]:
                if pattern in user_skills_lower or pattern in project_text:
                    matched_triggers.append(pattern)

            if matched_triggers:
                results.append({
                    "skill": target,
                    "evidence_sources": matched_triggers,
                    "confidence": rule["confidence"],
                    "transfer_ratio": rule["transfer_ratio"],
                    "explanation": rule["explanation"],
                    "category": SkillTaxonomy.get_skill(target).get("category", "General") if SkillTaxonomy.get_skill(target) else "General"
                })

        return results
