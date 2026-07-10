# Exercise images

Drop exercise illustrations here and they appear in the fitness section automatically —
no code change needed.

## Path convention

```
public/assets/exercises/<muscle-group>/<exercise-slug>.png
```

`<muscle-group>` is the group key: `chest`, `back`, `shoulders`, `biceps`, `triceps`, `abs`, `legs`.

## Chest slugs (authored in `CHEST_EXERCISES` in index.html)

```
chest/bench-press.png
chest/lever-seated-fly.png
chest/incline-bench-press.png
chest/dumbbell-fly.png
chest/cable-fly.png
chest/push-up.png
chest/dips.png
chest/pec-deck.png
chest/chest-press-machine.png
```

Other groups derive their slugs from the `id` field of the `EXERCISES` atlas in `index.html`
(e.g. `back/lat-pulldown.png`, `biceps/hammer-curl.png`).

## Behaviour when an image is missing

Each card renders a designed SVG fallback (light plate, faint grid, equipment glyph) *underneath*
the `<img>`. The photo is transparent until it actually decodes, so a missing, blocked, or slow
file degrades to the illustration rather than a blank white card. No emoji are ever used.

## Licensing

Only add images you have the right to ship. Do not hotlink, scrape, or copy assets from
commercial fitness apps.

Recommended aspect ratio: roughly square (cards use `1 / 0.84`), light or white background to
match the reference card style.
