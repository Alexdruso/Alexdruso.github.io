# Personal Website

The personal website and CV of Alessandro Sanvito, served at
[alexdruso.github.io](https://alexdruso.github.io) via GitHub Pages. It is a
**Jekyll 4** site (source under `docs/`) plus a **LaTeX (Awesome CV)** pipeline
that compiles a CV PDF into the site. The signature content is a set of
interactive **Study Notes** — standalone HTML posts with embedded SVG/canvas
visualizations and vanilla JS.

There is no application backend or JS framework — the deliverable is a static
site.

> For detailed contributor guidance (content model, design tokens, gotchas), see
> [`CLAUDE.md`](CLAUDE.md) and [`docs/_posts/CLAUDE.md`](docs/_posts/CLAUDE.md).

## Structure

```
.
├── Makefile                       # make dev / make cv / make clean
├── .github/workflows/cv-build.yml # CI: build CV + site, deploy to gh-pages
└── docs/                          # *** the Jekyll site root ***
    ├── _config.yml                # the sole Jekyll config
    ├── Gemfile                    # jekyll 4.3, webrick, jekyll-feed, jekyll-sitemap
    ├── index.md                   # "About Me" home page
    ├── publications.md            # renders _data/publications.yml
    ├── projects.md                # renders _data/projects.yml
    ├── posts.html                 # "/study-notes/" index of all posts
    ├── cv.md                      # embeds the generated CV PDF
    ├── game.md                    # "/game/" — a vanilla-JS Snake game
    ├── 404.md
    ├── _data/                     # navigation.yml, projects.yml, publications.yml
    ├── _layouts/                  # default.html → page.html / post.html
    ├── _includes/                 # meta, analytics, svg-icons, study-note-styles
    ├── _posts/                    # the interactive Study Notes (HTML)
    ├── _sass/                     # reset, variables, themes/minimal, highlights
    ├── style.scss                 # top-level stylesheet (@imports _sass partials)
    ├── cv-src/                    # LaTeX source for the CV (Awesome CV)
    │   ├── cv.tex                 # main file; \input's the cv/*.tex sections
    │   ├── awesome-cv.cls
    │   ├── cv/*.tex               # experience, education, skills, publications, ...
    │   └── fonts/                 # Roboto + FontAwesome TTFs (xelatex)
    ├── images/
    └── public/                    # generated assets — the CV PDF lives here
```

## Features

- Responsive design with site-wide dark/light mode (persisted to `localStorage`)
- Interactive Study Notes with theme-aware SVG/canvas visualizations
- Embedded PDF viewer for the CV, generated from LaTeX
- SEO meta tags, sitemap, and Atom feed
- Automated build and deployment via GitHub Actions

## Local development

The `Makefile` is the front door; run targets from the repo root.

```bash
make dev      # install ruby/xelatex/node + bundle install (Debian/Ubuntu, uses sudo)
make cv       # build the CV PDF from docs/cv-src into docs/public/
make clean    # remove LaTeX intermediates
```

Serve the site locally:

```bash
cd docs
bundle install                   # first time only
bundle exec jekyll serve         # http://localhost:4000/
# add --livereload while editing study notes
```

## CV generation

The CV is built from `docs/cv-src/` with **xelatex** (required for the
Roboto/FontAwesome OpenType fonts — not `pdflatex`). `make cv` compiles
`cv.tex` twice (for reference resolution) and copies the result to
`docs/public/Alessandro_Sanvito_CV.pdf`. The committed PDF is a build
artifact — to change the CV, edit the `.tex` sources, not the PDF.

## CI / deployment

CI lives in `.github/workflows/cv-build.yml`:

- **Pull requests** (touching `docs/**`, the workflow, or `Makefile`) run a fast
  `verify` job: `jekyll build` plus `html-proofer` on internal links/images.
- **Push to `master`** runs the full `build` job: build the CV with xelatex,
  commit the regenerated PDF back to the branch, build the Jekyll site, and
  deploy `docs/_site` to the `gh-pages` branch via `peaceiris/actions-gh-pages`.

Do not commit to `gh-pages` by hand — CI owns it.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file
for details.
