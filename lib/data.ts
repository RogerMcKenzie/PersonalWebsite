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
    period: "May 2025 — August 2025",
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
    period: "January 2024 — April 2024",
    bullets: [
      "Tailored explanations in Calculus, Statistics, and Discrete Math to individual learning styles.",
      "Helped regular students achieve an estimated 15–20% average improvement on course examinations.",
      "Increased tutoring lab utilization for assigned subjects by 30%.",
    ],
  },
  {
    company: "America On Tech",
    role: "Peer Mentor",
    location: "Miami, Florida",
    period: "February 2023 — May 2023",
    bullets: [
      "Facilitated over 20 students through an introductory front-end curriculum.",
      "Guided the deployment of 5 unique, multi-page websites built with HTML5, CSS3, and Bootstrap 5.",
    ],
    tech: ["HTML5", "CSS3", "Bootstrap 5"],
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
  { label: "About", href: "#about" },
  { label: "Resume", href: "#resume" },
  { label: "Projects", href: "#projects" },
  { label: "Content", href: "#content" },
];
