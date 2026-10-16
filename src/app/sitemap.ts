import type { MetadataRoute } from "next";
import { MARKETING_PATHS, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return MARKETING_PATHS.map((entry) => ({
    url: `${SITE_URL}${entry.path === "/" ? "" : entry.path}`,
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
