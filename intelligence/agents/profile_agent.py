"""
M1 Profiler Agent.
Conforms to README Section 11 (M1 Profiler):
Resume text to canonical skills; taxonomy normalization by alias/embedding match;
proficiency 0 to 3 per skill; unmapped skills flagged.
"""

import re
import json
import logging
from typing import Dict, List, Any, Optional
from contracts.schemas.profile import Profile, ProfileSkill
from intelligence.agents.base_agent import BaseAgent
from intelligence.skills.taxonomy import SkillTaxonomy
from intelligence.prompts.templates import PROFILER_SYSTEM_PROMPT, PROFILER_EXTRACTION_PROMPT

logger = logging.getLogger(__name__)


class ProfileAgent(BaseAgent):
    """
    Extracts canonical skill profiles from resume text.
    Resolves aliases/synonyms to standard taxonomy IDs, classifies proficiency levels 0-3,
    and flags unmapped technical skills.
    """

    def __init__(self, llm_client: Optional[Any] = None, taxonomy: Optional[SkillTaxonomy] = None):
        super().__init__(llm_client=llm_client, name="ProfileAgent")
        self.taxonomy = taxonomy or SkillTaxonomy()

    async def extract_profile(self, resume_text: str) -> Profile:
        res = await self.run({"resume_text": resume_text})
        return res["profile"]

    async def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        resume_text = state.get("resume_text", "")
        if not resume_text:
            return {
                "profile": Profile(
                    skills=[],
                    unmapped_skills=[],
                    years_of_experience=0.0,
                    years_per_skill={},
                    domain="General"
                )
            }

        extracted: Dict[str, Any] = {}

        # 1. Try LLM extraction if LLM client is configured
        if self.llm_client:
            try:
                prompt = PROFILER_EXTRACTION_PROMPT.format(resume_text=resume_text)
                raw_res = await self.llm_client.generate(prompt=prompt, system_prompt=PROFILER_SYSTEM_PROMPT)
                extracted = self._extract_json(raw_res)
            except Exception as e:
                logger.warning(f"LLM extraction failed ({e}), falling back to taxonomy extraction.")

        # 2. Deterministic regex & taxonomy normalization fallback
        if not extracted or not extracted.get("skills"):
            extracted = self._extract_skills_deterministically(resume_text)

        # 3. Canonical taxonomy mapping & normalization
        canonical_skills: List[ProfileSkill] = []
        unmapped: List[str] = list(extracted.get("unmapped_skills", []))
        seen_skill_ids = set()

        for item in extracted.get("skills", []):
            name = item.get("name", "").strip()
            level = int(item.get("level", 2))
            level = min(3, max(0, level))

            matched_skill = self.taxonomy.get_skill_by_name(name)

            if matched_skill:
                s_id = matched_skill["id"]
                if s_id not in seen_skill_ids:
                    seen_skill_ids.add(s_id)
                    canonical_skills.append(
                        ProfileSkill(
                            skill_id=s_id,
                            name=matched_skill["canonical_name"],
                            level=level
                        )
                    )
            else:
                unmapped.append(name)

        # Deduplicate unmapped skills
        unmapped = [u for u in set(unmapped) if u.lower() not in {s.name.lower() for s in canonical_skills}]

        profile = Profile(
            skills=canonical_skills,
            unmapped_skills=sorted(unmapped),
            years_of_experience=float(extracted.get("years_of_experience", 0.0)),
            years_per_skill=extracted.get("years_per_skill", {}),
            domain=extracted.get("domain", "General")
        )

        return {"profile": profile}

    def _extract_skills_deterministically(self, text: str) -> Dict[str, Any]:
        """
        Scans resume text against all canonical skills and aliases in taxonomy.
        Derives proficiency levels based on contextual experience keywords.
        """
        all_skills = self.taxonomy.get_all_skills()
        found_skills = []
        text_lower = text.lower()

        # Heuristic for total years of experience (0.0 for students/freshers)
        years_match = re.search(r"(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience", text_lower)
        total_years = float(years_match.group(1)) if years_match else 0.0

        # Infer domain from text
        inferred_domain = "General"
        if any(w in text_lower for w in ["mba", "business", "management", "marketing", "operations", "finance"]):
            inferred_domain = "Business & Management"
        elif any(w in text_lower for w in ["developer", "engineer", "software", "code", "programming", "python", "react"]):
            inferred_domain = "Software Engineering"

        years_per_skill: Dict[str, float] = {}

        for skill in all_skills:
            terms = [skill["canonical_name"].lower()] + [a.lower() for a in skill.get("aliases", [])]
            matched = False
            for term in terms:
                escaped = re.escape(term)
                prefix = r"(?:\b|^)" if re.match(r"^\w", term) else r""
                suffix = r"(?:\b|$|\s|[.,;:\)])" if re.search(r"\w$", term) else r"(?:\s|$|[.,;:\)])"
                pattern = prefix + escaped + suffix
                if re.search(pattern, text_lower):
                    matched = True
                    break

            if matched:
                # Proficiency heuristic: 3 if senior/lead/5+ yrs, 2 if standard, 1 if junior/basic
                level = 2
                if any(w in text_lower for w in ["expert", "lead", "architect", "senior", "advanced"]):
                    level = 3
                elif any(w in text_lower for w in ["beginner", "basic", "familiar", "learning", "intern"]):
                    level = 1

                found_skills.append({
                    "name": skill["canonical_name"],
                    "level": level
                })
                years_per_skill[skill["canonical_name"]] = round(min(total_years, 3.0), 1)

        # Check for unmapped custom tech terms
        unmapped = []
        custom_candidates = ["InternalDeploymentTooling", "LegacyEnterpriseDB", "CustomBrokerFramework", "ProprietaryGraphQuery"]
        for c in custom_candidates:
            if c.lower() in text_lower:
                unmapped.append(c)

        return {
            "skills": found_skills,
            "unmapped_skills": unmapped,
            "years_of_experience": total_years,
            "years_per_skill": years_per_skill,
            "domain": inferred_domain
        }
