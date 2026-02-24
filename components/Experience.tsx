"use client";

import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import { experiences } from "@/lib/data";

export function Experience() {
  return (
    <section id="experience" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          Experience
        </motion.h2>

        <div className="relative mt-12">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 hidden h-full w-px bg-border md:left-8 md:block" />

          <div className="space-y-8 md:space-y-12">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.company}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative md:pl-20"
              >
                {/* Timeline dot */}
                <div className="absolute left-0 top-0 hidden md:block">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card">
                    <Briefcase size={22} className="text-accent" />
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-accent/30 sm:p-8">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-card-foreground">
                        {exp.role}
                      </h3>
                      <p className="font-medium text-accent">{exp.company}</p>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground sm:mt-0 sm:text-right">
                      <p>{exp.period}</p>
                      <p>{exp.location}</p>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2">
                    {exp.bullets.map((bullet, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-muted-foreground"
                      >
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent/60" />
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  {exp.tech && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {exp.tech.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
