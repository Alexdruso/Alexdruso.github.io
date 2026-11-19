// The command-palette index (Cmd/Ctrl-K): pages, projects, publications, notes.
import type { APIRoute } from 'astro';
import { navigation, projects, publications } from '../lib/data';
import { notes, stripHtml } from '../lib/notes';

/** Liquid's `truncate`: at most `n` characters, ending in "..." when cut. */
function truncate(text: string, n: number): string {
  const chars = Array.from(text);
  return chars.length <= n ? text : chars.slice(0, n - 3).join('') + '...';
}

export const GET: APIRoute = () => {
  const index = [
    ...navigation.map((item) => ({ title: item.title, url: item.url, type: 'Page', text: '' })),
    ...projects.map((p) => ({ title: p.title, url: '/projects/', type: 'Project', text: (p.tags ?? []).join(' ') })),
    ...publications.map((p) => ({ title: p.title, url: '/publications/', type: 'Publication', text: p.venue ?? '' })),
    ...notes.map((note) => ({
      title: note.title,
      url: `/${note.slug}/`,
      type: 'Study Note',
      text: truncate(stripHtml(note.excerpt).replace(/[\r\n]/g, ''), 300),
    })),
  ];
  return new Response(JSON.stringify(index, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
