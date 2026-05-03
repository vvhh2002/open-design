# editorial-collage

Magazine-grade editorial landing page in the Atelier Zero style.

```
editorial-collage/
├── SKILL.md                       ← agent workflow (front-matter + steps)
├── example.html                   ← known-good rendering for "Open Design"
├── README.md                      ← you are here
└── assets/
    ├── imagegen-prompts.md        ← style anchor + per-slot prompt pack
    ├── image-manifest.json        ← slot → file/size/prompt mapping (16 images)
    ├── hero.png                   ← 1:1 hero collage
    ├── about.png                  ← 1:1 manifesto plate
    ├── capabilities.png           ← 1:1 capabilities matrix
    ├── method-1..4.png            ← 4× 1:1 method tiles
    ├── lab-1..5.png               ← 5× 3:4 experiment cards
    ├── work-1..2.png              ← 2× 3:4 selected work plates
    ├── testimonial.png            ← 1:1 portrait bust
    └── cta.png                    ← 1:1 closing plate

Authoritative per-slot dimensions live in `assets/image-manifest.json`.
```

## Pairs with

- **Design system:** [`design-systems/atelier-zero/DESIGN.md`](../../design-systems/atelier-zero/DESIGN.md)
- **Craft:** `craft/typography.md`, `craft/color.md`, `craft/anti-ai-slop.md`

## Try it locally

```bash
# from the repo root
cd skills/editorial-collage
python3 -m http.server 8765
# open http://localhost:8765/example.html
```

## Re-key for a new brand

1. Update the `<title>`, brand mark `Ø`, brand name, `vol_issue`,
   `coords`, `filed_under`, headline, italic words, and section copy.
2. Regenerate the brand-sensitive images (`hero`, `about`,
   `capabilities`, `cta`, `testimonial`, `work-1`, `work-2`) using
   `assets/imagegen-prompts.md`. These slots are flagged
   `rekey_on_brand_change: true` in `image-manifest.json`.
3. Reuse the `method-1..4` and `lab-1..5` images — they read as
   abstract collage motifs and travel between brands.
