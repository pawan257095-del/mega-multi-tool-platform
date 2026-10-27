import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Toolbox — Free Online Tools",
    short_name: "Toolbox",
    description: "A growing collection of free online tools for everyday tasks and developers.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f8fafc",
    theme_color: "#6d28d9",
    icons: [
      { src: "/toolbox-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/toolbox-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/toolbox-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }
    ]
  };
}
