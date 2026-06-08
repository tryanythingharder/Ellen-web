"use client";

import { useEffect, useRef } from "react";
import styles from "./MediaVideo.module.scss";

const activeVideos = new Set<HTMLVideoElement>();

type MediaVideoProps = {
  src: string;
  alt: string;
  poster?: string;
  aspectRatio?: string;
  threshold?: number;
};

export function MediaVideo({
  src,
  alt,
  poster,
  aspectRatio = "16 / 9",
  threshold = 0.42,
}: MediaVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          activeVideos.forEach((activeVideo) => {
            if (activeVideo !== video) {
              activeVideo.pause();
              activeVideos.delete(activeVideo);
            }
          });
          activeVideos.add(video);
          void video.play().catch(() => undefined);
        } else {
          video.pause();
          activeVideos.delete(video);
        }
      },
      { threshold },
    );

    observer.observe(video);

    return () => {
      activeVideos.delete(video);
      observer.disconnect();
    };
  }, [threshold]);

  return (
    <figure className={styles.videoFrame} style={{ aspectRatio }}>
      <video
        ref={videoRef}
        aria-label={alt}
        className={styles.video}
        loop
        muted
        playsInline
        poster={poster}
        preload="metadata"
        src={src}
      />
    </figure>
  );
}
