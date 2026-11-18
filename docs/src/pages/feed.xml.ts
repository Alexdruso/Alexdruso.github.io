// Atom feed of the 10 newest study notes, at the same URL and with the same
// entry ids the Jekyll site (jekyll-feed) published, so subscribers see no
// duplicates after the migration.
import type { APIRoute } from 'astro';
import { SITE, absoluteUrl } from '../site';
import { notes } from '../lib/notes';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
const iso = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, '+00:00');

export const GET: APIRoute = () => {
  const feedUrl = absoluteUrl('/feed.xml');
  const entries = notes.slice(0, 10).map((note) => {
    const url = absoluteUrl(`/${note.slug}/`);
    return [
      '<entry>',
      `<title type="html">${esc(note.title)}</title>`,
      `<link href="${url}" rel="alternate" type="text/html" title="${esc(note.title)}" />`,
      `<published>${iso(note.date)}</published>`,
      `<updated>${iso(note.date)}</updated>`,
      `<id>${absoluteUrl(`/${note.slug}`)}</id>`,
      `<content type="html" xml:base="${url}">${cdata(note.body.trim())}</content>`,
      `<author><name>${esc(SITE.name)}</name></author>`,
      ...note.categories.map((c) => `<category term="${esc(c)}" />`),
      `<summary type="html">${cdata(note.excerpt)}</summary>`,
      '</entry>',
    ].join('');
  });
  const xml =
    '<?xml version="1.0" encoding="utf-8"?>' +
    '<feed xmlns="http://www.w3.org/2005/Atom">' +
    `<link href="${feedUrl}" rel="self" type="application/atom+xml" />` +
    `<link href="${absoluteUrl('/')}" rel="alternate" type="text/html" />` +
    `<updated>${iso(new Date())}</updated>` +
    `<id>${feedUrl}</id>` +
    `<title type="html">${esc(SITE.name)}</title>` +
    `<subtitle>${esc(SITE.description)}</subtitle>` +
    entries.join('') +
    '</feed>\n';
  return new Response(xml, { headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' } });
};
