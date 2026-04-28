"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { featuredProjects, type FeaturedProject } from "@/lib/data";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
};

export function FeaturedProjects() {
  return (
    <section id="projects" className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between gap-3"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber">
            Featured Projects
          </p>
          <a
            href="/projects"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber hover:text-amber-hover"
          >
            View all projects
            <ArrowRight size={16} />
          </a>
        </motion.div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project, idx) => (
            <ProjectCard key={project.slug} project={project} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  index,
}: {
  project: FeaturedProject;
  index: number;
}) {
  return (
    <motion.a
      href={project.liveUrl ?? `/projects#${project.slug}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(15,23,42,0.18)]"
    >
      <ProjectCover project={project} />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-serif-display text-2xl font-semibold text-foreground">
          {project.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tech.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.a>
  );
}

export function ProjectCover({ project }: { project: FeaturedProject }) {
  return (
    <div
      className={`relative flex aspect-[16/10] items-center justify-center overflow-hidden ${project.coverClass} ${project.coverTextClass ?? "text-white"}`}
    >
      <div className="absolute inset-3 rounded-xl border border-white/10" />
      <div className="relative px-6 text-center">
        <div className="font-serif-display text-3xl font-semibold leading-tight">
          {project.title}
        </div>
        <div className="mt-2 text-xs font-medium opacity-80">
          {project.tagline}
        </div>
      </div>
    </div>
  );
}
