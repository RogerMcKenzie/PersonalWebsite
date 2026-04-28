import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PhotographyGallery } from "@/components/PhotographyGallery";

export const metadata: Metadata = {
  title: "Photography",
  description:
    "A personal photography portfolio - moments captured between lines of code.",
};

export default function PhotographyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <PhotographyGallery />
      </main>
      <Footer />
    </>
  );
}
