import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://lottomn.vercel.app";
const SITE_NAME = "BLCK Авто Худалдаа";
const DESCRIPTION =
  "BLCK Авто Худалдаа (BLCK Auto Hudaldaa)";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Автомашины Сугалаа`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    "BLCK",
    "BLCK Авто Худалдаа",
    "BLCK Auto Hudaldaa",
    "blck avto hudaldaa",
    "блк авто худалдаа",
    "авто худалдаа",
    "автомашины сугалаа",
    "машины сугалаа",
    "сугалаа",
  ],
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "mn_MN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Автомашины Сугалаа`,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} — Автомашины Сугалаа`,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  alternateName: ["BLCK", "BLCK Auto Hudaldaa", "BLCK авто худалдаа", "blck"],
  url: SITE_URL,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-white">{children}</body>
    </html>
  );
}
