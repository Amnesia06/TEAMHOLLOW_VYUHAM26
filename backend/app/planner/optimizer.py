"""
Deterministic Planner (M4).
Conforms strictly to README Section 9.6, 9.7, 9.8.
Plain deterministic knapsack bundle selection, prerequisite resolution, topological ordering,
and cycle detection. No LLM computes any roadmap.
"""

from typing import List, Dict, Set, Optional, Tuple
from contracts.schemas.course import Course
from contracts.schemas.gap import Gap
from contracts.schemas.constraints import UserConstraints
from contracts.schemas.roadmap import Roadmap, RoadmapItem, UncoveredGap
from backend.app.catalog.catalog_db import catalog_db, CatalogDatabase
from backend.app.planner.scheduler import TimelineScheduler
from intelligence.interfaces import PlannerInterface


class CycleDetectedError(Exception):
    """Raised when a cyclical dependency is detected in the course prerequisite graph."""
    pass


class DeterministicPlanner(PlannerInterface):
    """
    Plain deterministic knapsack-style selection and topological prerequisite sequencing.
    """

    def __init__(self, catalog: Optional[CatalogDatabase] = None):
        self.catalog = catalog or catalog_db

    def generate_plan(
        self,
        gaps: List[Gap],
        constraints: UserConstraints,
        user_skills: List[str]
    ) -> Roadmap:
        if not gaps:
            return Roadmap(
                items=[],
                total_cost=0.0,
                total_hours=0.0,
                total_weeks=0.0,
                uncovered_gaps=[],
                verifier_status="pass",
                violations=[]
            )

        user_skills_set = {s.lower() for s in user_skills}

        # 1. Candidate course set: courses that cover at least one gap
        gap_skill_ids = {g.skill_id for g in gaps}
        all_courses = self.catalog.get_all_courses()

        candidate_courses = [
            c for c in all_courses
            if any(s in gap_skill_ids for s in c.skills_covered)
        ]

        # 2. Knapsack constrained selection (Section 9.6)
        max_budget = constraints.budget
        max_hours = None
        if constraints.target_timeline is not None and constraints.target_timeline > 0:
            max_hours = constraints.weekly_hours * constraints.target_timeline

        # Sort candidate courses: zero-cost first, curated catalog courses over dynamic stubs, then lowest cost, then hours
        candidate_courses.sort(key=lambda c: (c.cost > 0, c.id.startswith("dyn_"), c.cost, c.hours))

        # Greedy knapsack approximation for set cover with knapsack constraints
        selected_courses: List[Course] = []
        covered_gap_ids: Set[str] = set()
        accumulated_cost = 0.0
        accumulated_hours = 0.0

        # Sort gaps by priority descending
        sorted_gaps = sorted(gaps, key=lambda g: g.priority_score, reverse=True)

        for gap in sorted_gaps:
            if gap.skill_id in covered_gap_ids:
                continue

            # Find best candidate covering this gap within budget & hours
            options = [
                c for c in candidate_courses
                if gap.skill_id in c.skills_covered
            ]

            chosen = None
            for c in options:
                cost_candidate = c.cost if c not in selected_courses else 0.0
                hours_candidate = c.hours if c not in selected_courses else 0.0

                if accumulated_cost + cost_candidate <= max_budget:
                    if max_hours is None or (accumulated_hours + hours_candidate <= max_hours):
                        chosen = c
                        break

            if chosen:
                if chosen not in selected_courses:
                    selected_courses.append(chosen)
                    accumulated_cost += chosen.cost
                    accumulated_hours += chosen.hours
                for s in chosen.skills_covered:
                    covered_gap_ids.add(s)

        # 3. Uncovered gaps with explicit reasons (Section 9.6)
        uncovered_gaps: List[UncoveredGap] = []
        for gap in sorted_gaps:
            if gap.skill_id not in covered_gap_ids:
                # Determine reason
                available_courses = [c for c in all_courses if gap.skill_id in c.skills_covered]
                if not available_courses:
                    reason = f"No course currently in catalog covers {gap.skill_name} ({gap.skill_id})."
                else:
                    cheapest = min(available_courses, key=lambda c: c.cost)
                    if cheapest.cost > max_budget:
                        reason = f"Cheapest course ({cheapest.cost} {cheapest.currency}) exceeds remaining budget ({max_budget} {constraints.currency})."
                    elif max_hours is not None and cheapest.hours > max_hours:
                        reason = f"Course duration ({cheapest.hours}h) exceeds allowable time ({max_hours}h) for target timeline."
                    else:
                        reason = "Constraint trade-off prevented bundle inclusion."

                uncovered_gaps.append(UncoveredGap(gap=gap, reason=reason))

        # 4. Prerequisite resolution (Section 9.7)
        # If a prerequisite skill is neither held by the user nor covered by a selected course,
        # add the cheapest course that covers it and mark it "added for prerequisite".
        added_for_prereqs_ids: Set[str] = set()
        prereq_added_courses: List[Course] = []

        all_covered_skills = set(covered_gap_ids).union(user_skills_set)
        for c in list(selected_courses):
            for prereq in c.prerequisite_skills:
                if prereq not in all_covered_skills and prereq.lower() not in user_skills_set:
                    prereq_courses = [cand for cand in all_courses if prereq in cand.skills_covered]
                    if prereq_courses:
                        cheapest_prereq = min(prereq_courses, key=lambda p: (p.cost > 0, p.cost, p.hours))
                        if cheapest_prereq not in selected_courses and cheapest_prereq not in prereq_added_courses:
                            prereq_added_courses.append(cheapest_prereq)
                            added_for_prereqs_ids.add(cheapest_prereq.id)
                            for s in cheapest_prereq.skills_covered:
                                all_covered_skills.add(s)

        final_courses = selected_courses + prereq_added_courses

        # 5. Topological Sort with Cycle Detection (Section 9.7)
        ordered_courses = self._topological_sort(final_courses)

        # 6. Build Roadmap Items
        items: List[RoadmapItem] = []
        for idx, course in enumerate(ordered_courses, start=1):
            course_gaps = [g for g in gaps if g.skill_id in course.skills_covered]
            is_prereq = course.id in added_for_prereqs_ids
            items.append(
                RoadmapItem(
                    order=idx,
                    course=course,
                    gaps_covered=course_gaps,
                    start_week=1.0,
                    end_week=1.0,
                    cost=course.cost,
                    hours=course.hours,
                    added_for_prerequisite=is_prereq,
                    explanation=""  # Written by M6 Explainer
                )
            )

        # 7. Timeline scheduling (Section 9.8)
        total_weeks = TimelineScheduler.schedule_items(items, constraints.weekly_hours)
        total_cost = sum(item.cost for item in items)
        total_hours = sum(item.hours for item in items)

        return Roadmap(
            items=items,
            total_cost=total_cost,
            total_hours=total_hours,
            total_weeks=total_weeks,
            uncovered_gaps=uncovered_gaps,
            verifier_status="pass",
            violations=[]
        )

    def _topological_sort(self, courses: List[Course]) -> List[Course]:
        """
        Topological sort: a course depends on the skills listed as its prerequisites.
        Fails loudly on cycles (README Section 9.7).
        """
        course_map = {c.id: c for c in courses}
        skill_to_courses: Dict[str, List[str]] = {}
        for c in courses:
            for s in c.skills_covered:
                if s not in skill_to_courses:
                    skill_to_courses[s] = []
                skill_to_courses[s].append(c.id)

        adj: Dict[str, Set[str]] = {c.id: set() for c in courses}
        in_degree: Dict[str, int] = {c.id: 0 for c in courses}

        for c in courses:
            for prereq in c.prerequisite_skills:
                # If a selected course covers this prerequisite skill, c depends on it
                providers = skill_to_courses.get(prereq, [])
                for provider_id in providers:
                    if provider_id != c.id and provider_id not in adj[c.id]:
                        adj[provider_id].add(c.id)

        for u in adj:
            for v in adj[u]:
                in_degree[v] += 1

        ready = [c_id for c_id, deg in in_degree.items() if deg == 0]
        # Sort ready queue: free first, lowest cost first
        ready.sort(key=lambda cid: (course_map[cid].cost, course_map[cid].hours))

        sorted_ids: List[str] = []
        while ready:
            curr = ready.pop(0)
            sorted_ids.append(curr)
            for neighbor in adj[curr]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    ready.append(neighbor)
            ready.sort(key=lambda cid: (course_map[cid].cost, course_map[cid].hours))

        if len(sorted_ids) != len(courses):
            raise CycleDetectedError("Cyclical dependency detected in course prerequisites!")

        return [course_map[cid] for cid in sorted_ids]
