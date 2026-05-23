"use client";

import { BookOpen, Briefcase, Cloud, GraduationCap } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { education, experiences } from "@/lib/data";

export function About() {
  return (
    <section id="about" className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-warm">
              About Me
            </p>
            <h2 className="mt-3 max-w-md font-serif-display text-4xl font-semibold leading-tight text-foreground sm:text-6xl">
              Building with Purpose
            </h2>
          </Reveal>

          <div className="grid gap-10">
            <Reveal
              delay={0.08}
              className="space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg"
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
            </Reveal>

            <Reveal delay={0.14}>
              <div className="grid border-y border-border sm:grid-cols-3">
                <InfoRow
                  icon={<GraduationCap size={18} className="text-warm" />}
                  label={education.school}
                  value={education.degree}
                />
                <InfoRow
                  icon={<Cloud size={18} className="text-warm" />}
                  label="Interests"
                  value="Cloud, AI, Full-Stack"
                />
                <InfoRow
                  icon={<BookOpen size={18} className="text-warm" />}
                  label="Currently"
                  value="Building | Learning | Sharing"
                />
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.18} className="mt-16">
          <div className="grid gap-6 border-t border-border pt-6 lg:grid-cols-[0.35fr_1fr]">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-warm">
              <Briefcase size={16} />
              Experience
            </div>
            <div className="grid divide-y divide-border">
              {experiences.slice(0, 3).map((experience) => (
                <div
                  key={`${experience.company}-${experience.role}`}
                  className="grid gap-3 py-5 sm:grid-cols-[0.55fr_1fr]"
                >
                  <div>
                    <p className="font-serif-display text-2xl font-semibold text-foreground">
                      {experience.company}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {experience.period}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {experience.role}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {experience.bullets[0]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
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
    <div className="flex items-start gap-3 border-border py-5 sm:border-r sm:px-5 sm:last:border-r-0">
      <span className="mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}
