"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  ExternalLink,
  Globe,
  LayoutGrid,
  PlayCircle,
  Puzzle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import {
  featuredProjects,
  type FeaturedProject,
  type ProjectCategory,
} from "@/lib/data";
import { ProjectCover } from "./FeaturedProjects";

const filters: {
  label: string;
  value: "All" | ProjectCategory;
  icon: React.ReactNode;
}[] = [
  { label: "All", value: "All", icon: <LayoutGrid size={14} /> },
  { label: "Web Apps", value: "Web Apps", icon: <Globe size={14} /> },
  { label: "Extensions", value: "Extensions", icon: <Puzzle size={14} /> },
  { label: "AI", value: "AI", icon: <Sparkles size={14} /> },
  { label: "Content", value: "Content", icon: <PlayCircle size={14} /> },
];

export function ProjectsExplorer() {
  const [active, setActive] = useState<"All" | ProjectCategory>("All");

  const filtered = useMemo(() => {
    if (active === "All") return featuredProjects;
    return featuredProjects.filter((p) => p.category.includes(active));
  }, [active]);

  return (
    <>
      <section className="relative overflow-hidden bg-background">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] lg:block"
          aria-hidden
        >
          <div className="relative h-full w-full">
            <Image
              src="/profile.jpg"
              alt=""
              fill
              priority
              sizes="55vw"
              className="object-cover object-center opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber">
            My Work
          </p>
          <h1 className="mt-3 font-serif-display text-6xl font-semibold leading-[1.02] text-foreground sm:text-7xl">
            Projects
          </h1>
          <p className="mt-4 font-serif-display text-2xl font-medium text-foreground sm:text-3xl">
            Products I&apos;ve built and shipped
          </p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Solving real problems through products, tools, and content that
            help people learn, build, and grow.
          </p>
        </div>
      </section>

      <section className="bg-background pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => {
              const isActive = active === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setActive(f.value)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {f.icon}
                  {f.label}
                </button>
              );
            })}
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Showing {filtered.length} project{filtered.length === 1 ? "" : "s"}
          </p>

          <div className="mt-6 flex flex-col gap-5">
            {filtered.map((project, index) => (
              <ProjectRow key={project.slug} project={project} index={index} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ProjectRow({
  project,
  index,
}: {
  project: FeaturedProject;
  index: number;
}) {
  return (
    <motion.article
      id={project.slug}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="grid gap-6 rounded-2xl border border-border bg-card p-5 sm:p-6 lg:grid-cols-[300px_1fr_auto] lg:items-center"
    >
      <div className="overflow-hidden rounded-xl">
        <ProjectCover project={project} />
      </div>

      <div>
        <h2 className="font-serif-display text-2xl font-semibold text-foreground">
          {project.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {project.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {project.tech.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Meta icon={<Briefcase size={14} />} label="Role" value={project.role} />
          <Meta
            icon={<Calendar size={14} />}
            label="Timeline"
            value={project.timeline}
          />
          <Meta
            icon={<TrendingUp size={14} />}
            label="Impact"
            value={project.impact}
          />
        </div>
      </div>

      <div className="flex flex-row gap-2 lg:flex-col lg:items-stretch">
        <a
          href={project.caseStudyUrl ?? `#${project.slug}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-accent-hover"
        >
          Case Study
          <ArrowRight size={14} />
        </a>
        <a
          href={project.liveUrl ?? `#${project.slug}`}
          target={project.liveUrl ? "_blank" : undefined}
          rel={project.liveUrl ? "noopener noreferrer" : undefined}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Live Demo
          <ExternalLink size={14} />
        </a>
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-3 py-2.5 text-foreground transition-colors hover:bg-muted lg:self-center"
          >
            <FaGithub size={18} />
          </a>
        )}
      </div>
    </motion.article>
  );
}

function Meta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-muted-foreground">{icon}</span>
      <span className="font-semibold text-foreground">{label}:</span>
      <span>{value}</span>
    </span>
  );
}
