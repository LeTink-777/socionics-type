import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

/**
 * Генерируется из SITE_URL, чтобы адреса не разъезжались при смене домена.
 * Отдаётся по /sitemap.xml.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/result`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/offer`, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
