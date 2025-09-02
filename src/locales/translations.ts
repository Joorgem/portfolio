import { Language } from '../contexts/LanguageContext';

// Type definitions for translations structure
export interface ExperienceTranslation {
  title: string;
  job: string;
  date: string;
  contents: string[];
}

export interface CommonTranslations {
  languageToggle: {
    ariaLabel: string;
  };
}

export interface CourseTranslation {
  title: string;
  institution: string;
  period: string;
  description: string;
  type: 'course' | 'certification' | 'extracurricular';
  technologies: string[];
  link?: string;
  logo: string;
}

export interface ProjectTranslation {
  title: string;
  subDescription: string[];
  tags: { name: string; }[];
}

export interface ProjectsTranslations {
  sectionTitle: string;
  sectionSubtitle: string;
  scrollText: string;
  endText: string;
  labels: {
    technologies: string;
    links: string;
    viewProject: string;
    code: string;
    viewDetails: string;
    projectDetails: string;
  };
  projects: ProjectTranslation[];
}

export interface CoursesTranslations {
  sectionTitle: string;
  courses: CourseTranslation[];
  typeLabels: {
    course: string;
    certification: string;
    extracurricular: string;
  };
}

export interface ExperiencesTranslations {
  sectionTitle: string;
  experiences: ExperienceTranslation[];
}

export interface Translations {
  common: CommonTranslations;
  experiences: ExperiencesTranslations;
  courses: CoursesTranslations;
  projects: ProjectsTranslations;
}

// Portuguese translations
const ptTranslations: Translations = {
  common: {
    languageToggle: {
      ariaLabel: 'Alterar idioma',
    },
  },
  experiences: {
    sectionTitle: 'Minha Experiência Profissional',
    experiences: [
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
        title: "Summer Finance Internship",
        job: "Isaac - Fintech",
        date: "Jan - Mar 2021",
        contents: [
          "Primeiras automações em Python para processos ETL em bases de dados financeiros de escolas particulares.",
          "Normalização e transformação de dados para integração com sistemas ERP corporativos.",
          "Início da jornada em programação através de análise de dados e manipulação de grandes volumes de informações.",
        ],
      },
      {
        title: "Estagiário em Excelência Operacional",
        job: "Novelis",
        date: "2021 - 2022",
        contents: [
          "Desenvolvimento de dashboards automatizados em Python para monitoramento do sistema WCM (World Class Manufacturing).",
          "Integração de múltiplas fontes de dados para geração de relatórios em tempo real sobre performance operacional.",
          "Automação de processos de coleta e análise de dados para suporte aos times de manutenção autônoma.",
        ],
      },
      {
        title: "Analista de Business Intelligence Jr",
        job: "Mobyan",
        date: "2022 - 2024",
        contents: [
          "Desenvolvimento de relatórios interativos em Python integrando Web, SAP, DataLake, APIs e bancos SQL.",
          "Processamento de Big Data com PySpark e PySparkSQL no Azure Synapse Analytics.",
          "Automações com Python, SQL, NoSQL e integração de APIs para otimização de processos financeiros e operacionais.",
        ],
      },
      {
        title: "Desenvolvedor Full-Stack",
        job: "Projetos Pessoais & Freelance",
        date: "2023 - Present",
        contents: [
          "E-commerce completo com painel administrativo, gestão de produtos e sistema de pagamentos",
          "Dashboards executivos com analytics em tempo real e relatórios automatizados", 
          "Aplicações web 3D interativas e experiências visuais avançadas",
          "Sistemas de automação, APIs escaláveis e integrações com serviços externos",
          "Arquitetura cloud com deploy automatizado e monitoramento de performance",
        ],
      },
      {
        title: "Data Engineer sSr",
        job: "Globant",
        date: "2024 - Present",
        contents: [
          "Desenvolvimento de soluções full-stack com Python/Flask e Azure Databricks para processamento de milhões de registros em escala nacional.",
          "Implementação de pipelines otimizados e queries SQL para análise em tempo real de auditorias comerciais.",
          "Criação de aplicações React/TypeScript com arquitetura enterprise, autenticação Azure AD (MSAL) e APIs Node.js/Express.",
          "Arquitetura backend escalável com Node.js/Express, implementação de JWT, rate limiting e middleware de segurança para aplicações empresariais.",
        ],
      },
    ],
  },
  courses: {
    sectionTitle: 'Formação & Experiências',
    typeLabels: {
      course: 'Curso',
      certification: 'Certificação',
      extracurricular: 'Extracurricular'
    },
    courses: [
      {
        title: "Node.js - The Complete Guide",
        institution: "Udemy - Maximilian Schwarzmüller", 
        period: "2025",
        description: "Desenvolvimento backend completo com Node.js, Express, MongoDB, autenticação JWT, APIs RESTful e deployment em produção.",
        type: "course",
        technologies: ["Node.js", "Express", "MongoDB", "JWT"],
        link: "https://udemy.com",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg"
      },
      {
        title: "Aplicações React com IA",
        institution: "Udemy - JavaScript Mastery",
        period: "2025",
        description: "Desenvolvimento de aplicações React integradas com IA, utilizando OpenAI API, ChatGPT, machine learning e processamento de linguagem natural no frontend.",
        type: "course",
        technologies: ["React", "OpenAI API", "IA/ML", "TypeScript"],
        link: "https://udemy.com",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
      },
      {
        title: "Bootcamp E-commerce Next.js",
        institution: "Fullstack Club",
        period: "2025",
        description: "Bootcamp intensivo focado no desenvolvimento de aplicações e-commerce completas usando Next.js, TypeScript, Stripe e deploy em produção.",
        type: "extracurricular",
        technologies: ["Next.js", "TypeScript", "E-commerce"],
        link: "https://www.fullstackclub.com.br/bootcampecommerce",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg"
      },
      {
        title: "Contribuidor Open Source",
        institution: "Comunidade GitHub",
        period: "2024-Presente",
        description: "Contribuições ativas para projetos open source, incluindo bibliotecas React, tools de desenvolvimento e documentação técnica.",
        type: "extracurricular",
        technologies: ["Open Source", "Git", "Comunidade"],
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
      },
      {
        title: "Padrões Avançados de TypeScript",
        institution: "Frontend Masters",
        period: "2024",
        description: "Padrões avançados em TypeScript para desenvolvimento de bibliotecas, utility types, conditional types e meta-programming.",
        type: "course",
        technologies: ["TypeScript", "Padrões Avançados"],
        link: "https://frontendmasters.com",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg"
      },
      {
        title: "Docker & Kubernetes: Guia Completo",
        institution: "Udemy - Stephen Grider",
        period: "2024",
        description: "Curso completo de containerização com Docker, orquestração com Kubernetes, CI/CD pipelines e deploy de aplicações em clusters de produção.",
        type: "course",
        technologies: ["Docker", "Kubernetes", "DevOps"],
        link: "https://udemy.com",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg"
      },
      {
        title: "AWS Certified Cloud Practitioner",
        institution: "Udemy - Stephane Maarek",
        period: "2024",
        description: "Curso completo de fundamentos AWS cobrindo EC2, S3, RDS, Lambda, IAM, CloudFormation e preparação para certificação Cloud Practitioner com hands-on labs.",
        type: "course",
        technologies: ["AWS", "Cloud Computing", "EC2", "S3"],
        link: "https://udemy.com",
        logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
      },
      {
        title: "Three.js para Iniciantes",
        institution: "Udemy - Chris Courses",
        period: "2024",
        description: "Introdução ao Three.js para desenvolvimento web 3D, criação de geometrias, materiais, iluminação e animações básicas para sites interativos.",
        type: "course",
        technologies: ["Three.js", "JavaScript", "WebGL"],
        link: "https://udemy.com",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg"
      },
      {
        title: "Inteligência Artificial e Agentes Inteligentes",
        institution: "Alura",
        period: "2024",
        description: "Curso completo sobre IA, criação de agentes inteligentes, redes neurais, processamento de linguagem natural e implementação de chatbots com Python.",
        type: "course",
        technologies: ["Python", "IA", "Agentes", "NLP"],
        link: "https://alura.com.br",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
      },
      {
        title: "Python para Ciência de Dados",
        institution: "Alura",
        period: "2022",
        description: "Formação completa em Python focada em análise de dados, pandas, numpy, matplotlib e machine learning com scikit-learn para projetos reais.",
        type: "course",
        technologies: ["Python", "Pandas", "NumPy", "Machine Learning"],
        link: "https://alura.com.br",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
      },
      {
        title: "Bootcamp Completo de Python",
        institution: "Udemy - Jose Portilla",
        period: "2021",
        description: "Curso completo de Python cobrindo fundamentos, programação orientada a objetos, manipulação de dados, APIs e desenvolvimento web com Flask/Django.",
        type: "course",
        technologies: ["Python", "Django", "Flask", "Análise de Dados"],
        link: "https://udemy.com",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
      }
    ]
  },
  projects: {
    sectionTitle: 'Projetos',
    sectionSubtitle: 'Uma coleção de trabalhos que demonstra paixão por código limpo, design intuitivo e soluções inovadoras',
    scrollText: 'scroll',
    endText: 'Fim dos projetos',
    labels: {
      technologies: 'Tecnologias',
      links: 'Links',
      viewProject: 'Ver Projeto',
      code: 'Código',
      viewDetails: 'Ver Detalhes',
      projectDetails: 'Detalhes do Projeto'
    },
    projects: [
      {
        title: 'SOLTO®',
        subDescription: [
          'Plataforma de e-commerce construída com Next.js 14, TypeScript e Drizzle ORM.',
          'Painel administrativo completo com gestão de produtos, pedidos, clientes, promoções, coleções e analytics em tempo real.',
          'Checkout otimizado com múltiplos métodos de pagamento e cálculo automático de frete.',
          'Design responsivo e moderno com Tailwind CSS, otimizado para todos os dispositivos.',
          'Arquitetura escalável com SSR/SSG, cache inteligente e React Query.'
        ],
        tags: [
          { name: 'Next.js' },
          { name: 'TypeScript' },
          { name: 'Drizzle ORM' },
          { name: 'React Query' },
          { name: 'Tailwind' },
          { name: 'PostgreSQL' },
          { name: 'Vercel' },
          { name: 'Stripe' }
        ]
      },
      {
        title: 'Portfólio 3D Interativo',
        subDescription: [
          'Portfólio pessoal desenvolvido com Three.js e React, apresentando navegação 3D imersiva.',
          'Sistema de navegação planetária com transições suaves e animações físicas realistas.',
          'Interface responsiva adaptável para desktop e mobile com controles otimizados.',
          'Arquitetura modular com gerenciamento de estado Zustand e animações Framer Motion.',
          'Performance otimizada com lazy loading, code splitting e renderização eficiente.'
        ],
        tags: [
          { name: 'Three.js' },
          { name: 'React' },
          { name: 'TypeScript' },
          { name: 'Framer Motion' },
          { name: 'Zustand' },
          { name: 'Tailwind' },
          { name: 'Vite' },
          { name: 'WebGL' }
        ]
      },
      {
        title: 'StoreHub',
        subDescription: [
          'Sistema corporativo para consulta e cadastro de dados de CNPJ desenvolvido para Reckitt com React 18, TypeScript e Vite.',
          'Sistema de autenticação híbrida com Microsoft MSAL (Azure AD) para produção e mock provider para desenvolvimento.',
          'Consulta individual e em lote de CNPJs, cadastro de novos clientes, edição de dados existentes e importação via CSV.',
          'API backend com Node.js para validação de dados com Zod e middleware abrangente de tratamento de erros.',
          'Deploy no Azure Static Web Apps com pipeline CI/CD, suite de testes automatizados com Playwright e scripts PowerShell.'
        ],
        tags: [
          { name: 'React 18' },
          { name: 'TypeScript' },
          { name: 'Vite' },
          { name: 'Azure AD' },
          { name: 'Node.js' },
          { name: 'Tailwind' },
          { name: 'Playwright' },
          { name: 'Axios' }
        ]
      }
    ]
  }
};

// English translations
const enTranslations: Translations = {
  common: {
    languageToggle: {
      ariaLabel: 'Change language',
    },
  },
  experiences: {
    sectionTitle: 'My Work Experience',
    experiences: [
      {
        title: "Chemical Engineering",
        job: "University of São Paulo (USP)",
        date: "2017-2023",
        contents: [
          "Education in industrial process analysis, mathematical modeling, and system optimization.",
          "First personal projects with Python automations for data analysis and automated reporting.",
          "Experience in quality control and validation methodologies in laboratories.",
          "Solid foundation in systematic thinking and complex problem solving.",
        ],
      },
      {
        title: "Summer Finance Internship",
        job: "Isaac - Fintech",
        date: "Jan - Mar 2021",
        contents: [
          "First Python automations for ETL processes in financial databases of private schools.",
          "Data normalization and transformation for integration with corporate ERP systems.",
          "Beginning of programming journey through data analysis and manipulation of large volumes of information.",
        ],
      },
      {
        title: "Operational Excellence Intern",
        job: "Novelis",
        date: "2021 - 2022",
        contents: [
          "Development of automated dashboards in Python for WCM (World Class Manufacturing) system monitoring.",
          "Integration of multiple data sources for real-time reporting on operational performance.",
          "Automation of data collection and analysis processes to support autonomous maintenance teams.",
        ],
      },
      {
        title: "Jr. Business Intelligence Analyst",
        job: "Mobyan",
        date: "2022 - 2024",
        contents: [
          "Development of interactive reports in Python integrating Web, SAP, DataLake, APIs, and SQL databases.",
          "Big Data processing with PySpark and PySparkSQL in Azure Synapse Analytics.",
          "Automations with Python, SQL, NoSQL, and API integration for financial and operational process optimization.",
        ],
      },
      {
        title: "Full-Stack Developer",
        job: "Personal Projects & Freelance",
        date: "2023 - Present",
        contents: [
          "Complete e-commerce with admin panel, product management and payment systems",
          "Executive dashboards with real-time analytics and automated reporting",
          "Interactive 3D web applications and advanced visual experiences", 
          "Automation systems, scalable APIs and external service integrations",
          "Cloud architecture with automated deployment and performance monitoring",
        ],
      },
      {
        title: "Sr. Data Engineer",
        job: "Globant",
        date: "2024 - Present",
        contents: [
          "Development of full-stack solutions with Python/Flask and Azure Databricks for processing millions of records at national scale.",
          "Implementation of optimized pipelines and SQL queries for real-time commercial audit analysis.",
          "Creation of React/TypeScript applications with enterprise architecture, Azure AD (MSAL) authentication, and Node.js/Express APIs.",
          "Scalable backend architecture with Node.js/Express, JWT implementation, rate limiting, and security middleware for enterprise applications.",
        ],
      },
    ],
  },
  courses: {
    sectionTitle: 'Education & Training',
    typeLabels: {
      course: 'Course',
      certification: 'Certification',
      extracurricular: 'Extracurricular'
    },
    courses: [
      {
        title: "Node.js - The Complete Guide",
        institution: "Udemy - Maximilian Schwarzmüller", 
        period: "2025",
        description: "Complete backend development with Node.js, Express, MongoDB, JWT authentication, RESTful APIs and production deployment.",
        type: "course",
        technologies: ["Node.js", "Express", "MongoDB", "JWT"],
        link: "https://udemy.com",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg"
      },
      {
        title: "AI-Powered React Applications",
        institution: "Udemy - JavaScript Mastery",
        period: "2025",
        description: "Development of React applications integrated with AI, using OpenAI API, ChatGPT, machine learning and natural language processing in frontend.",
        type: "course",
        technologies: ["React", "OpenAI API", "AI/ML", "TypeScript"],
        link: "https://udemy.com",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
      },
      {
        title: "E-commerce Next.js Bootcamp",
        institution: "Fullstack Club",
        period: "2025",
        description: "Intensive bootcamp focused on developing complete e-commerce applications using Next.js, TypeScript, Stripe and production deployment.",
        type: "extracurricular",
        technologies: ["Next.js", "TypeScript", "E-commerce"],
        link: "https://www.fullstackclub.com.br/bootcampecommerce",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg"
      },
      {
        title: "Open Source Contributor",
        institution: "GitHub Community",
        period: "2024-Present",
        description: "Active contributions to open source projects, including React libraries, development tools and technical documentation.",
        type: "extracurricular",
        technologies: ["Open Source", "Git", "Community"],
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
      },
      {
        title: "Advanced TypeScript Patterns",
        institution: "Frontend Masters",
        period: "2024",
        description: "Advanced TypeScript patterns for library development, utility types, conditional types and meta-programming.",
        type: "course",
        technologies: ["TypeScript", "Advanced Patterns"],
        link: "https://frontendmasters.com",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg"
      },
      {
        title: "Docker & Kubernetes: The Complete Guide",
        institution: "Udemy - Stephen Grider",
        period: "2024",
        description: "Complete course on containerization with Docker, orchestration with Kubernetes, CI/CD pipelines and deployment of applications in production clusters.",
        type: "course",
        technologies: ["Docker", "Kubernetes", "DevOps"],
        link: "https://udemy.com",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg"
      },
      {
        title: "Ultimate AWS Certified Cloud Practitioner",
        institution: "Udemy - Stephane Maarek",
        period: "2024",
        description: "Complete AWS fundamentals course covering EC2, S3, RDS, Lambda, IAM, CloudFormation and Cloud Practitioner certification preparation with hands-on labs.",
        type: "course",
        technologies: ["AWS", "Cloud Computing", "EC2", "S3"],
        link: "https://udemy.com",
        logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
      },
      {
        title: "Three.js for Beginners",
        institution: "Udemy - Chris Courses",
        period: "2024",
        description: "Introduction to Three.js for 3D web development, creating geometries, materials, lighting and basic animations for interactive websites.",
        type: "course",
        technologies: ["Three.js", "JavaScript", "WebGL"],
        link: "https://udemy.com",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg"
      },
      {
        title: "Artificial Intelligence and Intelligent Agents",
        institution: "Alura",
        period: "2024",
        description: "Complete course on AI, creation of intelligent agents, neural networks, natural language processing and chatbot implementation with Python.",
        type: "course",
        technologies: ["Python", "AI", "Agents", "NLP"],
        link: "https://alura.com.br",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
      },
      {
        title: "Python for Data Science",
        institution: "Alura",
        period: "2022",
        description: "Complete Python training focused on data analysis, pandas, numpy, matplotlib and machine learning with scikit-learn for real projects.",
        type: "course",
        technologies: ["Python", "Pandas", "NumPy", "Machine Learning"],
        link: "https://alura.com.br",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
      },
      {
        title: "Complete Python Bootcamp",
        institution: "Udemy - Jose Portilla",
        period: "2021",
        description: "Complete Python course covering fundamentals, object-oriented programming, data manipulation, APIs and web development with Flask/Django.",
        type: "course",
        technologies: ["Python", "Django", "Flask", "Data Analysis"],
        link: "https://udemy.com",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
      }
    ]
  },
  projects: {
    sectionTitle: 'Projects',
    sectionSubtitle: 'A collection of work that demonstrates passion for clean code, intuitive design and innovative solutions',
    scrollText: 'scroll',
    endText: 'End of projects',
    labels: {
      technologies: 'Technologies',
      links: 'Links',
      viewProject: 'View Project',
      code: 'Code',
      viewDetails: 'View Details',
      projectDetails: 'Project Details'
    },
    projects: [
      {
        title: 'SOLTO®',
        subDescription: [
          'E-commerce platform built with Next.js 14, TypeScript and Drizzle ORM.',
          'Complete administrative panel with product, order, customer, promotion, collection management and real-time analytics.',
          'Optimized checkout with multiple payment methods and automatic shipping calculation.',
          'Responsive and modern design with Tailwind CSS, optimized for all devices.',
          'Scalable architecture with SSR/SSG, intelligent caching and React Query.'
        ],
        tags: [
          { name: 'Next.js' },
          { name: 'TypeScript' },
          { name: 'Drizzle ORM' },
          { name: 'React Query' },
          { name: 'Tailwind' },
          { name: 'PostgreSQL' },
          { name: 'Vercel' },
          { name: 'Stripe' }
        ]
      },
      {
        title: 'Interactive 3D Portfolio',
        subDescription: [
          'Personal portfolio developed with Three.js and React, featuring immersive 3D navigation.',
          'Planetary navigation system with smooth transitions and realistic physics animations.',
          'Responsive interface adaptable for desktop and mobile with optimized controls.',
          'Modular architecture with Zustand state management and Framer Motion animations.',
          'Optimized performance with lazy loading, code splitting and efficient rendering.'
        ],
        tags: [
          { name: 'Three.js' },
          { name: 'React' },
          { name: 'TypeScript' },
          { name: 'Framer Motion' },
          { name: 'Zustand' },
          { name: 'Tailwind' },
          { name: 'Vite' },
          { name: 'WebGL' }
        ]
      },
      {
        title: 'StoreHub',
        subDescription: [
          'Corporate system for CNPJ consultation and registration developed for Reckitt with React 18, TypeScript and Vite.',
          'Hybrid authentication system with Microsoft MSAL (Azure AD) for production and mock provider for development.',
          'Individual and batch CNPJ consultation, new client registration, existing data editing and CSV import functionality.',
          'Backend API with Node.js handling data validation with Zod and comprehensive error handling middleware.',
          'Azure Static Web Apps deployment with CI/CD pipeline, automated testing suite with Playwright and PowerShell scripts.'
        ],
        tags: [
          { name: 'React 18' },
          { name: 'TypeScript' },
          { name: 'Vite' },
          { name: 'Azure AD' },
          { name: 'Node.js' },
          { name: 'Tailwind' },
          { name: 'Playwright' },
          { name: 'Axios' }
        ]
      }
    ]
  }
};

// Translation map
const translationsMap: Record<Language, Translations> = {
  pt: ptTranslations,
  en: enTranslations,
};

// Utility function to get translations by language
export const getTranslations = (language: Language): Translations => {
  return translationsMap[language] || translationsMap.en; // Fallback to English
};

// Hook-like function for getting current translations
export const useTranslations = (language: Language) => {
  return getTranslations(language);
};