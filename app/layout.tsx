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
  title: "Verbalize - 漆黒の言語化道場",
  description: "言葉の壁を破壊し、未踏の思考領域を言語化せよ。Gemini 3.1 搭載の超次元言語化トレーニング。",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Verbalize",
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
