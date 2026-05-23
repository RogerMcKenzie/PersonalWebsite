"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
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
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 700], [0, 70]);
  const imageScale = useTransform(scrollY, [0, 700], [1, 1.06]);

  return (
    <section className="relative isolate overflow-hidden bg-ivory">
      <motion.div
        aria-hidden
        className="absolute inset-0 z-0"
        style={reduceMotion ? undefined : { y: imageY, scale: imageScale }}
      >
        <Image
          src="/profile.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[63%_center]"
        />
      </motion.div>
      <div
        aria-hidden
        className="absolute inset-0 z-0 bg-[linear-gradient(90deg,rgba(251,248,240,0.98)_0%,rgba(251,248,240,0.94)_36%,rgba(251,248,240,0.48)_66%,rgba(251,248,240,0.08)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-0 h-36 bg-[linear-gradient(180deg,rgba(247,244,236,0)_0%,rgba(247,244,236,1)_100%)]"
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(88svh-4rem)] max-w-7xl flex-col justify-end px-4 pb-8 pt-16 sm:px-6 sm:pb-10 lg:justify-center lg:py-20">
        <div className="max-w-3xl">
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
            className="mt-4 max-w-3xl font-serif-display text-5xl font-semibold leading-[1.02] text-foreground sm:text-7xl lg:text-8xl"
          >
            Roger McKenzie
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
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

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.28 }}
          className="mt-14 grid border-y border-border/80 bg-ivory/75 backdrop-blur-sm sm:grid-cols-3"
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
