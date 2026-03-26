// Types for project data structure
export interface ProjectTag {
  id: number;
  name: string;
  path: string;
}

export interface ProjectMedia {
  type: "image" | "gif" | "video";
  src: string;
  alt: string;
  thumbnail?: string; // For videos
  description?: string;
  category: "web" | "mobile" | "admin" | "features" | "api" | "architecture";
  priority?: number; // For ordering within the category
}

export interface Project {
  id: number;
  title: string;
  subDescription: string[];
  href: string;
  repositoryUrl?: string;
  logo: string;
  image: string; // Maintained for compatibility
  media: ProjectMedia[]; // Array of media (GIFs, videos, images)
  tags: ProjectTag[];
}

export interface Social {
  name: string;
  href: string;
  icon: string;
}

export interface Experience {
  title: string;
  job: string;
  date: string;
  contents: string[];
}

export interface Course {
  title: string;
  institution: string;
  period: string;
  description: string;
  type: "course" | "certification" | "extracurricular";
  technologies?: string[];
  link?: string;
  logo: string;
}

export const myProjects: Project[] = [
  {
    id: 1,
    title: "SOLTO®",
    subDescription: [
      "E-commerce platform built with Next.js 14, TypeScript and Drizzle ORM.",
      "Complete administrative panel with product, order, customer, promotion, collection management and real-time analytics.",
      "Optimized checkout with multiple payment methods and automatic shipping calculation.",
      "Responsive and modern design with Tailwind CSS, optimized for all devices.",
      "Scalable architecture with SSR/SSG, intelligent caching and React Query.",
    ],
    href: "https://solto-shop.vercel.app/",
    repositoryUrl: "#",
    logo: "/assets/logos/solto-logo.png",
    image: "/assets/projects/solto-homepage.jpg",
    media: [
      {
        type: "video",
        src: "/assets/projects-optimized/solto-demo-opt.mp4",
        alt: "SOLTO Demo - complete navigation",
        category: "web",
        priority: 1,
      },
      {
        type: "video",
        src: "/assets/projects-optimized/solto-mobile-opt.mp4",
        alt: "Responsive mobile interface",
        category: "mobile",
        priority: 1,
      },
      {
        type: "video",
        src: "/assets/projects-optimized/solto-admin-opt.mp4",
        alt: "SOLTO administrative panel",
        category: "admin",
        priority: 1,
      },
    ],
    tags: [
      { id: 1, name: "Next.js", path: "/assets/logos/nextjs.svg" },
      { id: 2, name: "TypeScript", path: "/assets/logos/typescript.svg" },
      { id: 3, name: "Drizzle ORM", path: "/assets/logos/drizzle.svg" },
      { id: 4, name: "React Query", path: "/assets/logos/react-query.svg" },
      { id: 5, name: "Tailwind", path: "/assets/logos/tailwindcss.svg" },
      { id: 6, name: "PostgreSQL", path: "/assets/logos/postgresql.svg" },
      { id: 7, name: "Vercel", path: "/assets/logos/vercel.svg" },
      { id: 8, name: "Stripe", path: "/assets/logos/stripe.svg" },
    ],
  },
  {
    id: 2,
    title: "Immersive Portifolio",
    subDescription: [
      "3D interactive portfolio with spatial navigation using Three.js and React Three Fiber.",
      "Complex state management system with Zustand for seamless transitions between sections.",
      "Advanced animations with Framer Motion, GSAP and custom interactive particles.",
      "Modern TypeScript architecture with Vite, Tailwind CSS 4.0 and mobile-first responsive design.",
    ],
    href: "https://jorgemolina.dev/",
    repositoryUrl: "https://github.com/Joorgem/portfolio",
    logo: "",
    image: "/assets/projects/portfolio-3d.jpg",
    media: [
      {
        type: "video",
        src: "/assets/projects-optimized/portifolio3d-demo-opt.mp4",
        alt: "3D Portfolio navigation demo",
        category: "web",
        priority: 1,
      },
      {
        type: "video",
        src: "/assets/projects-optimized/portifolio3d-mobile-opt.mp4",
        alt: "3D Portfolio mobile interface",
        category: "mobile",
        priority: 1,
      },
    ],
    tags: [
      { id: 17, name: "React 19", path: "/assets/logos/react.svg" },
      { id: 18, name: "TypeScript", path: "/assets/logos/typescript.svg" },
      { id: 19, name: "Three.js", path: "/assets/logos/threejs.svg" },
      { id: 20, name: "Vite", path: "/assets/logos/vite.svg" },
      { id: 21, name: "Tailwind CSS", path: "/assets/logos/tailwindcss.svg" },
      { id: 22, name: "Framer Motion", path: "/assets/logos/framer.svg" },
      { id: 23, name: "Zustand", path: "/assets/logos/zustand.svg" },
      { id: 24, name: "EmailJS", path: "/assets/logos/emailjs.svg" },
    ],
  },
  {
    id: 3,
    title: "StoreHub",
    subDescription: [
      "Corporate system for CNPJ consultation and registration developed for Reckitt with React 18, TypeScript and Vite.",
      "Hybrid authentication system with Microsoft MSAL (Azure AD) for production and mock provider for development.",
      "Individual and batch CNPJ consultation, new client registration, existing data editing and CSV import functionality.",
      "Backend API with Node.js handling data validation with Zod and comprehensive error handling middleware.",
      "Azure Static Web Apps deployment with CI/CD pipeline, automated testing suite with Playwright and PowerShell scripts.",
    ],
    href: "#",
    repositoryUrl: "#",
    logo: "",
    image: "/assets/projects/storehub-dashboard.jpg",
    media: [
      {
        type: "video",
        src: "/assets/projects-optimized/storehub-demo-opt.mp4",
        alt: "StoreHub system demonstration",
        category: "web",
        priority: 1,
      },
    ],
    tags: [
      { id: 13, name: "React 18", path: "/assets/logos/react.svg" },
      { id: 14, name: "TypeScript", path: "/assets/logos/typescript.svg" },
      { id: 26, name: "Vite", path: "/assets/logos/vite.svg" },
      { id: 16, name: "Azure AD", path: "/assets/logos/azure.svg" },
      { id: 29, name: "Node.js", path: "/assets/logos/nodejs.svg" },
      { id: 30, name: "Tailwind", path: "/assets/logos/tailwindcss.svg" },
      { id: 31, name: "Playwright", path: "/assets/logos/playwright.svg" },
      { id: 32, name: "Axios", path: "/assets/logos/axios.svg" },
    ],
  },
];

export const experiences: Experience[] = [
  {
    title: "Engenharia Química",
    job: "Universidade de São Paulo (USP)",
    date: "2017-2023",
    contents: [
      "Formação em análise de processos industriais, modelagem matemática e otimização de sistemas.",
      "Primeiros projetos pessoais com automações Python para análise de dados e relatórios automatizados.",
      "Experiência em controle de qualidade e metodologias de validação em laboratórios.",
      "Base sólida em pensamento sistemático e resolução de problemas complexos.",
    ],
  },
  {
    title: "Data Analyst Intern",
    job: "Novelis",
    date: "Mar 2020 - Feb 2021",
    contents: [
      "Consolidação de dados de Oracle, SQL/NoSQL, SAP e fontes IoT de chão de fábrica para monitoramento operacional em tempo real.",
      "Desenvolvimento de scripts Python automatizados para ingestão, padronização e limpeza de dados, reduzindo trabalho manual em ~60%.",
      "Criação de dashboards interativos em Power BI para tracking de eficiência de produção e indicadores operacionais críticos.",
      "Implementação de regras de validação, reconciliação e detecção de anomalias, elevando a acurácia dos dados para 95%+.",
    ],
  },
  {
    title: "Data Engineer",
    job: "Santander Group",
    date: "Aug 2021 - Sep 2023",
    contents: [
      "Criação de dashboards interativos em Power BI e pipelines de relatórios automatizados com Python, reduzindo esforço manual em ~70%.",
      "Integração e padronização de dados de SAP, APIs externas, bancos SQL e Azure Data Lake em ambiente analítico centralizado.",
      "Pipelines de processamento distribuído com PySpark e SparkSQL, melhorando performance 3-5x sobre processos legados.",
      "Arquiteturas Azure com Synapse Analytics, ADLS e Databricks para reportes near real-time.",
    ],
  },
  {
    title: "Senior Full-Stack Developer & AI Engineer",
    job: "Freelancer",
    date: "Mar 2022 - Present",
    contents: [
      "Entrega de sistemas de produção com Python e SQL, projetando APIs escaláveis e camadas de processamento suportando 10K+ requests/dia.",
      "Pipelines de dados escaláveis com Airflow e Databricks/PySpark (batch e streaming), reduzindo ciclos de refresh em até 80%.",
      "Plataformas cloud-native em Azure, AWS e GCP com Docker, Kubernetes e Terraform, reduzindo custos de infraestrutura em ~35%.",
      "Monitoramento e observabilidade para sistemas de dados e IA com LangSmith e Datadog.",
    ],
  },
  {
    title: "Senior Data Engineer (Full-Stack & Data Products)",
    job: "Globant",
    date: "Sep 2023 - Jan 2026",
    contents: [
      "Plataformas de ingestão e transformação em larga escala com Python, Azure Databricks, PySpark, Delta Lake e SQL, processando 10M+ registros/mês.",
      "Pipelines ETL/ELT distribuídos orquestrados com Airflow e Azure Data Factory, reduzindo esforço manual de integração em ~80%.",
      "Frameworks de validação, monitoramento e alertas incluindo detecção de anomalias, schema drift e tracking de SLAs.",
      "Otimização de queries SQL e estratégias de indexação, reduzindo tempo de execução de ~18s para menos de 3s.",
    ],
  },
  {
    title: "Senior Data Engineer",
    job: "CI&T",
    date: "Jan 2026 - Present",
    contents: [
      "Fundações de plataforma de dados enterprise codificando infraestrutura e controles de governança com Pulumi (TypeScript) em múltiplos ambientes.",
      "Controles de privacidade by-design no Snowflake (políticas de mascaramento PII com hashing determinístico).",
      "Pipelines de ingestão end-to-end com CDC via Fivetran para ADLS (Iceberg) e Snowflake (volumes externos, integração de catálogo).",
      "Hardening de CI/CD com GitHub Actions reusáveis, gates de ambiente e credenciais por conector.",
    ],
  },
];

export const courses: Course[] = [
  {
    title: "LangChain- Agentic AI Engineering with LangChain & LangGraph",
    institution: "Udemy - Eden Marco",
    period: "2025",
    description:
      "Aplicações LLM production-ready com LangChain e LangGraph: AI agents, RAG systems, tool calling, structured outputs e orquestração de workflows multi-step.",
    type: "course",
    technologies: ["LangChain", "LangGraph", "RAG", "AI Agents"],
    link: "https://www.udemy.com/course/langchain/",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  },
  {
    title: "Snowflake - The Complete Masterclass",
    institution: "Udemy - Nikolai Schuler",
    period: "2025",
    description:
      "Snowflake completo: arquitetura, data warehousing, data loading, time travel, data sharing, tasks, streams, access management e performance optimization.",
    type: "course",
    technologies: ["Snowflake", "SQL", "Data Warehousing", "ETL"],
    link: "https://www.udemy.com/course/snowflake-masterclass/",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azuresqldatabase/azuresqldatabase-original.svg",
  },
  {
    title: "Spark and Python for Big Data with PySpark",
    institution: "Udemy - Jose Portilla",
    period: "2025",
    description:
      "Big Data com PySpark: DataFrames, Spark SQL, Spark Streaming, MLlib para machine learning e projetos reais de classificação e análise.",
    type: "course",
    technologies: ["PySpark", "Spark SQL", "Big Data", "MLlib"],
    link: "https://www.udemy.com/course/spark-and-python-for-big-data-with-pyspark/",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apachespark/apachespark-original.svg",
  },
  {
    title: "Formação em Next.js",
    institution: "Full Stack Club - Felipe Rocha",
    period: "2025",
    description:
      "Formação completa em Next.js com 30+ horas: SSR/SSG, autenticação NextAuth, Prisma, PostgreSQL, shadcn/ui e projetos e-commerce em produção.",
    type: "extracurricular",
    technologies: ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
    link: "https://www.fullstackclub.com.br/formacaoemnext",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
  },
  {
    title: "Apache Airflow: The Hands-On Guide",
    institution: "Udemy - Marc Lamberti",
    period: "2024",
    description:
      "Orquestração de pipelines com Apache Airflow: DAGs, TaskFlow API, XCOMs, sensores, hooks, scaling com Celery/Kubernetes executors e RBAC security.",
    type: "course",
    technologies: ["Airflow", "Python", "Data Pipelines", "ETL"],
    link: "https://www.udemy.com/course/the-ultimate-hands-on-course-to-master-apache-airflow/",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apacheairflow/apacheairflow-original.svg",
  },
  {
    title: "HashiCorp Certified: Terraform Associate",
    institution: "Udemy - Bryan Krausen",
    period: "2024",
    description:
      "Terraform com labs práticos: módulos, workspaces, remote state, provider versioning, sensitive data e preparação para certificação HashiCorp.",
    type: "course",
    technologies: ["Terraform", "IaC", "AWS", "DevOps"],
    link: "https://www.udemy.com/course/hashicorp-certified-terraform-associate-004/",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/terraform/terraform-original.svg",
  },
  {
    title: "TypeScript Masterclass 2025 Edition",
    institution: "Udemy - Manik (Cloudaffle)",
    period: "2024",
    description:
      "TypeScript V5 com Full Stack: interfaces, generics, decorators, conditional types e projeto completo com React, ShadcnUI, Node.js e MongoDB.",
    type: "course",
    technologies: ["TypeScript", "React", "Node.js", "MongoDB"],
    link: "https://www.udemy.com/course/typescript-course/",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  },
  {
    title: "Docker: Do Básico ao Avançado",
    institution: "Udemy",
    period: "2024",
    description:
      "Containerização com Docker: imagens, containers, Dockerfile, multistaging, Docker Compose, Docker Swarm e deploy de aplicações distribuídas.",
    type: "course",
    technologies: ["Docker", "Docker Compose", "Docker Swarm", "Containers"],
    link: "https://www.udemy.com/course/docker-basico-ao-avancado/",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
  },
  {
    title: "Ultimate AWS Certified Cloud Practitioner CLF-C02",
    institution: "Udemy - Stephane Maarek",
    period: "2024",
    description:
      "Fundamentos AWS cobrindo EC2, S3, RDS, Lambda, IAM, CloudFormation e preparação para certificação Cloud Practitioner CLF-C02.",
    type: "course",
    technologies: ["AWS", "EC2", "S3", "Lambda", "IAM"],
    link: "https://www.udemy.com/course/aws-certified-cloud-practitioner-new/",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
  },
  {
    title: "Inteligência Artificial e Agentes Inteligentes",
    institution: "Alura",
    period: "2024",
    description:
      "IA, agentes inteligentes, redes neurais, processamento de linguagem natural e implementação de chatbots com Python.",
    type: "course",
    technologies: ["Python", "AI", "Agents", "NLP"],
    link: "https://alura.com.br",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  },
  {
    title: "Python para Ciência de Dados",
    institution: "Alura",
    period: "2022",
    description:
      "Formação em Python focada em análise de dados, pandas, numpy, matplotlib e machine learning com scikit-learn.",
    type: "course",
    technologies: ["Python", "Pandas", "NumPy", "Machine Learning"],
    link: "https://alura.com.br",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  },
  {
    title: "Complete Python Bootcamp",
    institution: "Udemy - Jose Portilla",
    period: "2021",
    description:
      "Python completo: fundamentos, POO, manipulação de dados, APIs e desenvolvimento web com Flask/Django.",
    type: "course",
    technologies: ["Python", "Flask", "Django", "APIs"],
    link: "https://udemy.com",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  },
];
