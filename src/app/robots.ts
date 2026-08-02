import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/login', '/admin', '/admin/*', '/api/*'],
    },
    sitemap: 'https://skstudio.store/sitemap.xml',
  };
}
