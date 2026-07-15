import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://lottomn.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
