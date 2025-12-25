import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Physiogora - 判断OSアプリ",
  description: "スマホ1つで疲労・負荷を最短で記録し、選手の状態を可視化",
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

