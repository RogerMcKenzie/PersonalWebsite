"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { siteConfig } from "@/lib/data";
import { SlantedDivider } from "./SectionDivider";

export function Resume() {
  return (
    <section id="resume" className="relative bg-[#eff6ff] py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="section-heading font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Resume
            </h2>
            <a
              href={siteConfig.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-accent-secondary px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_20px_rgba(250,70,22,0.3)]"
            >
              <Download size={16} />
              Download PDF
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8"
        >
          <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
            <div className="relative aspect-[8.5/11] w-full">
              <iframe
                src={siteConfig.resumePreviewUrl}
                title="Roger McKenzie Resume"
                className="absolute inset-0 h-full w-full"
                loading="lazy"
              />
            </div>
          </div>
        </motion.div>
      </div>
      <SlantedDivider bgColor="#0a0f1c" flip />
    </section>
  );
}
