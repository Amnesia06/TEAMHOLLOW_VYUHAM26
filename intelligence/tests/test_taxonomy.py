"""
Unit tests for Skill Taxonomy and Transferable Skill Mapper.
"""

from intelligence.skills.taxonomy import SkillTaxonomy
from intelligence.skills.mapper import TransferableSkillMapper


def test_taxonomy_skill_lookup():
    python_skill = SkillTaxonomy.get_skill("python")
    assert python_skill is not None
    assert python_skill["name"] == "Python"
    assert python_skill["category"] == "Programming Languages"


def test_prerequisite_resolution():
    prereqs = SkillTaxonomy.get_all_prerequisites_recursive("Deep Learning")
    assert "Machine Learning Fundamentals" in prereqs or "Python" in prereqs


def test_transferable_mapping():
    projects = [
        {
            "name": "Autonomous GPS Farm Rover",
            "description": "Path planning using A* algorithm and obstacle avoidance.",
            "technologies": ["Python", "C++"]
        }
    ]
    user_skills = ["Python", "C++"]

    inferred = TransferableSkillMapper.identify_transferable_skills(user_skills, projects)
    inferred_names = [t["skill"] for t in inferred]

    assert "Graph Algorithms" in inferred_names
    for item in inferred:
        assert "explanation" in item
        assert item["confidence"] in ["low", "medium", "high"]
