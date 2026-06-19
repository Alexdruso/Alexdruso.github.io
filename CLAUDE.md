# CLAUDE.md

Guidance for AI assistants (and humans) working in this repository.

## What this is

The personal website and CV of Alessandro Sanvito, served at
**alexdruso.github.io** via GitHub Pages. It is a
**Jekyll 4** site whose source lives entirely under `docs/`, plus a
**LaTeX (Awesome CV)** pipeline that compiles a CV PDF and drops it into the
site. The site's signature content is a set of **interactive "Study Notes"** —
standalone HTML blog posts with embedded SVG/canvas visualizations and vanilla
JS.

There is no application backend, test suite, or package manager beyond Bundler
(Ruby gems) — the deliverable is a static site.

## Repository layout

```
.
├── Makefile                 # `make dev`, `make cv`, `make clean` — primary entry points
├── README.md                # human-facing project overview
├── .github/workflows/cv-build.yml   # CI: build CV + Jekyll, deploy to gh-pages
└── docs/                    # *** the Jekyll site root ***
    ├── _config.yml          # the real Jekyll config
    ├── Gemfile              # jekyll 4.3, webrick, jekyll-feed, jekyll-seo-tag
    ├── index.md             # "About Me" home page (layout: page)
    ├── publications.md      # renders docs/_data/publications.yml
    ├── projects.md          # renders docs/_data/projects.yml
    ├── posts.html           # "/study-notes/" index page listing all posts
    ├── cv.md                # embeds the generated CV PDF in an <iframe>
    ├── game.md              # "/game/" — a vanilla-JS Snake game
    ├── 404.md
    ├── _data/
    │   ├── navigation.yml   # top nav (title/url/icon) — edit to change the menu
    │   ├── projects.yml     # source of truth for the Projects page
    │   └── publications.yml # source of truth for the Publications page
    ├── _layouts/            # default.html → page.html / post.html
    ├── _includes/           # head/meta, svg-icons, analytics, disqus, study-note-styles
    ├── _posts/              # the interactive Study Notes (HTML) + _posts/CLAUDE.md
    ├── _sass/               # reset, variables, themes/minimal, highlights, svg-icons
    ├── style.scss           # top-level stylesheet (@imports the _sass partials)
    ├── cv-src/              # LaTeX source for the CV (Awesome CV template)
    │   ├── cv.tex           # main file; \input's the cv/*.tex sections
    │   ├── awesome-cv.cls   # template class
    │   ├── cv/*.tex         # experience, education, skills, publications, ...
    │   └── fonts/           # Roboto + FontAwesome TTFs used by xelatex
    ├── images/              # avatars, 404 image
    └── public/              # generated assets — Alessandro_Sanvito_CV.pdf lives here
```

### One `_config.yml` — don't add another
- `docs/_config.yml` is the **sole Jekyll config** (site name, nav rendering,
  kramdown/rouge, sass, `exclude`/`include`, base URL).
  When changing site behavior, edit `docs/_config.yml`.

## How the site is built and deployed

CI lives in `.github/workflows/cv-build.yml` and runs on push to `master`
(when `docs/**`, the workflow, or `Makefile` change) or via manual dispatch:

1. Set up Ruby 3.2 with `bundler-cache`.
2. Install TeX Live + **xelatex** and fonts.
3. `make clean && make cv` → compiles `docs/cv-src/cv.tex` **twice** with
   `xelatex` (for reference resolution) and copies the result to
   `docs/public/Alessandro_Sanvito_CV.pdf`.
4. Commit the regenerated PDF back to the branch (only if it changed).
5. `bundle exec jekyll build` in `docs/`.
6. Deploy `docs/_site` to the `gh-pages` branch via `peaceiris/actions-gh-pages`.

So: the **committed CV PDF is a build artifact** — CI regenerates it from
`cv-src/`. To change the CV, edit the `.tex` sources, not the PDF.

> ⚠️ The pipeline requires **xelatex** (not `pdflatex`) because the CV uses the
> Roboto/FontAwesome OpenType fonts. Trust the Makefile and the workflow.

## Local development

The `Makefile` is the front door. Run targets from the **repo root**.

```bash
make dev      # install ruby/xelatex/node + bundle install (Debian/Ubuntu, uses sudo)
make cv       # build the CV PDF from docs/cv-src into docs/public/
make clean    # remove LaTeX intermediates (cv.aux/log/out/pdf)
```

Serve the site locally:

```bash
cd docs
bundle install                      # first time only
bundle exec jekyll serve            # http://localhost:4000/
# or, for live reload while editing study notes:
bundle exec jekyll serve --livereload
```

Build the CV by hand (equivalent to `make cv`):

```bash
cd docs/cv-src
xelatex cv.tex && xelatex cv.tex    # run twice
cp cv.pdf ../public/Alessandro_Sanvito_CV.pdf
```

`docs/Gemfile.lock`, `docs/_site/`, `docs/vendor/`, and LaTeX intermediates are
gitignored.

## Content model — where to edit what

- **Navigation menu**: `docs/_data/navigation.yml` (drives the `<nav>` loop in
  `_layouts/default.html`).
- **Home / About**: `docs/index.md`.
- **Publications**: add an entry to `docs/_data/publications.yml`; the page
  template `publications.md` renders it. Keep it in sync with
  `docs/cv-src/cv/publications.tex` and Google Scholar (the data file says so).
- **Projects**: add an entry to `docs/_data/projects.yml`; `projects.md` renders
  it, sorted by `year` descending.
- **CV**: edit `docs/cv-src/cv.tex` and the `docs/cv-src/cv/*.tex` sections; CI
  regenerates the PDF.
- **Study Notes (blog posts)**: add an HTML file to `docs/_posts/` named
  `YYYY-MM-DD-slug.html`. **Before writing or editing one, read
  `docs/_posts/CLAUDE.md`** — it is the authoritative design-system and
  interactivity guide for these posts (see below).

## Study Notes — the important convention

`docs/_posts/CLAUDE.md` is a domain-specific authoring guide for the interactive
study notes and **takes precedence for anything under `docs/_posts/`**. Key
points, summarized (read the file for the full rules):

- Each note is a standalone `layout: post` HTML file that starts with
  `{% include study-note-styles.html %}` and wraps its body in
  `<div class="study-note"> … </div>`. The wrapper is required for theming and
  CSS scoping to work.
- Use the **`--sn-*` design tokens** defined in
  `docs/_includes/study-note-styles.html` (cyan-teal "sleek/futuristic" system
  with light + dark variants). **Never** hardcode brand colors, and never use
  the old purple/blue palette.
- JS-drawn SVG/canvas must read tokens at runtime and redraw on theme toggle
  (there's a documented `MutationObserver` pattern).
- The shared JS keys off specific ids/class names (e.g. `data-action` hooks,
  `bm-cell.on`, `vi-table td.best`). Restyle freely but **do not rename** the
  selectors the JS reads.
- Front matter uses `categories` and an `excerpt` (the excerpt is shown on the
  `/study-notes/` index, `posts.html`).

## Styling

- Global styles: `docs/style.scss` (`@import`s `_sass/_reset`, `_variables`,
  `themes/minimal`, and at the bottom `highlights`, `svg-icons`). It needs the
  empty `---` front matter for Jekyll to process it into `style.css`.
- Dark mode is a site-wide feature: the toggle button in
  `_layouts/default.html` adds/removes `.dark-theme` on `<body>` and persists to
  `localStorage`. Study-note tokens key off `.dark-theme .study-note`.

## Conventions & gotchas for assistants

- **Do not hand-edit `docs/public/Alessandro_Sanvito_CV.pdf`** — it's generated.
- Keep `docs/_data/publications.yml` and `docs/cv-src/cv/publications.tex`
  consistent when adding a publication.
- New pages are Markdown/HTML with Jekyll front matter; set an explicit
  `permalink` like the existing pages do.
- The site is plain Jekyll + vanilla JS — there is no build step beyond Jekyll
  and no JS framework. Keep additions dependency-free unless there's a reason
  not to.
- This repo is a `<user>.github.io` user site: `baseurl` is empty and the live
  domain is `alexdruso.github.io` (no custom domain).

## Git / workflow

- Active development branch for this work: `claude/repo-cleanup-domain-migration-u2ilma`.
  Commit and push there; do not push to `master` without explicit permission.
- Production deploys happen automatically from `master` via the workflow above;
  do not commit to the `gh-pages` branch by hand (CI owns it).
- Do not open a pull request unless explicitly asked.
