# Roger McKenzie — Personal Website

A personal portfolio website showcasing software development projects, technical internships, and tech-focused content. Built as a fully static frontend application.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, static export)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [React Icons](https://react-icons.github.io/react-icons/) + [Lucide React](https://lucide.dev/)
- **Theming:** [next-themes](https://github.com/pacocoursey/next-themes) (light / dark mode)
- **Fonts:** Space Grotesk (headings) + Inter (body) via `next/font/google`
- **Linting:** ESLint + Prettier

## Project Structure

```
/app
  layout.tsx        # Root layout — metadata, fonts, ThemeProvider
  page.tsx          # Single-page entry — renders all sections
/components
  Navbar.tsx        # Sticky nav with social icons and mobile hamburger
  Hero.tsx          # Full-viewport intro with resume download
  About.tsx         # Education, certifications, and skills
  Experience.tsx    # Vertical timeline of work history
  Projects.tsx      # Project cards with tech stack badges
  Content.tsx       # YouTube embed section
  Footer.tsx        # Social links footer
  ThemeToggle.tsx   # Light / dark mode toggle
/lib
  data.ts           # All site content as typed TypeScript objects
/public
  robots.txt        # SEO crawler directives
  sitemap.xml       # Site sitemap for search indexing
```

## Resume

The resume is hosted on Google Docs and served as a direct PDF download.

[Download Resume (PDF)](https://docs.google.com/document/d/15JX0X1Reny-b6ptbkC4ADLikTLXrJYg3/export?format=pdf)

The Hero section download button uses this same URL. To update the resume, simply edit the Google Doc — the link stays the same.

## Deployment

Deployment instructions will be added once the site is ready to go live.

## Social

- GitHub: [github.com/RogerMcKenzie](https://github.com/RogerMcKenzie)
- LinkedIn: [linkedin.com/in/rogermckenzie](https://www.linkedin.com/in/rogermckenzie/)
- YouTube: [youtube.com/@RogerMcKenzie1](https://www.youtube.com/@RogerMcKenzie1)
