"""
Job Dataset Pipeline (Track 3: Intelligence).
Cleans job postings, computes skill frequencies for role requirements,
and embeds job postings and skills taxonomy into 384-dimensional vectors.
"""

import os
import json
import re
from typing import List, Dict, Any
from datetime import datetime, timezone
from intelligence.embeddings import embed_text, embed_batch

RAW_POSTINGS = [
    # --- Full-Stack Developer ---
    {
        "role": "Full-Stack Developer",
        "title": "Senior Full Stack Engineer (React/Node/TypeScript)",
        "source": "kaggle_tech_jobs_2025",
        "text": """
We are looking for an experienced Full-Stack Developer to build resilient, high-throughput cloud applications.
Responsibilities:
- Build responsive user interfaces with TypeScript and React.
- Create performant backend microservices with Node.js and Next.js.
- Model relational data schemas in PostgreSQL and optimize REST APIs and database queries.
- Participate in code reviews and branch management using Git.
Requirements:
- 3+ years experience in TypeScript, React, and Node.js.
- Strong knowledge of Next.js, PostgreSQL, and REST APIs.
- Proficient with Git version control and collaborative workflows.
"""
    },
    {
        "role": "Full-Stack Developer",
        "title": "Full Stack Software Engineer",
        "source": "kaggle_tech_jobs_2025",
        "text": """
Join our agile team building customer-facing web platforms.
Key requirements:
- Proficiency in modern JavaScript/TypeScript and frontend development with React.
- Backend API services built with Node.js, Express, or Next.js.
- Hands-on experience querying PostgreSQL and designing scalable REST APIs.
- Familiarity with version control using Git.
Nice to have: Docker basics, automated testing.
"""
    },
    {
        "role": "Full-Stack Developer",
        "title": "Web Application Developer",
        "source": "kaggle_tech_jobs_2025",
        "text": """
Looking for a Full Stack Web Developer.
Must have:
- React and TypeScript expertise for responsive UI design.
- Node.js backend development, creating RESTful endpoints.
- Relational databases, specifically PostgreSQL.
- Git workflow with pull requests and code reviews.
"""
    },
    # --- Data Engineer ---
    {
        "role": "Data Engineer",
        "title": "Lead Data Platform Engineer",
        "source": "kaggle_tech_jobs_2025",
        "text": """
We are seeking a Data Engineer to design, implement, and maintain our batch and real-time data pipelines.
Responsibilities:
- Build scalable ETL pipelines using Python and Apache Spark.
- Orchestrate data workflows using Apache Airflow.
- Design dimensional and relational data models in PostgreSQL and enterprise data warehouses using SQL.
- Containerize data pipeline applications with Docker.
Qualifications:
- Solid background in Python and complex SQL query tuning.
- Production experience with Apache Spark, Airflow, and Data Modeling.
- Practical experience with Docker and PostgreSQL.
"""
    },
    {
        "role": "Data Engineer",
        "title": "Data Pipeline Engineer",
        "source": "kaggle_tech_jobs_2025",
        "text": """
Seeking a Data Engineer for big data analytics.
Requirements:
- Advanced Python programming and strong SQL skills.
- Experience with distributed computing using Apache Spark (PySpark).
- Workflow management and scheduler experience with Apache Airflow.
- Hands-on data modeling principles (star schema, snowflake) in PostgreSQL.
- Docker containers for reproducible local and cloud data pipelines.
"""
    },
    {
        "role": "Data Engineer",
        "title": "Junior Data Engineer",
        "source": "kaggle_tech_jobs_2025",
        "text": """
Exciting opportunity for a Data Engineer:
- Python and SQL scripting for data extraction and transformation.
- Assisting with Apache Spark pipelines and Airflow DAGs.
- Working with PostgreSQL database schemas and data modeling.
- Containerization with Docker.
"""
    },
    # --- Machine Learning Engineer ---
    {
        "role": "Machine Learning Engineer",
        "title": "ML Engineer (Computer Vision & NLP)",
        "source": "kaggle_tech_jobs_2025",
        "text": """
We are hiring a Machine Learning Engineer to build and deploy state-of-the-art predictive models.
Key duties:
- Develop deep learning models using Python and PyTorch.
- Baseline modeling with Scikit-learn and automated feature engineering.
- Implement production MLOps workflows including model tracking, evaluation, and registry.
- Package ML models into containerized microservices using Docker and Git.
- Construct robust data pipelines for data preprocessing and validation.
Requirements:
- Expert in Python, PyTorch, and Scikit-learn.
- Demonstrated experience with MLOps and automated Data Pipelines.
- Git for version control and Docker for deployments.
"""
    },
    {
        "role": "Machine Learning Engineer",
        "title": "Applied Machine Learning Specialist",
        "source": "kaggle_tech_jobs_2025",
        "text": """
Our AI team is expanding!
Requirements:
- Strong Python fundamentals and mathematical intuition.
- Deep learning framework proficiency: PyTorch.
- Classical machine learning with Scikit-learn.
- Production deployment: Docker, MLOps practices, and reliable data pipelines.
- Clean code and version control with Git.
"""
    },
    {
        "role": "Machine Learning Engineer",
        "title": "Production ML Engineer",
        "source": "kaggle_tech_jobs_2025",
        "text": """
Build production-grade machine learning systems:
- Python coding standards and testing.
- PyTorch model training and Scikit-learn pipelines.
- MLOps tooling and CI/CD for machine learning models.
- Containerization using Docker and version control using Git.
- Real-time data pipelines for inference.
"""
    },
    # --- Cloud / DevOps Engineer ---
    {
        "role": "Cloud / DevOps Engineer",
        "title": "DevOps & Infrastructure Automation Engineer",
        "source": "kaggle_tech_jobs_2025",
        "text": """
We are looking for a Cloud / DevOps Engineer to lead infrastructure as code and site reliability.
Responsibilities:
- Administer Linux servers, shell automation with Bash.
- Provision multi-cloud infrastructure on AWS / GCP using Terraform.
- Configure and manage containerized workloads on Kubernetes and Docker.
- Implement automated CI/CD pipelines for continuous integration and delivery.
Qualifications:
- Deep Linux system administration and Bash scripting.
- Production Kubernetes cluster administration and Docker container orchestration.
- Terraform infrastructure-as-code for AWS / GCP.
- Automated CI/CD pipeline creation (GitHub Actions, GitLab CI).
"""
    },
    {
        "role": "Cloud / DevOps Engineer",
        "title": "Cloud Platform Engineer",
        "source": "kaggle_tech_jobs_2025",
        "text": """
Seeking a Cloud Platform Engineer:
- Linux operating system internals and Bash scripting.
- Containerization with Docker and orchestration via Kubernetes.
- Infrastructure automation using Terraform on AWS / GCP clouds.
- Designing reliable CI/CD deployment pipelines.
"""
    },
    {
        "role": "Cloud / DevOps Engineer",
        "title": "Site Reliability / DevOps Engineer",
        "source": "kaggle_tech_jobs_2025",
        "text": """
Join our SRE team:
- Strong Linux command line experience and Bash scripting.
- Docker containers and Kubernetes clusters in production.
- Terraform for declarative cloud infrastructure on AWS or GCP.
- CI/CD automation for zero-downtime releases.
"""
    },
    # --- Rust Embedded Systems Engineer (Niche Role) ---
    {
        "role": "Rust Embedded Systems Engineer",
        "title": "Embedded Systems Engineer (Rust / C++)",
        "source": "kaggle_tech_jobs_2025",
        "text": """
We are pioneering safe systems programming for IoT hardware.
Responsibilities:
- Write memory-safe low-level firmware in Rust and modern C++.
- Develop real-time operating system applications with RTOS (FreeRTOS/Zephyr).
- Interface with microcontrollers (ARM Cortex-M, RISC-V) and hardware communication protocols (SPI, I2C, UART).
Qualifications:
- Solid experience in Rust and C++ for embedded development.
- In-depth understanding of RTOS scheduling, interrupt handling, and memory constraints.
"""
    },
    {
        "role": "Rust Embedded Systems Engineer",
        "title": "Firmware Engineer (Embedded Rust)",
        "source": "kaggle_tech_jobs_2025",
        "text": """
Looking for an Embedded Software Engineer:
- Developing bare-metal and RTOS applications using Rust and C++.
- Hardware bring-up and debugging on microcontrollers.
- Low-level concurrency and real-time deterministic execution.
"""
    }
]


def clean_text(text: str) -> str:
    """Normalizes whitespace and standardizes formatting."""
    text = re.sub(r"\r\n|\r", "\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    return "\n".join(lines)


def run_pipeline():
    print("=" * 60)
    print("STARTING JOB DATASET & EMBEDDINGS PIPELINE")
    print("=" * 60)

    # 1. Load taxonomy
    taxonomy_file = "contracts/taxonomy/skills.json"
    with open(taxonomy_file, "r", encoding="utf-8") as f:
        taxonomy_data = json.load(f)
    skills = taxonomy_data.get("skills", [])
    print(f"Loaded {len(skills)} taxonomy skills.")

    # 2. Clean and embed job postings
    cleaned_postings = []
    for raw in RAW_POSTINGS:
        cleaned_text = clean_text(raw["text"])
        posting_record = {
            "role": raw["role"],
            "title": raw.get("title", raw["role"]),
            "text": cleaned_text,
            "source": raw.get("source", "kaggle_tech_jobs_2025"),
            "retrieved_at": datetime.now(timezone.utc).isoformat()
        }
        cleaned_postings.append(posting_record)

    print(f"Cleaned {len(cleaned_postings)} job postings. Generating embeddings...")
    texts_to_embed = [p["text"] for p in cleaned_postings]
    embeddings = embed_batch(texts_to_embed)
    for p, emb in zip(cleaned_postings, embeddings):
        p["embedding"] = emb

    # Save job_postings.json
    out_postings_path = "intelligence/market_data/job_postings.json"
    with open(out_postings_path, "w", encoding="utf-8") as f:
        json.dump(cleaned_postings, f, indent=2)
    print(f"Saved {len(cleaned_postings)} embedded job postings to {out_postings_path}.")

    # 3. Compute skill frequencies and role requirements
    roles_list = sorted(list(set(p["role"] for p in cleaned_postings)))
    role_requirements = []

    for role in roles_list:
        role_postings = [p for p in cleaned_postings if p["role"] == role]
        total_p = len(role_postings)
        if total_p == 0:
            continue

        for skill in skills:
            s_id = skill["id"]
            names_to_check = [skill["canonical_name"].lower()] + [a.lower() for a in skill.get("aliases", [])]

            match_count = 0
            for p in role_postings:
                p_lower = p["text"].lower()
                matched = False
                for term in names_to_check:
                    # Match exact word or phrase boundary
                    pattern = r"(?:\b|_)" + re.escape(term) + r"(?:\b|_)"
                    if re.search(pattern, p_lower):
                        matched = True
                        break
                if matched:
                    match_count += 1

            if match_count > 0:
                freq = round(match_count / total_p, 3)
                role_requirements.append({
                    "role": role,
                    "skill_id": s_id,
                    "skill_name": skill["canonical_name"],
                    "frequency": freq,
                    "required_level": 2,  # Default level 2 (intermediate) per README Section 9.4
                    "snapshot_date": datetime.now(timezone.utc).strftime("%Y-%m-%d")
                })

    out_reqs_path = "intelligence/market_data/role_requirements.json"
    with open(out_reqs_path, "w", encoding="utf-8") as f:
        json.dump(role_requirements, f, indent=2)
    print(f"Computed and saved {len(role_requirements)} role requirements to {out_reqs_path}.")

    # 4. Embed Skills Taxonomy
    print("Generating embeddings for skills taxonomy...")
    skill_texts = [f"{s['canonical_name']}: {s.get('category', '')}. Aliases: {', '.join(s.get('aliases', []))}" for s in skills]
    skill_embeddings = embed_batch(skill_texts)
    for s, emb in zip(skills, skill_embeddings):
        s["embedding"] = emb

    # Save updated taxonomy with embeddings
    with open(taxonomy_file, "w", encoding="utf-8") as f:
        json.dump(taxonomy_data, f, indent=2)
    print(f"Updated {taxonomy_file} with {len(skills)} 384-dimensional embeddings.")

    print("=" * 60)
    print("JOB DATASET & EMBEDDINGS PIPELINE COMPLETE")
    print("=" * 60)
    return True


if __name__ == "__main__":
    run_pipeline()
