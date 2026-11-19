// Study notes live in src/notes/ as YYYY-MM-DD-slug.html: YAML front matter
// followed by a standalone HTML body (inline <style>, SVG/canvas, vanilla JS).
// Each one is served at /slug/, the same URLs the Jekyll site used.
import { parse } from 'yaml';

export interface Note {
  slug: string;
  file: string;
  title: string;
  date: Date;
  categories: string[];
  excerpt: string;
  body: string;
}

const sources = import.meta.glob('../notes/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const FILE_RE = /^(\d{4}-\d{2}-\d{2})-(.+)\.html$/;
const FRONT_MATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;

function toDate(value: unknown, file: string): Date {
  const d =
    value instanceof Date
      ? value
      : typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T00:00:00Z`)
        : new Date(NaN);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`${file}: front-matter "date" must be a YYYY-MM-DD date, got ${JSON.stringify(value)}`);
  }
  return d;
}

function load(path: string, raw: string): Note {
  const file = path.split('/').pop()!;
  const name = FILE_RE.exec(file);
  if (!name) throw new Error(`${file}: study notes must be named YYYY-MM-DD-slug.html`);
  const fm = FRONT_MATTER_RE.exec(raw);
  if (!fm) throw new Error(`${file}: missing YAML front matter`);
  const data = (parse(fm[1]) ?? {}) as Record<string, unknown>;
  for (const key of ['title', 'excerpt'] as const) {
    if (typeof data[key] !== 'string' || !data[key]) {
      throw new Error(`${file}: front-matter "${key}" is required`);
    }
  }
  return {
    slug: name[2],
    file,
    title: data.title as string,
    date: toDate(data.date ?? name[1], file),
    categories: Array.isArray(data.categories) ? data.categories.map(String) : [],
    excerpt: data.excerpt as string,
    body: raw.slice(fm[0].length),
  };
}

/** All notes, newest first (ties broken by filename, descending, as Jekyll did). */
export const notes: Note[] = Object.entries(sources)
  .map(([path, raw]) => load(path, raw))
  .sort((a, b) => b.date.getTime() - a.date.getTime() || (a.file < b.file ? 1 : -1));

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

/** "May 21, 2026" (dates are calendar days, so format in UTC). */
export function formatDate(d: Date): string {
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function stripHtml(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->|<[^>]*>/g, '');
}
