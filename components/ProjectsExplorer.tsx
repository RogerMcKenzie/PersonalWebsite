"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  ExternalLink,
  Globe,
  LayoutGrid,
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
import { Reveal } from "@/components/motion/Reveal";
import {
  SegmentedFilter,
  type SegmentOption,
} from "@/components/ui/SegmentedFilter";
import { AnimatedAnchor } from "@/components/ui/AnimatedAnchor";

type FilterValue = "All" | ProjectCategory;

const filters: SegmentOption<FilterValue>[] = [
  { label: "All", value: "All", icon: <LayoutGrid size={14} /> },
  { label: "Web Apps", value: "Web Apps", icon: <Globe size={14} /> },
  { label: "Extensions", value: "Extensions", icon: <Puzzle size={14} /> },
  { label: "AI", value: "AI", icon: <Sparkles size={14} /> },
];

export function ProjectsExplorer() {
  const [active, setActive] = useState<FilterValue>("All");
  const reduceMotion = useReducedMotion();

  const filtered = useMemo(() => {
    if (active === "All") return featuredProjects;
    return featuredProjects.filter((p) => p.category.includes(active));
  }, [active]);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink text-accent-foreground">
        <div className="absolute inset-y-0 right-0 w-full opacity-55 lg:w-[58%]">
          <Image
            src="/profile.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-cover object-[62%_center]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,24,39,1)_0%,rgba(17,24,39,0.92)_34%,rgba(17,24,39,0.5)_66%,rgba(17,24,39,0.18)_100%)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-warm">
              My Work
            </p>
            <h1 className="mt-3 font-serif-display text-6xl font-semibold leading-[1.02] sm:text-7xl">
              Projects
            </h1>
            <p className="mt-4 font-serif-display text-2xl font-medium sm:text-3xl">
              Products I&apos;ve built and shipped
            </p>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/72 sm:text-lg">
              Solving real problems through products, tools, and content that
              help people learn, build, and grow.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <SegmentedFilter
              options={filters}
              value={active}
              onChange={setActive}
              ariaLabel="Project category"
              layoutId="project-filter-active"
            />
            <p className="text-sm text-muted-foreground">
              Showing {filtered.length} project{filtered.length === 1 ? "" : "s"}
            </p>
          </div>

          <motion.div layout className="mt-8 grid gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((project, index) => (
                <ProjectRow
                  key={project.slug}
                  project={project}
                  index={index}
                />
              ))}
              {filtered.length === 0 && (
                <motion.div
                  key="empty-projects"
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.28 }}
                  className="rounded-lg border border-dashed border-border bg-paper px-6 py-12 text-center"
                >
                  <p className="font-serif-display text-3xl font-semibold text-foreground">
                    No projects in this category yet
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Try another filter to browse the current featured work.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
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
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      id={project.slug}
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.38,
        delay: index * 0.04,
        ease: [0.22, 1, 0.36, 1],
        layout: { type: "spring", stiffness: 420, damping: 38 },
      }}
      className="grid gap-6 rounded-lg border border-border bg-paper p-4 shadow-[0_18px_45px_-38px_rgba(17,24,39,0.5)] sm:p-5 lg:grid-cols-[300px_1fr_auto] lg:items-center"
    >
      <div className="overflow-hidden rounded-md">
        <ProjectCover project={project} />
      </div>

      <div>
        <h2 className="font-serif-display text-3xl font-semibold text-foreground">
          {project.title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
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
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
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

      <div className="flex flex-row flex-wrap gap-2 lg:flex-col lg:items-stretch">
        {project.caseStudyUrl ? (
          <AnimatedAnchor href={project.caseStudyUrl} className="px-4 py-2.5">
            Case Study
            <ArrowRight size={14} />
          </AnimatedAnchor>
        ) : (
          <span className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-muted px-4 py-2.5 text-sm font-semibold text-muted-foreground">
            Case study soon
          </span>
        )}
        {project.liveUrl ? (
          <AnimatedAnchor
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            className="px-4 py-2.5"
          >
            Live Demo
            <ExternalLink size={14} />
          </AnimatedAnchor>
        ) : (
          <span className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-paper px-4 py-2.5 text-sm font-semibold text-muted-foreground">
            Demo coming soon
          </span>
        )}
        {project.github && (
          <AnimatedAnchor
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.title} GitHub repository`}
            variant="secondary"
            className="px-3 py-2.5 lg:self-center"
          >
            <FaGithub size={18} />
          </AnimatedAnchor>
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
