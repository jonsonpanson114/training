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
  title: "思考の鉄槌 - 零秒言語化トレーニング",
  description: "脳内に渦巻く混沌を、一撃で研ぎ澄まされた言葉に変える。超実践的言語化訓練。",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "思考の鉄槌",
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
