"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Download, Sparkles, Youtube } from "lucide-react";
import { FaAmazon } from "react-icons/fa";
import { siteConfig } from "@/lib/data";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div className="relative z-10">
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.5 }}
              className="text-xs font-semibold uppercase tracking-[0.22em] text-amber"
            >
              Hello, I&apos;m
            </motion.p>

            <motion.h1
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-3 font-serif-display text-5xl font-semibold leading-[1.02] text-foreground sm:text-6xl lg:text-7xl"
            >
              Roger McKenzie
            </motion.h1>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-5 text-2xl font-medium text-foreground sm:text-3xl"
            >
              Software Developer &amp; Content Creator
            </motion.p>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Computer Science student at the University of Florida who builds
              useful software and shares what I learn through tech content.
            </motion.p>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <a
                href="/projects"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-accent-hover"
              >
                Explore Projects
                <ArrowRight size={16} />
              </a>
              <a
                href={siteConfig.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Download Resume
                <Download size={16} />
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border bg-cream shadow-[0_30px_60px_-30px_rgba(15,23,42,0.25)]"
          >
            <Image
              src="/profile.jpg"
              alt="Roger McKenzie"
              fill
              priority
              sizes="(min-width: 1024px) 36rem, (min-width: 640px) 28rem, 100vw"
              className="object-cover object-center"
            />
          </motion.div>
        </div>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 grid grid-cols-1 gap-2 rounded-2xl border border-border bg-card/70 p-3 sm:grid-cols-3 sm:p-4"
        >
          <PillRow
            icon={<FaAmazon className="text-[#ff9900]" size={20} />}
            title="Amazon Experience"
            subtitle="Software Engineering Intern"
          />
          <PillRow
            icon={<Sparkles size={20} className="text-foreground" />}
            title="AI Products"
            subtitle="Building useful tools"
          />
          <PillRow
            icon={<Youtube size={20} className="text-amber" />}
            title="Tech Content"
            subtitle="Sharing on YouTube"
          />
        </motion.div>
      </div>
    </section>
  );
}

function PillRow({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2 sm:px-4">
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
