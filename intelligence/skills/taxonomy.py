"""
Comprehensive Skill Taxonomy for Pathwise.
Maps 80+ technical and professional skills across 9 core domains,
with prerequisite graphs and difficulty levels.
"""

from typing import Dict, List, Optional, Any


class SkillTaxonomy:
    """
    Authoritative taxonomy for standardized skill normalization,
    prerequisite analysis, and cross-domain classification.
    """

    SKILLS: Dict[str, Dict[str, Any]] = {
        # --- Programming Languages ---
        "Python": {
            "category": "Programming Languages",
            "difficulty": "beginner",
            "prerequisites": [],
            "related_skills": ["C++", "Java", "Data Structures", "Algorithms"],
            "description": "General-purpose language prominent in AI, data science, and backend development."
        },
        "C++": {
            "category": "Programming Languages",
            "difficulty": "intermediate",
            "prerequisites": [],
            "related_skills": ["C", "Rust", "Computer Architecture", "Object-Oriented Programming"],
            "description": "High-performance systems language used extensively in robotics, game dev, and ML engines."
        },
        "Java": {
            "category": "Programming Languages",
            "difficulty": "intermediate",
            "prerequisites": [],
            "related_skills": ["Kotlin", "C#", "Object-Oriented Programming"],
            "description": "Robust enterprise programming language."
        },
        "TypeScript": {
            "category": "Programming Languages",
            "difficulty": "intermediate",
            "prerequisites": ["JavaScript"],
            "related_skills": ["JavaScript", "React", "Node.js"],
            "description": "Typed superset of JavaScript widely used in modern web engineering."
        },
        "JavaScript": {
            "category": "Programming Languages",
            "difficulty": "beginner",
            "prerequisites": [],
            "related_skills": ["TypeScript", "HTML/CSS"],
            "description": "Core language for web frontend and full-stack runtime."
        },
        "Rust": {
            "category": "Programming Languages",
            "difficulty": "advanced",
            "prerequisites": ["C++"],
            "related_skills": ["C++", "Systems Programming"],
            "description": "Memory-safe systems programming language."
        },
        "SQL": {
            "category": "Programming Languages",
            "difficulty": "beginner",
            "prerequisites": [],
            "related_skills": ["Relational Databases", "Data Analysis"],
            "description": "Standard query language for relational database management."
        },

        # --- Data Structures & Algorithms ---
        "Data Structures": {
            "category": "Computer Science Foundations",
            "difficulty": "intermediate",
            "prerequisites": ["Python"],
            "related_skills": ["Algorithms", "Problem Solving", "Memory Management"],
            "description": "Arrays, Linked Lists, Trees, Graphs, Hash Tables, Heaps."
        },
        "Algorithms": {
            "category": "Computer Science Foundations",
            "difficulty": "intermediate",
            "prerequisites": ["Data Structures"],
            "related_skills": ["Graph Algorithms", "Dynamic Programming", "Optimization"],
            "description": "Sorting, searching, recursion, divide-and-conquer, greedy techniques."
        },
        "Graph Algorithms": {
            "category": "Computer Science Foundations",
            "difficulty": "intermediate",
            "prerequisites": ["Data Structures", "Algorithms"],
            "related_skills": ["Path Planning (A*)", "Dijkstra", "Network Analysis"],
            "description": "Traversal, shortest path, spanning trees, topological sort."
        },

        # --- Mathematics & Statistics ---
        "Linear Algebra": {
            "category": "Mathematics & Statistics",
            "difficulty": "intermediate",
            "prerequisites": [],
            "related_skills": ["Calculus", "Machine Learning", "Computer Vision"],
            "description": "Vectors, matrices, eigenvalues, eigenvectors, matrix decompositions."
        },
        "Multivariate Calculus": {
            "category": "Mathematics & Statistics",
            "difficulty": "intermediate",
            "prerequisites": [],
            "related_skills": ["Optimization", "Deep Learning", "Gradient Descent"],
            "description": "Partial derivatives, gradients, Hessians, chain rule."
        },
        "Probability & Statistics": {
            "category": "Mathematics & Statistics",
            "difficulty": "intermediate",
            "prerequisites": [],
            "related_skills": ["Bayesian Inference", "Hypothesis Testing", "Data Analysis"],
            "description": "Distributions, expected value, Bayes theorem, confidence intervals."
        },
        "Mathematical Optimization": {
            "category": "Mathematics & Statistics",
            "difficulty": "advanced",
            "prerequisites": ["Linear Algebra", "Multivariate Calculus"],
            "related_skills": ["Gradient Descent", "Convex Optimization"],
            "description": "Loss function minimization, constrained optimization, dual formulations."
        },

        # --- Data Science & Machine Learning ---
        "Machine Learning Fundamentals": {
            "category": "Data Science & ML",
            "difficulty": "intermediate",
            "prerequisites": ["Python", "Linear Algebra", "Probability & Statistics"],
            "related_skills": ["Scikit-learn", "Supervised Learning", "Unsupervised Learning"],
            "description": "Classification, regression, clustering, evaluation metrics."
        },
        "Scikit-learn": {
            "category": "Data Science & ML",
            "difficulty": "intermediate",
            "prerequisites": ["Python", "Machine Learning Fundamentals"],
            "related_skills": ["Pandas", "NumPy", "Data Preprocessing"],
            "description": "Industry-standard Python machine learning toolkit."
        },
        "Deep Learning": {
            "category": "Data Science & ML",
            "difficulty": "advanced",
            "prerequisites": ["Machine Learning Fundamentals", "Multivariate Calculus"],
            "related_skills": ["PyTorch", "TensorFlow", "Neural Networks"],
            "description": "Multi-layer perceptrons, CNNs, RNNs, Transformers, backpropagation."
        },
        "PyTorch": {
            "category": "Data Science & ML",
            "difficulty": "advanced",
            "prerequisites": ["Python", "Deep Learning"],
            "related_skills": ["TensorFlow", "CUDA", "Model Training"],
            "description": "Leading open-source deep learning research and production framework."
        },
        "TensorFlow": {
            "category": "Data Science & ML",
            "difficulty": "advanced",
            "prerequisites": ["Python", "Deep Learning"],
            "related_skills": ["Keras", "Model Deployment"],
            "description": "End-to-end open source platform for machine learning."
        },
        "Natural Language Processing (NLP)": {
            "category": "Data Science & ML",
            "difficulty": "advanced",
            "prerequisites": ["Deep Learning", "Python"],
            "related_skills": ["Transformers", "Hugging Face", "LLMs"],
            "description": "Tokenization, embeddings, sentiment analysis, translation, language modeling."
        },
        "Computer Vision": {
            "category": "Data Science & ML",
            "difficulty": "advanced",
            "prerequisites": ["Deep Learning", "Linear Algebra"],
            "related_skills": ["OpenCV", "Object Detection", "Image Segmentation"],
            "description": "Visual feature extraction, object detection, image classification."
        },
        "Large Language Models (LLMs)": {
            "category": "Data Science & ML",
            "difficulty": "advanced",
            "prerequisites": ["Natural Language Processing (NLP)", "Deep Learning"],
            "related_skills": ["LangChain", "LangGraph", "Prompt Engineering", "RAG"],
            "description": "Architectures, fine-tuning, retrieval-augmented generation, agents."
        },
        "MLOps": {
            "category": "Data Science & ML",
            "difficulty": "advanced",
            "prerequisites": ["Machine Learning Fundamentals", "Docker"],
            "related_skills": ["Model Deployment", "MLflow", "CI/CD for ML"],
            "description": "Continuous integration, deployment, and monitoring for ML systems."
        },
        "Data Preprocessing": {
            "category": "Data Science & ML",
            "difficulty": "beginner",
            "prerequisites": ["Python"],
            "related_skills": ["Pandas", "NumPy", "Feature Engineering"],
            "description": "Cleaning, normalization, imputation, encoding categorical variables."
        },
        "Pandas": {
            "category": "Data Science & ML",
            "difficulty": "beginner",
            "prerequisites": ["Python"],
            "related_skills": ["NumPy", "Data Preprocessing", "Data Visualization"],
            "description": "Tabular data manipulation and analysis library."
        },
        "NumPy": {
            "category": "Data Science & ML",
            "difficulty": "beginner",
            "prerequisites": ["Python"],
            "related_skills": ["Linear Algebra", "Data Preprocessing"],
            "description": "Fundamental package for scientific computing with Python arrays."
        },

        # --- Robotics & Autonomous Systems ---
        "ROS / ROS 2": {
            "category": "Robotics & Embedded",
            "difficulty": "intermediate",
            "prerequisites": ["C++", "Python", "Linux"],
            "related_skills": ["Robot Kinematics", "Sensor Fusion", "Gazebo"],
            "description": "Robot Operating System framework for robotics middleware and nodes."
        },
        "Path Planning (A*)": {
            "category": "Robotics & Embedded",
            "difficulty": "intermediate",
            "prerequisites": ["Algorithms", "Graph Algorithms"],
            "related_skills": ["Graph Search", "Motion Planning", "RRT", "Autonomous Navigation"],
            "description": "Heuristic-guided shortest path algorithm widely used in autonomous navigation."
        },
        "Sensor Fusion": {
            "category": "Robotics & Embedded",
            "difficulty": "advanced",
            "prerequisites": ["Probability & Statistics", "Linear Algebra"],
            "related_skills": ["Kalman Filtering", "SLAM", "IMU Integration"],
            "description": "Combining sensory data from GPS, IMU, LIDAR, and cameras."
        },
        "Kalman Filtering": {
            "category": "Robotics & Embedded",
            "difficulty": "advanced",
            "prerequisites": ["Linear Algebra", "Probability & Statistics"],
            "related_skills": ["Sensor Fusion", "State Estimation", "Localization"],
            "description": "Optimal state estimation in the presence of noise and uncertainty."
        },
        "SLAM (Simultaneous Localization & Mapping)": {
            "category": "Robotics & Embedded",
            "difficulty": "advanced",
            "prerequisites": ["Sensor Fusion", "Computer Vision"],
            "related_skills": ["LIDAR Processing", "Visual Odometry"],
            "description": "Real-time map generation and spatial tracking in unknown environments."
        },
        "Embedded Systems": {
            "category": "Robotics & Embedded",
            "difficulty": "intermediate",
            "prerequisites": ["C++"],
            "related_skills": ["Microcontrollers", "RTOS", "Hardware Protocols (I2C/SPI)"],
            "description": "Programming microcontrollers (ARM, ESP32, Arduino) with real-time constraints."
        },

        # --- Web & Backend Engineering ---
        "FastAPI": {
            "category": "Web Development",
            "difficulty": "intermediate",
            "prerequisites": ["Python"],
            "related_skills": ["REST APIs", "Async Programming", "Pydantic"],
            "description": "Modern, high-performance web framework for building APIs with Python."
        },
        "React": {
            "category": "Web Development",
            "difficulty": "intermediate",
            "prerequisites": ["JavaScript", "HTML/CSS"],
            "related_skills": ["TypeScript", "Next.js", "State Management"],
            "description": "Declarative component-based UI library."
        },
        "Next.js": {
            "category": "Web Development",
            "difficulty": "intermediate",
            "prerequisites": ["React", "TypeScript"],
            "related_skills": ["Server Components", "Full-Stack Development"],
            "description": "The React framework for the web with SSR, SSG, and API routes."
        },
        "REST APIs": {
            "category": "Web Development",
            "difficulty": "beginner",
            "prerequisites": [],
            "related_skills": ["HTTP Protocols", "FastAPI", "JSON"],
            "description": "Architectural style for web communication and endpoints."
        },
        "HTML/CSS": {
            "category": "Web Development",
            "difficulty": "beginner",
            "prerequisites": [],
            "related_skills": ["Tailwind CSS", "Responsive Design"],
            "description": "Core layout and styling foundations of the web."
        },
        "Tailwind CSS": {
            "category": "Web Development",
            "difficulty": "beginner",
            "prerequisites": ["HTML/CSS"],
            "related_skills": ["CSS", "UI Design"],
            "description": "Utility-first CSS framework for rapid interface design."
        },

        # --- Cloud & DevOps ---
        "Docker": {
            "category": "Cloud & DevOps",
            "difficulty": "intermediate",
            "prerequisites": ["Linux"],
            "related_skills": ["Kubernetes", "Containerization", "CI/CD"],
            "description": "OS-level virtualization for portable containerized applications."
        },
        "Kubernetes": {
            "category": "Cloud & DevOps",
            "difficulty": "advanced",
            "prerequisites": ["Docker"],
            "related_skills": ["Cloud Orchestration", "Microservices"],
            "description": "Container orchestration system for automating deployment and scaling."
        },
        "AWS": {
            "category": "Cloud & DevOps",
            "difficulty": "intermediate",
            "prerequisites": ["Linux", "Networking"],
            "related_skills": ["EC2", "S3", "Lambda", "Cloud Architecture"],
            "description": "Amazon Web Services comprehensive cloud platform."
        },
        "GCP": {
            "category": "Cloud & DevOps",
            "difficulty": "intermediate",
            "prerequisites": ["Linux"],
            "related_skills": ["BigQuery", "Vertex AI", "Cloud Run"],
            "description": "Google Cloud Platform infrastructure and AI services."
        },
        "Linux": {
            "category": "Cloud & DevOps",
            "difficulty": "beginner",
            "prerequisites": [],
            "related_skills": ["Bash Scripting", "System Administration"],
            "description": "Standard operating system environment for servers and robotics."
        },
        "Git": {
            "category": "Development Tools",
            "difficulty": "beginner",
            "prerequisites": [],
            "related_skills": ["GitHub", "Version Control", "Team Collaboration"],
            "description": "Distributed version control system."
        },

        # --- Databases ---
        "PostgreSQL": {
            "category": "Databases",
            "difficulty": "intermediate",
            "prerequisites": ["SQL"],
            "related_skills": ["Relational Databases", "pgvector", "Database Design"],
            "description": "Powerful open-source object-relational database system."
        },
        "pgvector / Vector Databases": {
            "category": "Databases",
            "difficulty": "intermediate",
            "prerequisites": ["PostgreSQL", "Machine Learning Fundamentals"],
            "related_skills": ["Embeddings", "Semantic Search", "RAG"],
            "description": "Vector similarity search extension for PostgreSQL and AI workflows."
        },

        # --- Soft Skills & Professional Competencies ---
        "System Design": {
            "category": "Professional Competencies",
            "difficulty": "advanced",
            "prerequisites": ["Software Engineering", "Databases"],
            "related_skills": ["Architecture", "Scalability", "Tradeoff Analysis"],
            "description": "Designing scalable, maintainable, high-reliability software architectures."
        },
        "Technical Communication": {
            "category": "Soft Skills",
            "difficulty": "intermediate",
            "prerequisites": [],
            "related_skills": ["Documentation", "Team Collaboration"],
            "description": "Conveying complex engineering concepts clearly to technical and business audiences."
        }
    }

    @classmethod
    def get_skill(cls, name: str) -> Optional[Dict[str, Any]]:
        """Get canonical definition for a skill (case-insensitive)."""
        name_lower = name.lower()
        for k, v in cls.SKILLS.items():
            if k.lower() == name_lower:
                return {"name": k, **v}
        return None

    @classmethod
    def find_by_category(cls, category: str) -> List[Dict[str, Any]]:
        """List all skills in a given category."""
        return [
            {"name": k, **v}
            for k, v in cls.SKILLS.items()
            if v["category"].lower() == category.lower()
        ]

    @classmethod
    def get_prerequisites(cls, skill_name: str) -> List[str]:
        """Retrieve direct prerequisites for a skill."""
        skill = cls.get_skill(skill_name)
        if skill:
            return skill.get("prerequisites", [])
        return []

    @classmethod
    def get_all_prerequisites_recursive(cls, skill_name: str, visited: Optional[set] = None) -> List[str]:
        """Recursively resolve the full prerequisite tree."""
        if visited is None:
            visited = set()

        skill = cls.get_skill(skill_name)
        if not skill:
            return []

        prereqs = []
        for p in skill.get("prerequisites", []):
            if p not in visited:
                visited.add(p)
                prereqs.extend(cls.get_all_prerequisites_recursive(p, visited))
                prereqs.append(p)
        return prereqs

    @classmethod
    def list_all_skills(cls) -> List[str]:
        """Return list of all canonical skill names."""
        return list(cls.SKILLS.keys())
