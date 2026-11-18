// /sitemap.xml at the same URL as before (search engines already know it).
import type { APIRoute } from 'astro';
import { absoluteUrl } from '../site';
import { notes } from '../lib/notes';

const PAGES = ['/', '/publications/', '/projects/', '/study-notes/', '/cv/', '/game/'];
const FILES = ['/public/Alessandro_Sanvito_CV.pdf'];

export const GET: APIRoute = () => {
  const urls = [
    ...notes.map((n) => ({ loc: `/${n.slug}/`, lastmod: n.date.toISOString().slice(0, 10) })),
    ...PAGES.map((loc) => ({ loc })),
    ...FILES.map((loc) => ({ loc })),
  ];
  const body = urls
    .map((u) => `<url>\n<loc>${absoluteUrl(u.loc)}</loc>\n${'lastmod' in u ? `<lastmod>${u.lastmod}</lastmod>\n` : ''}</url>`)
    .join('\n');
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    body +
    '\n</urlset>\n';
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
