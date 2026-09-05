import type { Metadata } from "next";
import { Playfair_Display, Poppins, Teko } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: true,
});

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
  preload: true,
});

const teko = Teko({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://skstudio.store"),
  title: {
    default: "SK Photo Studio | Professional Photography Studio in Pune",
    template: "%s | SK Photo Studio Pune"
  },
  description: "SK Photo Studio is Pune's premier professional photography studio specializing in cinematic wedding photography, maternity portraits (indoor & outdoor), newborn & baby shoots, and luxury handcrafted photo frames.",
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
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icon.png",
  },
  openGraph: {
    title: "SK Photo Studio | Professional Photography Studio in Pune",
    description: "Best photo studio near me in Pune. Premium professional photography for weddings, maternity, baby shoots, and custom frames.",
    type: "website",
    url: "https://skstudio.store",
    siteName: "SK Photo Studio Pune",
    locale: "en_IN",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "SK Studio Pune Camera Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SK Photo Studio | Professional Photography Studio in Pune",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/icon.png" sizes="512x512" type="image/png" />
        <link rel="icon" href="/icon-192.png" sizes="192x192" type="image/png" />
        <link rel="icon" href="/icon-48.png" sizes="48x48" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
