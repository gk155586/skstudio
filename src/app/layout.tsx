import type { Metadata } from "next";
import { Playfair_Display, Poppins, Teko } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const teko = Teko({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://skstudio.store"),
  title: "SK Studio Pune | Premium Photography Studio & Portfolio",
  description: "India's premium photography studio based in Pune. Capturing unforgettable moments with artistic precision: wedding segment, maternity indoor/outdoor, newborn, baby & toddlers shoot.",
  keywords: "Best Photo Studio in Pimpri Chinchwad, Maternity Photoshoot Studio in Pune, Birthday Photoshoot Pune, Wedding Photography Pune, Baby Shoot Pune",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "SK Studio Pune | Premium Photography",
    description: "Capturing unforgettable moments with artistic precision.",
    type: "website",
    url: "https://skstudio.store",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "SK Studio Pune Icon" }],
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${playfairDisplay.variable} ${poppins.variable} ${teko.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
