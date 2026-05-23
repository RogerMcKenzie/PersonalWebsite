"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { featuredProjects, type FeaturedProject } from "@/lib/data";
import { Reveal } from "@/components/motion/Reveal";
import { AnimatedAnchor } from "@/components/ui/AnimatedAnchor";

export function FeaturedProjects() {
  return (
    <section id="projects" className="bg-mist py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="flex flex-col gap-4 border-b border-foreground/15 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-warm">
              Featured Projects
            </p>
            <h2 className="mt-3 font-serif-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              Products with a point of view
            </h2>
          </div>
          <AnimatedAnchor href="/projects" variant="quiet" showArrow>
            View all projects
          </AnimatedAnchor>
        </Reveal>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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
  const reduceMotion = useReducedMotion();

  return (
    <motion.a
      href={project.caseStudyUrl ?? project.liveUrl ?? `/projects#${project.slug}`}
      target={!project.caseStudyUrl && project.liveUrl ? "_blank" : undefined}
      rel={!project.caseStudyUrl && project.liveUrl ? "noopener noreferrer" : undefined}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -6 }}
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group flex min-h-full flex-col overflow-hidden rounded-lg border border-foreground/10 bg-paper shadow-[0_20px_55px_-42px_rgba(17,24,39,0.55)] transition-colors hover:border-foreground/25"
    >
      <ProjectCover project={project} />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-warm">
          {project.role}
        </p>
        <h3 className="mt-2 font-serif-display text-2xl font-semibold text-foreground">
          {project.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
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
  if (project.coverImage) {
    return (
      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-muted">
        <Image
          src={project.coverImage}
          alt={`${project.title} cover`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 rounded-md border border-foreground/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
    );
  }

  return (
    <div
      className={`relative flex aspect-[16/10] items-center justify-center overflow-hidden ${project.coverClass} ${project.coverTextClass ?? "text-white"}`}
    >
      <div className="absolute inset-3 rounded-md border border-white/15 opacity-80 transition-transform duration-500 group-hover:scale-[0.98]" />
      <div className="relative px-6 text-center transition-transform duration-500 group-hover:-translate-y-1">
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
