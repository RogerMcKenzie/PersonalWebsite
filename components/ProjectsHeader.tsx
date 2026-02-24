"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/lib/data";

export function ProjectsHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="section-heading section-heading-light font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Featured Projects
      </h2>
      <p className="mt-4 max-w-2xl text-white/70">
        Recent repositories from{" "}
        <a
          href={siteConfig.social.github}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-accent-secondary transition-colors hover:underline"
        >
          GitHub
        </a>
        . Check out the full profile for more.
      </p>
    </motion.div>
  );
}
