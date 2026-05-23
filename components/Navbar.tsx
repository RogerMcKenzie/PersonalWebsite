"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navLinks, siteConfig } from "@/lib/data";
import { cn } from "@/lib/utils";

function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground font-display text-sm font-bold text-accent-foreground transition-transform duration-300 group-hover:-rotate-3">
        RM
      </span>
      <span className="font-medium text-foreground">{siteConfig.name}</span>
    </Link>
  );
}

function isLinkActive(href: string, pathname: string) {
  if (href.startsWith("http") || href.startsWith("mailto:")) return false;
  if (href === "/") return pathname === "/";
  const path = href.split("#")[0] || "/";
  if (path === "/") return false;
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname() || "/";
  const reduceMotion = useReducedMotion();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-ivory/88 backdrop-blur-xl">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto] items-center px-4 sm:px-6 md:grid-cols-[1fr_auto_1fr]">
        <Logo />

        <nav className="hidden items-center gap-1 justify-self-center md:flex">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href, pathname);
            return (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="relative z-10">{link.label}</span>
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-2 -bottom-[10px] h-0.5 rounded-full bg-warm"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 520, damping: 38 }
                    }
                  />
                )}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 justify-self-end md:hidden">
          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div aria-hidden="true" className="hidden md:block" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border bg-ivory md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {navLinks.map((link) => {
                const active = isLinkActive(link.href, pathname);
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
