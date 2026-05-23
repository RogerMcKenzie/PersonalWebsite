"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Download, Sparkles, Youtube } from "lucide-react";
import { FaAmazon } from "react-icons/fa";
import { siteConfig } from "@/lib/data";
import { AnimatedAnchor } from "@/components/ui/AnimatedAnchor";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-ivory">
      <div className="relative z-10 mx-auto flex min-h-[calc(88svh-4rem)] max-w-7xl flex-col justify-center px-4 pb-8 pt-16 sm:px-6 sm:pb-10 lg:py-20">
        
        <div className="flex flex-col-reverse gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          {/* Text Content */}
          <div className="max-w-2xl flex-1">
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.5 }}
              className="text-xs font-semibold uppercase tracking-[0.22em] text-warm"
            >
              Software Developer &amp; Content Creator
            </motion.p>

            <motion.h1
              {...fadeUp}
              transition={{
                duration: 0.65,
                delay: 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-4 font-serif-display text-5xl font-semibold leading-[1.02] text-foreground sm:text-7xl lg:text-8xl"
            >
              Roger McKenzie
            </motion.h1>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl"
            >
              Computer Science student at the University of Florida who builds
              useful software and shares what I learn through tech content.
            </motion.p>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <AnimatedAnchor href="/projects" showArrow>
                Explore Projects
              </AnimatedAnchor>
              <AnimatedAnchor
                href={siteConfig.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
              >
                <Download size={16} />
                Download Resume
              </AnimatedAnchor>
            </motion.div>
          </div>

          {/* Profile Image Container */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-sm flex-1 lg:max-w-md"
          >
            <div className="relative aspect-square w-full">
              {/* Depth Box */}
              <div className="absolute -bottom-4 -right-4 top-4 left-4 rounded-xl bg-warm/20 sm:-bottom-6 sm:-right-6 sm:top-6 sm:left-6" />
              <div className="absolute -bottom-2 -right-2 top-2 left-2 rounded-xl bg-warm/40 sm:-bottom-3 sm:-right-3 sm:top-3 sm:left-3" />
              
              {/* Image */}
              <div className="relative h-full w-full overflow-hidden rounded-xl border border-border bg-muted shadow-2xl">
                <Image
                  src="/profile.jpg"
                  alt="Roger McKenzie"
                  fill
                  priority
                  sizes="(min-width: 1024px) 450px, 100vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Proof Section */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.28 }}
          className="mt-16 grid border-y border-border/80 bg-paper/50 sm:grid-cols-3 lg:mt-24"
        >
          <ProofRow
            icon={<FaAmazon className="text-[#ff9900]" size={20} />}
            title="Amazon Experience"
            subtitle="Software Engineering Intern"
          />
          <ProofRow
            icon={<Sparkles size={20} className="text-warm" />}
            title="AI Products"
            subtitle="Building useful tools"
          />
          <ProofRow
            icon={<Youtube size={20} className="text-warm" />}
            title="Tech Content"
            subtitle="Sharing on YouTube"
          />
        </motion.div>
      </div>
    </section>
  );
}

function ProofRow({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 border-border px-4 py-4 sm:border-r sm:last:border-r-0">
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-paper/80">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
