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
    period: "May 2025 - August 2025",
    bullets: [
      "Engineered the front-end of an A/B testing platform using React and TypeScript.",
      "Delivered a functional prototype allowing marketers to visually build and compare campaign variations.",
    ],
    tech: ["React", "TypeScript"],
  },
  {
    company: "Miami Dade College",
    role: "Math Tutor",
    location: "Miami, Florida",
    period: "January 2024 - April 2024",
    bullets: [
      "Tailored explanations in Calculus, Statistics, and Discrete Math to individual learning styles.",
      "Helped regular students achieve an estimated 15-20% average improvement on course examinations.",
      "Increased tutoring lab utilization for assigned subjects by 30%.",
    ],
  },
  {
    company: "America On Tech",
    role: "Peer Mentor",
    location: "Miami, Florida",
    period: "February 2023 - May 2023",
    bullets: [
      "Facilitated over 20 students through an introductory front-end curriculum.",
      "Guided the deployment of 5 unique, multi-page websites built with HTML5, CSS3, and Bootstrap 5.",
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
    coverClass: "bg-gradient-to-br from-[#f6e6c4] to-[#e8c98a]",
    coverTextClass: "text-[#3a2a18]",
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
    src: "/photography/01.jpg",
    alt: "Golden hour over the Gainesville skyline",
    caption: "Golden hour over campus",
    location: "Gainesville, FL",
    date: "2024",
    category: "Architecture",
    size: "wide",
  },
  {
    src: "/photography/02.jpg",
    alt: "Quiet alley after the rain",
    caption: "After the rain",
    location: "Miami, FL",
    date: "2024",
    category: "Street",
  },
  {
    src: "/photography/03.jpg",
    alt: "A friend laughing",
    caption: "Real laughs",
    location: "Miami, FL",
    date: "2023",
    category: "Portrait",
    size: "tall",
  },
  {
    src: "/photography/04.jpg",
    alt: "Palms against a soft blue sky",
    caption: "Soft skies",
    location: "Miami Beach, FL",
    date: "2023",
    category: "Nature",
  },
  {
    src: "/photography/05.jpg",
    alt: "Subway tile reflections",
    caption: "Subway light",
    location: "New York, NY",
    date: "2024",
    category: "Travel",
  },
  {
    src: "/photography/06.jpg",
    alt: "Foggy morning at Lake Alice",
    caption: "Foggy mornings",
    location: "Gainesville, FL",
    date: "2024",
    category: "Nature",
    size: "tall",
  },
  {
    src: "/photography/07.jpg",
    alt: "Crowd at a concert",
    caption: "Front row",
    location: "Orlando, FL",
    date: "2024",
    category: "Street",
    size: "wide",
  },
  {
    src: "/photography/08.jpg",
    alt: "Quiet portrait in window light",
    caption: "Window light",
    location: "Studio",
    date: "2023",
    category: "Portrait",
  },
];
