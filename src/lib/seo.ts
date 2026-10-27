import type { Metadata } from "next";
import { tools } from "@/data/tools";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-domain.com";

export const siteUrl = configuredSiteUrl.replace(/\/$/, "");

export function absoluteUrl(path: string): string {
  return new URL(path, `${siteUrl}/`).toString();
}

export function getToolMetadata(toolId: string): Metadata {
  const tool = tools.find((item) => item.id === toolId);

  if (!tool) {
    return {
      title: "Online Tool",
      description: "Free online tools for everyday tasks.",
      robots: { index: false, follow: false },
    };
  }

  const title = `${tool.name} | Toolbox`;
  const description = tool.description.slice(0, 160);
  const canonical = absoluteUrl(`/tools/${tool.id}`);

  return {
    title: tool.name,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "Toolbox",
      title,
      description,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
