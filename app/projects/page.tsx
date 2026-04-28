import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProjectsExplorer } from "@/components/ProjectsExplorer";

export const metadata: Metadata = {
  title: "Projects",
  description: "Products, tools, and content built by Roger McKenzie.",
};

export default function ProjectsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <ProjectsExplorer />
      </main>
      <Footer />
    </>
  );
}
