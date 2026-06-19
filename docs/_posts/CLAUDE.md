# Study Notes — authoring guide

Interactive study notes live here as standalone HTML posts (`layout: post`) with an
inline `<style>` block and embedded vanilla JS. They share one **sleek / futuristic**
design system so they look cohesive and never drift back toward the old "gamey,
blue-and-violet" look. Follow these rules when creating or editing a note.

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
- **Keep what already teaches well.** The one-sentence summary box, emoji section headers,
  equations, and the interactive demos all stay. A running worked example (e.g. Luca for MDPs,
  the coin for hypothesis testing) is welcome **when it genuinely carries the math** — introduce
  it right after the concept, not as a story that opens the note.
- **Excerpts** (front-matter) follow the same voice: a crisp concept summary, not a hook.

## Required scaffold

Right under the front matter, pull in the shared styles and wrap the whole body in
`.study-note`:

```liquid
---
layout: post
title: "..."
date: YYYY-MM-DD
categories: [Topic, Interactive]
excerpt: "..."
---

{% include study-note-styles.html %}

<div class="study-note">

<style>
/* note-specific LAYOUT only — colors come from tokens, shared components
   come from study-note-styles.html */
</style>

... content, demos ...

<script> ... </script>

</div>
```

The wrapper matters: `study-note-styles.html` scopes everything (including
`svg text`) under `.study-note`, and the dark-mode token overrides key off
`.dark-theme .study-note`. Without the wrapper, nothing themes correctly.

## Use the design tokens — never hardcode brand colors

Defined in `_includes/study-note-styles.html` on `.study-note`, with
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
redraw on toggle. Pattern used across the notes:

```js
const SN = document.querySelector(".study-note");
const readCols = () => { const cs = getComputedStyle(SN); const c = n => cs.getPropertyValue(n).trim();
  return { accent: c("--sn-accent"), good: c("--sn-good"), bad: c("--sn-bad"),
           warn: c("--sn-warn"), muted: c("--sn-muted"), grid: c("--sn-grid") }; };
let COL = readCols();
const redrawFns = [];
const onTheme = fn => { redrawFns.push(fn); return fn; };
new MutationObserver(() => { COL = readCols(); redrawFns.forEach(f => f()); })
  .observe(document.body, { attributes: true, attributeFilter: ["class"] });
// ...then in each demo: use COL.accent/COL.grid/... and call onTheme(draw);
```

For interpolated colors (e.g. energy/weight ramps) blend between tokens with a small
`hex2rgb`/`mix` helper (see the Boltzmann note) instead of literal blue→red ramps.

## Don't break interactivity

The JS keys off specific ids and class names (e.g. `se-tag.good`, `bm-cell.on`,
`bm-cell.flash`, `state-badge.active`, `action-btn[data-action]`, `vi-table td.best`,
`log-entry`/`popin`). Restyle freely, but **do not rename** a selector the JS reads or
toggles, and keep the `data-action` / state class hooks intact.

## Preview

```sh
cd docs && bundle exec jekyll serve --livereload   # http://localhost:4000/
```

Check each demo in **both** light and dark (toggle bottom-right). Sliders, buttons,
tags, charts, and the theme toggle should all stay cyan/sleek with no purple.
