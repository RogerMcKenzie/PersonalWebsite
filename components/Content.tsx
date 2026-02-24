"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";

const youtubeChannelUrl = "https://www.youtube.com/@RogerMcKenzie1";

export function Content() {
  return (
    <section id="content" className="relative bg-muted py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-dot-pattern opacity-[0.04]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-heading font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Content
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Tech reviews, tutorials, and behind-the-scenes looks at software
            development. Check out my YouTube channel for the latest content.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-12"
        >
          <a
            href={youtubeChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center justify-center rounded-2xl bg-white p-12 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#fa4616]/20 sm:p-16"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF0000]/10 text-[#FF0000] transition-transform group-hover:scale-110">
              <Play size={28} fill="currentColor" />
            </div>
            <h3 className="mt-6 font-display text-xl font-semibold text-foreground">
              Watch on YouTube
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              @RogerMcKenzie1 — Tech reviews, tutorials &amp; more
            </p>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
