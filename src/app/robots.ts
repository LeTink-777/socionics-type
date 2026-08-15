import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

/** Отдаётся по /robots.txt. host подсказывает Яндексу канонический хост (www). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
