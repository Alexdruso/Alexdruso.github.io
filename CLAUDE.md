# CLAUDE.md

Guidance for AI assistants (and humans) working in this repository.

## What this is

The personal website and CV of Alessandro Sanvito, served at
**alexdruso.github.io** via GitHub Pages. It is a static
**Astro** site whose project lives entirely under `docs/`, plus a
**LaTeX (Awesome CV)** pipeline that compiles a CV PDF and drops it into the
site. The site's signature content is a set of **interactive "Study Notes"** —
standalone HTML pages with embedded SVG/canvas visualizations and vanilla JS.

There is no application backend, test suite, or client-side framework — Astro
renders everything to static HTML at build time and ships no framework JS. The
only package manager is npm (in `docs/`).

## Repository layout

```
.
├── Makefile                 # `make dev`, `make serve`, `make site`, `make cv`, `make clean`
├── README.md                # human-facing project overview
├── .github/workflows/cv-build.yml   # CI: build CV + site, deploy to gh-pages
└── docs/                    # *** the Astro project root ***
    ├── astro.config.mjs     # site URL, publicDir, trailing slashes, HTML/Sass options
    ├── package.json         # astro, sass, yaml, marked; scripts: dev/build/preview/check-links
    ├── scripts/check-links.mjs  # dependency-free internal link/image checker (CI)
    ├── src/
    │   ├── site.ts          # site name, description, avatar, footer links, analytics
    │   ├── data/
    │   │   ├── navigation.yml   # top nav (title/url/icon) — edit to change the menu
    │   │   ├── projects.yml     # source of truth for the Projects page
    │   │   └── publications.yml # source of truth for the Publications page
    │   ├── lib/
    │   │   ├── data.ts      # parses the YAML files above (typed)
    │   │   └── notes.ts     # loads src/notes/*.html: front matter + body, sorting, dates
    │   ├── notes/           # the interactive Study Notes (HTML) + notes/CLAUDE.md
    │   ├── scripts/study-note.js  # shared note runtime (window.StudyNote)
    │   ├── layouts/         # Base.astro (site shell) → Page.astro
    │   ├── components/      # Meta, FooterLinks, CommandPalette, Analytics
    │   ├── pages/
    │   │   ├── index.astro          # "About Me" home page
    │   │   ├── publications.astro   # renders data/publications.yml
    │   │   ├── projects.astro       # renders data/projects.yml
    │   │   ├── study-notes.astro    # "/study-notes/" index with canvas thumbnails
    │   │   ├── [slug].astro         # one page per study note, at /slug/
    │   │   ├── cv.astro             # embeds the generated CV PDF in an <iframe>
    │   │   ├── game.astro           # "/game/" — Snake + a Q-learning agent
    │   │   ├── 404.astro
    │   │   └── search.json.ts, feed.xml.ts, sitemap.xml.ts, robots.txt.ts
    │   └── styles/          # style.scss (+ _reset, _variables, _highlights, _svg-icons),
    │                        # study-note.css (the study-note design system)
    ├── static/              # copied verbatim to the site root (Astro's publicDir)
    │   ├── images/          # avatar
    │   ├── public/          # generated — Alessandro_Sanvito_CV.pdf lives here
    │   └── .nojekyll        # stops GitHub Pages from running Jekyll on the output
    └── cv-src/              # LaTeX source for the CV (Awesome CV template)
        ├── cv.tex           # main file; \input's the cv/*.tex sections
        ├── awesome-cv.cls   # template class
        ├── cv/*.tex         # experience, education, skills, publications, ...
        └── fonts/           # Roboto + FontAwesome TTFs used by xelatex
```

### Why `static/` and not `public/`
Astro's default static folder is `public/`, served at the site root. The CV has
always lived at `/public/Alessandro_Sanvito_CV.pdf`, so `astro.config.mjs` sets
`publicDir: './static'` and the PDF sits in `static/public/`. Keep that URL
stable — it's linked from outside the site.

## How the site is built and deployed

CI lives in `.github/workflows/cv-build.yml` and runs on push to `master`
(when `docs/**`, the workflow, `Makefile` or `.nvmrc` change) or via manual dispatch:

1. Set up Node (version from `.nvmrc`) and `npm ci` in `docs/`.
2. Install TeX Live + **xelatex** and fonts.
3. `make clean && make cv` → compiles `docs/cv-src/cv.tex` **twice** with
   `xelatex` (for reference resolution) and copies the result to
   `docs/static/public/Alessandro_Sanvito_CV.pdf`.
4. Commit the regenerated PDF back to the branch (only if it changed).
5. `npm run build` in `docs/` (→ `docs/dist/`), then `npm run check-links`.
6. Deploy `docs/dist` to the `gh-pages` branch via `peaceiris/actions-gh-pages`.

Pull requests run a fast `verify` job instead: `npm ci`, build, link check.

So: the **committed CV PDF is a build artifact** — CI regenerates it from
`cv-src/`. To change the CV, edit the `.tex` sources, not the PDF.

> ⚠️ The pipeline requires **xelatex** (not `pdflatex`) because the CV uses the
> Roboto/FontAwesome OpenType fonts. Trust the Makefile and the workflow.

## Local development

The `Makefile` is the front door. Run targets from the **repo root**. Astro
needs **Node ≥ 22.23** (`engines` in `docs/package.json`, checked by
`docs/scripts/check-node.mjs`; `make serve`/`make site` refuse to run on an older
Node). `.nvmrc` pins the major version for nvm/fnm and for CI.

```bash
make dev      # install Node 22 (NodeSource) / xelatex if missing or too old (Debian/Ubuntu, sudo) + npm ci
make serve    # astro dev server with live reload → http://localhost:4321/
make site     # production build into docs/dist/ + internal link check
make cv       # build the CV PDF from docs/cv-src into docs/static/public/
make clean    # remove LaTeX intermediates (cv.aux/log/out/pdf)
```

Or directly:

```bash
cd docs
npm ci                 # first time only
npm run dev            # http://localhost:4321/
npm run build          # → dist/
npm run preview        # serve dist/ locally
npm run check-links    # verify internal links/images in dist/
```

`docs/dist/`, `docs/.astro/`, `docs/node_modules/` and LaTeX intermediates are
gitignored.

## Content model — where to edit what

- **Navigation menu**: `docs/src/data/navigation.yml` (rendered by
  `src/layouts/Base.astro`, and indexed by the search palette).
- **Site name / description / footer links / analytics**: `docs/src/site.ts`.
- **Home / About**: `docs/src/pages/index.astro`.
- **Publications**: add an entry to `docs/src/data/publications.yml`; the page
  `publications.astro` renders it, newest year first. Keep it in sync with
  `docs/cv-src/cv/publications.tex` and Google Scholar (the data file says so).
- **Projects**: add an entry to `docs/src/data/projects.yml`; `projects.astro`
  renders it, sorted by `year` descending (stable, so same-year entries keep file
  order). `description` supports inline Markdown (e.g. `` `code` ``).
- **CV**: edit `docs/cv-src/cv.tex` and the `docs/cv-src/cv/*.tex` sections; CI
  regenerates the PDF.
- **Study Notes**: add an HTML file to `docs/src/notes/` named
  `YYYY-MM-DD-slug.html`; it is served at `/slug/` and appears on `/study-notes/`,
  in the search palette, the feed and the sitemap automatically. **Before writing
  or editing one, read `docs/src/notes/CLAUDE.md`** — it is the authoritative
  design-system and interactivity guide for these notes (see below). The
  `add-study-note` skill (`.claude/skills/add-study-note/`) scaffolds and
  screenshots notes.
- **New pages**: add `docs/src/pages/<name>.astro` using `layouts/Page.astro`
  (or `Base.astro`); the file path is the URL (`about.astro` → `/about/`).

## Study Notes — the important convention

`docs/src/notes/CLAUDE.md` is a domain-specific authoring guide for the
interactive study notes and **takes precedence for anything under
`docs/src/notes/`**. Key points, summarized (read the file for the full rules):

- Each note is a standalone HTML file: YAML front matter (`title`, `date`,
  `categories`, `excerpt` — the excerpt is shown on `/study-notes/`), then a body
  wrapped in `<div class="study-note"> … </div>`. The wrapper is required for
  theming and CSS scoping to work. The shared styles
  (`src/styles/study-note.css`) are added by `src/pages/[slug].astro`.
- The body is emitted **verbatim** (`set:html`): plain HTML, `<style>` and
  `<script>` work as written, and there is no templating inside a note. Link to
  other pages with root-relative URLs (`/self-attention/`).
- Use the **`--sn-*` design tokens** defined in `src/styles/study-note.css`
  (editorial system: serif prose in one reading column, numbered sections, no
  emoji, one cyan-teal accent with light + dark variants). **Never** hardcode
  brand colors, and never use the old purple/blue palette.
- JS-drawn SVG/canvas must read tokens at runtime and redraw on theme toggle,
  via the shared runtime `window.StudyNote` (`src/scripts/study-note.js`:
  `StudyNote.reader(el)` and `StudyNote.onThemeChange(fn)`), which
  `[slug].astro` loads in `<head>`. Shared note helpers go there, not copied
  into each note.
- The shared JS keys off specific ids/class names (e.g. `data-action` hooks,
  `bm-cell.on`, `vi-table td.best`). Restyle freely but **do not rename** the
  selectors the JS reads.
- If a note links to a new thumbnail sketch on `/study-notes/`, add it to the
  `sketches` map in `src/pages/study-notes.astro` (keyed by a slug substring).

## Styling

- Global styles: `docs/src/styles/style.scss` (`@import`s `_reset`,
  `_variables`, and at the bottom `highlights`, `svg-icons`), imported by
  `Base.astro`. Astro compiles and fingerprints it under `/_astro/`, so there's
  no cache-busting to do by hand.
- Dark mode is a site-wide feature: the toggle button in `Base.astro` adds/removes
  `.dark-theme` on `<body>` and persists to `localStorage`. That script is
  `is:inline` on purpose so the saved theme applies before first paint.
  Study-note tokens key off `.dark-theme .study-note`.

## Conventions & gotchas for assistants

- **Do not hand-edit `docs/static/public/Alessandro_Sanvito_CV.pdf`** — it's generated.
- Keep `docs/src/data/publications.yml` and `docs/cv-src/cv/publications.tex`
  consistent when adding a publication.
- Keep URLs stable: pages are directories with a trailing slash
  (`trailingSlash: 'always'`, `build.format: 'directory'`), notes are `/slug/`,
  and `/feed.xml`, `/sitemap.xml`, `/search.json`, `/404.html` must keep existing.
- `compressHTML` is off on purpose: compression drops meaningful whitespace
  (e.g. the space in "Full list on <a>GitHub</a>").
- Legacy page scripts (theme toggle, command palette, thumbnails, Snake) are
  `<script is:inline>`, i.e. shipped exactly as written. New shared client code
  can be a normal Astro `<script>` or an imported module, which Astro bundles.
- Keep additions dependency-free unless there's a reason not to; no UI
  framework integrations.
- This repo is a `<user>.github.io` user site: no `base` path, and the live
  domain is `alexdruso.github.io` (no custom domain).

## Git / workflow

- Do your work on a feature branch and commit/push there; never push to
  `master` without explicit permission.
- Production deploys happen automatically from `master` via the workflow above;
  do not commit to the `gh-pages` branch by hand (CI owns it).
- Do not open a pull request unless explicitly asked.
