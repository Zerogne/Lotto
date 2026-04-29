import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LottoMN - Автомашины Сугалаа",
  description: "Монголын автомашины сугалааны тавцан",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body className="antialiased bg-white">{children}</body>
    </html>
  );
}
