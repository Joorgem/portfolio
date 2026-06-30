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
    id: 4,
    title: "Fernanda Fiuza", // overwritten at render by translation; fallback only
    subDescription: [
      "Bilingual (PT/EN) portfolio for movement director and choreographer Fernanda Fiuza.",
      "Built with Next.js 15 App Router, Sanity CMS, and Mux adaptive video streaming.",
    ],
    href: "https://fernandafiuza.com",
    repositoryUrl: "#", // private repo -> hides the Code button
    logo: "", // value unused by Projects section
    image: "", // value unused by Projects section
    media: [
      {
        type: "video",
        src: "/assets/projects-optimized/fernanda-fiuza-demo-opt.mp4",
        alt: "Fernanda Fiuza portfolio — desktop walkthrough",
        category: "web",
        priority: 1,
      },
      {
        type: "video",
        src: "/assets/projects-optimized/fernanda-fiuza-mobile-opt.mp4",
        alt: "Fernanda Fiuza portfolio — mobile walkthrough",
        category: "mobile",
        priority: 1,
      },
    ],
    // tag id/path are unused by the Projects section (it renders the locale JSON tag name only);
    // paths point at existing logo files to avoid dead refs.
    tags: [
      { id: 40, name: "Next.js", path: "/assets/logos/nextjs.check.svg" },
      { id: 41, name: "TypeScript", path: "/assets/logos/typescript.svg" },
      { id: 42, name: "Sanity", path: "/assets/logos/react.svg" },
      { id: 43, name: "Mux", path: "/assets/logos/nodejs.svg" },
      { id: 44, name: "Tailwind", path: "/assets/logos/tailwindcss.svg" },
      { id: 45, name: "next-intl", path: "/assets/logos/vitejs.svg" },
      { id: 46, name: "Vercel", path: "/assets/logos/docker.svg" },
    ],
  },
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
    date: "2017 - 2023",
    contents: [
      "Formação em análise de processos industriais, modelagem matemática e otimização de sistemas.",
      "Primeiros projetos pessoais com automações Python para análise de dados e relatórios automatizados.",
      "Base sólida em pensamento sistemático e resolução de problemas complexos.",
    ],
  },
  {
    title: "Data Analyst Intern",
    job: "Novelis",
    date: "Mar 2020 - Feb 2021",
    contents: [
      "Consolidação de dados de Oracle, sistemas SQL/NoSQL, SAP e fontes IoT de chão de fábrica, contribuindo para ambiente analítico near real-time para monitoramento operacional.",
      "Desenvolvimento de scripts Python automatizados para ingestão, padronização e limpeza de dados, reduzindo trabalho manual em planilhas e acelerando atualizações de KPIs.",
      "Design e entrega de dashboards interativos em Power BI para tracking de eficiência de produção, downtime de máquinas e indicadores operacionais críticos.",
      "Implementação de regras de validação de dados, reconciliação e detecção de anomalias para melhorar acurácia e confiabilidade dos dados.",
      "Parceria com engenheiros e supervisores de planta para definir requisitos, documentar fontes de dados e manter dicionários de KPI.",
    ],
  },
  {
    title: "Data Engineer",
    job: "Santander Group",
    date: "Aug 2021 - Sep 2023",
    contents: [
      "Design e entrega de dashboards interativos em Power BI e pipelines de reporting automatizados usando Python, reduzindo esforço manual e expandindo analytics self-service.",
      "Integração e padronização de dados de SAP, APIs externas, bancos SQL e Azure Data Lake em ambiente analítico centralizado.",
      "Pipelines de processamento distribuído com PySpark e SparkSQL, melhorando performance sobre processos legados e acelerando insights para times de negócio.",
      "Arquiteturas Azure com Synapse Analytics, ADLS e Databricks para suportar reporting near real-time.",
      "Rotinas automatizadas de validação de dados, reconciliação e detecção de anomalias para melhorar acurácia e reduzir issues recorrentes.",
      "Criação e manutenção de dashboards de KPI para finanças, vendas e operações.",
      "Colaboração com stakeholders cross-funcionais para definir requisitos, manter dicionários de dados e documentar pipelines.",
    ],
  },
  {
    title: "Freelance Full-Stack Developer & AI Engineer",
    job: "Autônomo",
    date: "Mar 2022 - Present",
    contents: [
      "Entrega de aplicações full-stack baseadas em projetos usando TypeScript (React/Next.js, Node.js) e Python, com foco em qualidade de produto e entrega confiável.",
      "Construção de workflows habilitados por IA e aplicações baseadas em retrieval para casos de uso de conhecimento e automação, incluindo integrações LLM e structured outputs.",
      "Design de serviços backend, integrações de API, fluxos de autenticação e deploys em cloud em stacks web modernas.",
      "Criação de interfaces polidas e experiências web interativas, incluindo portfolio pessoal com engenharia frontend, motion e apresentação visual.",
      "Aplicação de práticas de teste, validação e monitoramento para melhorar estabilidade e confiabilidade geral do produto.",
    ],
  },
  {
    title: "Senior Data Engineer (Full-Stack & Data Products)",
    job: "Globant",
    date: "Sep 2023 - Jan 2026",
    contents: [
      "Desenvolvimento e operação de plataformas de ingestão de dados em larga escala usando Python, Azure Databricks, PySpark, Delta Lake e SQL.",
      "Design e otimização de workflows ETL/ELT orquestrados com Airflow e Azure Data Factory para datasets estruturados e semi-estruturados.",
      "Construção de frameworks de qualidade de dados, monitoramento e alertas, incluindo detecção de anomalias, schema drift e tracking de SLAs.",
      "Otimização de transformações SQL, estratégias de indexação e planos de query para workloads analíticos de alto volume.",
      "Automação backend e serviços com Python e Azure Functions para orquestrar fluxos de ingestão, retries e recuperação de falhas.",
      "Dashboards de observabilidade com Power BI e Elasticsearch/Kibana para monitorar freshness, saúde de pipelines e latência.",
      "Parceria com times de engenharia, produto e operações em entrega ágil, ownership de componentes de ingestão end-to-end.",
    ],
  },
  {
    title: "Senior Data Engineer",
    job: "CI&T",
    date: "Jan 2026 - Present",
    contents: [
      "Atuação em iniciativas de plataforma de dados enterprise e governança, apoiando implementação de infraestrutura de dados e controles de acesso em múltiplos ambientes.",
      "Contribuição com práticas de governança e segurança no Snowflake, incluindo RBAC, políticas de mascaramento e acesso controlado para datasets regulados.",
      "Suporte a onboarding de fontes e workflows de ingestão usando Fivetran, ADLS (Iceberg) e Snowflake para analytics e reporting.",
      "Melhoria de confiabilidade de CI/CD e consistência de deploys com GitHub Actions e práticas de configuração segura.",
      "Colaboração na manutenção da plataforma, documentação e resolução técnica para manter o ambiente estável, seguro e fácil de operar.",
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
