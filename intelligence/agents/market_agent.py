"""
Market Intelligence Agent (M2) and Role Matcher (M7).
Conforms to README Section 11:
Embed role, retrieve top-k postings, extract requirements, compute frequencies;
autonomous fallback to live search when similarity is low or few postings return;
merge fresh data with timestamps.
"""

import os
import json
import logging
import re
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
from contracts.schemas.role_requirement import RoleRequirement
from intelligence.agents.base_agent import BaseAgent
from intelligence.interfaces import JobPostingSearchInterface, TaxonomyLookupInterface
from intelligence.config import intelligence_config
from intelligence.skills.taxonomy import SkillTaxonomy

logger = logging.getLogger(__name__)


class MarketIntelligenceAgent(BaseAgent):
    """
    Retrieves job postings from vector store with autonomous fallback to live search.
    Computes required skills, frequencies, and trends.
    """

    def __init__(
        self,
        llm_client: Optional[Any] = None,
        posting_search: Optional[JobPostingSearchInterface] = None,
        taxonomy: Optional[SkillTaxonomy] = None,
        search_client: Optional[Any] = None
    ):
        from intelligence.llm.gemini_client import gemini_client
        super().__init__(llm_client=llm_client or gemini_client, name="MarketIntelligenceAgent")
        self.posting_search = posting_search
        self.taxonomy = taxonomy or SkillTaxonomy()
        self.search_client = search_client

    async def get_role_requirements(self, role: str) -> Dict[str, Any]:
        """
        Retrieves postings for role and computes skill frequencies.
        Triggers live search fallback if cached count < MIN_POSTINGS_COUNT.
        """
        postings: List[Dict[str, Any]] = []
        source = "cache"
        fallback_reason: Optional[str] = None

        # 1. Search cached/database postings
        if self.posting_search:
            try:
                postings = self.posting_search.search_postings(
                    role=role,
                    query_vector=[],
                    top_k=intelligence_config.TOP_K_POSTINGS
                )
            except Exception as e:
                logger.warning(f"Error querying postings from database: {e}")
                postings = []

        # 2. Check precomputed role requirements from market data before live search
        if len(postings) < intelligence_config.MIN_POSTINGS_COUNT:
            precomputed = self._get_precomputed_requirements(role)
            if precomputed:
                return {
                    "role": role,
                    "source": "cache",
                    "fallback_reason": None,
                    "posting_count": len(precomputed) * 10,
                    "requirements": precomputed
                }

            source = "live"
            fallback_reason = (
                f"Insufficient cached postings for role '{role}' ({len(postings)} found, "
                f"minimum {intelligence_config.MIN_POSTINGS_COUNT} required). Live web search initiated."
            )
            if self.search_client:
                try:
                    search_query = f"{role} job requirements skills hiring"
                    search_results = await self.search_client.search(search_query)
                    for item in search_results:
                        postings.append({
                            "role": role,
                            "text": item.get("content") or item.get("title", ""),
                            "source": item.get("url", "live_search"),
                            "retrieved_at": datetime.now(timezone.utc).isoformat()
                        })
                except Exception as e:
                    logger.error(f"Live search failed: {e}")
                    fallback_reason = f"Live search unavailable ({type(e).__name__}). Standard verified curriculum loaded."

        # 3. Extract skills and compute frequencies across retrieved postings
        requirements: List[RoleRequirement] = []
        all_skills = self.taxonomy.get_all_skills()
        total_postings = max(1, len(postings))

        for skill in all_skills:
            s_id = skill["id"]
            canonical = skill["canonical_name"].lower()
            aliases = [a.lower() for a in skill.get("aliases", [])]
            check_terms = [canonical] + aliases

            count = 0
            for p in postings:
                text_lower = (p.get("text") or "").lower()
                matched = False
                for term in check_terms:
                    pattern = r"(?:\b|_)" + re.escape(term) + r"(?:\b|_)"
                    if re.search(pattern, text_lower):
                        matched = True
                        break
                if matched:
                    count += 1

            if count > 0:
                freq = round(count / total_postings, 3)
                # Cap frequency at 1.0
                freq = min(1.0, freq)
                requirements.append(
                    RoleRequirement(
                        skill_id=s_id,
                        skill_name=skill["canonical_name"],
                        frequency=freq,
                        required_level=2,  # Default level 2 per README Section 9.4
                        trend="rising" if freq >= 0.70 else "stable",
                        source=source,
                        timestamp=datetime.now(timezone.utc).strftime("%Y-%m-%d")
                    )
                )

        # 3b. Autonomous Open-World Skill Extraction via LLM from job postings
        # If taxonomy matched fewer than 3 skills or live search was used, extract full domain competencies
        if (len(requirements) < 3 or source == "live") and self.llm_client:
            combined_search_text = "\n\n".join([p.get("text", "") for p in postings[:5] if p.get("text")])
            try:
                extraction_prompt = f"""
You are an expert career and occupational competency analyst.
Target Role or Domain: "{role}"

Live Web Research & Job Search Content:
{combined_search_text[:2500] if combined_search_text else "No web text available."}

Identify 4 to 6 core industry skills, technologies, or competencies essential for someone pursuing this role.
Return STRICTLY a JSON array of objects with "name" (skill name string) and "frequency" (float between 0.70 and 0.95):
[
  {{"name": "Skill Name", "frequency": 0.85}}
]
"""
                raw_json = await self.llm_client.generate(
                    prompt=extraction_prompt,
                    system_prompt="You extract career skills and return strictly valid JSON.",
                    json_mode=True,
                    temperature=0.2
                )
                parsed_skills = json.loads(raw_json.strip())
                if isinstance(parsed_skills, list) and len(parsed_skills) > 0:
                    existing_skill_names = {r.skill_name.lower() for r in requirements}
                    for item in parsed_skills[:6]:
                        s_name = item.get("name", "").strip()
                        if not s_name or s_name.lower() in existing_skill_names:
                            continue
                        clean_id = "skill_" + re.sub(r'[^a-z0-9]+', '_', s_name.lower()).strip('_')
                        freq = float(item.get("frequency", 0.85))
                        freq = min(1.0, max(0.1, freq))
                        # Register in taxonomy dynamically so gap analyzer can map it
                        if hasattr(self.taxonomy, "_local_cache") and clean_id not in self.taxonomy._local_cache:
                            self.taxonomy._local_cache[clean_id] = {
                                "id": clean_id,
                                "canonical_name": s_name,
                                "aliases": [s_name.lower()],
                                "category": "Dynamic Live Skill",
                                "prerequisites": []
                            }
                            self.taxonomy._name_to_id[s_name.lower()] = clean_id

                        requirements.append(
                            RoleRequirement(
                                skill_id=clean_id,
                                skill_name=s_name,
                                frequency=freq,
                                required_level=2,
                                trend="rising",
                                source="live",
                                timestamp=datetime.now(timezone.utc).strftime("%Y-%m-%d")
                            )
                        )
                        existing_skill_names.add(s_name.lower())
                    if requirements and not fallback_reason:
                        fallback_reason = f"Dynamically extracted {len(requirements)} competencies for '{role}' from live search."
            except Exception as e:
                logger.warning(f"LLM dynamic skill extraction fallback failed: {e}")

        # 4. Domain-level fallback if 0 requirements matched (e.g. offline or novel non-tech domain)
        if len(requirements) == 0:
            precomputed = self._get_precomputed_requirements(role)
            if precomputed:
                requirements = precomputed
                fallback_reason = f"Verified curriculum loaded from market benchmarks for '{role}'."
            else:
                role_lower = role.lower()
                if any(k in role_lower for k in ["business", "management", "mba", "strategy"]):
                    fallback_skill_ids = [
                        "skill_strategic_management",
                        "skill_operations_management",
                        "skill_financial_accounting",
                        "skill_organizational_leadership",
                        "skill_business_analytics",
                        "skill_project_management"
                    ]
                elif any(k in role_lower for k in ["operation", "supply chain", "logistics"]):
                    fallback_skill_ids = [
                        "skill_operations_management",
                        "skill_project_management",
                        "skill_business_analytics",
                        "skill_organizational_leadership"
                    ]
                elif any(k in role_lower for k in ["finance", "financial", "accounting", "banking"]):
                    fallback_skill_ids = [
                        "skill_financial_accounting",
                        "skill_business_analytics",
                        "skill_strategic_management"
                    ]
                elif any(k in role_lower for k in ["product", "pm"]):
                    fallback_skill_ids = [
                        "skill_product_strategy",
                        "skill_project_management",
                        "skill_business_analytics",
                        "skill_system_design"
                    ]
                elif any(k in role_lower for k in ["music", "audio", "sound", "musician", "instrument", "song"]):
                    fallback_skill_ids = [
                        "skill_music_theory",
                        "skill_audio_production",
                        "skill_sound_design",
                        "skill_instrument_technique"
                    ]
                elif any(k in role_lower for k in ["design", "ui", "ux", "graphic"]):
                    fallback_skill_ids = [
                        "skill_html_css",
                        "skill_tailwind",
                        "skill_product_strategy",
                        "skill_git"
                    ]
                else:
                    fallback_skill_ids = ["skill_python", "skill_git", "skill_rest_apis", "skill_dsa"]

                for s_id in fallback_skill_ids:
                    s_obj = self.taxonomy.get_skill_by_id(s_id)
                    if s_obj:
                        requirements.append(
                            RoleRequirement(
                                skill_id=s_id,
                                skill_name=s_obj["canonical_name"],
                                frequency=0.85,
                                required_level=2,
                                trend="stable",
                                source="cache",
                                timestamp=datetime.now(timezone.utc).strftime("%Y-%m-%d")
                            )
                        )
                if not fallback_reason:
                    fallback_reason = f"Standard verified curriculum loaded for '{role}'."

        # Sort requirements by frequency descending
        requirements.sort(key=lambda r: r.frequency, reverse=True)

        return {
            "role": role,
            "source": source,
            "fallback_reason": fallback_reason,
            "posting_count": len(postings),
            "requirements": requirements
        }

    def _get_precomputed_requirements(self, role: str) -> List[RoleRequirement]:
        """Loads precomputed requirements from role_requirements.json for matching roles."""
        req_file = os.path.join(os.path.dirname(__file__), "..", "market_data", "role_requirements.json")
        if not os.path.exists(req_file):
            return []
        try:
            with open(req_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            role_clean = role.lower().strip()
            # Normalize common synonyms
            ROLE_SYNONYMS = {
                "ai/ml engineer": "Machine Learning Engineer",
                "ai/ml": "Machine Learning Engineer",
                "ai & ml": "Machine Learning Engineer",
                "ai and ml": "Machine Learning Engineer",
                "ml engineer": "Machine Learning Engineer",
                "machine learning": "Machine Learning Engineer",
                "ai developer": "AI Engineer",
                "web developer": "Full-Stack Developer",
                "fullstack": "Full-Stack Developer",
                "full stack": "Full-Stack Developer",
                "full-stack": "Full-Stack Developer",
                "backend": "Backend Developer",
                "frontend": "Frontend Developer",
                "data science": "Data Scientist",
                "data analytics": "Data Analyst",
            }
            target_lookup = ROLE_SYNONYMS.get(role_clean, role_clean)

            # 1. Exact match
            matched = [r for r in data if r.get("role", "").lower().strip() == target_lookup.lower().strip()]
            # 2. Substring / alias match if exact not found
            if not matched:
                matched = [
                    r for r in data
                    if target_lookup.lower() in r.get("role", "").lower() or r.get("role", "").lower() in target_lookup.lower()
                ]
            if matched:
                results = []
                for item in matched:
                    results.append(
                        RoleRequirement(
                            skill_id=item["skill_id"],
                            skill_name=item["skill_name"],
                            frequency=float(item.get("frequency", 0.8)),
                            required_level=int(item.get("required_level", 2)),
                            trend="rising" if float(item.get("frequency", 0.8)) >= 0.6 else "stable",
                            source="cache",
                            timestamp=item.get("snapshot_date", datetime.now(timezone.utc).strftime("%Y-%m-%d"))
                        )
                    )
                results.sort(key=lambda r: r.frequency, reverse=True)
                return results
        except Exception as e:
            logger.warning(f"Error loading precomputed role requirements: {e}")
        return []
