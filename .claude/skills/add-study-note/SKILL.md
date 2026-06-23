---
name: add-study-note
description: Add, write, or preview an interactive "Study Note" blog post for the alexdruso.github.io Jekyll site. Use when asked to create a new study note / interactive explainer, scaffold a post under docs/_posts, or render/screenshot a note to check it in light and dark mode before pushing.
---

A Study Note is a standalone interactive HTML blog post (`docs/_posts/YYYY-MM-DD-slug.html`)
with embedded SVG/canvas demos and vanilla JS, sharing one cyan/teal design system.
Authoring one = write the HTML following the design rules, then **render it in a real
browser and look at it in both light and dark** — that visual check is the whole point
and the only reliable verification. The harness is
`.claude/skills/add-study-note/driver.mjs`: it builds the site and screenshots a note
(light + dark) with headless Chrome.

All paths below are relative to the repo root (`/home/user/Alexdruso.github.io`).

## Read this first (authoring rules)

`docs/_posts/CLAUDE.md` is the **authoritative** design-system and voice guide for study
notes and takes precedence for anything under `docs/_posts/`. Read it before writing.
Key non-negotiables it enforces:

- Start the body with `{% include study-note-styles.html %}` and wrap everything in
  `<div class="study-note"> … </div>` (theming + CSS scoping break without the wrapper).
- Use the `--sn-*` design tokens; **never** hardcode brand colors or use the old
  purple/blue palette.
- JS-drawn SVG/canvas must read tokens at runtime and redraw on theme toggle (the
  `MutationObserver` pattern).
- Concept-first voice; front matter has `categories` and an `excerpt` (shown on the index).

`.claude/skills/add-study-note/template.html` is a minimal, conventions-correct starting
scaffold (front matter + `.study-note` wrapper + one slider demo + one adaptive SVG chart
with the MutationObserver redraw). Copy it as your starting point.

## Research and fact-check first (deep-research)

These are study notes — the math and claims must be **correct**. Before writing, gather
and verify the content with the `deep-research` skill so the note rests on cited sources,
not recollection:

```
/deep-research <the note's topic, e.g. "Shannon entropy: definition, the −Σ p log p
formula, why log base 2 gives bits, and the average-surprise interpretation">
```

Use it to: confirm definitions and formulas, pin down constants/edge cases, sanity-check
the worked example's numbers, and surface the standard framing. Fold the verified facts
(and keep the key sources for your own reference) into the prose and the interactive demos.
The voice stays concept-first per `docs/_posts/CLAUDE.md` — research informs accuracy, it
doesn't turn the note into a literature review.

## Prerequisites

Site build deps (Ruby 3.3 + Bundler are preinstalled in this environment):

```bash
cd docs && bundle install
```

Headless Chrome for the preview harness (one-time; lands in `~/.cache/puppeteer`):

```bash
npx -y puppeteer browsers install chrome-headless-shell
```

Driver's Node deps (puppeteer-core), installed into the skill dir:

```bash
cd .claude/skills/add-study-note && npm install
```

## Write the note

Slug rule: filename is `YYYY-MM-DD-slug.html`; the live URL is `/:title/` so the slug for
the driver is the filename minus the date prefix and `.html`.

```bash
# from repo root — start from the scaffold, then edit the front matter + body
cp .claude/skills/add-study-note/template.html docs/_posts/2026-06-23-my-topic.html
```

Then edit `title`, `date`, `categories`, `excerpt`, and replace the body with your content,
following `docs/_posts/CLAUDE.md`.

## Preview (agent path — build + screenshot)

```bash
node .claude/skills/add-study-note/driver.mjs my-topic
```

This builds the site and writes three PNGs to
`.claude/skills/add-study-note/screenshots/`:

| file | what it shows |
|---|---|
| `my-topic-light.png` | the note in light mode (full page) |
| `my-topic-dark.png`  | the note in dark mode (full page) |
| `index-light.png`    | the `/study-notes/` index — confirm the new note appears with its excerpt |

**Look at all three.** Verify: demos render, the curve/chart uses the cyan accent, dark
mode is dark (not a light page on a dark frame), and the note is listed on the index.
Re-run after edits; pass `--no-build` to re-screenshot without rebuilding.

## Preview (human path)

```bash
cd docs && bundle exec jekyll serve --livereload   # → http://localhost:4000/
```

Useless in this headless container (no display), but it's the live-reload loop a human
uses locally. Toggle the theme with the bottom-right button.

## Gotchas

- **`bundle exec jekyll build` / `serve` fails with `command not found: jekyll`** under
  this environment's rbenv setup, even though `bundle show jekyll` resolves the gem. The
  driver works around it by invoking the gem's exe through ruby:
  `bundle exec ruby "$(bundle show jekyll)/exe/jekyll" build`. Use that form if you build
  by hand.
- **Permalink strips the date.** A file `2026-06-23-foo.html` builds to `_site/foo/` and
  serves at `/foo/` (`permalink: /:title/`). Pass the *slug* (`foo`), not the filename, to
  the driver.
- **`site.posts` is date-sorted, newest first.** A `date` in the future still publishes
  (Jekyll's `future` isn't disabled here) and sorts to the top of the index — fine for new
  notes, but don't expect a far-future date to be hidden.
- **Theme is applied via `body.dark-theme`** (toggle button + localStorage). The driver
  forces dark by adding that class directly, then waits ~600ms for the MutationObserver
  redraw — if your chart ignores the token-reread pattern, the dark screenshot will reveal
  hardcoded colors.
- **`screenshots/` and `node_modules/` are gitignored** in the skill dir — they're
  regenerated artifacts, not committed.

## Troubleshooting

- **`✗ _site/<slug>/index.html not found`**: wrong slug or the post failed to build. The
  error prints the list of built post slugs — match against it.
- **`Invalid date '…': Document … does not have a valid date`**: the post's front-matter
  `date:` is a placeholder or malformed. Set it to a real `YYYY-MM-DD` (the template ships
  with a `2026-01-01` placeholder you must change). A single bad post aborts the whole build.
- **`✗ chrome-headless-shell not found`**: run the `npx … puppeteer browsers install`
  line above.
- **`Cannot find package 'puppeteer-core'`**: run `npm install` in
  `.claude/skills/add-study-note`.
