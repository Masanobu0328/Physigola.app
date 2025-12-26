import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Physiogora - 判断OSアプリ",
  description: "スマホ1つで疲労・負荷を最短で記録し、選手の状態を可視化",
  manifest: "/manifest.json",
  themeColor: "#df961a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Physiogora",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

