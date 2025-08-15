import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  return [
    { url: `${base}/en`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/es`, changeFrequency: "weekly", priority: 1 },
  ];
}


