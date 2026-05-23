import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/lib/data";
import { PageTransition } from "@/components/motion/PageTransition";
import { AnimatedAnchor } from "@/components/ui/AnimatedAnchor";

export const metadata: Metadata = {
  title: "Resume",
  description: `Resume of ${siteConfig.name}.`,
};

export default function ResumePage() {
  return (
    <>
      <Navbar />
      <PageTransition>
        <main className="flex-1 bg-background">
          <section className="bg-mist">
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
              <div className="flex flex-col gap-5 border-b border-foreground/15 pb-8 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-warm">
                    Resume
                  </p>
                  <h1 className="mt-3 font-serif-display text-5xl font-semibold leading-tight text-foreground sm:text-6xl">
                    Roger McKenzie
                  </h1>
                  <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
                    Software Developer &amp; Content Creator | University of
                    Florida
                  </p>
                </div>
                <AnimatedAnchor
                  href={siteConfig.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit"
                >
                  <Download size={16} />
                  Download PDF
                </AnimatedAnchor>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
            <div className="overflow-hidden rounded-lg border border-border bg-paper shadow-[0_24px_70px_-48px_rgba(17,24,39,0.65)]">
              <iframe
                src={siteConfig.resumePreviewUrl}
                title="Roger McKenzie Resume"
                className="h-[85vh] w-full sm:h-[1100px]"
                loading="lazy"
              />
            </div>
          </section>
        </main>
      </PageTransition>
      <Footer />
    </>
  );
}
