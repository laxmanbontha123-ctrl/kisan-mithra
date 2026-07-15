import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kisan Mithra",
    short_name: "Kisan Mithra",
    description:
      "AI-powered smart farming assistant for disease scan, weather alerts, and farm advisories.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8fffb",
    theme_color: "#166534",
    orientation: "portrait",
    categories: ["agriculture", "weather", "productivity"],
    lang: "en",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
