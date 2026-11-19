import type { APIRoute } from 'astro';
import { absoluteUrl } from '../site';

export const GET: APIRoute = () =>
  new Response(`Sitemap: ${absoluteUrl('/sitemap.xml')}\n`, { headers: { 'Content-Type': 'text/plain' } });
