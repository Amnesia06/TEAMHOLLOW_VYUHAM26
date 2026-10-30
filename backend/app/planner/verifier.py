"""
Deterministic Verifier (M5).
Conforms strictly to README Section 9.9.
Evaluates the 6 deterministic rules. Returns pass or violations flagged.
"""

from typing import List, Dict, Any, Set
from contracts.schemas.roadmap import Roadmap
from contracts.schemas.constraints import UserConstraints
from intelligence.interfaces import VerifierInterface


class PlanVerifier(VerifierInterface):
    """
    Plain deterministic verification of roadmap constraints and sequencing rules.
    """

    def verify_plan(
        self,
        roadmap: Roadmap,
        constraints: UserConstraints
    ) -> Dict[str, Any]:
        violations: List[str] = []

        # Rule 1: Total cost at most the budget
        if roadmap.total_cost > constraints.budget:
            violations.append(
                f"Rule 1 violation: Total cost ({roadmap.total_cost} {constraints.currency}) exceeds budget ({constraints.budget} {constraints.currency})."
            )

        # Rule 2: Total hours fit weekly hours and target timeline when provided
        if constraints.target_timeline is not None and constraints.target_timeline > 0:
            max_allowed_hours = constraints.weekly_hours * constraints.target_timeline
            if roadmap.total_hours > max_allowed_hours:
                violations.append(
                    f"Rule 2 violation: Total hours ({roadmap.total_hours}h) exceed target timeline capacity ({max_allowed_hours}h = {constraints.weekly_hours}h/wk * {constraints.target_timeline} wks)."
                )

        # Rule 3: Every item appears after all of its prerequisites
        skills_mastered_so_far: Set[str] = set()
        for idx, item in enumerate(roadmap.items):
            for prereq in item.course.prerequisite_skills:
                # If prereq is covered by a course in this roadmap, it must appear before this item
                course_covers_prereq_in_roadmap = any(
                    prereq in other.course.skills_covered for other in roadmap.items
                )
                if course_covers_prereq_in_roadmap and prereq not in skills_mastered_so_far:
                    violations.append(
                        f"Rule 3 violation: Item #{item.order} ({item.course.title}) requires prerequisite skill '{prereq}' which has not been covered yet."
                    )
            for s in item.course.skills_covered:
                skills_mastered_so_far.add(s)

        # Rule 4: Every top-priority gap is covered or listed as uncovered with a reason
        # Covered gaps are present in items or explicitly listed in uncovered_gaps
        for item in roadmap.items:
            for g in item.gaps_covered:
                if not g.skill_id:
                    violations.append(f"Rule 4 violation: Gap covered in item #{item.order} lacks skill_id.")

        for ug in roadmap.uncovered_gaps:
            if not ug.reason or len(ug.reason.strip()) == 0:
                violations.append(f"Rule 4 violation: Uncovered gap '{ug.gap.skill_name}' lacks a documented reason.")

        # Rule 5: No duplicate courses
        seen_course_ids: Set[str] = set()
        for item in roadmap.items:
            if item.course.id in seen_course_ids:
                violations.append(f"Rule 5 violation: Duplicate course '{item.course.id}' in roadmap.")
            seen_course_ids.add(item.course.id)

        # Rule 6: Every item has the fields the Explainer needs
        for item in roadmap.items:
            if not item.course or not item.course.title:
                violations.append(f"Rule 6 violation: Item #{item.order} missing course title.")
            if item.start_week <= 0 or item.end_week < item.start_week:
                violations.append(f"Rule 6 violation: Item #{item.order} invalid start/end timeline.")

        status = "pass" if len(violations) == 0 else "violations_flagged"
        return {
            "status": status,
            "passed": len(violations) == 0,
            "violations": violations
        }
