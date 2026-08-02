import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://skstudio.store';
  const routes = [
    '',
    '/about',
    '/portfolio',
    '/process',
    '/testimonials',
    '/contact',
    '/photo-frames',
    '/bookings',
    '/services/wedding-segment',
    '/services/pre-wedding',
    '/services/haldi',
    '/services/wedding',
    '/services/maternity',
    '/services/maternity-indoor',
    '/services/maternity-outdoor',
    '/services/baby',
    '/services/baby-indoor',
    '/services/baby-outdoor',
    '/services/newborn',
    '/services/theme',
    '/services/eyara',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route.startsWith('/services') ? 0.9 : 0.8,
  }));
}
