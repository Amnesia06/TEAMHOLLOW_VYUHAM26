"""
Phase 2 P0 Test Suite: Intelligence Modules (M1, M2, M3).
Tests:
- M1 Profiler on 10 varied resumes: synonym normalization, proficiency levels 0-3, unmapped flagging.
- M2 Market Intelligence: Database cache retrieval for common role, live Tavily search fallback for niche role.
- M3 Gap Analyzer: Cosine similarity matching, transferable skill detection, priority scores, empty gap on full match.
"""

import pytest
import os
from contracts.schemas.profile import Profile, ProfileSkill
from contracts.schemas.role_requirement import RoleRequirement
from contracts.schemas.gap import Gap
from intelligence.agents.profile_agent import ProfileAgent
from intelligence.agents.market_agent import MarketIntelligenceAgent
from intelligence.skills.gap_analyzer import GapAnalyzer
from intelligence.skills.taxonomy import SkillTaxonomy
from dotenv import load_dotenv

load_dotenv()

# --- 10 VARIED TEST RESUMES FOR M1 ---
TEST_RESUMES = [
    {
        "id": "resume_1_senior_fsd",
        "title": "Senior Full-Stack Engineer",
        "text": """
Marcus Brody - Senior Full-Stack Engineer with 6+ years of experience.
Expert in TypeScript, React, and Node.js.
Deep experience with PostgreSQL and designing scalable REST APIs.
Maintained clean repository branch standards using Git.
""",
        "expected_canonical": ["skill_typescript", "skill_react", "skill_nodejs", "skill_postgresql", "skill_git"],
        "expect_min_level": 3
    },
    {
        "id": "resume_2_junior_frontend",
        "title": "Junior Frontend Developer",
        "text": """
Liam Patel - Junior Frontend Intern with 1 year of experience.
Familiar with JavaScript, HTML, CSS, and basic React development.
Learning TypeScript and Git fundamentals.
""",
        "expected_canonical": ["skill_javascript", "skill_react", "skill_typescript", "skill_git"],
        "expect_min_level": 1
    },
    {
        "id": "resume_3_lead_data_engineer",
        "title": "Lead Data Platform Engineer",
        "text": """
Priya Sharma - Lead Data Engineer with 7 years of experience.
Architected high-throughput pipelines with Apache Spark (PySpark) and Python.
Orchestrated complex DAGs in Apache Airflow.
Advanced SQL optimization and dimensional Data Modeling in PostgreSQL.
""",
        "expected_canonical": ["skill_python", "skill_spark", "skill_airflow", "skill_sql", "skill_postgresql", "skill_data_modeling"],
        "expect_min_level": 3
    },
    {
        "id": "resume_4_data_analyst",
        "title": "Data Analyst / Python Scripter",
        "text": """
Carlos Gomez - Data Analyst with 2 years of experience.
Skilled in SQL queries and Python data wrangling.
Familiar with Linux terminal commands and Git version control.
""",
        "expected_canonical": ["skill_sql", "skill_python", "skill_linux", "skill_git"],
        "expect_min_level": 2
    },
    {
        "id": "resume_5_ml_researcher",
        "title": "Machine Learning Specialist",
        "text": """
Dr. Evelyn Vance - AI Research Scientist with 4 years of experience.
Deep learning research using Python, PyTorch, and Scikit-learn.
Strong background in Linear Algebra and mathematical data preprocessing.
""",
        "expected_canonical": ["skill_python", "skill_pytorch", "skill_scikit_learn", "skill_linear_algebra"],
        "expect_min_level": 2
    },
    {
        "id": "resume_6_mlops_engineer",
        "title": "MLOps Infrastructure Engineer",
        "text": """
Devon Taylor - MLOps Engineer with 3.5 years experience.
Production deployment of machine learning models with MLOps pipelines.
Containerization using Docker and orchestration with Kubernetes.
Automated testing and continuous delivery using CI/CD and Git.
""",
        "expected_canonical": ["skill_mlops", "skill_docker", "skill_kubernetes", "skill_cicd", "skill_git"],
        "expect_min_level": 2
    },
    {
        "id": "resume_7_cloud_devops",
        "title": "Cloud DevOps Architect",
        "text": """
Aisha Al-Mansoor - Senior Cloud & DevOps Engineer with 5+ years experience.
Expert in Linux administration and Bash shell scripting.
Infrastructure as Code provisioning with Terraform on AWS / GCP.
Container cluster management using Kubernetes and Docker with CI/CD.
""",
        "expected_canonical": ["skill_linux", "skill_bash", "skill_terraform", "skill_cloud_aws_gcp", "skill_kubernetes", "skill_docker", "skill_cicd"],
        "expect_min_level": 3
    },
    {
        "id": "resume_8_systems_programmer",
        "title": "Low-Level Systems Developer",
        "text": """
Viktor Hansen - Systems Programmer with 3 years of experience.
High-performance development in modern C++ and Rust.
Linux systems programming, POSIX threads, and Bash scripting.
""",
        "expected_canonical": ["skill_cpp", "skill_rust", "skill_linux", "skill_bash"],
        "expect_min_level": 2
    },
    {
        "id": "resume_9_embedded_iot",
        "title": "Embedded IoT Firmware Engineer",
        "text": """
Kenji Sato - Embedded Systems Engineer with 4 years of experience.
Firmware development in C and C++ for ARM microcontrollers.
Real-time task scheduling with RTOS (FreeRTOS) and Hardware Protocols (I2C/SPI/UART).
""",
        "expected_canonical": ["skill_cpp", "skill_microcontrollers", "skill_rtos", "skill_hw_protocols"],
        "expect_min_level": 2
    },
    {
        "id": "resume_10_unmapped_custom",
        "title": "Enterprise Legacy Developer",
        "text": """
Rachel Green - Software Engineer with 3 years experience.
Worked with Python, SQL, and Git.
Maintained proprietary internal tools: InternalDeploymentTooling and CustomBrokerFramework.
""",
        "expected_canonical": ["skill_python", "skill_sql", "skill_git"],
        "expected_unmapped": ["InternalDeploymentTooling", "CustomBrokerFramework"],
        "expect_min_level": 2
    }
]


class TestM1Profiler:
    """M1 Profiler Module Acceptance Tests."""

    @pytest.mark.asyncio
    async def test_m1_on_10_varied_resumes(self):
        """Tests synonym normalization, levels 0-3, and unmapped flagging across 10 resumes."""
        agent = ProfileAgent()

        print("\n" + "=" * 60)
        print("M1 PROFILER: 10 VARIED RESUMES ACCEPTANCE TEST (REAL TAXONOMY)")
        print("=" * 60)

        for resume in TEST_RESUMES:
            res = await agent.run({"resume_text": resume["text"]})
            profile: Profile = res["profile"]

            # Assertions
            assert profile.years_of_experience > 0
            assert len(profile.skills) > 0

            found_skill_ids = [s.skill_id for s in profile.skills]
            for exp_id in resume["expected_canonical"]:
                assert exp_id in found_skill_ids, f"Resume {resume['id']} missing expected canonical skill {exp_id}"

            # Verify every skill has a level between 0 and 3
            for s in profile.skills:
                assert 0 <= s.level <= 3

            # Check unmapped skills if applicable
            if "expected_unmapped" in resume:
                for unmapped in resume["expected_unmapped"]:
                    assert unmapped in profile.unmapped_skills, f"Expected unmapped skill '{unmapped}' not flagged"

            print(f"[PASS] {resume['title']}: {len(profile.skills)} canonical skills mapped, levels 0-3 valid, unmapped={profile.unmapped_skills}")


class TestM2MarketIntelligence:
    """M2 Market Intelligence Module Acceptance Tests."""

    @pytest.mark.asyncio
    async def test_m2_common_role_uses_cached_data(self):
        """Common role (Full-Stack Developer) should use database cache without live search."""
        # Database posting search mock representing loaded Supabase postings
        class CachedDatabaseSearch:
            def search_postings(self, role, query_vector, top_k):
                return [
                    {"role": role, "text": "Hiring Full-Stack Developer: TypeScript, React, Node.js, PostgreSQL, Git."},
                    {"role": role, "text": "Full-Stack role requiring React, Node.js, and REST APIs with PostgreSQL."},
                    {"role": role, "text": "Senior Web Engineer: TypeScript, Next.js, and relational databases."},
                    {"role": role, "text": "Web developer with React, TypeScript, and Git experience."},
                    {"role": role, "text": "Full stack engineer: Node.js, REST APIs, and PostgreSQL queries."}
                ]

        agent = MarketIntelligenceAgent(posting_search=CachedDatabaseSearch())
        result = await agent.get_role_requirements("Full-Stack Developer")

        assert result["source"] == "cache"
        assert result["fallback_reason"] is None
        assert result["posting_count"] >= 3
        assert len(result["requirements"]) > 0

        req_names = [r.skill_name for r in result["requirements"]]
        assert "React" in req_names
        assert "TypeScript" in req_names
        print(f"\n[PASS] M2 Common Role: Used cache (3 postings), {len(result['requirements'])} requirements extracted.")

    @pytest.mark.asyncio
    async def test_m2_niche_role_triggers_live_search_fallback(self):
        """Niche role with 0 cached postings triggers live search fallback with explicit reason."""
        tavily_key = os.getenv("TAVILY_API_KEY")

        if not tavily_key:
            pytest.skip("BLOCKED: TAVILY_API_KEY is not set in environment.")

        from tavily import TavilyClient
        tavily_client = TavilyClient(api_key=tavily_key)

        class RealTavilySearchAdapter:
            async def search(self, query):
                res = tavily_client.search(query=query, max_results=3)
                return [{"content": r.get("content", ""), "url": r.get("url", "")} for r in res.get("results", [])]

        class EmptyDatabaseSearch:
            def search_postings(self, role, query_vector, top_k):
                return []  # 0 cached postings to trigger autonomous fallback

        agent = MarketIntelligenceAgent(
            posting_search=EmptyDatabaseSearch(),
            search_client=RealTavilySearchAdapter()
        )

        result = await agent.get_role_requirements("Rust Embedded Systems Engineer")

        assert result["source"] == "live"
        assert result["fallback_reason"] is not None
        assert "Live web search initiated" in result["fallback_reason"]
        assert result["posting_count"] > 0
        print(f"\n[PASS] M2 Niche Role (REAL TAVILY CLIENT): Fallback triggered: '{result['fallback_reason']}'")


class TestM3GapAnalyzer:
    """M3 Gap Analyzer Module Acceptance Tests."""

    def test_m3_priority_scoring_and_transferable_detection(self):
        """Tests frequency, gap size, transferable matching (0.5 factor), and trend factor."""
        analyzer = GapAnalyzer()

        # Candidate has SQL (level 2) and Python (level 2)
        profile = Profile(
            skills=[
                ProfileSkill(skill_id="skill_sql", name="SQL", level=2),
                ProfileSkill(skill_id="skill_python", name="Python", level=2),
            ],
            unmapped_skills=[],
            years_of_experience=3.0,
            years_per_skill={"SQL": 3.0, "Python": 3.0},
            domain="Data"
        )

        # Requirements:
        # 1. PostgreSQL (frequency 0.80, req level 2, trend rising) -> Transferable from SQL (partial match)!
        # 2. Apache Spark (frequency 0.90, req level 2, trend stable) -> No match!
        # 3. Python (frequency 1.0, req level 2, trend stable) -> Exact full match -> gap 0!
        requirements = [
            RoleRequirement(
                skill_id="skill_postgresql",
                skill_name="PostgreSQL",
                frequency=0.80,
                required_level=2,
                trend="rising",
                source="cache",
                timestamp="2026-10-30"
            ),
            RoleRequirement(
                skill_id="skill_spark",
                skill_name="Apache Spark",
                frequency=0.90,
                required_level=2,
                trend="stable",
                source="cache",
                timestamp="2026-10-30"
            ),
            RoleRequirement(
                skill_id="skill_python",
                skill_name="Python",
                frequency=1.00,
                required_level=2,
                trend="stable",
                source="cache",
                timestamp="2026-10-30"
            )
        ]

        gaps = analyzer.analyze_gaps(profile, requirements)

        # Python should NOT be in gaps because user already has level 2
        gap_skill_ids = [g.skill_id for g in gaps]
        assert "skill_python" not in gap_skill_ids, "Python should have 0 gap"

        # Spark should be a non-transferable gap
        spark_gap = next(g for g in gaps if g.skill_id == "skill_spark")
        assert not spark_gap.transferable
        # priority = frequency (0.9) * gap_size (2) * transfer (1.0) * trend (1.0) = 1.8
        assert spark_gap.priority_score == 1.8

        # PostgreSQL should be a transferable gap supported by SQL
        pg_gap = next(g for g in gaps if g.skill_id == "skill_postgresql")
        assert pg_gap.transferable
        assert pg_gap.supporting_skill == "SQL"
        # priority = frequency (0.8) * gap_size (1) * transfer (0.5) * trend (1.2) = 0.48
        assert pg_gap.priority_score == 0.48

        print(f"\n[PASS] M3 Gap Analyzer: Correct transferable detection (PostgreSQL from SQL) and priority scores (Spark: {spark_gap.priority_score}, PG: {pg_gap.priority_score})")

    def test_m3_empty_gap_when_user_holds_all_skills(self):
        """User holding all required skills at or above required levels gets empty gap list."""
        analyzer = GapAnalyzer()
        profile = Profile(
            skills=[
                ProfileSkill(skill_id="skill_python", name="Python", level=3),
                ProfileSkill(skill_id="skill_sql", name="SQL", level=2),
            ],
            unmapped_skills=[],
            years_of_experience=4.0,
            years_per_skill={"Python": 4.0, "SQL": 3.0},
            domain="Data"
        )
        requirements = [
            RoleRequirement(
                skill_id="skill_python",
                skill_name="Python",
                frequency=1.0,
                required_level=2,
                trend="stable",
                source="cache",
                timestamp="2026-10-30"
            ),
            RoleRequirement(
                skill_id="skill_sql",
                skill_name="SQL",
                frequency=0.8,
                required_level=2,
                trend="stable",
                source="cache",
                timestamp="2026-10-30"
            )
        ]

        gaps = analyzer.analyze_gaps(profile, requirements)
        assert len(gaps) == 0, "Expected empty gap list when candidate meets all requirements"
        print("[PASS] M3 Gap Analyzer: User with all competencies yields empty gap list.")
