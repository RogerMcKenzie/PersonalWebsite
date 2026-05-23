export const siteConfig = {
  name: "Roger McKenzie",
  title: "Roger McKenzie | Software Developer",
  description:
    "Software developer, content creator, and Computer Science student at the University of Florida. Explore my projects, experience, and tech content.",
  url: "https://rogermckenzie.dev",
  resumeUrl:
    "https://docs.google.com/document/d/15JX0X1Reny-b6ptbkC4ADLikTLXrJYg3/export?format=pdf",
  resumePreviewUrl:
    "https://docs.google.com/document/d/15JX0X1Reny-b6ptbkC4ADLikTLXrJYg3/preview",
  githubUsername: "RogerMcKenzie",
  social: {
    github: "https://github.com/RogerMcKenzie",
    linkedin: "https://www.linkedin.com/in/rogermckenzie/",
    youtube: "https://www.youtube.com/@RogerMcKenzie1",
    email: "McKenzieRoger83@gmail.com",
  },
};

export interface Experience {
  company: string;
  role: string;
  location: string;
  period: string;
  bullets: string[];
  tech?: string[];
}

export const experiences: Experience[] = [
  {
    company: "Amazon",
    role: "Software Development Engineer Intern",
    location: "Arlington, Virginia",
    period: "May 2026 - Present",
    bullets: [
      "Engineered a serverless, self-improving inference system to automate cross-functional evaluator selection, reducing manual contacts by 37%, saving time for recruiting coordinators and decreasing interviewer burnout.",
      "Architected scalable data pipelines with AWS EMR and Amazon Data Firehose to ingest and process dynamic evaluator availability and historical data, orchestrating workflows via Step Functions and lambda functions VPC.",
      "Optimized system responsiveness by caching real-time scheduling data in Amazon ElastiCache (Valkey) and established comprehensive operational monitoring through CloudWatch.",
    ],
    tech: ["AWS", "Serverless", "Python"],
  },
  {
    company: "Amazon",
    role: "Software Development Engineer Intern",
    location: "Arlington, Virginia",
    period: "May 2025 - August 2025",
    bullets: [
      "Partnered with Software Engineers and Data Scientists to translate stakeholder needs into a clear vision for an A/B testing platform, to address the goal of successful campaigning outreach to potential hiring candidates.",
      "Conceputalized the platform's front-end using React and TypeScript, leveraging an internal UI library's components, icons, and styling to ensure design consistency across the department and accelerate development.",
      "Delivered a functional prototype that empowered marketers to visually build and compare campaign variations, culminating in a successful handoff for backend integration and final Quality Assurance.",
    ],
    tech: ["React", "TypeScript"],
  },
  {
    company: "Miami Dade College",
    role: "Math Tutor",
    location: "Miami, Florida",
    period: "January 2024 - April 2024",
    bullets: [
      "Demystified complex topics in Calculus and Statistics for 10+ students weekly, tailoring explanations to individual learning styles to foster deep comprehension.",
      "Strengthened student performance across Calculus, Statistics, and Discrete Math, with regularly attending students achieving an estimated 15-20% average improvement on course examinations.",
      "Increased the utilization of the math tutoring lab for my assigned subjects by 30% over the semester through proactive outreach and positive instructor referrals.",
    ],
  },
  {
    company: "America On Tech",
    role: "Peer Mentor",
    location: "Miami, Florida",
    period: "February 2023 - May 2023",
    bullets: [
      "Facilitated 20+ students through a front-end introductory curriculum, leading to the successful deployment of 5 unique, multi-page websites built with HTML5, CSS3, and Bootstrap 5.",
      "Coordinated with program manager and instructor to discuss student feedback about TECH360 and create an inclusive and enriching learning environment for students.",
      "Participated in monthly professional development sessions about topics such as goal setting, resume drafting and developing an elevator pitch.",
    ],
    tech: ["HTML5", "CSS3", "Bootstrap 5"],
  },
];

export type ProjectCategory = "Web Apps" | "Extensions" | "AI" | "Content";

export interface FeaturedProject {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  tech: string[];
  category: ProjectCategory[];
  role: string;
  timeline: string;
  impact: string;
  liveUrl?: string;
  caseStudyUrl?: string;
  github?: string;
  /** Tailwind classes for the cover tile background. */
  coverClass: string;
  /** Optional accent color for the cover. */
  coverTextClass?: string;
  /** Optional image URL for the cover. */
  coverImage?: string;
}

export const featuredProjects: FeaturedProject[] = [
  {
    slug: "resmatch",
    title: "ResMatch",
    tagline: "Tailored resumes. Better matches. More interviews.",
    description:
      "AI-powered platform that tailors your resume to any job description, helping you stand out and land more interviews.",
    tech: ["Next.js", "TypeScript", "OpenAI", "Tailwind CSS"],
    category: ["Web Apps", "AI"],
    role: "Founder & Developer",
    timeline: "Jan - Mar 2024",
    impact: "10K+ users",
    coverClass: "bg-gradient-to-br from-[#0a1a3a] via-[#0f2557] to-[#1a3a8a]",
    coverTextClass: "text-white",
  },
  {
    slug: "snapcal",
    title: "SnapCal",
    tagline:
      "Extract event details from any webpage and create Google Calendar events in one click.",
    description:
      "Chrome extension that extracts event details from webpages and creates Google Calendar events instantly.",
    tech: ["JavaScript", "Chrome API", "Google Calendar", "UI/UX"],
    category: ["Extensions", "AI"],
    role: "Developer",
    timeline: "May - Jun 2024",
    impact: "2K+ users",
    coverClass: "bg-gradient-to-br from-[#dbeafe] to-[#bfdbfe]",
    coverTextClass: "text-[#0f172a]",
  },
  {
    slug: "jennas-recipes",
    title: "Jenna's Recipes",
    tagline: "Discover, save, and share delicious recipes with AI-enhanced discovery.",
    description:
      "Recipe web app with AI-enhanced discovery, personalized recommendations, and a clean experience for food lovers.",
    tech: ["React", "Node.js", "MongoDB", "Tailwind CSS"],
    category: ["Web Apps", "AI"],
    role: "Full Stack Developer",
    timeline: "Oct - Dec 2023",
    impact: "1K+ users",
    liveUrl: "https://jennarecipes.vercel.app",
    coverClass: "bg-gradient-to-br from-[#f6e6c4] to-[#e8c98a]",
    coverTextClass: "text-[#3a2a18]",
    coverImage: "/projects/jennas-recipes.jpg",
  },
];

export interface ContentVideo {
  title: string;
  description: string;
  duration: string;
  url: string;
  thumbnailClass: string;
  badge: string;
  date: string;
}

export const featuredContent: ContentVideo[] = [
  {
    title: "4 AI Chrome Extensions I Built",
    description:
      "A look at four AI-powered Chrome extensions I built to solve everyday problems.",
    duration: "10:24",
    url: "https://www.youtube.com/@RogerMcKenzie1",
    thumbnailClass: "bg-gradient-to-br from-[#0b1228] via-[#142150] to-[#1a2a72]",
    badge: "4 AI CHROME EXTENSIONS I BUILT",
    date: "May 5, 2024",
  },
  {
    title: "Building ResMatch",
    description:
      "How I built my AI resume tailoring platform from idea to launch.",
    duration: "14:37",
    url: "https://www.youtube.com/@RogerMcKenzie1",
    thumbnailClass: "bg-gradient-to-br from-[#0a0f1f] to-[#1a2347]",
    badge: "BUILDING RESMATCH",
    date: "Apr 12, 2024",
  },
  {
    title: "Amazon Internship Experience",
    description:
      "How I prepared, what I worked on, and key takeaways from my time at Amazon.",
    duration: "9:58",
    url: "https://www.youtube.com/@RogerMcKenzie1",
    thumbnailClass: "bg-gradient-to-br from-[#0a1a2f] to-[#16335c]",
    badge: "AMAZON INTERNSHIP EXPERIENCE",
    date: "Mar 20, 2024",
  },
];

export interface Project {
  title: string;
  description: string;
  tech: string[];
  bullets: string[];
  github?: string;
  live?: string;
}

export const fallbackProjects: Project[] = [
  {
    title: "Ad-Viser AI",
    description:
      "An ad intelligence platform that crawls websites to flag likely ad surfaces and score them by estimated CTR.",
    tech: ["React", "TypeScript", "Tailwind CSS", "MongoDB", "Firebase"],
    bullets: [
      "Features a visual explorer that overlays suggestions on uploaded screenshots.",
    ],
  },
  {
    title: "SnapCal",
    description:
      "A Chrome MV3 extension integrated with Gemini and Google Calendar.",
    tech: ["Chrome Extension", "Google OAuth", "Chrome Identity API", "Gemini"],
    bullets: [
      "Extracts page text to convert visible events into Google Calendar entries.",
      "Utilizes Google OAuth and the Chrome Identity API for secure event creation.",
      "Delivered a fast popup-based UX with an editable preview step.",
    ],
  },
];

export const education = {
  school: "University of Florida",
  degree: "Bachelor of Science in Computer Science",
  minor: "Minor in African American Studies",
  graduation: "April 2028",
};

export const navLinks = [
  { label: "About", href: "/#about" },
  { label: "Resume", href: "/resume" },
  { label: "Projects", href: "/projects" },
  { label: "Photography", href: "/photography" },
  { label: "Content", href: siteConfig.social.youtube, external: true },
  { label: "Contact", href: `mailto:${siteConfig.social.email}` },
];

export type PhotoCategory =
  | "Travel"
  | "Street"
  | "Portrait"
  | "Nature"
  | "Architecture";

export interface Photo {
  src: string;
  alt: string;
  caption?: string;
  location?: string;
  date?: string;
  category: PhotoCategory;
  /** "tall" doubles row span; "wide" doubles column span. */
  size?: "tall" | "wide" | "square";
}

export const photos: Photo[] = [
  {
    src: "/photography/sunset-cathedral.jpg",
    alt: "Orange sunset over a cathedral silhouette and city rooftops",
    caption: "Cathedral sunset",
    location: "Washington, DC",
    date: "2026",
    category: "Architecture",
    size: "tall",
  },
  {
    src: "/photography/terrace-lights.jpg",
    alt: "Rooftop terrace with string lights over a city at night",
    caption: "Terrace lights",
    date: "2026",
    category: "Travel",
    size: "tall",
  },
  {
    src: "/photography/caesars-palace.jpg",
    alt: "Caesars Palace entrance at golden hour with crowds on the Las Vegas Strip",
    caption: "Caesars Palace",
    location: "Las Vegas, NV",
    date: "2026",
    category: "Architecture",
    size: "tall",
  },
  {
    src: "/photography/north-beach-night.jpg",
    alt: "North Beach street scene at night with neon signs and city lights",
    caption: "North Beach nights",
    location: "San Francisco, CA",
    date: "2026",
    category: "Street",
    size: "tall",
  },
];
