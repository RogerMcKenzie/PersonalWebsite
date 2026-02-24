"use client";

import { motion } from "framer-motion";
import { fallbackProjects } from "@/lib/data";

export function FallbackProjects() {
  return (
    <div className="mt-12 grid gap-6 md:grid-cols-2">
      {fallbackProjects.map((project, index) => (
        <motion.div
          key={project.title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="group rounded-2xl bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-accent-tertiary/10 sm:p-8"
        >
          <h3 className="font-display text-xl font-semibold text-card-foreground">
            {project.title}
          </h3>
          <p className="mt-3 text-muted-foreground">{project.description}</p>

          <ul className="mt-4 space-y-2">
            {project.bullets.map((bullet, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-tertiary/60" />
                {bullet}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <span
                key={t}
                className="rounded-full bg-accent-secondary/10 px-2.5 py-0.5 text-xs font-medium text-accent-secondary"
              >
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
