"""
Automated dependency direction test (README Section 7.1 & Non-negotiable rules).
Backend imports intelligence. Intelligence NEVER imports backend. Both import contracts.
"""

import os
import ast
import pytest

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def get_python_files(folder_name: str):
    folder_path = os.path.join(REPO_ROOT, folder_name)
    py_files = []
    for root, _, files in os.walk(folder_path):
        for f in files:
            if f.endswith(".py"):
                py_files.append(os.path.join(root, f))
    return py_files


def test_intelligence_never_imports_backend():
    intelligence_files = get_python_files("intelligence")
    violations = []

    for file_path in intelligence_files:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        try:
            tree = ast.parse(content, filename=file_path)
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        if alias.name.startswith("backend"):
                            violations.append((file_path, alias.name))
                elif isinstance(node, ast.ImportFrom):
                    if node.module and node.module.startswith("backend"):
                        violations.append((file_path, node.module))
        except Exception:
            # Fallback simple check
            for line in content.splitlines():
                line_clean = line.strip()
                if line_clean.startswith("import backend") or line_clean.startswith("from backend"):
                    violations.append((file_path, line_clean))

    assert len(violations) == 0, f"Dependency violation! Intelligence imports backend in: {violations}"
