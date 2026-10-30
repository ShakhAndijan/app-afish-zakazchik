import { ENDPOINTS } from '../constants/config';
import { request } from '../utils/request';

// Foydali maqolalar (saytdagi /maqolalar). Matn so'rov tilida (Accept-Language) keladi.

/** Chop etilgan maqolalar, yangisi birinchi: `[{ slug, title, summary, publishedAt, readingMinutes }]`. */
export async function getArticles() {
  const data = await request(ENDPOINTS.ARTICLES(), {
    auth: false,
    fallbackMessage: 'Maqolalar yuklanmadi',
  });
  return (data?.items ?? []).map((a) => ({
    slug: a.slug,
    title: a.title ?? '',
    summary: a.summary ?? '',
    publishedAt: a.published_at ?? null,
    readingMinutes: Number(a.reading_minutes) || 0,
  }));
}

/** Bitta maqola; `html` — xavfsiz HTML (utils/articleHtml.js bilan tahlil qilinadi). 404 `article_not_found`. */
export async function getArticle(slug) {
  const a = await request(ENDPOINTS.ARTICLE(slug), {
    auth: false,
    fallbackMessage: 'Maqola yuklanmadi',
  });
  return {
    slug: a.slug,
    title: a.title ?? '',
    summary: a.summary ?? '',
    publishedAt: a.published_at ?? null,
    readingMinutes: Number(a.reading_minutes) || 0,
    path: a.path ?? `/maqolalar/${a.slug}`,
    html: a.html ?? '',
  };
}
