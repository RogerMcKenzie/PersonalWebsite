"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Play } from "lucide-react";
import { featuredContent, siteConfig, type ContentVideo } from "@/lib/data";
import { Reveal } from "@/components/motion/Reveal";
import { AnimatedAnchor } from "@/components/ui/AnimatedAnchor";

const youtubeUploadsFeedUrl =
  "https://www.youtube.com/feeds/videos.xml?channel_id=UCJhcT-FAakAVf55H2HmfeuA";
const youtubeUploadsApiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(youtubeUploadsFeedUrl)}`;

interface FeedItem {
  guid?: string;
  title?: string;
  link?: string;
  pubDate?: string;
  thumbnail?: string;
}

interface FeedResponse {
  status?: string;
  items?: FeedItem[];
}

interface RemoteVideo {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  date: string;
}

function extractVideoId(link?: string) {
  if (!link) return "";
  try {
    return new URL(link).searchParams.get("v") ?? "";
  } catch {
    return "";
  }
}

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function Content() {
  const [videos, setVideos] = useState<RemoteVideo[]>([]);

  useEffect(() => {
    let active = true;
    fetch(youtubeUploadsApiUrl, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: FeedResponse | null) => {
        if (!active || !data || data.status !== "ok") return;
        const items = (data.items ?? []).slice(0, 3).map((item, i) => {
          const id = extractVideoId(item.link);
          return {
            id: item.guid || `${id}-${i}`,
            title: item.title ?? "",
            url: item.link ?? siteConfig.social.youtube,
            thumbnailUrl:
              item.thumbnail ||
              (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ""),
            date: formatDate(item.pubDate),
          };
        });
        setVideos(items.filter((v) => v.thumbnailUrl));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="content" className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-warm">
              Latest Content
            </p>
            <h2 className="mt-3 font-serif-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              Building in public
            </h2>
          </div>
          <AnimatedAnchor
            href={siteConfig.social.youtube}
            target="_blank"
            rel="noopener noreferrer"
            variant="quiet"
            showArrow
          >
            View all on YouTube
          </AnimatedAnchor>
        </Reveal>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {videos.length > 0
            ? videos.map((video, i) => (
                <RemoteVideoCard key={video.id} video={video} index={i} />
              ))
            : featuredContent.map((video, i) => (
                <FeaturedVideoCard key={video.title} video={video} index={i} />
              ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedVideoCard({
  video,
  index,
}: {
  video: ContentVideo;
  index: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -6 }}
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group flex min-h-full flex-col overflow-hidden rounded-lg border border-border bg-paper transition-colors hover:border-foreground/25"
    >
      <div
        className={`relative flex aspect-video items-center justify-center overflow-hidden ${video.thumbnailClass}`}
      >
        <span className="px-6 text-center font-display text-2xl font-bold leading-tight text-white drop-shadow">
          {video.badge}
        </span>
        <PlayButton />
      </div>
      <VideoText title={video.title} date={video.date} />
    </motion.a>
  );
}

function RemoteVideoCard({
  video,
  index,
}: {
  video: RemoteVideo;
  index: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -6 }}
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group flex min-h-full flex-col overflow-hidden rounded-lg border border-border bg-paper transition-colors hover:border-foreground/25"
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <PlayButton />
      </div>
      <VideoText title={video.title} date={video.date} />
    </motion.a>
  );
}

function PlayButton() {
  return (
    <span className="absolute inset-0 flex items-center justify-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-foreground shadow-lg transition-transform duration-300 group-hover:scale-110">
        <Play size={22} className="ml-0.5" fill="currentColor" />
      </span>
    </span>
  );
}

function VideoText({ title, date }: { title: string; date?: string }) {
  return (
    <div className="flex flex-1 flex-col p-5">
      <h3 className="line-clamp-2 font-semibold text-foreground">{title}</h3>
      {date && <p className="mt-1 text-xs text-muted-foreground">{date}</p>}
    </div>
  );
}
