"use client";

import { useState } from "react";
import { SafeImage } from "@/components/site/SafeImage";
import { parseVideoUrl } from "@/lib/utils";

/** Click-to-load player: no third-party iframe loads until the visitor presses play. */
export function VideoPlayer({
  url,
  title,
  thumbnail,
}: {
  url: string;
  title: string;
  thumbnail?: string | null;
}) {
  const [playing, setPlaying] = useState(false);
  const video = parseVideoUrl(url);

  if (video.kind === "file") {
    return (
      <div className="video-frame">
        <video src={video.url} controls preload="metadata" poster={thumbnail ?? undefined} title={title} />
      </div>
    );
  }

  if (video.kind === "unknown") {
    return (
      <a href={video.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
        ▶ {title}
      </a>
    );
  }

  const poster = thumbnail || video.thumbnail;
  return (
    <div className="video-frame">
      {playing ? (
        <iframe
          src={video.embedUrl}
          title={title}
          allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <>
          <SafeImage src={poster} alt={title} sizes="(max-width: 900px) 100vw, 33vw" />
          <button type="button" className="video-play" onClick={() => setPlaying(true)} aria-label={`▶ ${title}`}>
            <span>▶</span>
          </button>
        </>
      )}
    </div>
  );
}
