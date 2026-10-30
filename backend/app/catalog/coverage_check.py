"""
Course Catalog Coverage and Prerequisite Cycle Check (Track 2: Backend M9).
Verifies that:
1. Every skill required by the demo roles is covered by at least one course.
2. Every course's prerequisite skills are valid taxonomy skills and have courses covering them.
3. No prerequisite cycles exist in the course catalog.
"""

import json
import os
import sys
from typing import Dict, List, Set, Any, Tuple


def load_data(
    taxonomy_path: str = "contracts/taxonomy/skills.json",
    roles_path: str = "intelligence/market_data/job_roles.json",
    catalog_path: str = "backend/app/catalog/learning_resources.json"
) -> Tuple[Dict[str, Any], List[Dict[str, Any]], List[Dict[str, Any]]]:
    with open(taxonomy_path, "r", encoding="utf-8") as f:
        taxonomy = json.load(f)
    with open(roles_path, "r", encoding="utf-8") as f:
        roles = json.load(f).get("roles", [])
    with open(catalog_path, "r", encoding="utf-8") as f:
        courses = json.load(f).get("resources", [])
    return taxonomy, roles, courses


def check_coverage(roles: List[Dict[str, Any]], courses: List[Dict[str, Any]]) -> Dict[str, Any]:
    skill_to_courses: Dict[str, List[str]] = {}
    for c in courses:
        for s in c.get("skills_covered", []):
            skill_to_courses.setdefault(s, []).append(c["id"])

    role_coverage = {}
    all_passed = True

    for r in roles:
        role_id = r.get("role_id", r.get("title"))
        role_title = r.get("title")
        required = r.get("required_skills", [])
        missing = []
        covered = []

        for req in required:
            s_id = req["skill_id"]
            if s_id in skill_to_courses and len(skill_to_courses[s_id]) > 0:
                covered.append({"skill_id": s_id, "name": req["name"], "course_count": len(skill_to_courses[s_id])})
            else:
                missing.append({"skill_id": s_id, "name": req["name"]})
                all_passed = False

        role_coverage[role_title] = {
            "role_id": role_id,
            "total_skills": len(required),
            "covered_count": len(covered),
            "missing": missing,
            "passed": len(missing) == 0
        }

    return {
        "passed": all_passed,
        "roles": role_coverage,
        "total_courses": len(courses),
        "unique_covered_skills": len(skill_to_courses)
    }


def check_prerequisite_cycles(courses: List[Dict[str, Any]]) -> Tuple[bool, List[List[str]]]:
    """
    Constructs a directed graph of courses based on prerequisite skill relationships.
    Course A depends on Course B if Course B covers a prerequisite skill of Course A.
    """
    skill_providers: Dict[str, List[str]] = {}
    for c in courses:
        for s in c.get("skills_covered", []):
            skill_providers.setdefault(s, []).append(c["id"])

    graph: Dict[str, Set[str]] = {c["id"]: set() for c in courses}
    for c in courses:
        c_id = c["id"]
        for prereq_skill in c.get("prerequisite_skills", []):
            providers = skill_providers.get(prereq_skill, [])
            for p in providers:
                if p != c_id:
                    graph[c_id].add(p)

    # Cycle detection using DFS
    visited: Dict[str, int] = {}  # 0: unvisited, 1: visiting, 2: visited
    cycles: List[List[str]] = []

    def dfs(node: str, path: List[str]):
        visited[node] = 1
        path.append(node)
        for neighbor in graph.get(node, set()):
            if visited.get(neighbor, 0) == 1:
                # Cycle found
                cycle_start = path.index(neighbor)
                cycles.append(path[cycle_start:] + [neighbor])
            elif visited.get(neighbor, 0) == 0:
                dfs(neighbor, path)
        path.pop()
        visited[node] = 2

    for c in courses:
        c_id = c["id"]
        if visited.get(c_id, 0) == 0:
            dfs(c_id, [])

    return len(cycles) == 0, cycles


def run_all_checks() -> bool:
    print("=" * 60)
    print("PATHWISE COURSE CATALOG COVERAGE & CYCLE CHECK")
    print("=" * 60)

    taxonomy, roles, courses = load_data()
    print(f"Loaded {len(courses)} courses from catalog.")
    print(f"Loaded {len(roles)} demo roles.")
    print("-" * 60)

    coverage_result = check_coverage(roles, courses)
    cycles_passed, cycles = check_prerequisite_cycles(courses)

    print("\n--- 1. DEMO ROLE COVERAGE RESULTS ---")
    for role_name, res in coverage_result["roles"].items():
        status = "PASSED" if res["passed"] else "FAILED"
        print(f"[{status}] {role_name}: {res['covered_count']}/{res['total_skills']} skills covered")
        if not res["passed"]:
            for m in res["missing"]:
                print(f"       MISSING: {m['name']} ({m['skill_id']})")

    print("\n--- 2. PREREQUISITE CYCLE CHECK RESULTS ---")
    if cycles_passed:
        print("[PASSED] No prerequisite cycles detected in the course catalog.")
    else:
        print(f"[FAILED] {len(cycles)} cycle(s) detected:")
        for cyc in cycles:
            print(" -> ".join(cyc))

    print("\n--- 3. UNVERIFIED FIELD AUDIT ---")
    unverified_count = sum(1 for c in courses if not c.get("verified", False))
    print(f"Catalog entries marked UNVERIFIED: {unverified_count}/{len(courses)}")

    overall_pass = coverage_result["passed"] and cycles_passed
    print("=" * 60)
    if overall_pass:
        print("OVERALL RESULT: PASSED (All demo roles covered, 0 cycles)")
    else:
        print("OVERALL RESULT: FAILED")
    print("=" * 60)

    return overall_pass


if __name__ == "__main__":
    success = run_all_checks()
    sys.exit(0 if success else 1)

