// @ts-check
import { defineConfig } from 'astro/config';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://alexdruso.github.io',
  // Static files served as-is from the site root. Named `static/` (not Astro's
  // default `public/`) so the CV keeps its long-standing URL,
  // /public/Alessandro_Sanvito_CV.pdf, without a public/public/ folder.
  publicDir: './static',
  // Every page is a directory (/self-attention/ -> self-attention/index.html),
  // matching the URLs the Jekyll site used.
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Keep authored whitespace: compression drops the space in text like
  // "Full list on <a>GitHub</a>" and between inline-block footer icons.
  compressHTML: false,
  vite: {
    css: {
      preprocessorOptions: {
        // style.scss still uses Sass @import; keep the build output quiet.
        scss: { silenceDeprecations: ['import', 'global-builtin', 'color-functions'] },
      },
    },
  },
});
