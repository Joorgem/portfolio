// Types for project data structure
export interface ProjectTag {
  id: number;
  name: string;
  path: string;
}

export interface ProjectMedia {
  type: 'image' | 'gif' | 'video';
  src: string;
  alt: string;
  thumbnail?: string; // For videos
  description?: string;
  category: 'web' | 'mobile' | 'admin' | 'features' | 'api' | 'architecture';
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

export interface Review {
  name: string;
  username: string;
  body: string;
  img: string;
}

export interface Course {
  title: string;
  institution: string;
  period: string;
  description: string;
  type: 'course' | 'certification' | 'extracurricular';
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
      "Scalable architecture with SSR/SSG, intelligent caching and React Query."
    ],
    href: "https://solto-shop.vercel.app/",
    repositoryUrl: "#",
    logo: "/assets/logos/solto-logo.png",
    image: "/assets/projects/solto-homepage.jpg",
    media: [
      {
        type: "gif",
        src: "/assets/projects/solto-demo.gif",
        alt: "SOLTO Demo - complete navigation",
        category: "web",
        priority: 1
      },
      {
        type: "gif",
        src: "/assets/projects/solto-mobile.gif",
        alt: "Responsive mobile interface",
        category: "mobile",
        priority: 1
      },
      {
        type: "gif", 
        src: "/assets/projects/solto-admin.gif",
        alt: "SOLTO administrative panel",
        category: "admin",
        priority: 1
      }
    ],
    tags: [
      { id: 1, name: "Next.js", path: "/assets/logos/nextjs.svg" },
      { id: 2, name: "TypeScript", path: "/assets/logos/typescript.svg" },
      { id: 3, name: "Drizzle ORM", path: "/assets/logos/drizzle.svg" },
      { id: 4, name: "React Query", path: "/assets/logos/react-query.svg" },
      { id: 5, name: "Tailwind", path: "/assets/logos/tailwindcss.svg" },
      { id: 6, name: "PostgreSQL", path: "/assets/logos/postgresql.svg" },
      { id: 7, name: "Vercel", path: "/assets/logos/vercel.svg" },
      { id: 8, name: "Stripe", path: "/assets/logos/stripe.svg" }
    ]
  },
  {
    id: 2,
    title: "Interactive 3D Portfolio",
    subDescription: [
      "3D interactive portfolio with spatial navigation using Three.js and React Three Fiber.",
      "Complex state management system with Zustand for seamless transitions between sections.",
      "Advanced animations with Framer Motion, GSAP and custom interactive particles.",
      "Modern TypeScript architecture with Vite, Tailwind CSS 4.0 and mobile-first responsive design."
    ],
    href: "https://jorgemolina.dev/",
    repositoryUrl: "#",
    logo: "",
    image: "/assets/projects/portfolio-3d.jpg",
    media: [
      {
        type: "gif",
        src: "/assets/projects/portifolio3d-demo.gif",
        alt: "3D Portfolio navigation demo",
        category: "web",
        priority: 1
      },
      {
        type: "gif",
        src: "/assets/projects/portifolio3d-mobile.gif",
        alt: "3D Portfolio mobile interface",
        category: "mobile",
        priority: 1
      }
    ],
    tags: [
      { id: 17, name: "React 19", path: "/assets/logos/react.svg" },
      { id: 18, name: "TypeScript", path: "/assets/logos/typescript.svg" },
      { id: 19, name: "Three.js", path: "/assets/logos/threejs.svg" },
      { id: 20, name: "Vite", path: "/assets/logos/vite.svg" },
      { id: 21, name: "Tailwind CSS", path: "/assets/logos/tailwindcss.svg" },
      { id: 22, name: "Framer Motion", path: "/assets/logos/framer.svg" },
      { id: 23, name: "Zustand", path: "/assets/logos/zustand.svg" },
      { id: 24, name: "EmailJS", path: "/assets/logos/emailjs.svg" }
    ]
  },
  {
    id: 3,
    title: "StoreHub",
    subDescription: [
      "Corporate system for CNPJ consultation and registration developed for Reckitt with React 18, TypeScript and Vite.",
      "Hybrid authentication system with Microsoft MSAL (Azure AD) for production and mock provider for development.",
      "Individual and batch CNPJ consultation, new client registration, existing data editing and CSV import functionality.",
      "Backend API with Node.js handling data validation with Zod and comprehensive error handling middleware.",
      "Azure Static Web Apps deployment with CI/CD pipeline, automated testing suite with Playwright and PowerShell scripts."
    ],
    href: "#",
    repositoryUrl: "#",
    logo: "",
    image: "/assets/projects/storehub-dashboard.jpg",
    media: [
      {
        type: "gif",
        src: "/assets/projects/storehub-demo.gif",
        alt: "StoreHub system demonstration",
        category: "web",
        priority: 1
      }
    ],
    tags: [
      { id: 13, name: "React 18", path: "/assets/logos/react.svg" },
      { id: 14, name: "TypeScript", path: "/assets/logos/typescript.svg" },
      { id: 26, name: "Vite", path: "/assets/logos/vite.svg" },
      { id: 16, name: "Azure AD", path: "/assets/logos/azure.svg" },
      { id: 29, name: "Node.js", path: "/assets/logos/nodejs.svg" },
      { id: 30, name: "Tailwind", path: "/assets/logos/tailwindcss.svg" },
      { id: 31, name: "Playwright", path: "/assets/logos/playwright.svg" },
      { id: 32, name: "Axios", path: "/assets/logos/axios.svg" }
    ]
  }
];

export const mySocials: Social[] = [
  {
    name: "WhatsApp",
    href: "",
    icon: "/assets/socials/whatsApp.svg",
  },
  {
    name: "Linkedin",
    href: "https://www.linkedin.com/in/ali-sanati/",
    icon: "/assets/socials/linkedIn.svg",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/ali.sanatidev/reels/",
    icon: "/assets/socials/instagram.svg",
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
      "E-commerce completo com Next.js, TypeScript e painel administrativo avançado",
      "Arquitetura de microserviços escalável com Redis e SQL Server",
      "Portfolio 3D interativo com Three.js e cálculos matemáticos complexos",
      "Sistemas de processamento batch e filas assíncronas",
      "Pipelines CI/CD automatizados com Docker e deploy em nuvem",
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
];

export const reviews: Review[] = [
  {
    name: "Jack",
    username: "@jack",
    body: "I've never seen anything like this before. It's amazing. I love it.",
    img: "https://robohash.org/jack",
  },
  {
    name: "Jill",
    username: "@jill",
    body: "I don't know what to say. I'm speechless. This is amazing.",
    img: "https://robohash.org/jill",
  },
  {
    name: "John",
    username: "@john",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://robohash.org/john",
  },
  {
    name: "Alice",
    username: "@alice",
    body: "This is hands down the best thing I've experienced. Highly recommend!",
    img: "https://robohash.org/alice",
  },
  {
    name: "Bob",
    username: "@bob",
    body: "Incredible work! The attention to detail is phenomenal.",
    img: "https://robohash.org/bob",
  },
  {
    name: "Charlie",
    username: "@charlie",
    body: "This exceeded all my expectations. Absolutely stunning!",
    img: "https://robohash.org/charlie",
  },
  {
    name: "Dave",
    username: "@dave",
    body: "Simply breathtaking. The best decision I've made in a while.",
    img: "https://robohash.org/dave",
  },
  {
    name: "Eve",
    username: "@eve",
    body: "So glad I found this. It has changed the game for me.",
    img: "https://robohash.org/eve",
  },
];

export const courses: Course[] = [
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
    title: "AI-Powered React Applications",
    institution: "Udemy - JavaScript Mastery",
    period: "2025",
    description: "Desenvolvimento de aplicações React integradas com IA, utilizando OpenAI API, ChatGPT, machine learning e processamento de linguagem natural no frontend.",
    type: "course",
    technologies: ["React", "OpenAI API", "AI/ML", "TypeScript"],
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
    title: "Open Source Contributor",
    institution: "GitHub Community",
    period: "2024-Present",
    description: "Contribuições ativas para projetos open source, incluindo bibliotecas React, tools de desenvolvimento e documentação técnica.",
    type: "extracurricular",
    technologies: ["Open Source", "Git", "Community"],
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
  },
  {
    title: "Advanced TypeScript Patterns",
    institution: "Frontend Masters",
    period: "2024",
    description: "Padrões avançados em TypeScript para desenvolvimento de bibliotecas, utility types, conditional types e meta-programming.",
    type: "course",
    technologies: ["TypeScript", "Advanced Patterns"],
    link: "https://frontendmasters.com",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg"
  },
  {
    title: "Docker & Kubernetes: The Complete Guide",
    institution: "Udemy - Stephen Grider",
    period: "2024",
    description: "Curso completo de containerização com Docker, orquestração com Kubernetes, CI/CD pipelines e deploy de aplicações em clusters de produção.",
    type: "course",
    technologies: ["Docker", "Kubernetes", "DevOps"],
    link: "https://udemy.com",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg"
  },
  {
    title: "Ultimate AWS Certified Cloud Practitioner",
    institution: "Udemy - Stephane Maarek",
    period: "2024",
    description: "Curso completo de fundamentos AWS cobrindo EC2, S3, RDS, Lambda, IAM, CloudFormation e preparação para certificação Cloud Practitioner com hands-on labs.",
    type: "course",
    technologies: ["AWS", "Cloud Computing", "EC2", "S3"],
    link: "https://udemy.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
  },
  {
    title: "Three.js for Beginners",
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
    title: "Complete Python Bootcamp",
    institution: "Udemy - Jose Portilla",
    period: "2021",
    description: "Curso completo de Python cobrindo fundamentos, programação orientada a objetos, manipulação de dados, APIs e desenvolvimento web com Flask/Django.",
    type: "course",
    technologies: ["Python", "Django", "Flask", "Data Analysis"],
    link: "https://udemy.com",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
  }];