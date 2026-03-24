import type { Metadata } from "next";
import { Noto_Serif_JP, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSerif = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Abduction Lens - 零秒言語化トレーニング",
  description: "決定的な一瞬を捉え、仮説を紡ぎ出す。阿武妥苦衝（アブダクション）の深淵へ導くトレーニングアプリ。",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Abduction Lens",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#1A1A1A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${notoSerif.variable} ${notoSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
