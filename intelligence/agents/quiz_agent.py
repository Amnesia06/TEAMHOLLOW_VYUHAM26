"""
Quiz Generation Agent (M12).
Generates diagnostic multiple-choice assessments for completed roadmap courses.
Grounded strictly in the technical skills covered by each module.
Includes LLM generation with schema validation and deterministic technical question bank fallback.
"""

import json
import logging
from typing import List, Dict, Any, Optional
from contracts.schemas.quiz import Quiz, QuizQuestion
from intelligence.agents.base_agent import BaseAgent
from intelligence.prompts.templates import QUIZ_SYSTEM_PROMPT, QUIZ_GENERATION_PROMPT

logger = logging.getLogger(__name__)

# Grounded deterministic question bank for standard tech skills
SKILL_QUESTION_BANK: Dict[str, List[Dict[str, Any]]] = {
    "python": [
        {
            "question": "Which Python built-in data type is immutable?",
            "options": ["list", "tuple", "dict", "set"],
            "correct_index": 1,
            "explanation": "Tuples are immutable sequences in Python; their elements cannot be modified after creation."
        },
        {
            "question": "What does a generator function in Python use to produce a series of values lazily?",
            "options": ["return", "yield", "emit", "async"],
            "correct_index": 1,
            "explanation": "The 'yield' statement suspends function execution and yields an intermediate value to the iterator without loading all elements into memory."
        },
        {
            "question": "In Python, which dunder method implements the context manager protocol for 'with' statements?",
            "options": ["__enter__ and __exit__", "__init__ and __del__", "__open__ and __close__", "__iter__ and __next__"],
            "correct_index": 0,
            "explanation": "Context managers implement '__enter__' for setup and '__exit__' for teardown/cleanup."
        }
    ],
    "sql": [
        {
            "question": "What is the difference between WHERE and HAVING in SQL?",
            "options": [
                "WHERE filters rows before grouping; HAVING filters aggregated groups after GROUP BY",
                "HAVING filters rows before grouping; WHERE filters aggregated groups",
                "WHERE can only be used with numeric columns; HAVING with strings",
                "There is no difference; they are aliases"
            ],
            "correct_index": 0,
            "explanation": "The WHERE clause filters individual rows before aggregation; the HAVING clause filters the aggregated results after GROUP BY."
        },
        {
            "question": "Which SQL JOIN returns all rows from the left table and matched rows from the right table?",
            "options": ["INNER JOIN", "CROSS JOIN", "LEFT OUTER JOIN", "FULL OUTER JOIN"],
            "correct_index": 2,
            "explanation": "A LEFT OUTER JOIN preserves all rows from the left relation, filling missing right-side attributes with NULL."
        },
        {
            "question": "What index structure is the default in PostgreSQL for B-tree equality and range queries?",
            "options": ["GIN", "B-tree", "Hash", "BRIN"],
            "correct_index": 1,
            "explanation": "B-tree indexes are the PostgreSQL default, optimized for sorted range comparisons and equality lookups."
        }
    ],
    "react": [
        {
            "question": "What hook should be used in React to perform side effects after rendering?",
            "options": ["useState", "useEffect", "useMemo", "useRef"],
            "correct_index": 1,
            "explanation": "useEffect lets you perform side effects (such as fetching data or subscribing to events) after component layout and render."
        },
        {
            "question": "Why should keys provided to list items in React be unique and stable?",
            "options": [
                "To style elements uniquely in CSS",
                "To help React identify which items have changed, been added, or removed for efficient reconciliation",
                "To bind event listeners directly to the DOM",
                "To store item state in localStorage automatically"
            ],
            "correct_index": 1,
            "explanation": "Stable keys allow React's diffing algorithm to match virtual DOM tree elements across renders."
        },
        {
            "question": "What is the primary benefit of useCallback hook?",
            "options": [
                "Caches a calculated value across renders",
                "Returns a memoized version of the callback function that only changes when dependencies change",
                "Automatically triggers component re-mounting",
                "Defers component rendering until idle"
            ],
            "correct_index": 1,
            "explanation": "useCallback caches function definitions between renders to prevent unnecessary re-rendering of child components passing callbacks."
        }
    ],
    "node.js": [
        {
            "question": "Which module in Node.js provides an asynchronous event-driven architecture?",
            "options": ["events (EventEmitter)", "http", "stream", "cluster"],
            "correct_index": 0,
            "explanation": "The 'EventEmitter' class in the 'events' module is the core foundation for event handling in Node.js."
        },
        {
            "question": "What phase of the Node.js Event Loop executes I/O callbacks?",
            "options": ["Timers", "Poll", "Check", "Close callbacks"],
            "correct_index": 1,
            "explanation": "The Poll phase retrieves new I/O events and executes I/O related callbacks."
        },
        {
            "question": "What is the non-blocking file system call equivalent of fs.readFileSync?",
            "options": ["fs.readFile", "fs.loadFile", "fs.openSync", "fs.asyncRead"],
            "correct_index": 0,
            "explanation": "fs.readFile executes asynchronously without blocking the main event loop thread."
        }
    ],
    "docker": [
        {
            "question": "What is the main difference between a Docker Image and a Docker Container?",
            "options": [
                "An image is an executable runtime instance; a container is a static template",
                "An image is an immutable template containing application code; a container is a runnable instance of an image",
                "Images run on Linux; containers run only on Windows",
                "They are identical terms in Docker"
            ],
            "correct_index": 1,
            "explanation": "A Docker image is a read-only blueprint; a container is the isolated, running instance created from that blueprint."
        },
        {
            "question": "Which Dockerfile instruction specifies the default command executed when a container starts?",
            "options": ["RUN", "CMD", "COPY", "WORKDIR"],
            "correct_index": 1,
            "explanation": "CMD provides default arguments for an executing container, which can be overridden at runtime."
        },
        {
            "question": "What Docker mechanism allows persisting data outside the container lifecycle?",
            "options": ["Layers", "Volumes", "Swarm", "Contexts"],
            "correct_index": 1,
            "explanation": "Volumes are stored on the host filesystem and persist independent of container restarts or deletions."
        }
    ]
}


class QuizAgent(BaseAgent):
    """
    Generates technical diagnostic quizzes grounded in the course skills.
    """

    def __init__(self, llm_client: Optional[Any] = None):
        super().__init__(llm_client=llm_client, name="QuizAgent")

    async def generate_quiz(
        self,
        course_id: str,
        course_title: str,
        skills: List[str]
    ) -> Quiz:
        # 1. Try LLM generation if client configured
        if self.llm_client:
            try:
                prompt = QUIZ_GENERATION_PROMPT.format(
                    skills_list=", ".join(skills),
                    course_title=course_title
                )
                messages = [
                    {"role": "system", "content": QUIZ_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ]
                res = await self.llm_client.generate(messages=messages, temperature=0.2)
                text = res.get("content", "") if isinstance(res, dict) else str(res)
                parsed = json.loads(text)
                raw_qs = parsed.get("questions", [])
                if len(raw_qs) >= 2:
                    questions = [QuizQuestion(**q) for q in raw_qs[:3]]
                    return Quiz(
                        course_id=course_id,
                        course_title=course_title,
                        skills=skills,
                        questions=questions
                    )
            except Exception as e:
                logger.warning(f"LLM quiz generation failed ({e}), using grounded question bank.")

        # 2. Grounded deterministic fallback
        questions: List[QuizQuestion] = []
        for s in skills:
            s_clean = s.lower().replace("-", "").replace(".", "").replace(" ", "")
            for bank_key, q_list in SKILL_QUESTION_BANK.items():
                if bank_key in s_clean or s_clean in bank_key:
                    for q in q_list:
                        if len(questions) < 3:
                            questions.append(QuizQuestion(**q))
                    break
            if len(questions) >= 3:
                break

        # Generic technical questions if skill was unmapped
        if not questions:
            questions = [
                QuizQuestion(
                    question=f"What is the foundational architectural pattern emphasized in {course_title}?",
                    options=["Separation of concerns", "Tight coupling", "Monolithic state bypass", "Single-threaded blocking execution"],
                    correct_index=0,
                    explanation="Modern software engineering practices advocate separation of concerns to ensure modularity and maintainability."
                ),
                QuizQuestion(
                    question=f"When working with {skills[0] if skills else 'this module'}, what is the industry best practice for dependency management?",
                    options=["Commit binary dependencies to git", "Use lockfiles (package-lock.json / Cargo.lock) to guarantee reproducibility", "Never use version constraints", "Download packages directly via curl into root"],
                    correct_index=1,
                    explanation="Lockfiles pin exact transitive dependencies to prevent unexpected breaking changes across environments."
                ),
                QuizQuestion(
                    question="How does asynchronous non-blocking execution improve system throughput?",
                    options=[
                        "Allows CPU threads to handle other tasks while waiting for I/O operations to complete",
                        "Multiplies single-core CPU frequency automatically",
                        "Bypasses network sockets completely",
                        "Eliminates memory consumption"
                    ],
                    correct_index=0,
                    explanation="Asynchronous programming avoids blocking OS threads on slow I/O, allowing high concurrency under heavy traffic."
                )
            ]

        return Quiz(
            course_id=course_id,
            course_title=course_title,
            skills=skills,
            questions=questions[:3]
        )


quiz_agent = QuizAgent()

