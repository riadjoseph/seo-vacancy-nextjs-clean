import React from "react";

/**
 * TrackerPixel component
 *
 * Usage: <TrackerPixel /> inside your Next.js pages.
 * This will fire a request to your PHP tracker just like a pixel,
 * and it will include the full absolute page URL as a query parameter.
 */
export default function TrackerPixel() {
  if (typeof window === "undefined") return null;
  const fullUrl = encodeURIComponent(window.location.href);
  const src = `https://wiki.booksparis.com/gpt/tracker.php?site=https%3A%2F%2Fseo-vacancy.eu&url=${fullUrl}`;

  return (
    <img
      src={src}
      width="1"
      height="1"
      style={{ display: "none" }}
      alt="tracker"
    />
  );
}