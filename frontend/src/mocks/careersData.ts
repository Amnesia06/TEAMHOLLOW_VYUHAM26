export interface CareerRole {
  id: string;
  title: string;
  category: string;
  description: string;
  marketDemand: string;
  averageSalary: string;
  topSkills: string[];
  openingsEstimate: string;
}

export const CAREER_ROLES: CareerRole[] = [
  {
    id: "role_fsd_01",
    title: "Full-Stack Developer",
    category: "Software Engineering",
    description: "Build end-to-end web architectures using modern TypeScript, React, Node.js, and relational PostgreSQL databases.",
    marketDemand: "High (82% posting match)",
    averageSalary: "$115,000 / ₹18-28 LPA",
    topSkills: ["TypeScript", "React", "Node.js", "Next.js", "PostgreSQL", "REST APIs", "Git"],
    openingsEstimate: "14,200+ active roles"
  },
  {
    id: "role_de_02",
    title: "Data Engineer",
    category: "Data & Analytics",
    description: "Construct scalable data pipelines, ETL workflows, and analytical infrastructure using Apache Spark, Airflow, and SQL.",
    marketDemand: "Very High (88% posting match)",
    averageSalary: "$125,000 / ₹20-32 LPA",
    topSkills: ["Python", "SQL", "Apache Spark", "Airflow", "PostgreSQL", "Data Modeling", "Docker"],
    openingsEstimate: "9,800+ active roles"
  },
  {
    id: "role_mle_03",
    title: "Machine Learning Engineer",
    category: "Artificial Intelligence",
    description: "Train, evaluate, and deploy deep learning models and MLOps container pipelines using PyTorch and Scikit-learn.",
    marketDemand: "Rapid Growth (91% posting match)",
    averageSalary: "$138,000 / ₹24-38 LPA",
    topSkills: ["Python", "PyTorch", "Scikit-learn", "MLOps", "Docker", "Git", "Data Pipelines"],
    openingsEstimate: "7,400+ active roles"
  },
  {
    id: "role_devops_04",
    title: "Cloud / DevOps Engineer",
    category: "Infrastructure & Platform",
    description: "Architect cloud infrastructure as code (IaC), CI/CD pipelines, and Kubernetes container clusters on AWS and GCP.",
    marketDemand: "Very High (85% posting match)",
    averageSalary: "$130,000 / ₹22-35 LPA",
    topSkills: ["Linux", "Docker", "Kubernetes", "Terraform", "AWS / GCP", "CI/CD", "Bash"],
    openingsEstimate: "11,500+ active roles"
  },
  {
    id: "role_embedded_05",
    title: "Rust Embedded Systems Engineer",
    category: "Systems & IoT",
    description: "Pioneer memory-safe embedded firmware, microcontrollers, and real-time operating systems using Rust and modern C++.",
    marketDemand: "Niche High Demand (78% posting match)",
    averageSalary: "$142,000 / ₹25-42 LPA",
    topSkills: ["Rust", "C++", "RTOS", "Microcontrollers", "Hardware Protocols", "Linux"],
    openingsEstimate: "2,100+ active roles"
  }
];

