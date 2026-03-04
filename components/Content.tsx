"use client";

import { motion } from "framer-motion";
import { ExternalLink, PlayCircle, Youtube } from "lucide-react";
import { useEffect, useState } from "react";

const youtubeChannelUrl = "https://www.youtube.com/@RogerMcKenzie1";
const youtubeUploadsFeedUrl =
  "https://www.youtube.com/feeds/videos.xml?channel_id=UCJhcT-FAakAVf55H2HmfeuA";
const youtubeUploadsApiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(youtubeUploadsFeedUrl)}`;

interface YouTubeVideo {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  published: string;
}

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

function extractVideoId(link?: string) {
  if (!link) {
    return "";
  }

  try {
    return new URL(link).searchParams.get("v") ?? "";
  } catch {
    return "";
  }
}

function formatPublishedDate(value: string) {
  if (!value) {
    return "Recent upload";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recent upload";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function Content() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadLatestUploads = async () => {
      try {
        const response = await fetch(youtubeUploadsApiUrl, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load YouTube uploads");
        }

        const data = (await response.json()) as FeedResponse;
        const items = data.status === "ok" ? data.items ?? [] : [];

        const latestVideos = items
          .slice(0, 3)
          .map((item, index) => {
            const videoId = extractVideoId(item.link);
            const thumbnailUrl =
              item.thumbnail || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "");

            return {
              id: item.guid || `${videoId}-${index}`,
              title: item.title || "Untitled video",
              url: item.link || youtubeChannelUrl,
              thumbnailUrl,
              published: item.pubDate || "",
            };
          })
          .filter((video) => video.thumbnailUrl);

        if (isMounted) {
          setVideos(latestVideos);
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setVideos([]);
          setIsLoading(false);
        }
      }
    };

    loadLatestUploads();
    const refreshInterval = window.setInterval(loadLatestUploads, 10 * 60 * 1000);

    return () => {
      isMounted = false;
      window.clearInterval(refreshInterval);
    };
  }, []);

  return (
    <section id="content" className="relative bg-muted py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-dot-pattern opacity-[0.04]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-heading font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Content
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Videos and technical breakdowns are on the way. In the meantime, you can
            visit my YouTube channel directly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10"
        >
          <div className="mx-auto max-w-5xl">
            {isLoading ? (
              <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
                <div className="h-5 w-20 animate-pulse rounded-full bg-black/10" />
                <div className="mt-4 h-9 w-64 animate-pulse rounded-lg bg-black/10" />
                <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-black/10" />
                <div className="mt-2 h-4 w-full max-w-lg animate-pulse rounded bg-black/10" />
                <div className="mt-6 h-10 w-48 animate-pulse rounded-full bg-black/10" />
              </div>
            ) : videos.length === 0 ? (
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:p-8">
                <div className="flex items-center gap-2 text-[#c12800]">
                  <Youtube size={18} />
                  <p className="text-xs font-semibold uppercase tracking-[0.16em]">YouTube</p>
                </div>
                <h3 className="mt-3 text-center font-display text-2xl font-semibold text-foreground sm:text-3xl">
                  Content coming soon
                </h3>
                <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
                  New uploads will appear here automatically when they are published.
                </p>
                <div className="mt-6 flex justify-center">
                  <a
                    href={youtubeChannelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF0000] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d40000]"
                  >
                    Visit YouTube Channel
                    <ExternalLink size={15} />
                  </a>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.07)]">
                <div className="flex flex-col gap-4 border-b border-black/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF0000]/10 text-[#FF0000]">
                      <Youtube size={18} />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        Latest YouTube Uploads
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Updates automatically when new videos are published
                      </p>
                    </div>
                  </div>
                  <a
                    href={youtubeChannelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-[#FF0000]/20 px-3 py-1.5 text-xs font-medium text-[#b32600] transition-colors hover:bg-[#FF0000]/5"
                  >
                    View Channel
                    <ExternalLink size={14} />
                  </a>
                </div>
                <div className="grid gap-5 p-5 sm:grid-cols-2 md:p-6 lg:grid-cols-3">
                  {videos.map((video) => (
                    <a
                      key={video.id}
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group overflow-hidden rounded-xl border border-black/10 bg-white transition-transform duration-300 hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="aspect-video overflow-hidden bg-black/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FF0000]/10 px-2.5 py-1 text-[11px] font-semibold text-[#b32600]">
                          <PlayCircle size={12} />
                          New upload
                        </span>
                        <p className="line-clamp-2 text-sm font-semibold text-foreground">
                          {video.title}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {formatPublishedDate(video.published)}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
