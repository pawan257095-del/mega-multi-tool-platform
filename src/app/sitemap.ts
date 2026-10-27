import type { MetadataRoute } from "next";
import { tools } from "@/data/tools";
import { absoluteUrl } from "@/lib/seo";

// Only include routes that actually exist and return indexable pages.
// Categories are currently filters on the homepage, not separate URL routes.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...tools.map((tool) => ({
      url: absoluteUrl(`/tools/${tool.id}`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: tool.popular ? 0.8 : 0.6,
    })),
  ];
}
