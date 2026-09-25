"use client";

import { useLayoutEffect, useRef, useState } from "react";

const SRC = "https://images.mcneelyfamilypoodles.com/home/hero.mp4";

/** Ranch loop. Reduced-motion leaves it paused on a frame instead of autoplaying. */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const video = ref.current;

    const sync = () => {
      const reduce = mq.matches;
      setReduced(reduce);
      if (!video) return;
      if (reduce) {
        video.autoplay = false;
        video.pause();
        if (video.readyState >= 2) video.currentTime = 0.01;
      } else {
        void video.play().catch(() => {});
      }
    };

    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <video
      ref={ref}
      className="aspect-video w-full rounded-2xl bg-gray-100 object-cover"
      src={SRC}
      muted
      playsInline
      preload="metadata"
      loop
      autoPlay
      aria-label="Miniature poodles at the ranch"
      onLoadedData={(event) => {
        if (!reduced) return;
        event.currentTarget.pause();
        event.currentTarget.currentTime = 0.01;
      }}
    />
  );
}
