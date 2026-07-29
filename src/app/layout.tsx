import type { Metadata } from "next";
import { Playfair_Display, Poppins, Teko } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap", // Ensure text renders immediately in fallback font
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
  title: "SK Studio Pune | Premium Photography Studio & Portfolio",
  description: "India's premium photography studio based in Pune. Capturing unforgettable moments with artistic precision: wedding segment, maternity indoor/outdoor, newborn, baby & toddlers shoot.",
  keywords: "Best Photo Studio in Pimpri Chinchwad, Maternity Photoshoot Studio in Pune, Birthday Photoshoot Pune, Wedding Photography Pune, Baby Shoot Pune",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  openGraph: {
    title: "SK Studio Pune | Premium Photography",
    description: "Capturing unforgettable moments with artistic precision.",
    type: "website",
    url: "http://localhost:3001/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfairDisplay.variable} ${poppins.variable} ${teko.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
