import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: "Resume",
  description: `Resume of ${siteConfig.name}.`,
};

export default function ResumePage() {
  return (
    <>
      <Navbar />
      <main className="bg-background">
        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber">
                Resume
              </p>
              <h1 className="mt-3 font-serif-display text-5xl font-semibold leading-tight text-foreground sm:text-6xl">
                Roger McKenzie
              </h1>
              <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                Software Developer &amp; Content Creator | University of Florida
              </p>
            </div>
            <a
              href={siteConfig.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-accent-hover"
            >
              <Download size={16} />
              Download PDF
            </a>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)]">
            <iframe
              src={siteConfig.resumePreviewUrl}
              title="Roger McKenzie Resume"
              className="h-[85vh] w-full sm:h-[1100px]"
              loading="lazy"
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
