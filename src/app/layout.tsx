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
  title: {
    default: "SK Studio Pune | Best Photo Studio Near Me | #1 Premium Photography",
    template: "%s | SK Photo Studio Pune"
  },
  description: "Best Photo Studio near me in Pune. SK Photo Studio Pune specializes in cinematic wedding photography, maternity portraits (indoor & outdoor), newborn & baby shoots, and luxury handcrafted photo frames.",
  keywords: [
    "best photo studio",
    "photo studio near me",
    "best photo studio near me",
    "photo studio in pune",
    "best photo studio in pune",
    "photo studio near me in pune",
    "SK Studio",
    "SK Studio Pune",
    "SK Photo Studio",
    "SK Photo Studio Pune",
    "skstudio.store",
    "maternity photoshoot studio near me",
    "wedding photographer near me",
    "baby shoot studio near me",
    "pre wedding shoot near me",
    "photo framing shop near me"
  ],
  authors: [{ name: "SK Photo Studio Pune", url: "https://skstudio.store" }],
  creator: "SK Photo Studio Pune",
  icons: {
    icon: [
      { url: "/icon-light.png", media: "(prefers-color-scheme: light)", type: "image/png" },
      { url: "/icon-dark.png", media: "(prefers-color-scheme: dark)", type: "image/png" },
      { url: "/favicon-light.png", media: "(prefers-color-scheme: light)", type: "image/png" },
      { url: "/favicon-dark.png", media: "(prefers-color-scheme: dark)", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon-light.png", media: "(prefers-color-scheme: light)", type: "image/png" },
      { url: "/apple-touch-icon-dark.png", media: "(prefers-color-scheme: dark)", type: "image/png" },
    ],
    shortcut: "/icon.png",
  },
  openGraph: {
    title: "SK Studio Pune | Best Photo Studio Near Me | #1 Premium Photography",
    description: "Best photo studio near me in Pune. Premium photography for weddings, maternity, baby shoots, and custom frames.",
    type: "website",
    url: "https://skstudio.store",
    siteName: "SK Photo Studio Pune",
    locale: "en_IN",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "SK Studio Pune Camera Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SK Studio Pune | Best Photo Studio Near Me",
    description: "Best photo studio near me in Pune for weddings, maternity, and baby shoots.",
    images: ["/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Photographer"],
  "name": "SK Photo Studio Pune",
  "alternateName": ["SK Studio", "SK Studio Pune", "SK Photo Studio", "SKStudio", "Best Photo Studio Near Me"],
  "url": "https://skstudio.store",
  "logo": "https://skstudio.store/icon.png",
  "image": "https://skstudio.store/icon.png",
  "description": "Best photo studio near me in Pune. SK Photo Studio Pune specializes in cinematic weddings, maternity portraits, baby shoots, and luxury photo frames.",
  "telephone": "+919307112119",
  "email": "ganeshkalapadgk@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "SK Photo Studio, Pune",
    "addressLocality": "Pune",
    "addressRegion": "Maharashtra",
    "postalCode": "411001",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 18.5204,
    "longitude": 73.8567
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "opens": "09:00",
    "closes": "21:00"
  },
  "sameAs": [
    "https://instagram.com/skstudiopune"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5.0",
    "reviewCount": "1200"
  },
  "priceRange": "₹₹"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon-light.png" media="(prefers-color-scheme: light)" type="image/png" />
        <link rel="icon" href="/icon-dark.png" media="(prefers-color-scheme: dark)" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-light.png" media="(prefers-color-scheme: light)" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-dark.png" media="(prefers-color-scheme: dark)" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body
        className={`${playfairDisplay.variable} ${poppins.variable} ${teko.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
