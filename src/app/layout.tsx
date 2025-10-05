import type { Metadata } from "next";
import Script from 'next/script'
import { useId } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./reset.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Creative Gallery",
  description: "ギャラリーサイト",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adobeFontsId = useId();

  return (
    <html lang="en">
      <Script id={adobeFontsId} stylesheets={["https://use.typekit.net/faa5hio.css"]}></Script>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
