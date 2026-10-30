"""
Deterministic Roadmap Optimizer.
Builds prerequisite DAG, performs topological sorting, prioritizes gaps,
allocates curated resources within budget constraints, and generates milestone sequences.
"""

import uuid
from typing import Dict, List, Optional, Any, Set
from intelligence.skills.taxonomy import SkillTaxonomy
from intelligence.resources.database import ResourceDatabase
from intelligence.roadmap.scheduler import ConstraintScheduler


class RoadmapOptimizer:
    """
    Constructs an optimized, constraint-aware development roadmap.
    """

    def __init__(self, resource_db: Optional[ResourceDatabase] = None):
        self.resource_db = resource_db or ResourceDatabase()

    def generate_roadmap(
        self,
        target_role: str,
        skill_gaps: List[Dict[str, Any]],
        user_skills: List[str],
        hours_per_week: float = 5.0,
        monthly_budget: float = 0.0,
        desired_timeline_months: Optional[float] = None,
        preferred_format: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Main pipeline to build a fully optimized roadmap.
        """
        user_skills_set = {s.lower() for s in user_skills}

        # 1. Collect all skills that need development
        target_skills_map = {}
        for gap in skill_gaps:
            s_name = gap.get("skill") or gap.get("name")
            if s_name:
                target_skills_map[s_name] = gap

        if not target_skills_map:
            # Fallback if no explicit gaps passed
            target_skills_map["Machine Learning Fundamentals"] = {"importance": "required", "priority": "high"}

        # 2. Expand prerequisite DAG for all required gap skills
        expanded_skills: Set[str] = set()
        adj_list: Dict[str, List[str]] = {}  # skill -> list of prereqs
        in_degree: Dict[str, int] = {}

        for skill_name in target_skills_map.keys():
            all_prereqs = SkillTaxonomy.get_all_prerequisites_recursive(skill_name)
            skills_chain = all_prereqs + [skill_name]
            for s in skills_chain:
                # Only include if user doesn't already have this skill
                if s.lower() not in user_skills_set:
                    expanded_skills.add(s)

        for s in expanded_skills:
            direct_prereqs = [
                p for p in SkillTaxonomy.get_prerequisites(s)
                if p.lower() not in user_skills_set and p in expanded_skills
            ]
            adj_list[s] = direct_prereqs
            in_degree[s] = len(direct_prereqs)

        # 3. Topological sort with priority weighting
        # We process skills whose in-degree is 0, choosing foundational/higher priority first
        ready_queue = [s for s, deg in in_degree.items() if deg == 0]
        sorted_skills: List[str] = []

        while ready_queue:
            # Sort ready queue by priority score descending
            ready_queue.sort(
                key=lambda s: self._calculate_skill_priority(s, target_skills_map.get(s, {})),
                reverse=True
            )
            current = ready_queue.pop(0)
            sorted_skills.append(current)

            for dependent, prereqs in adj_list.items():
                if current in prereqs and dependent not in sorted_skills:
                    in_degree[dependent] -= 1
                    if in_degree[dependent] == 0:
                        ready_queue.append(dependent)

        # Include any remaining skills if there was a cycle or disconnected node
        for s in expanded_skills:
            if s not in sorted_skills:
                sorted_skills.append(s)

        # 4. Construct milestones with allocated resources
        milestones = []
        for s_name in sorted_skills:
            gap_info = target_skills_map.get(s_name, {})
            skill_def = SkillTaxonomy.get_skill(s_name) or {}

            # Query resources strictly adhering to zero-budget or specified monthly budget
            max_cost = 0.0 if monthly_budget == 0 else monthly_budget
            matching_resources = self.resource_db.query(
                skill=s_name,
                max_cost=max_cost,
                limit=2
            )

            # Fallback if specific skill query returned nothing: general match
            if not matching_resources:
                matching_resources = self.resource_db.query(max_cost=0.0, limit=1)

            est_hours = sum(r.get("estimated_hours", 10) for r in matching_resources) or 15
            est_cost = sum(r.get("cost", 0) for r in matching_resources)

            # Generate explainable rationale for priority
            is_prereq = s_name not in target_skills_map
            importance = gap_info.get("importance", "preferred" if is_prereq else "required")
            rationale = self._generate_priority_explanation(s_name, is_prereq, importance)

            milestone = {
                "milestone_id": f"ms_{uuid.uuid4().hex[:8]}",
                "title": f"Master {s_name}",
                "description": skill_def.get("description", f"Develop working proficiency in {s_name}."),
                "skills_covered": [s_name],
                "estimated_hours": est_hours,
                "estimated_cost": est_cost,
                "prerequisites": SkillTaxonomy.get_prerequisites(s_name),
                "resources": matching_resources,
                "priority_explanation": rationale,
                "status": "not_started",
                "progress": 0
            }
            milestones.append(milestone)

        # 5. Run deterministic constraint scheduling
        scheduled_milestones, feasibility = ConstraintScheduler.schedule(
            milestones=milestones,
            hours_per_week=hours_per_week,
            monthly_budget=monthly_budget,
            desired_timeline_months=desired_timeline_months
        )

        return {
            "roadmap_id": f"rdm_{uuid.uuid4().hex[:8]}",
            "target_role": target_role,
            "total_estimated_weeks": feasibility["total_estimated_weeks"],
            "total_estimated_months": feasibility["total_estimated_months"],
            "total_estimated_cost": feasibility["total_estimated_cost"],
            "feasibility": feasibility,
            "milestones": scheduled_milestones,
            "explanation": (
                f"Personalized development plan for {target_role}. "
                f"Sequenced strictly using prerequisite dependency analysis. "
                f"Estimated {feasibility['total_estimated_weeks']} weeks at {hours_per_week} hours/week."
            )
        }

    def _calculate_skill_priority(self, skill_name: str, gap_info: Dict[str, Any]) -> float:
        """Score skills to order parallel readiness."""
        base_score = 50.0
        # Foundational skills (math, foundations) get a boost to appear early
        cat = SkillTaxonomy.get_skill(skill_name).get("category", "") if SkillTaxonomy.get_skill(skill_name) else ""
        if "Foundations" in cat or "Mathematics" in cat:
            base_score += 30.0

        importance = gap_info.get("importance", "").lower()
        if importance == "required":
            base_score += 25.0
        elif importance == "emerging":
            base_score += 15.0

        return base_score

    def _generate_priority_explanation(self, skill_name: str, is_prereq: bool, importance: str) -> str:
        """Create a human-readable explanation for why this skill was prioritized."""
        if is_prereq:
            return f"Essential foundational prerequisite. Mastering {skill_name} establishes core mathematical or algorithmic concepts required before tackling higher-level techniques."
        if importance == "required":
            return f"Mandatory competency for this role. Evaluated by hiring teams as a fundamental qualification."
        if importance == "emerging":
            return f"High-growth emerging signal. Adding {skill_name} differentiates your profile in modern market requirements."
        return f"Valued skill that strengthens your engineering capabilities and increases job-readiness."
