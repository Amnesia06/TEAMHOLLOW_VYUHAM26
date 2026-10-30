import { Course } from "../types/contracts";

export const CATALOG_COURSES: Course[] = [
  {
    "id": "res_py_01",
    "title": "Python for Everybody Specialization",
    "platform": "freeCodeCamp",
    "url": "https://www.freecodecamp.org/learn/scientific-computing-with-python/",
    "cost": 0.0,
    "currency": "USD",
    "hours": 35.0,
    "level": 1,
    "skills_covered": [
      "skill_python",
      "skill_dsa"
    ],
    "prerequisite_skills": [],
    "verified": false
  },
  {
    "id": "res_py_02",
    "title": "Official Python Documentation & Tutorial",
    "platform": "Python Software Foundation",
    "url": "https://docs.python.org/3/tutorial/",
    "cost": 0.0,
    "currency": "USD",
    "hours": 15.0,
    "level": 1,
    "skills_covered": [
      "skill_python"
    ],
    "prerequisite_skills": [],
    "verified": false
  },
  {
    "id": "res_math_01",
    "title": "Essence of Linear Algebra",
    "platform": "3Blue1Brown",
    "url": "https://www.3blue1brown.com/topics/linear-algebra",
    "cost": 0.0,
    "currency": "USD",
    "hours": 8.0,
    "level": 1,
    "skills_covered": [
      "skill_linear_algebra"
    ],
    "prerequisite_skills": [],
    "verified": false
  },
  {
    "id": "res_math_02",
    "title": "Essence of Calculus",
    "platform": "3Blue1Brown",
    "url": "https://www.3blue1brown.com/topics/calculus",
    "cost": 0.0,
    "currency": "USD",
    "hours": 6.0,
    "level": 1,
    "skills_covered": [
      "skill_calculus"
    ],
    "prerequisite_skills": [],
    "verified": false
  },
  {
    "id": "res_math_03",
    "title": "MIT 18.06 Linear Algebra (Gilbert Strang)",
    "platform": "MIT OpenCourseWare",
    "url": "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/",
    "cost": 0.0,
    "currency": "USD",
    "hours": 35.0,
    "level": 2,
    "skills_covered": [
      "skill_linear_algebra",
      "skill_math_optimization"
    ],
    "prerequisite_skills": [],
    "verified": false
  },
  {
    "id": "res_math_04",
    "title": "Khan Academy Statistics and Probability",
    "platform": "Khan Academy",
    "url": "https://www.khanacademy.org/math/statistics-probability",
    "cost": 0.0,
    "currency": "USD",
    "hours": 25.0,
    "level": 1,
    "skills_covered": [
      "skill_probability_stats"
    ],
    "prerequisite_skills": [],
    "verified": false
  },
  {
    "id": "res_dsa_01",
    "title": "Data Structures & Algorithms Course",
    "platform": "freeCodeCamp",
    "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
    "cost": 0.0,
    "currency": "USD",
    "hours": 40.0,
    "level": 2,
    "skills_covered": [
      "skill_dsa",
      "skill_algorithms"
    ],
    "prerequisite_skills": [
      "skill_python"
    ],
    "verified": false
  },
  {
    "id": "res_dsa_02",
    "title": "Graph Algorithms for Technical Interviews",
    "platform": "freeCodeCamp",
    "url": "https://www.youtube.com/watch?v=tWVWeAqZ0WU",
    "cost": 0.0,
    "currency": "USD",
    "hours": 8.0,
    "level": 2,
    "skills_covered": [
      "skill_graph_algorithms"
    ],
    "prerequisite_skills": [
      "skill_dsa"
    ],
    "verified": false
  },
  {
    "id": "res_ml_01",
    "title": "Machine Learning Specialization by Andrew Ng",
    "platform": "Coursera (Audit Mode)",
    "url": "https://www.coursera.org/specializations/machine-learning-introduction",
    "cost": 0.0,
    "currency": "USD",
    "hours": 45.0,
    "level": 2,
    "skills_covered": [
      "skill_ml_fundamentals",
      "skill_linear_algebra"
    ],
    "prerequisite_skills": [
      "skill_python",
      "skill_linear_algebra"
    ],
    "verified": false
  },
  {
    "id": "res_ml_02",
    "title": "Scikit-Learn User Guide & Getting Started",
    "platform": "Scikit-learn Documentation",
    "url": "https://scikit-learn.org/stable/user_guide.html",
    "cost": 0.0,
    "currency": "USD",
    "hours": 15.0,
    "level": 2,
    "skills_covered": [
      "skill_scikit_learn",
      "skill_ml_fundamentals"
    ],
    "prerequisite_skills": [
      "skill_python"
    ],
    "verified": false
  },
  {
    "id": "res_dl_01",
    "title": "Deep Learning with PyTorch: A 60 Minute Blitz",
    "platform": "PyTorch Official",
    "url": "https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html",
    "cost": 0.0,
    "currency": "USD",
    "hours": 4.0,
    "level": 2,
    "skills_covered": [
      "skill_pytorch"
    ],
    "prerequisite_skills": [
      "skill_python",
      "skill_ml_fundamentals"
    ],
    "verified": false
  },
  {
    "id": "res_dl_02",
    "title": "Practical Deep Learning for Coders",
    "platform": "Fast.ai",
    "url": "https://course.fast.ai/",
    "cost": 0.0,
    "currency": "USD",
    "hours": 50.0,
    "level": 2,
    "skills_covered": [
      "skill_pytorch",
      "skill_ml_fundamentals"
    ],
    "prerequisite_skills": [
      "skill_python"
    ],
    "verified": false
  },
  {
    "id": "res_ts_01",
    "title": "TypeScript for JavaScript Programmers",
    "platform": "TypeScript Official Docs",
    "url": "https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html",
    "cost": 0.0,
    "currency": "USD",
    "hours": 10.0,
    "level": 2,
    "skills_covered": [
      "skill_typescript"
    ],
    "prerequisite_skills": [
      "skill_javascript"
    ],
    "verified": false
  },
  {
    "id": "res_react_01",
    "title": "React Official Documentation & Interactive Quick Start",
    "platform": "React.dev",
    "url": "https://react.dev/learn",
    "cost": 0.0,
    "currency": "USD",
    "hours": 20.0,
    "level": 2,
    "skills_covered": [
      "skill_react"
    ],
    "prerequisite_skills": [
      "skill_javascript",
      "skill_html_css"
    ],
    "verified": false
  },
  {
    "id": "res_next_01",
    "title": "Next.js Official Learn Course",
    "platform": "Nextjs.org",
    "url": "https://nextjs.org/learn",
    "cost": 0.0,
    "currency": "USD",
    "hours": 16.0,
    "level": 2,
    "skills_covered": [
      "skill_nextjs"
    ],
    "prerequisite_skills": [
      "skill_react",
      "skill_typescript"
    ],
    "verified": false
  },
  {
    "id": "res_node_01",
    "title": "Node.js Complete Guide",
    "platform": "freeCodeCamp",
    "url": "https://www.freecodecamp.org/news/free-nodejs-course/",
    "cost": 0.0,
    "currency": "USD",
    "hours": 15.0,
    "level": 2,
    "skills_covered": [
      "skill_nodejs",
      "skill_rest_apis"
    ],
    "prerequisite_skills": [
      "skill_javascript"
    ],
    "verified": false
  },
  {
    "id": "res_sql_01",
    "title": "SQL Tutorial for Beginners",
    "platform": "Mode Analytics",
    "url": "https://mode.com/sql-tutorial/",
    "cost": 0.0,
    "currency": "USD",
    "hours": 10.0,
    "level": 1,
    "skills_covered": [
      "skill_sql"
    ],
    "prerequisite_skills": [],
    "verified": false
  },
  {
    "id": "res_pg_01",
    "title": "PostgreSQL Tutorial & pgvector Extension Setup",
    "platform": "PostgreSQL Community",
    "url": "https://www.postgresqltutorial.com/",
    "cost": 0.0,
    "currency": "USD",
    "hours": 12.0,
    "level": 2,
    "skills_covered": [
      "skill_postgresql",
      "skill_pgvector"
    ],
    "prerequisite_skills": [
      "skill_sql"
    ],
    "verified": false
  },
  {
    "id": "res_spark_01",
    "title": "Apache Spark & PySpark Documentation Tutorial",
    "platform": "Apache Spark",
    "url": "https://spark.apache.org/docs/latest/api/python/getting_started/index.html",
    "cost": 0.0,
    "currency": "USD",
    "hours": 20.0,
    "level": 2,
    "skills_covered": [
      "skill_spark"
    ],
    "prerequisite_skills": [
      "skill_python",
      "skill_sql"
    ],
    "verified": false
  },
  {
    "id": "res_airflow_01",
    "title": "Apache Airflow Fundamentals Tutorial",
    "platform": "Apache Airflow",
    "url": "https://airflow.apache.org/docs/apache-airflow/stable/tutorial/index.html",
    "cost": 0.0,
    "currency": "USD",
    "hours": 15.0,
    "level": 2,
    "skills_covered": [
      "skill_airflow",
      "skill_data_pipelines"
    ],
    "prerequisite_skills": [
      "skill_python"
    ],
    "verified": false
  },
  {
    "id": "res_docker_01",
    "title": "Docker for Beginners",
    "platform": "freeCodeCamp",
    "url": "https://www.youtube.com/watch?v=fqMOX6JJhGo",
    "cost": 0.0,
    "currency": "USD",
    "hours": 6.0,
    "level": 1,
    "skills_covered": [
      "skill_docker"
    ],
    "prerequisite_skills": [
      "skill_linux"
    ],
    "verified": false
  },
  {
    "id": "res_k8s_01",
    "title": "Kubernetes Interactive Bootcamp & Tutorials",
    "platform": "Kubernetes.io",
    "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/",
    "cost": 0.0,
    "currency": "USD",
    "hours": 18.0,
    "level": 2,
    "skills_covered": [
      "skill_kubernetes"
    ],
    "prerequisite_skills": [
      "skill_docker"
    ],
    "verified": false
  },
  {
    "id": "res_terraform_01",
    "title": "Terraform HashiCorp Learn Tutorials",
    "platform": "HashiCorp Learn",
    "url": "https://developer.hashicorp.com/terraform/tutorials",
    "cost": 0.0,
    "currency": "USD",
    "hours": 14.0,
    "level": 2,
    "skills_covered": [
      "skill_terraform"
    ],
    "prerequisite_skills": [
      "skill_cloud_aws_gcp"
    ],
    "verified": false
  },
  {
    "id": "res_linux_01",
    "title": "The Missing Semester of Your CS Education",
    "platform": "MIT",
    "url": "https://missing.csail.mit.edu/",
    "cost": 0.0,
    "currency": "USD",
    "hours": 20.0,
    "level": 1,
    "skills_covered": [
      "skill_linux",
      "skill_bash",
      "skill_git"
    ],
    "prerequisite_skills": [],
    "verified": false
  },
  {
    "id": "res_rust_01",
    "title": "The Rust Programming Language (The Book)",
    "platform": "Rust Official",
    "url": "https://doc.rust-lang.org/book/",
    "cost": 0.0,
    "currency": "USD",
    "hours": 30.0,
    "level": 2,
    "skills_covered": [
      "skill_rust"
    ],
    "prerequisite_skills": [
      "skill_cpp"
    ],
    "verified": false
  },
  {
    "id": "res_embedded_01",
    "title": "Embedded Systems - Shape the World",
    "platform": "edX / UT Austin",
    "url": "https://www.edx.org/course/embedded-systems-shape-the-world",
    "cost": 0.0,
    "currency": "USD",
    "hours": 40.0,
    "level": 2,
    "skills_covered": [
      "skill_embedded_systems",
      "skill_microcontrollers",
      "skill_hw_protocols"
    ],
    "prerequisite_skills": [
      "skill_cpp"
    ],
    "verified": false
  },
  {
    "id": "res_dm_01",
    "title": "Database Design and Relational Data Modeling",
    "platform": "freeCodeCamp",
    "url": "https://www.freecodecamp.org/news/relational-database-design/",
    "cost": 0.0,
    "currency": "USD",
    "hours": 12.0,
    "level": 2,
    "skills_covered": [
      "skill_data_modeling"
    ],
    "prerequisite_skills": [
      "skill_sql"
    ],
    "verified": false
  },
  {
    "id": "res_mlops_01",
    "title": "Made With ML: Production MLOps Course",
    "platform": "Made With ML",
    "url": "https://madewithml.com/",
    "cost": 0.0,
    "currency": "USD",
    "hours": 20.0,
    "level": 2,
    "skills_covered": [
      "skill_mlops",
      "skill_data_pipelines"
    ],
    "prerequisite_skills": [
      "skill_python",
      "skill_docker"
    ],
    "verified": false
  },
  {
    "id": "res_cloud_01",
    "title": "AWS Cloud Practitioner Essentials",
    "platform": "AWS Skill Builder",
    "url": "https://explore.skillbuilder.aws/learn/course/external/view/elearning/134/aws-cloud-practitioner-essentials",
    "cost": 0.0,
    "currency": "USD",
    "hours": 16.0,
    "level": 1,
    "skills_covered": [
      "skill_cloud_aws_gcp"
    ],
    "prerequisite_skills": [
      "skill_linux"
    ],
    "verified": false
  },
  {
    "id": "res_cicd_01",
    "title": "GitHub Actions and CI/CD Pipelines Tutorial",
    "platform": "GitHub Docs / freeCodeCamp",
    "url": "https://docs.github.com/en/actions/learn-github-actions",
    "cost": 0.0,
    "currency": "USD",
    "hours": 10.0,
    "level": 2,
    "skills_covered": [
      "skill_cicd"
    ],
    "prerequisite_skills": [
      "skill_git",
      "skill_linux"
    ],
    "verified": false
  },
  {
    "id": "res_cpp_01",
    "title": "C++ Programming Course - Beginner to Advanced",
    "platform": "freeCodeCamp",
    "url": "https://www.freecodecamp.org/news/learn-c-with-free-31-hour-course/",
    "cost": 0.0,
    "currency": "USD",
    "hours": 30.0,
    "level": 1,
    "skills_covered": [
      "skill_cpp"
    ],
    "prerequisite_skills": [],
    "verified": false
  },
  {
    "id": "res_rtos_01",
    "title": "FreeRTOS Real-Time Kernel Tutorial & Guide",
    "platform": "FreeRTOS.org",
    "url": "https://www.freertos.org/Documentation/RTOS_book.html",
    "cost": 0.0,
    "currency": "USD",
    "hours": 18.0,
    "level": 2,
    "skills_covered": [
      "skill_rtos"
    ],
    "prerequisite_skills": [
      "skill_cpp"
    ],
    "verified": false
  }
];
