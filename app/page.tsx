import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { FeaturedProjects } from "@/components/FeaturedProjects";
import { Content } from "@/components/Content";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/motion/PageTransition";

export default function Home() {
  return (
    <>
      <Navbar />
      <PageTransition>
        <main className="flex-1">
          <Hero />
          <About />
          <FeaturedProjects />
          <Content />
        </main>
      </PageTransition>
      <Footer />
    </>
  );
}
