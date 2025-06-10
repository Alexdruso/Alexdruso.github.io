# Personal Website

This repository contains my personal website and CV, built using Jekyll and LaTeX. The website features a clean, modern design with sections for my professional experience, education, technical skills, and blog posts.

## Structure

- `docs/`: Main website directory
  - `_layouts/`: Jekyll layout templates
    - `default.html`: Main layout template with navigation
    - `post.html`: Blog post layout
  - `_includes/`: Reusable Jekyll components
    - `head.html`: Common head elements
    - `header.html`: Navigation header
    - `footer.html`: Site footer
  - `cv-src/`: LaTeX source files for CV generation
    - `cv.tex`: Main CV LaTeX file using Awesome CV template
    - `awesome-cv.cls`: CV template class
    - `cv/`: CV content sections
      - `experience.tex`: Professional experience
      - `education.tex`: Academic background
      - `skills.tex`: Technical skills
      - `publications.tex`: Research publications
    - `fonts/`: Custom fonts (Roboto and FontAwesome)
  - `public/`: Static assets and generated PDFs
    - `Alessandro_Sanvito_CV.pdf`: Generated CV
  - `style.scss`: Website styling with custom colors and layout
  - `index.md`: Main page with professional summary
  - `cv.md`: CV page with embedded PDF viewer
  - `about.md`: Detailed about page
  - `blog.md`: Blog posts and articles

## Features

- Responsive design that works on all devices
- Dark/light mode support
- Embedded PDF viewer for CV
- Blog section with markdown support
- Automated CV generation from LaTeX
- GitHub Pages deployment

## CV Generation

The CV is generated from LaTeX source files using XeLaTeX and the Awesome CV template. The generation process is automated through GitHub Actions:

1. When changes are pushed to the `docs/cv-src` directory, the workflow automatically:
   - Compiles the LaTeX files using XeLaTeX
   - Generates the PDF with proper font rendering
   - Places it in `docs/public/Alessandro_Sanvito_CV.pdf`
   - Rebuilds the Jekyll site
   - Deploys to GitHub Pages

## Local Development

### Prerequisites

- Ruby 3.2 or later
- Bundler
- TeX Live (for local CV generation)
- Git

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/yourusername.github.io.git
   cd yourusername.github.io
   ```

2. Install dependencies:
   ```bash
   cd docs
   bundle install
   ```

3. Run the development server:
   ```bash
   bundle exec jekyll serve
   ```

4. View the site at `http://localhost:4000`

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

## Contributing

Feel free to fork this repository and use it as a template for your own website. If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
