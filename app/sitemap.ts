import type { MetadataRoute } from "next";
import { getLotteries } from "@/lib/db";

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://lottomn.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lotteries = await getLotteries();

  return [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    ...lotteries.map((lottery) => ({
      url: `${SITE_URL}/lottery/${lottery.id}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
