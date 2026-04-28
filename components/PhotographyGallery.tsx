"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Camera, MapPin, X } from "lucide-react";
import { photos, type Photo, type PhotoCategory } from "@/lib/data";

const filters: ("All" | PhotoCategory)[] = [
  "All",
  "Travel",
  "Street",
  "Portrait",
  "Nature",
  "Architecture",
];

const sizeClass: Record<NonNullable<Photo["size"]> | "default", string> = {
  default: "row-span-1 col-span-1",
  square: "row-span-1 col-span-1",
  tall: "row-span-2 col-span-1",
  wide: "row-span-1 col-span-2",
};

export function PhotographyGallery() {
  const [active, setActive] = useState<"All" | PhotoCategory>("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      active === "All"
        ? photos
        : photos.filter((p) => p.category === active),
    [active],
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight")
        setOpenIndex((i) => (i === null ? null : (i + 1) % filtered.length));
      if (e.key === "ArrowLeft")
        setOpenIndex((i) =>
          i === null ? null : (i - 1 + filtered.length) % filtered.length,
        );
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, filtered.length]);

  return (
    <>
      <section className="bg-background pt-12 sm:pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber">
            Through My Lens
          </p>
          <h1 className="mt-3 font-serif-display text-6xl font-semibold leading-[1.02] text-foreground sm:text-7xl">
            Photography
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            A personal collection - moments I&apos;ve captured between lines
            of code. Every frame tells a small story.
          </p>
        </div>
      </section>

      <section className="bg-background py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => {
              const isActive = active === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActive(f)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Showing {filtered.length} photo{filtered.length === 1 ? "" : "s"}
          </p>

          <div className="mt-6 grid auto-rows-[200px] grid-cols-2 gap-3 sm:auto-rows-[260px] sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((photo, idx) => (
              <PhotoTile
                key={photo.src}
                photo={photo}
                onClick={() => setOpenIndex(idx)}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
              No photos in this category yet.
            </div>
          )}
        </div>
      </section>

      <Lightbox
        photos={filtered}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onPrev={() =>
          setOpenIndex((i) =>
            i === null ? null : (i - 1 + filtered.length) % filtered.length,
          )
        }
        onNext={() =>
          setOpenIndex((i) =>
            i === null ? null : (i + 1) % filtered.length,
          )
        }
      />
    </>
  );
}

function PhotoTile({
  photo,
  onClick,
}: {
  photo: Photo;
  onClick: () => void;
}) {
  const span = sizeClass[photo.size ?? "default"];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-cream ${span}`}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-4 text-left text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        {photo.caption && (
          <p className="font-serif-display text-lg font-semibold leading-tight">
            {photo.caption}
          </p>
        )}
        {(photo.location || photo.date) && (
          <p className="mt-1 flex items-center gap-1.5 text-xs">
            <MapPin size={12} />
            {[photo.location, photo.date].filter(Boolean).join(" | ")}
          </p>
        )}
      </div>
    </motion.button>
  );
}

function Lightbox({
  photos,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  photos: Photo[];
  index: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const photo = index === null ? null : photos[index];
  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 px-4 py-8"
          onClick={onClose}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:flex"
            aria-label="Previous"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:flex"
            aria-label="Next"
          >
            <ArrowRight size={20} />
          </button>

          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-black">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 80vw, 100vw"
                className="object-contain"
                priority
              />
            </div>
            <div className="mt-3 flex items-start justify-between gap-4 text-white">
              <div>
                {photo.caption && (
                  <p className="font-serif-display text-xl font-semibold">
                    {photo.caption}
                  </p>
                )}
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
                  {photo.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={12} /> {photo.location}
                    </span>
                  )}
                  {photo.date && (
                    <span className="inline-flex items-center gap-1.5">
                      <Camera size={12} /> {photo.date}
                    </span>
                  )}
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                    {photo.category}
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
