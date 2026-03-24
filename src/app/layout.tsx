import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Board — AI Board of Directors for Your Startup",
  description:
    "Pitch your startup idea and watch 5 AI board members research the market, debate each other, and deliver a live verdict — all in real-time voice.",
  metadataBase: new URL("https://the-board-ai.vercel.app"),
  openGraph: {
    title: "The Board — AI Board of Directors",
    description:
      "Pitch your startup idea and watch 5 AI board members research the market, debate each other, and deliver a live verdict — all in real-time voice.",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "The Board — 5 AI board members deliberating on a startup pitch in real-time",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Board — AI Board of Directors",
    description:
      "Pitch your startup idea and watch 5 AI board members research, debate, and vote — live.",
    images: ["/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
