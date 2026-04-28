import "server-only";

import { siteConfig } from "./data";

const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/playlistItems";
const YOUTUBE_REVALIDATE_SECONDS = 900;
const MAX_RESULTS = 4;
const INVALID_TITLES = new Set(["Deleted video", "Private video"]);
const DEFAULT_CHANNEL_ID = "UCJhcT-FAakAVf55H2HmfeuA";

export interface YouTubeVideo {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  publishedAt: string;
}

export type ContentStatus = "ready" | "empty" | "error";

interface ThumbnailSet {
  default?: { url?: string };
  medium?: { url?: string };
  high?: { url?: string };
  standard?: { url?: string };
  maxres?: { url?: string };
}

interface PlaylistItem {
  snippet?: {
    title?: string;
    publishedAt?: string;
    thumbnails?: ThumbnailSet;
    resourceId?: {
      videoId?: string;
    };
  };
  contentDetails?: {
    videoId?: string;
    videoPublishedAt?: string;
  };
}

interface PlaylistItemsResponse {
  items?: PlaylistItem[];
}

function getUploadsPlaylistId(channelId: string) {
  if (!channelId.startsWith("UC") || channelId.length <= 2) {
    return "";
  }

  return `UU${channelId.slice(2)}`;
}

function pickThumbnailUrl(thumbnails?: ThumbnailSet) {
  return (
    thumbnails?.maxres?.url ??
    thumbnails?.standard?.url ??
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    thumbnails?.default?.url ??
    ""
  );
}

function normalizeVideo(item: PlaylistItem): YouTubeVideo | null {
  const videoId =
    item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId ?? "";
  const title = item.snippet?.title?.trim() ?? "";
  const thumbnailUrl = pickThumbnailUrl(item.snippet?.thumbnails);

  if (!videoId || !title || INVALID_TITLES.has(title) || !thumbnailUrl) {
    return null;
  }

  return {
    id: videoId,
    title,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    thumbnailUrl,
    publishedAt:
      item.contentDetails?.videoPublishedAt ?? item.snippet?.publishedAt ?? "",
  };
}

export async function getYouTubeContent(): Promise<{
  status: ContentStatus;
  videos: YouTubeVideo[];
}> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId =
    (siteConfig as typeof siteConfig & { youtubeChannelId?: string }).youtubeChannelId ??
    DEFAULT_CHANNEL_ID;
  const playlistId = getUploadsPlaylistId(channelId);

  if (!apiKey || !playlistId) {
    console.warn("YouTube content is unavailable: missing API key or channel ID.");
    return {
      status: "error",
      videos: [],
    };
  }

  const url = new URL(YOUTUBE_API_URL);
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("playlistId", playlistId);
  url.searchParams.set("maxResults", String(MAX_RESULTS));
  url.searchParams.set("key", apiKey);

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: YOUTUBE_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      console.warn(
        `YouTube API returned ${response.status}; falling back to error state.`
      );
      return {
        status: "error",
        videos: [],
      };
    }

    const data = (await response.json()) as PlaylistItemsResponse;
    const videos = (data.items ?? [])
      .map(normalizeVideo)
      .filter((video): video is YouTubeVideo => video !== null);

    return {
      status: videos.length > 0 ? "ready" : "empty",
      videos,
    };
  } catch (error) {
    console.warn("Failed to load YouTube content.", error);
    return {
      status: "error",
      videos: [],
    };
  }
}
