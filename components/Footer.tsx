"use client";

import { Mail } from "lucide-react";
import { FaGithub, FaLinkedin, FaYoutube } from "react-icons/fa";
import { siteConfig } from "@/lib/data";

const socials = [
  { icon: FaLinkedin, href: siteConfig.social.linkedin, label: "LinkedIn" },
  { icon: FaGithub, href: siteConfig.social.github, label: "GitHub" },
  { icon: FaYoutube, href: siteConfig.social.youtube, label: "YouTube" },
];

const displayEmail = "roger@rogermckenzie.dev";

export function Footer() {
  return (
    <footer className="border-t border-border bg-ink text-accent-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-ivory font-display text-sm font-bold text-ink">
              RM
            </span>
            <span className="font-medium">{siteConfig.name}</span>
          </div>
          <p className="text-sm text-white/62">
            Software Developer &amp; Content Creator
          </p>
          <a
            href={siteConfig.url}
            className="w-fit text-sm text-warm transition-colors hover:text-white"
          >
            rogermckenzie.dev
          </a>
        </div>

        <a
          href={`mailto:${displayEmail}`}
          className="inline-flex items-center justify-start gap-2 text-sm text-white/70 transition-colors hover:text-white md:justify-center"
        >
          <Mail size={16} />
          {displayEmail}
        </a>

        <div className="flex items-center gap-5 md:justify-end">
          {socials.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
              aria-label={label}
            >
              <Icon size={18} />
              <span className="hidden sm:inline">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
