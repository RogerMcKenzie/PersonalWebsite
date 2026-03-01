"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { ExternalLink, Star, GitFork } from "lucide-react";
import type { GitHubRepo } from "@/lib/github";
import { MouseEvent } from "react";

const languageColors: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-green-500",
  Java: "bg-orange-500",
  "C++": "bg-pink-500",
  HTML: "bg-red-500",
  CSS: "bg-purple-500",
  Shell: "bg-emerald-500",
};

export function ProjectCard({
  repo,
  index,
}: {
  repo: GitHubRepo;
  index: number;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      className="group relative flex flex-col rounded-2xl bg-white/5 border border-white/10 p-6 sm:p-8 overflow-hidden transition-colors hover:border-white/20 hover:bg-white/10"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.06),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative z-10 flex items-start justify-between">
        <h3 className="font-display text-xl font-semibold text-white">
          {repo.name}
        </h3>
        <ExternalLink
          size={18}
          className="flex-shrink-0 text-white/50 transition-colors group-hover:text-white"
        />
      </div>

      <p className="relative z-10 mt-3 flex-grow text-white/70">
        {repo.description ?? "No description provided."}
      </p>

      <div className="relative z-10 mt-6 flex items-center gap-4 text-sm text-white/60">
        {repo.stargazers_count > 0 && (
          <span className="flex items-center gap-1">
            <Star size={14} />
            {repo.stargazers_count}
          </span>
        )}
        {repo.forks_count > 0 && (
          <span className="flex items-center gap-1">
            <GitFork size={14} />
            {repo.forks_count}
          </span>
        )}
      </div>

      {repo.languages && repo.languages.length > 0 && (
        <div className="relative z-10 mt-4 flex flex-wrap gap-2">
          {repo.languages.map((lang) => (
            <span
              key={lang}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/80 backdrop-blur-sm transition-colors group-hover:bg-white/20"
            >
              <span
                className={`h-2 w-2 rounded-full ${languageColors[lang] ?? "bg-gray-400"}`}
              />
              {lang}
            </span>
          ))}
        </div>
      )}
    </motion.a>
  );
}
