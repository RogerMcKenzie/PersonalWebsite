"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { SlantedDivider } from "./SectionDivider";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5 },
};

export function About() {
  return (
    <section id="about" className="relative bg-muted py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-dot-pattern opacity-[0.04] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.h2
          {...fadeInUp}
          className="section-heading font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          About Me
        </motion.h2>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
          {/* Profile photo — left on desktop */}
          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-center"
          >
            <div className="relative h-80 w-full max-w-sm overflow-hidden rounded-2xl border border-white/60 bg-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md lg:h-96">
              <Image
                src="/profile.jpg"
                alt="Roger McKenzie"
                fill
                priority
                sizes="(min-width: 1024px) 24rem, (min-width: 640px) 20rem, 100vw"
                className="object-cover object-top"
              />
            </div>
          </motion.div>

          {/* Text column — right on desktop */}
          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <p className="text-lg leading-relaxed text-muted-foreground">
              I&apos;m a Computer Science student at the University of Florida
              with a passion for building software that solves real problems.
              From engineering A/B testing platforms at Amazon to creating Chrome
              extensions powered by AI, I love turning ideas into polished,
              user-focused products.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              When I&apos;m not coding, you&apos;ll find me creating tech
              content on YouTube, exploring the latest in cloud computing and
              deep learning, or mentoring the next generation of developers.
            </p>
          </motion.div>
        </div>
      </div>
      <SlantedDivider bgColor="#ffffff" />
    </section>
  );
}
