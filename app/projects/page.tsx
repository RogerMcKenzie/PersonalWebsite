import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProjectsExplorer } from "@/components/ProjectsExplorer";
import { PageTransition } from "@/components/motion/PageTransition";

export const metadata: Metadata = {
  title: "Projects",
  description: "Products, tools, and content built by Roger McKenzie.",
};

export default function ProjectsPage() {
  return (
    <>
      <Navbar />
      <PageTransition>
        <main className="flex-1 bg-background">
          <ProjectsExplorer />
        </main>
      </PageTransition>
      <Footer />
    </>
  );
}
