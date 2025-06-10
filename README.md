# Personal Website

This repository contains my personal website and CV, built using Jekyll and LaTeX.

## Structure

- `docs/`: Main website directory
  - `_layouts/`: Jekyll layout templates
  - `_includes/`: Reusable Jekyll components
  - `cv-src/`: LaTeX source files for CV generation
    - `cv.tex`: Main CV LaTeX file
    - `awesome-cv.cls`: CV template class
    - `cv/`: CV content sections
    - `fonts/`: Custom fonts for CV
  - `public/`: Static assets and generated PDFs
  - `style.scss`: Website styling
  - `index.md`: Main page content
  - `cv.md`: CV page with PDF viewer
  - `about.md`: About page content
  - `blog.md`: Blog page content

## CV Generation

The CV is generated from LaTeX source files using XeLaTeX. The generation process is automated through GitHub Actions:

1. When changes are pushed to the `docs/cv-src` directory, the workflow automatically:
   - Compiles the LaTeX files using XeLaTeX
   - Generates the PDF
   - Places it in `docs/public/Alessandro_Sanvito_CV.pdf`
   - Rebuilds the Jekyll site
   - Deploys to GitHub Pages

## Local Development

### Prerequisites

- Ruby 3.2 or later
- Bundler
- TeX Live (for local CV generation)

### Setup

1. Install dependencies:
   ```bash
   cd docs
   bundle install
   ```

2. Run the development server:
   ```bash
   bundle exec jekyll serve
   ```

3. View the site at `http://localhost:4000`

### Local CV Generation

To generate the CV locally:

1. Install TeX Live with XeLaTeX support:
   ```bash
   sudo apt-get install texlive-xetex texlive-fonts-extra texlive-latex-extra
   ```

2. Generate the PDF:
   ```bash
   cd docs/cv-src
   xelatex cv.tex
   xelatex cv.tex  # Run twice for proper reference resolution
   ```

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the repository. The deployment process:

1. Builds the CV from LaTeX source
2. Generates the Jekyll site
3. Deploys to the `gh-pages` branch

## License

This project is licensed under the MIT License - see the LICENSE file for details.
