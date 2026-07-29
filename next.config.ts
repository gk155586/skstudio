import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cleanDistDir: true,
  // Allow all local network origins for mobile previewing
  allowedDevOrigins: ["10.140.223.174", "10.234.103.82", "0.0.0.0", "localhost"],
  images: {
    // Enable optimized image serving with WebP/AVIF formats
    formats: ["image/webp", "image/avif"],
    // Responsive image widths
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Compress static assets
  compress: true,
  // Optimize production builds
  productionBrowserSourceMaps: false,

  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/data/**', '**/node_modules/**'],
      };
    }
    return config;
  },

  async rewrites() {
    return [
      {
        source: "/index.php",
        destination: "/",
      },
      {
        source: "/:path*.php",
        destination: "/:path*.html",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/register",
        destination: "/admin",
        permanent: false,
      },
      {
        source: "/portfolio-mas2.php",
        destination: "/",
        permanent: false,
      },
      {
        source: "/portfolio-mas2.html",
        destination: "/",
        permanent: false,
      },
      {
        source: "/blog.php",
        destination: "/",
        permanent: false,
      },
      {
        source: "/blog.html",
        destination: "/",
        permanent: false,
      },
      {
        source: "/blog-details.php",
        destination: "/",
        permanent: false,
      },
      {
        source: "/blog-details.html",
        destination: "/",
        permanent: false,
      },
    ];
  },
  // Add cache headers for static assets
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
        has: [
          {
            type: "query",
            key: "v",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
