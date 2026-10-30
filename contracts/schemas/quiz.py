"""
Quiz contract schema (M12).
"""

from typing import List
from pydantic import BaseModel, Field


class QuizQuestion(BaseModel):
    question: str
    options: List[str] = Field(min_length=4, max_length=4)
    correct_index: int = Field(ge=0, le=3)
    explanation: str


class Quiz(BaseModel):
    course_id: str
    course_title: str
    skills: List[str]
    questions: List[QuizQuestion]

