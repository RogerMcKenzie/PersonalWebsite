"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Camera, Images, MapPin, X } from "lucide-react";
import { photos, type Photo, type PhotoCategory } from "@/lib/data";
import { Reveal } from "@/components/motion/Reveal";
import {
  SegmentedFilter,
  type SegmentOption,
} from "@/components/ui/SegmentedFilter";

type FilterValue = "All" | PhotoCategory;

const allFilters: SegmentOption<FilterValue>[] = [
  { label: "All", value: "All" },
  { label: "Travel", value: "Travel" },
  { label: "Street", value: "Street" },
  { label: "Portrait", value: "Portrait" },
  { label: "Nature", value: "Nature" },
  { label: "Architecture", value: "Architecture" },
];

const sizeClass: Record<NonNullable<Photo["size"]> | "default", string> = {
  default: "row-span-1 col-span-1",
  square: "row-span-1 col-span-1",
  tall: "row-span-2 col-span-1",
  wide: "row-span-1 col-span-2",
};

export function PhotographyGallery() {
  const [active, setActive] = useState<FilterValue>("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const hasPhotos = photos.length > 0;
  const filters = useMemo(() => {
    const categories = new Set(photos.map((photo) => photo.category));
    return allFilters.filter(
      (filter) => filter.value === "All" || categories.has(filter.value),
    );
  }, []);

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
      <section className="bg-sage py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-warm">
              Through My Lens
            </p>
            <h1 className="mt-3 font-serif-display text-6xl font-semibold leading-[1.02] text-foreground sm:text-7xl">
              Photography
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              A personal collection - moments I&apos;ve captured between lines
              of code. Every frame tells a small story.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {hasPhotos ? (
            <>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <SegmentedFilter
                  options={filters}
                  value={active}
                  onChange={setActive}
                  ariaLabel="Photo category"
                  layoutId="photo-filter-active"
                />
                <p className="text-sm text-muted-foreground">
                  Showing {filtered.length} photo
                  {filtered.length === 1 ? "" : "s"}
                </p>
              </div>

              <motion.div
                layout
                className="mt-8 grid auto-rows-[200px] grid-cols-2 gap-3 sm:auto-rows-[260px] sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
              >
                <AnimatePresence mode="popLayout">
                  {filtered.map((photo, idx) => (
                    <PhotoTile
                      key={photo.src}
                      photo={photo}
                      onClick={() => setOpenIndex(idx)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          ) : (
            <EmptyPhotographyState />
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

function EmptyPhotographyState() {
  return (
    <Reveal>
      <div className="grid gap-8 border-y border-border py-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Images size={22} />
          </div>
          <h2 className="mt-5 font-serif-display text-4xl font-semibold text-foreground sm:text-5xl">
            Photo journal coming soon
          </h2>
        </div>
        <div className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          <p>
            I&apos;m selecting the first set of images now. This space will become
            a quieter record of travel, portraits, street scenes, and the small
            moments that catch my eye.
          </p>
          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
            <span className="border-t border-border pt-3">Travel</span>
            <span className="border-t border-border pt-3">Portraits</span>
            <span className="border-t border-border pt-3">Street</span>
          </div>
        </div>
      </div>
    </Reveal>
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
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      layout
      onClick={onClick}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
      transition={{ duration: 0.2 }}
      className={`group relative overflow-hidden rounded-lg border border-border bg-muted ${span}`}
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
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg bg-black">
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
