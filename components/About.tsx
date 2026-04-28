"use client";

import { motion } from "framer-motion";
import { BookOpen, Cloud, GraduationCap } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
};

export function About() {
  return (
    <section id="about" className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.2fr_1fr]">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber">
              About Me
            </p>
            <h2 className="mt-3 font-serif-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              Building with Purpose
            </h2>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            <p>
              I&apos;m a Computer Science student at the University of Florida
              with a passion for building software that solves real problems.
              I&apos;ve had the opportunity to work as a Software Engineering
              Intern at Amazon, where I contributed to large-scale systems
              used by millions.
            </p>
            <p>
              I&apos;m especially interested in cloud technologies, AI, and
              product development. Through my YouTube channel, I share what
              I&apos;m learning and building to help others grow in tech.
            </p>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl border border-border bg-card p-5 sm:p-6"
          >
            <InfoRow
              icon={<GraduationCap size={18} className="text-amber" />}
              label="University of Florida"
              value="Computer Science"
            />
            <Divider />
            <InfoRow
              icon={<Cloud size={18} className="text-amber" />}
              label="Interests"
              value="Cloud, AI, Full-Stack"
            />
            <Divider />
            <InfoRow
              icon={<BookOpen size={18} className="text-amber" />}
              label="Currently"
              value="Building | Learning | Sharing"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="mt-0.5">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-border" />;
}
