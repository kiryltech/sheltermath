import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://sheltermath.engineeringthefuture.ai/'),
  title: "Shelter Math | Rent vs Buy Simulator",
  description: "A brutally logical Rent vs Buy simulator with interactive charts and AI analysis.",
  keywords: [
    "rent vs buy calculator",
    "real estate investment simulator",
    "housing market analysis",
    "mortgage calculator",
    "rent vs buy",
    "buy or rent",
  ],
  authors: [{ name: "Shelter Math" }],
  creator: "Shelter Math",
  publisher: "Shelter Math",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://sheltermath.engineeringthefuture.ai/",
  },
  openGraph: {
    title: "Shelter Math | Rent vs Buy Simulator",
    description: "A brutally logical Rent vs Buy simulator with interactive charts and AI analysis.",
    url: "https://sheltermath.engineeringthefuture.ai/",
    siteName: "Shelter Math",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og_image.png",
        width: 1200,
        height: 630,
        alt: "Shelter Math - Rent vs Buy Simulator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shelter Math | Rent vs Buy Simulator",
    description: "A brutally logical Rent vs Buy simulator with interactive charts and AI analysis.",
    images: ["/og_image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
