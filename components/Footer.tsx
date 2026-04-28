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
    <footer className="border-t border-border bg-cream">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-center sm:px-6 md:grid-cols-3 md:items-center md:text-left">
        <div className="flex flex-col items-center gap-1 md:items-start">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground font-display text-sm font-bold text-accent-foreground">
              RM
            </span>
            <span className="font-medium text-foreground">{siteConfig.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Software Developer &amp; Content Creator
          </p>
          <a
            href={siteConfig.url}
            className="text-sm text-amber hover:text-amber-hover"
          >
            rogermckenzie.dev
          </a>
        </div>

        <a
          href={`mailto:${displayEmail}`}
          className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Mail size={16} />
          {displayEmail}
        </a>

        <div className="flex items-center justify-center gap-6 md:justify-end">
          {socials.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
