"""
M3 Gap Analyzer (Track 3: Intelligence).
Conforms strictly to README Section 9.1 to 9.5:
- 9.1: Levels 0 to 3
- 9.2: Cosine similarity matching (full >= 0.80, partial/transferable >= 0.60)
- 9.3: Frequency weighting
- 9.4: Gap size (required_level - current_level, floored at 0)
- 9.5: Priority score = frequency * gap_size * transfer_factor * trend_factor
"""

import math
from typing import List, Dict, Optional, Tuple, Any
from contracts.schemas.gap import Gap
from contracts.schemas.profile import Profile, ProfileSkill
from contracts.schemas.role_requirement import RoleRequirement
from intelligence.config import intelligence_config
from intelligence.skills.taxonomy import SkillTaxonomy


def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Computes cosine similarity between two float vectors."""
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)


class GapAnalyzer:
    """
    Computes competency gaps between a candidate profile and target role requirements.
    Detects transferable skills and calculates deterministic priority scores.
    """

    def __init__(
        self,
        taxonomy: Optional[SkillTaxonomy] = None,
        full_match_threshold: float = 0.80,
        partial_match_threshold: float = 0.60
    ):
        self.taxonomy = taxonomy or SkillTaxonomy()
        self.full_match_threshold = full_match_threshold
        self.partial_match_threshold = partial_match_threshold

    def analyze_gaps(
        self,
        profile: Profile,
        requirements: List[RoleRequirement]
    ) -> List[Gap]:
        if not requirements:
            return []

        user_skills_by_id = {s.skill_id: s for s in profile.skills}
        user_skills_by_name = {s.name.lower(): s for s in profile.skills}

        gaps: List[Gap] = []

        for req in requirements:
            req_skill_id = req.skill_id
            req_skill_name = req.skill_name
            req_level = req.required_level
            frequency = req.frequency
            trend = req.trend

            matched_skill: Optional[ProfileSkill] = None
            is_transferable = False
            supporting_skill_name: Optional[str] = None
            effective_level = 0

            # 1. Exact match by skill_id or name
            if req_skill_id in user_skills_by_id:
                matched_skill = user_skills_by_id[req_skill_id]
                effective_level = matched_skill.level
            elif req_skill_name.lower() in user_skills_by_name:
                matched_skill = user_skills_by_name[req_skill_name.lower()]
                effective_level = matched_skill.level
            else:
                # 2. Embedding-based matching for synonyms and transferable skills
                req_tax = self.taxonomy.get_skill_by_id(req_skill_id) or self.taxonomy.get_skill_by_name(req_skill_name)
                req_emb = req_tax.get("embedding") if req_tax else None

                best_sim = 0.0
                best_user_skill: Optional[ProfileSkill] = None

                if req_emb:
                    for user_skill in profile.skills:
                        u_tax = self.taxonomy.get_skill_by_id(user_skill.skill_id) or self.taxonomy.get_skill_by_name(user_skill.name)
                        u_emb = u_tax.get("embedding") if u_tax else None
                        if u_emb:
                            sim = cosine_similarity(req_emb, u_emb)
                            if sim > best_sim:
                                best_sim = sim
                                best_user_skill = user_skill

                if best_sim >= self.full_match_threshold and best_user_skill:
                    # Full match via embedding similarity
                    matched_skill = best_user_skill
                    effective_level = matched_skill.level
                elif best_sim >= self.partial_match_threshold and best_user_skill:
                    # Partial match -> Transferable skill (README Section 9.2 & 9.5)
                    is_transferable = True
                    supporting_skill_name = best_user_skill.name
                    # Transferable skill grants partial foundation credit (effective level 1)
                    effective_level = min(1, best_user_skill.level)

            # 3. Calculate gap size (Section 9.4)
            gap_size = max(0, req_level - effective_level)

            if gap_size > 0:
                # 4. Priority score (Section 9.5)
                # Transfer factor: 1.0 for no match, 0.5 for partial match
                transfer_factor = 0.5 if is_transferable else 1.0

                # Trend factor: 1.2 for rising, 1.0 for stable, 0.9 for declining, 1.0 for unknown
                if trend == "rising":
                    trend_factor = 1.2
                elif trend == "declining":
                    trend_factor = 0.9
                else:
                    trend_factor = 1.0

                priority_score = round(frequency * gap_size * transfer_factor * trend_factor, 4)

                gaps.append(
                    Gap(
                        skill_id=req_skill_id,
                        skill_name=req_skill_name,
                        gap_size=gap_size,
                        frequency=frequency,
                        transferable=is_transferable,
                        supporting_skill=supporting_skill_name,
                        trend=trend,
                        priority_score=priority_score
                    )
                )

        # Sort gaps by priority score descending
        gaps.sort(key=lambda g: g.priority_score, reverse=True)
        return gaps

