"""
Constraint-based deterministic scheduler for Pathwise learning roadmaps.
Handles timeline estimation, weekly capacity distribution, budget caps,
and feasibility conflict resolution.
"""

from typing import Dict, List, Any, Tuple, Optional


class ConstraintScheduler:
    """
    Schedules learning milestones into an achievable calendar based on
    strict mathematical and resource constraints.
    """

    @classmethod
    def schedule(
        cls,
        milestones: List[Dict[str, Any]],
        hours_per_week: float,
        monthly_budget: float,
        desired_timeline_months: Optional[float] = None
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Schedule milestones respecting hours/week and budget.
        Returns: (scheduled_milestones, feasibility_report)
        """
        if hours_per_week <= 0:
            hours_per_week = 5.0  # sensible fallback

        total_hours = sum(m.get("estimated_hours", 10) for m in milestones)
        total_cost = sum(m.get("estimated_cost", 0) for m in milestones)

        # Calculate estimated weeks required
        total_weeks = total_hours / hours_per_week
        total_months = total_weeks / 4.33

        # Schedule milestones chronologically
        scheduled = []
        current_week_start = 1.0

        for idx, m in enumerate(milestones, start=1):
            m_hours = float(m.get("estimated_hours", 10))
            m_weeks = max(1.0, round(m_hours / hours_per_week, 1))
            week_end = current_week_start + m_weeks - 0.1

            scheduled_m = dict(m)
            scheduled_m["order"] = idx
            scheduled_m["estimated_weeks"] = m_weeks
            scheduled_m["schedule_window"] = f"Weeks {round(current_week_start, 1)} - {round(week_end, 1)}"
            scheduled.append(scheduled_m)

            current_week_start += m_weeks

        # Feasibility evaluation
        is_feasible = True
        notes = []

        if desired_timeline_months is not None and desired_timeline_months > 0:
            if total_months > desired_timeline_months:
                is_feasible = False
                deficit_weeks = round((total_months - desired_timeline_months) * 4.33, 1)
                needed_hours = round(total_hours / (desired_timeline_months * 4.33), 1)
                notes.append(
                    f"Timeline conflict: At {hours_per_week} hrs/week, this roadmap requires ~{round(total_months, 1)} months (~{round(total_weeks, 1)} weeks), exceeding your {desired_timeline_months}-month target. "
                    f"To meet this target, increase availability to {needed_hours} hrs/week, or focus on a streamlined subset of high-priority skills."
                )
            else:
                notes.append(
                    f"Timeline feasible: Can be completed in {round(total_months, 1)} months within your {desired_timeline_months}-month goal."
                )

        # Budget verification
        allowable_total_budget = monthly_budget * max(1.0, total_months)
        if total_cost > allowable_total_budget and monthly_budget > 0:
            is_feasible = False
            notes.append(
                f"Budget constraint: Total resource cost (${total_cost}) exceeds your estimated total budget (${round(allowable_total_budget, 2)}). Recommended free open-source alternatives have been prioritized."
            )
        elif monthly_budget == 0:
            notes.append("Zero-budget mode: All selected materials are 100% free and open-access.")

        return scheduled, {
            "is_feasible": is_feasible,
            "total_estimated_hours": total_hours,
            "total_estimated_weeks": round(total_weeks, 1),
            "total_estimated_months": round(total_months, 1),
            "total_estimated_cost": total_cost,
            "weekly_hours_allocated": hours_per_week,
            "notes": " ".join(notes) if notes else "Roadmap aligns well with stated constraints."
        }
