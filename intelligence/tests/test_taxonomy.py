"""
Unit tests for Skill Taxonomy wrapper.
"""

from intelligence.skills.taxonomy import SkillTaxonomy
from intelligence.fakes import FakeTaxonomyLookup


def test_taxonomy_skill_lookup():
    tax = SkillTaxonomy()
    skill = tax.get_skill_by_name("TypeScript")
    assert skill is not None
    assert skill["id"] == "skill_typescript"
    assert skill["category"] == "Programming Languages"


def test_taxonomy_prerequisite_lookup():
    tax = SkillTaxonomy()
    prereqs = tax.get_prerequisites("skill_nextjs")
    assert "skill_react" in prereqs or "skill_typescript" in prereqs


def test_taxonomy_with_backend_interface():
    fake_backend = FakeTaxonomyLookup()
    tax = SkillTaxonomy(backend_lookup=fake_backend)
    skill = tax.get_skill_by_name("Python")
    assert skill is not None
    assert skill["id"] == "skill_python"
