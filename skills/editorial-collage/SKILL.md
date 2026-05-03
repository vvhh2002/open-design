---
name: editorial-collage
description: |
  A magazine-grade editorial landing page in the Atelier Zero / Monocle
  tradition: warm paper canvas, surreal plaster-and-architecture collage
  imagery, oversized italic-serif-mixed display type, Roman-numeral
  section markers, side rails of rotated micro-text, coordinate
  annotations, and a single coral accent. Use when the brief asks for an
  "editorial landing page", "magazine site", "studio website", "manifesto
  page", "high-end agency landing", or names references like Monocle,
  Apartamento, IDEA, Atelier Zero.
triggers:
  - "editorial landing page"
  - "magazine landing"
  - "magazine site"
  - "studio website"
  - "agency landing"
  - "manifesto page"
  - "monocle style"
  - "apartamento style"
  - "atelier zero"
  - "杂志风落地页"
  - "国际范官网"
  - "编辑设计落地页"
od:
  mode: prototype
  platform: desktop
  scenario: marketing
  featured: 1
  preview:
    type: html
    entry: example.html
    reload: debounce-100
  design_system:
    requires: true
    recommended: atelier-zero
    sections: [color, typography, layout, components]
  craft:
    requires: [typography, color, anti-ai-slop]
  inputs:
    - name: brand_name
      type: string
      required: true
    - name: tagline
      type: string
      required: true
    - name: italic_words
      type: string
      required: false
      description: comma-separated nouns to render in italic serif inside the headline
    - name: vol_issue
      type: string
      default: "Vol. 01 / Issue Nº 01"
    - name: filed_under
      type: string
      default: "Design · Intelligence"
    - name: coords
      type: string
      default: "52.5200° N · 13.4050° E"
      description: studio coordinates rendered in mono microcopy
    - name: section_count
      type: integer
      default: 8
      min: 5
      max: 9
      description: total Roman-numeral sections (drives the "008 / 008" page-of-pages counter)
  parameters:
    - name: hero_image_share
      type: ratio
      default: 0.61
      range: [0.5, 0.7]
      description: portion of the hero row given to the collage image
    - name: accent_strength
      type: opacity
      default: 1.0
      range: [0.7, 1.0]
  outputs:
    primary: example.html
    assets: assets/
  capabilities_required:
    - file_write
    - image_generation
  example_prompt: |
    Build me a landing page for "Open Design" — open-source alternative to
    Claude Design. Tagline: "Designing intelligence with skills, taste, and
    code." Italic words: intelligence, taste, code. Editorial collage
    style — Atelier Zero / Monocle. Use the atelier-zero design system.
---

# Editorial Collage Skill

Produce a single-page editorial landing site that reads like a printed
magazine that happens to deploy. The vibe is the same as the reference
plate inside `assets/hero.png` — warm paper, plaster-and-arch collage,
oversized italic-mixed display type, Roman-numeral section walks, and a
single coral note.

## 1. Read context

Before writing anything:

1. Read the active `DESIGN.md` injected above. If the brief specifies
   the **atelier-zero** design system or the user invokes one of the
   trigger phrases, the system is correct. If a different DS is
   active, gracefully translate the tokens but preserve the layout
   primitives (Roman rules, side rails, metadata strip, hero crop
   marks, four-step method bar). Never drop those primitives.
2. Read `assets/imagegen-prompts.md`. It is the working prompt pack
   for every image this skill consumes.
3. Read `assets/image-manifest.json`. It enumerates every image slot
   the example uses (hero / about / capabilities / 4× method / 5× lab
   / 2× work / testimonial / cta) and the prompt id for each.

## 2. Decide content

From the brief, settle these inputs (ask the user only if unclear):

- `brand_name`, `tagline`, `italic_words` (2–4 emotional nouns)
  - Normalize the raw `italic_words` string before use: trim each
    entry, split on `,`, and drop empty tokens.
  - Cap the list at 4 nouns. If more than 4 were supplied, keep the
    first 4 and surface a one-line warning before emitting the page;
    this preserves the rule in DESIGN.md §12 that italic emphasis
    only carries emotional **nouns**.
  - If a token is a verb or adjective (e.g. `designing`, `beautiful`),
    rewrite it to its noun form (`design`, `beauty`) instead of
    italicizing it as-is. If you cannot map it confidently, drop it
    and warn rather than violating the noun-only rule.
  - Strip punctuation other than the comma separators (e.g. trailing
    periods, stray quotes) before comparing or rendering.
- `vol_issue` (defaults `Vol. 01 / Issue Nº 01`)
- `filed_under` (default `Design · Intelligence`)
- `coords` (default Berlin), and an alternate language list
  (`EN · DE · 中文 · 日本語`)
- the count of skills / systems / agents (or any 2-digit triplet
  that headlines the stat row, e.g. `31 · 72 · 12`)
- 4 method step names (default Detect / Discover / Direct / Deliver)
- 4 capability tile names (default Skills / Systems / Adapters / BYOK)
- 5 lab card names (default 5 experiments) + 2 selected work titles

## 3. Generate or reuse imagery

For each entry in `image-manifest.json`:

1. If a matching image already exists in `assets/` AND the brand
   theme is unchanged, reuse it.
2. Otherwise, call the active image-generation backend (`gpt-image-fal`
   if available, else `gpt-image-azure`) with the corresponding prompt
   from `imagegen-prompts.md`, substituting the brand variables. The
   manifest specifies size and quality.
3. Write each render to `assets/<slot>.png`. Long-edge ≥1024px.

If image generation is unavailable for a given slot, do NOT leave a
broken `<img>` reference. Inject an inline SVG placeholder sized to
the slot's manifest aspect ratio (1:1, 3:4, or whatever
`image-manifest.json` declares), filled with `--paper` (`#efe7d2`),
and showing a centered 10px JetBrains Mono label such as
`[Render pending: hero.png]` in `--ink-faint`. This preserves the
page layout, signals the gap explicitly, and stays inside the Atelier
Zero palette. The user can later regenerate the slot from
`imagegen-prompts.md` and replace the placeholder. Example:

```html
<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
     role="img" aria-label="Render pending: hero.png">
  <rect width="100" height="100" fill="#efe7d2"/>
  <text x="50" y="52" text-anchor="middle"
        font-family="JetBrains Mono, monospace" font-size="4"
        fill="#8b8676">[Render pending: hero.png]</text>
</svg>
```

If image generation succeeded for the slot, write the PNG to
`assets/<slot>.png` and reference it from `<img src>` as usual.

## 4. Compose the page

Write a single self-contained `example.html`:

- `<!doctype html>` through `</html>`, all CSS inline in `<head>`.
- Google Fonts via one `<link>`: `Inter Tight 400-900`,
  `Inter 300-600`, `Playfair Display ital@500-700`,
  `JetBrains Mono 400-500`.
- Paper canvas: warm `#efe7d2` body + a fixed `body::before`
  noise+vignette overlay (see DESIGN.md §2 surface noise).
- All editable elements tagged with `data-od-id="<unique-slug>"`.

### Section order (mandatory)

1. **Side rails** — two fixed 36px vertical strips on left + right
   edges, hidden ≤1280px. Right rail: `<brand_name> — <vol_issue> ·
   Apache-2.0`. Left rail: a comma list of skill keywords.
2. **Top metadata strip** — `<brand_name>/2026 · <vol_issue>` left,
   `Filed under <filed_under> · Compiled by <brand_name> · Apache-2.0`
   middle (collapses ≤1080), `● Live · v0.4.6` + locale switcher right.
3. **Nav** — brand mark `Ø` + brand name + studio meta block; nav
   links with superscript counts; primary CTA pill with mustard ★.
4. **Hero (I.)** — left copy column (`0.78fr`), right collage column
   (`1.22fr`). Headline 44–78px clamp, mixes Inter Tight 800 + Playfair
   Italic 500 + coral period. Hero image gets four corner crop marks,
   four corner annotations (`FIG. 01 / OD-26` · `Plate Nº 08` · `SHA …`
   · `Composed in <brand>`), and a bordered `01–04` index card on the
   right edge with one entry highlighted in ink.
5. **About (II.)** — a 1.05fr / 1fr split. Right side has the about
   collage with a side note rotated up the right margin.
6. **Capabilities (III.)** — left collage with vertical ribbon
   (`OPEN DESIGN · CAPABILITIES MATRIX`), right 2×2 cards (`01–04`)
   in Bone with serif italic numerals + arrow marks.
7. **Labs (IV.)** — pills row (All / Prototype / Deck / Mobile /
   Office) with active state coral. 5-column grid of lab cards;
   each card has a 4:5 image, a corner badge, `Nº 0n / 2026` row, h4,
   description, arrow mark. Below the grid: a dotted progress bar
   (`5 of 31`) and "VIEW FULL LIBRARY →".
8. **Method (V.)** — 4-step grid with a horizontal hairline
   threading through the step heads, `→` separators, italic Playfair
   `01–04` numerals at 78px coral. Each step has a 1:1 image
   underneath.
9. **Selected Work (VI.)** — dark `#15140f` panel rounded 32px with
   noise overlay. Left: copy + underlined coral link. Right: two
   work cards rotated -1.2° / +2.4° on Bone surface, each with index
   `01 / 31` and a 4:3 image.
10. **Testimonial / Collaborators (VII.)** — left: italic-quote h2,
    avatar + author, divider, partner glyph row (5 SVG marks).
    Right: testimonial collage image.
11. **CTA (VIII.)** — clamp(54px, 6.6vw, 100px) closing headline,
    primary CTA + email pill, `● Live` stamp + version + coords.
    Right: CTA collage with vertical `OPEN DESIGN · FIN.` ribbon and
    serif italic `Nº 08`.
12. **Footer** — 5-column link grid + bottom rule with `● <brand> ·
    Apache-2.0 · 2026 / <vol_issue>` + a closing mega-word
    `<brand>.` at clamp(70px, 13vw, 200px), with the trailing word in
    Playfair Italic coral.

### Section rule contract

Every section opens with `.sec-rule`:

```
[Roman.] · [section-meta] · [page-of-008]
```

Rules:

- Roman numerals are sequential `I, II, III, IV, V, VI, VII, VIII`.
  Render in Playfair Italic 14px coral.
- Page-of-pages: `004 / 008`. Pad both numbers to 3 digits.
- Use `•` (coral middle dot) between meta segments.

### Annotation contract

Every featured image carries:

- 4 hairline corner brackets (22×22, ink-faint `1px solid`).
- 4 corner annotations in Inter Tight 10.5px uppercase
  letter-spaced 0.18em (or JetBrains Mono 10px for SHAs/coords).
- The brand color `coral` may appear once inside the annotation
  set, e.g. inside `Composed in <brand>`.

## 5. Self-check (before emitting)

- [ ] Top metadata strip is present.
- [ ] Both side rails are present in the markup.
- [ ] All 8 sections carry a `.sec-rule` with Roman + page-of-008.
- [ ] Headline mixes Inter Tight 800 with Playfair Italic 500 and
      ends with `<span class="dot">.</span>` (coral period).
- [ ] Hero image has 4 corner crop marks + 4 annotations + the
      `01–04` index card.
- [ ] Coral appears in CTA fill, Roman numerals, eyebrow underlines,
      pulse dots — but **never** twice in the same viewport beyond
      this trio.
- [ ] No emoji except a single mustard ★ in the nav CTA.
- [ ] No pure black, no pure white on Paper.
- [ ] Footer mega-word ends with Playfair-italic coral.
- [ ] Page is responsive at 1440 / 1080 / 880 / 560.

## 6. Output contract

Emit between `<artifact>` tags:

```
<artifact identifier="<brand-slug>-editorial" type="text/html" title="<brand_name> — Editorial Landing">
<!doctype html>
<html lang="en">
…
</html>
</artifact>
```

One sentence before the artifact summarizing the chosen brand voice and
italic words. Nothing after.

## 7. For skill authors reading this as a reference

This skill is the canonical example of a **collage-first editorial
page** in Open Design. It pairs with:

- `design-systems/atelier-zero/DESIGN.md` — the tokens.
- `assets/imagegen-prompts.md` — the working prompt pack used to
  produce every collage.
- `assets/image-manifest.json` — the slot-to-prompt mapping.
- `example.html` — a known-good rendering for the seed brand
  ("Open Design").

The 16 PNGs in `assets/` ship with the skill so the example renders
out-of-the-box. When re-keying to a new brand, regenerate every slot
flagged `rekey_on_brand_change: true` in `assets/image-manifest.json`
— at the time of writing that is `hero.png`, `about.png`,
`capabilities.png`, `cta.png`, `testimonial.png`, `work-1.png`, and
`work-2.png`. The 4 method tiles and 5 lab cards can be reused across
many brands because they read as abstract collage motifs.

See `../../docs/skills-protocol.md` for the full skill protocol.
