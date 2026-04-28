"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { featuredContent, siteConfig, type ContentVideo } from "@/lib/data";

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

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
};

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
            thumbnailUrl: item.thumbnail || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ""),
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
    <section id="content" className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between gap-3 border-b border-border pb-4"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber">
            Latest Content
          </p>
          <a
            href={siteConfig.social.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber hover:text-amber-hover"
          >
            View all on YouTube
            <ArrowRight size={16} />
          </a>
        </motion.div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
  return (
    <motion.a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(15,23,42,0.18)]"
    >
      <div
        className={`relative flex aspect-video items-center justify-center overflow-hidden ${video.thumbnailClass}`}
      >
        <span className="px-6 text-center font-display text-2xl font-bold leading-tight text-white drop-shadow">
          {video.badge}
        </span>
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-foreground shadow-lg transition-transform group-hover:scale-110">
            <Play size={22} className="ml-0.5" fill="currentColor" />
          </span>
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-semibold text-foreground">{video.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{video.date}</p>
      </div>
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
  return (
    <motion.a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(15,23,42,0.18)]"
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-foreground shadow-lg transition-transform group-hover:scale-110">
            <Play size={22} className="ml-0.5" fill="currentColor" />
          </span>
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 font-semibold text-foreground">
          {video.title}
        </h3>
        {video.date && (
          <p className="mt-1 text-xs text-muted-foreground">{video.date}</p>
        )}
      </div>
    </motion.a>
  );
}
