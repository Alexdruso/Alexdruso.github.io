# GitHub Actions for LaTeX CV Generation

## Overview
This rule documents the setup and configuration for automatically generating a CV PDF from LaTeX source files using GitHub Actions.

## Key Components

### 1. Workflow Structure
```yaml
name: Build Site and CV
on:
  push:
    paths:
      - 'docs/**'
  workflow_dispatch:
```

### 2. TeX Live Setup
The TeX Live setup is crucial for LaTeX compilation. Use the `xu-cheng/texlive-action@v2` action with:
```yaml
- name: Set up TeX Live
  uses: xu-cheng/texlive-action@v2
  with:
    version: '2023'
    scheme: 'full'
    packages: 'latexmk'
```

### 3. CV Building Process
The CV building process requires:
- Running pdflatex twice for proper reference resolution
- Copying the output to the correct location
```yaml
- name: Build CV
  run: |
    cd docs/cv-src
    pdflatex cv.tex
    pdflatex cv.tex
    cp cv.pdf ../public/Alessandro_Sanvito_CV.pdf
```

## Common Issues and Solutions

1. **pdflatex: command not found**
   - Ensure TeX Live is properly set up with the correct parameters
   - Use the 'full' scheme to include all necessary packages
   - Add specific packages if needed (e.g., 'latexmk')

2. **Missing Dependencies**
   - Add required packages to the TeX Live setup
   - Ensure all LaTeX files and resources are in the correct directory

3. **Reference Resolution**
   - Always run pdflatex twice to ensure proper reference resolution
   - Check for any missing references in the LaTeX source

## Best Practices

1. **Directory Structure**
   - Keep LaTeX source files in `docs/cv-src/`
   - Store generated PDF in `docs/public/`
   - Maintain a clear separation between source and output

2. **Workflow Triggers**
   - Use path filters to trigger only on relevant changes
   - Enable manual triggers for testing

3. **Error Handling**
   - Check for compilation errors in the workflow logs
   - Ensure proper file permissions for output directories

## Integration with Jekyll

When combining with Jekyll:
1. Build the CV first
2. Then build the Jekyll site
3. Deploy everything together

```yaml
- name: Build Jekyll site
  run: |
    cd docs
    bundle exec jekyll build

- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./docs/_site
    commit_message: "Update site and CV"
``` 
