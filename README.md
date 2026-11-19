# Personal Website

The personal website and CV of Alessandro Sanvito, served at
[alexdruso.github.io](https://alexdruso.github.io) via GitHub Pages. It is a
static **Astro** site (project under `docs/`) plus a **LaTeX (Awesome CV)**
pipeline that compiles a CV PDF into the site. The signature content is a set of
interactive **Study Notes** — standalone HTML pages with embedded SVG/canvas
visualizations and vanilla JS.

There is no application backend or client-side framework — Astro renders
everything to static HTML at build time.

> For detailed contributor guidance (content model, design tokens, gotchas), see
> [`CLAUDE.md`](CLAUDE.md) and [`docs/src/notes/CLAUDE.md`](docs/src/notes/CLAUDE.md).

## Structure

```
.
├── Makefile                       # make dev / serve / site / cv / clean
├── .github/workflows/cv-build.yml # CI: build CV + site, deploy to GitHub Pages
└── docs/                          # *** the Astro project root ***
    ├── astro.config.mjs
    ├── package.json               # astro, sass, yaml, marked
    ├── scripts/check-links.mjs    # internal link/image checker used in CI
    ├── src/
    │   ├── site.ts                # site name, description, footer links
    │   ├── data/                  # navigation.yml, projects.yml, publications.yml
    │   ├── notes/                 # the interactive Study Notes (HTML)
    │   ├── layouts/               # Base.astro → Page.astro
    │   ├── components/            # meta tags, footer links, command palette, analytics
    │   ├── pages/                 # one file per route, plus feed/sitemap/search endpoints
    │   ├── lib/                   # YAML + study-note loaders
    │   └── styles/                # style.scss + partials, study-note.css
    ├── static/                    # served as-is at the site root
    │   ├── images/
    │   └── public/                # generated — the CV PDF lives here
    └── cv-src/                    # LaTeX source for the CV (Awesome CV)
        ├── cv.tex                 # main file; \input's the cv/*.tex sections
        ├── awesome-cv.cls
        ├── cv/*.tex               # experience, education, skills, publications, ...
        └── fonts/                 # Roboto + FontAwesome TTFs (xelatex)
```

## Features

- Responsive design with site-wide dark/light mode (persisted to `localStorage`)
- Interactive Study Notes with theme-aware SVG/canvas visualizations
- Command palette search (Cmd/Ctrl-K) over pages, notes, projects and publications
- Embedded PDF viewer for the CV, generated from LaTeX
- SEO meta tags, sitemap, and Atom feed
- Automated build, link check and deployment via GitHub Actions

## Local development

Requires Node ≥ 22.23 (`.nvmrc` pins Node 22 for nvm/fnm; `make dev` installs it
from NodeSource if needed). The `Makefile` is the front door; run targets from
the repo root.

```bash
make dev      # install Node 22 / xelatex if missing (Debian/Ubuntu, uses sudo) + npm ci
make serve    # dev server with live reload → http://localhost:4321/
make site     # production build into docs/dist/ + link check
make cv       # build the CV PDF from docs/cv-src into docs/static/public/
make clean    # remove LaTeX intermediates
```

Or from `docs/`: `npm ci`, then `npm run dev`, `npm run build`, `npm run preview`.

## CV generation

The CV is built from `docs/cv-src/` with **xelatex** (required for the
Roboto/FontAwesome OpenType fonts — not `pdflatex`). `make cv` compiles
`cv.tex` twice (for reference resolution) and copies the result to
`docs/static/public/Alessandro_Sanvito_CV.pdf`, served at
`/public/Alessandro_Sanvito_CV.pdf`. The committed PDF is a build artifact — to
change the CV, edit the `.tex` sources, not the PDF.

## CI / deployment

CI lives in `.github/workflows/cv-build.yml`:

- **Pull requests** (touching `docs/**`, the workflow, or `Makefile`) run a fast
  `verify` job: `npm ci`, `npm run build`, and `npm run check-links` on internal
  links/images.
- **Push to `master`** runs the full `build` job: build the CV with xelatex,
  commit the regenerated PDF back to the branch, build the site, check links,
  and publish `docs/dist` to GitHub Pages with GitHub's own Pages actions
  (`upload-pages-artifact` + `deploy-pages`; Pages source: GitHub Actions).

Nothing is committed for deploys: the built site goes straight from the workflow
to Pages.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file
for details.
