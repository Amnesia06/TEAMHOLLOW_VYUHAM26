"""
Learning Coach and Assessment Agent: Guides hands-on progression,
generates skill evaluation challenges, and verifies competence before updating profiles.
"""

from typing import Dict, List, Optional, Any
from intelligence.agents.base_agent import BaseAgent
from intelligence.resources.database import ResourceDatabase


class LearningCoachAgent(BaseAgent):
    """
    Acts as an interactive mentor, validating milestone completion
    through project-based assessment and targeted quizzes.
    """

    def __init__(self, llm_provider: Optional[Any] = None, resource_db: Optional[ResourceDatabase] = None):
        super().__init__(llm_provider=llm_provider, name="LearningCoachAgent")
        self.resource_db = resource_db or ResourceDatabase()

    async def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes coaching assistance.
        Can assess progress, generate a skill quiz, or recommend hands-on projects.
        """
        action = state.get("coach_action", "recommend_project")
        skill = state.get("target_skill", "Machine Learning Fundamentals")

        if action == "generate_assessment":
            assessment = self.generate_skill_quiz(skill)
            return {"assessment": assessment}

        # Default: suggest practical projects
        projects = self.suggest_hands_on_projects(skill)
        return {
            "coaching_message": f"To demonstrate mastery in {skill}, build a standalone project with testable results.",
            "recommended_projects": projects
        }

    def suggest_hands_on_projects(self, skill: str) -> List[Dict[str, Any]]:
        """Return practical project ideas for demonstrating a skill."""
        projects_catalog = {
            "Machine Learning Fundamentals": [
                {
                    "title": "Kaggle Tabular House Price Predictor",
                    "description": "Implement cross-validation, feature normalization, and compare linear regression vs ensemble trees using Scikit-Learn.",
                    "deliverable": "Jupyter Notebook with RMSE metrics and validation curves.",
                    "evidence_impact": "Upgrades self-reported ML knowledge to demonstrated project evidence."
                }
            ],
            "ROS / ROS 2": [
                {
                    "title": "Gazebo Differential Drive Simulation",
                    "description": "Create a ROS 2 package with custom URDF robot model and publish cmd_vel velocity commands.",
                    "deliverable": "GitHub repository with ROS 2 workspace and simulation launch files.",
                    "evidence_impact": "Direct verification for Robotics Software Engineer requirements."
                }
            ],
            "PyTorch": [
                {
                    "title": "Custom CNN Classifier on Fashion-MNIST",
                    "description": "Train a convolutional neural network from scratch using PyTorch nn.Module, custom Dataset, and DataLoader.",
                    "deliverable": "Model checkpoint and accuracy visualization on unseen test split.",
                    "evidence_impact": "Proves deep learning framework competence."
                }
            ]
        }
        return projects_catalog.get(skill, [
            {
                "title": f"Production Implementation in {skill}",
                "description": f"Build a public GitHub repository demonstrating end-to-end practical application of {skill}.",
                "deliverable": "Documented code repository with unit tests.",
                "evidence_impact": "Demonstrates independent engineering ability."
            }
        ])

    def generate_skill_quiz(self, skill: str) -> Dict[str, Any]:
        """Generates diagnostic quiz questions to verify proficiency before upgrading profile."""
        quiz_catalog = {
            "Linear Algebra": {
                "skill": "Linear Algebra",
                "questions": [
                    {
                        "question": "What is the geometric interpretation of multiplying a vector by an orthogonal matrix?",
                        "options": ["Scaling without rotation", "Pure rotation and/or reflection preserving vector length", "Projecting onto a subspace", "Inverting matrix eigenvalues"],
                        "correct_index": 1,
                        "explanation": "Orthogonal matrices preserve inner products and L2 norms, corresponding to rigid rotations and reflections."
                    }
                ]
            },
            "Machine Learning Fundamentals": {
                "skill": "Machine Learning Fundamentals",
                "questions": [
                    {
                        "question": "Why is high variance in model performance typically associated with overfitting?",
                        "options": ["The model is under-parameterized", "The model captures noise in the training set rather than the underlying pattern", "The learning rate is too high", "The dataset is too large"],
                        "correct_index": 1,
                        "explanation": "Overfitting happens when a complex model memorizes sample-specific noise, leading to high test-set error fluctuation."
                    }
                ]
            }
        }
        return quiz_catalog.get(skill, {
            "skill": skill,
            "questions": [
                {
                    "question": f"Explain the core architectural trade-offs involved in using {skill} in a production environment.",
                    "options": ["Scalability vs Simplicity", "Cost vs Throughput", "Reliability vs Development Speed", "All of the above"],
                    "correct_index": 3,
                    "explanation": "Engineering system choices routinely balance complexity, performance, and maintenance."
                }
            ]
        })
