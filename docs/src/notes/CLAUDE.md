# Study Notes — authoring guide

Interactive study notes live here as standalone HTML files (`YYYY-MM-DD-slug.html`, served
at `/slug/`) with an inline `<style>` block and embedded vanilla JS. The Astro route
`src/pages/[slug].astro` wraps each one in the site layout and loads the shared
stylesheet `src/styles/study-note.css`; the body after the front matter is emitted
verbatim, so plain HTML, `<style>` and `<script>` work exactly as written (there is no
templating inside a note). They share one **editorial** design
system (a single reading column, serif prose, numbered sections, one cyan-teal accent)
so they look cohesive and professional, and never drift back toward the old "gamey,
blue-and-violet" or emoji-decorated look. Follow these rules when creating or editing a note.

## Writing voice

These are **self-study notes**: the job of the prose is to teach the concept to me, not to
pitch it to an audience. Write to be informative first.

- **Open concept-first.** The first sentence states what the concept *is* and the question the
  note answers — a direct definition, not a personal anecdote, character intro, or hook. Then
  give the one-sentence summary (the `se-note`/`bm-note` device) and start unpacking it.
- **Banned openers and packaging.** No "when I first met X at university", "I copied it down /
  passed the exam", "the refresher I wish I'd had", "by the end of this post you'll have built
  intuition", "things you can poke, drag, and run", or "…live in your browser". These address a
  reader and promise an experience; just teach the thing instead.
- **Neutral register, no narrator.** Don't tell a personal learning story or use "I" as a
  narrator. State the idea directly.
- **"you" is for demo instructions only** — imperative how-to like "drag the slider" or "start
  flipping". Don't use it for audience promises ("you'll see…", "you already know…").
- **Keep what already teaches well.** The one-sentence summary box, equations, and the
  interactive demos all stay. A running worked example (e.g. Luca for MDPs, the coin for
  hypothesis testing) is welcome **when it genuinely carries the math** — introduce it right
  after the concept, not as a story that opens the note.
- **No emoji anywhere** — not in headings, buttons, labels, demo data or status strings.
  Section headings are plain text (the shared CSS numbers them 01, 02, …). Typographic
  symbols that carry meaning are fine: arrows (→ ↑ ↺), ✓ / ✗, ❚❚ for pause, and ▶︎ for
  play (write it as `▶︎`, i.e. followed by U+FE0E, so iOS doesn't render it as an emoji).
- **Excerpts** (front-matter) follow the same voice: a crisp concept summary, not a hook.

## Required scaffold

Wrap the whole body in `.study-note` (the shared styles are added by the layout):

```html
---
title: "..."
date: YYYY-MM-DD
categories: [Topic, Interactive]
excerpt: "..."
---

<div class="study-note">

<style>
/* note-specific LAYOUT only — colors come from tokens, shared components
   come from src/styles/study-note.css */
</style>

... content, demos ...

<script> ... </script>

</div>
```

The wrapper matters: `study-note.css` scopes everything (including
`svg text`) under `.study-note`, and the dark-mode token overrides key off
`.dark-theme .study-note`. Without the wrapper, nothing themes correctly.

## Use the design tokens — never hardcode brand colors

Defined in `src/styles/study-note.css` on `.study-note`, with
`.dark-theme .study-note` overrides (so light + dark both work for free):

| Token | Use |
| --- | --- |
| `--sn-accent` / `--sn-accent-strong` | primary accent (cyan-teal); links, active states, curves |
| `--sn-accent-soft` / `--sn-accent-line` | tinted fills / hairline accent borders |
| `--sn-on-accent` | text/icon color on top of an accent fill |
| `--sn-panel` / `--sn-panel-inset` / `--sn-section` | surfaces (card, inset, section bg) |
| `--sn-border` / `--sn-grid` | hairline borders / SVG gridlines |
| `--sn-text` / `--sn-muted` | body / secondary text |
| `--sn-good` `--sn-warn` `--sn-bad` (+ `*-bg`) | semantic status only, desaturated |
| `--sn-radius` / `--sn-radius-sm` | corner radii |
| `--sn-shadow` / `--sn-glow` / `--sn-ease` | depth / dark-only glow / easing |
| `--sn-mono` | numerals, readouts, code |

**Never** use purple (`#8e44ad`), the old blue (`#2980b9`/`#4a90e2`), or rainbow
gradients. Accent reference: `#0891b2` (light) / `#22d3ee` (dark) / `#06b6d4` (mid).

## Layout & typography (handled by `study-note.css`)

- The note, its title and its date sit in one ~760px reading column.
- Prose (`p`/`ul`/`ol` directly under `.study-note` or a section) and headings are set
  in the serif (`--sn-serif`, Source Serif 4, matching the rest of the site); demos,
  controls and captions use the companion sans (`--sn-sans`, Source Sans 3), which
  `.study-note` sets as its default. Both faces are loaded by `src/layouts/Base.astro`.
- Sections (`se-section`/`bm-section`/`mdp-section`) are **not boxes**: a hairline rule
  above, a mono accent number, then a plain `h3`. Don't add backgrounds/borders back.
- `se-note` is a quiet italic pull-quote; `se-equation` is unboxed, centered serif;
  `se-example` and chart wraps are flat `--sn-panel-inset` fills with no border.

## Component rules

- **Sliders** are flat and single-accent (neutral track + accent thumb with a soft
  ring). No multi-color gradient tracks. Just give a range input class `se-slider`/
  `bm-slider`, or rely on `.study-note input[type="range"]`.
- **Status tags** are desaturated pills (`se-tag`/`bm-tag` + `.good`/`.warn`/`.hot`):
  soft token background + token text, no hard borders.
- **Cards / boxes** use a 1px `--sn-border` (or accent-line) and `--sn-radius`, not
  bold 2-4px borders. Reuse `se-section`/`bm-section`/`mdp-section`, `se-equation`,
  `se-note`, `se-example`, `se-chartwrap`/`graph-wrap`.
- **Buttons**: primary = `se-btn`/`bm-btn`/`vi-btn` (solid accent, lift + glow on
  hover); secondary = add `.sec`; quiet = `se-reset`/`bm-reset`/`reset-link`.
- **Numerals** (stats, readouts, scores) use `--sn-mono` + `tabular-nums` + accent.
- **Motion** uses `--sn-ease`; the glow (`--sn-glow`) is dark-mode-only by design —
  apply it via `box-shadow: var(--sn-glow)` and it stays `none` in light mode.

## Adaptive charts (JS-drawn SVG/canvas)

Hardcoded hex in JS does not react to the theme toggle. Read tokens at runtime and
redraw on toggle, using the shared runtime `window.StudyNote`
(`src/scripts/study-note.js`, loaded in `<head>` of every note page, so it is
available to the note's inline scripts):

- `StudyNote.reader(el)` → a function `c("--sn-accent")` returning the trimmed
  computed value of a token on `el` (defaults to the first `.study-note`).
- `StudyNote.onThemeChange(fn)` → calls `fn` every time the site theme toggles
  (one shared `MutationObserver` on `<body>`'s class). Don't create your own.

Pattern used across the notes:

```js
const SN = document.querySelector(".study-note");
const readCols = () => { const c = StudyNote.reader(SN);
  return { accent: c("--sn-accent"), good: c("--sn-good"), bad: c("--sn-bad"),
           warn: c("--sn-warn"), muted: c("--sn-muted"), grid: c("--sn-grid") }; };
let COL = readCols();
const redrawFns = [];
const onTheme = fn => { redrawFns.push(fn); return fn; };
StudyNote.onThemeChange(() => { COL = readCols(); redrawFns.forEach(f => f()); });
// ...then in each demo: use COL.accent/COL.grid/... and call onTheme(draw);
```

If several notes need the same new helper, add it to `src/scripts/study-note.js`
instead of copying it into each note.

For interpolated colors (e.g. energy/weight ramps) blend between tokens with a small
`hex2rgb`/`mix` helper (see the Boltzmann note) instead of literal blue→red ramps.

## Don't break interactivity

The JS keys off specific ids and class names (e.g. `se-tag.good`, `bm-cell.on`,
`bm-cell.flash`, `state-badge.active`, `action-btn[data-action]`, `vi-table td.best`,
`log-entry`/`popin`). Restyle freely, but **do not rename** a selector the JS reads or
toggles, and keep the `data-action` / state class hooks intact.

## Preview

```sh
cd docs && npm run dev   # http://localhost:4321/ — reloads on save
```

Check each demo in **both** light and dark (toggle bottom-right). Sliders, buttons,
tags, charts, and the theme toggle should all stay cyan, with no purple and no emoji.
