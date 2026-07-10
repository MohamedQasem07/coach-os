# Exercise image generation prompts

For generating the exercise illustrations with an external image model
(Midjourney, DALL·E 3, Gemini / Nano Banana, Flux, SDXL…).

Generate each image separately. Keep the **Style block** identical across all
runs — that is what makes the 9 cards look like one set instead of 9 unrelated
pictures. Only swap the **Subject line**.

---

## Style block (paste with every generation, unchanged)

```
3D rendered anatomical fitness illustration of a muscular male figure
demonstrating a single gym exercise, viewed from a three-quarter front angle.

Rendering: clean medical-anatomy style. The body is rendered in neutral light
grey with clearly defined muscle groups and soft studio shading. The muscles
being worked by this exercise are highlighted in vivid orange-red (#E8452C).
All other muscles stay grey. No skin texture, no face detail, no hair — a
smooth anatomical mannequin. The figure wears simple dark grey shorts.

Equipment (barbell, bench, machine, cable stack) is rendered in matte dark grey
and light steel, simple and uncluttered.

Background: flat pure white (#FFFFFF), seamless, no floor line, no shadow
pooling, no gradient, no vignette.

Framing: the full figure and its equipment fit inside a square frame with even
margins. Centered composition. Even, soft, shadowless studio lighting.

Square 1:1 aspect ratio. High detail. No text, no logos, no watermarks,
no numbers, no arrows, no UI elements, no borders.
```

### Negative prompt (for SDXL / Flux / Automatic1111)

```
text, watermark, logo, signature, numbers, arrows, labels, UI, frame, border,
photograph, real person, skin texture, face, hair, tattoo, gym background,
mirrors, floor, shadow on ground, gradient background, colored background,
dark background, cropped limbs, extra limbs, deformed anatomy, blurry, noisy
```

---

## Subject lines — Chest (9 images)

Append one of these to the Style block. The filename it must be saved as is on
the right; it has to match exactly (see `README.md`).

| # | Subject line | Save as |
|---|---|---|
| 1 | Lying flat on a horizontal bench, pressing a loaded barbell up from the chest. **Highlight: pectorals (both sides), front deltoids, triceps.** | `bench-press.png` |
| 2 | Seated upright in a pec-deck / fly machine, arms out to the sides bent at the elbows, bringing the two padded arms together in front of the chest. **Highlight: pectorals.** | `lever-seated-fly.png` |
| 3 | Lying on a bench inclined about 30–45°, pressing two dumbbells upward from the upper chest. **Highlight: upper pectorals, front deltoids.** | `incline-bench-press.png` |
| 4 | Lying flat on a horizontal bench, arms opened out wide to the sides with a slight elbow bend, holding a dumbbell in each hand, mid-fly. **Highlight: pectorals.** | `dumbbell-fly.png` |
| 5 | Standing between two cable pulley towers, arms sweeping forward and inward to meet in front of the chest, holding one cable handle in each hand. **Highlight: pectorals.** | `cable-fly.png` |
| 6 | In a push-up position on the floor, body straight from head to heels, arms bent, chest lowered toward the ground. **Highlight: pectorals, triceps, front deltoids.** | `push-up.png` |
| 7 | Suspended on parallel dip bars, arms bent, torso leaning slightly forward at the bottom of a dip. **Highlight: lower pectorals, triceps.** | `dips.png` |
| 8 | Seated in a pec-deck machine with forearms flat against two vertical pads, squeezing the pads together in front of the chest. **Highlight: pectorals.** | `pec-deck.png` |
| 9 | Seated upright in a chest-press machine, pushing two horizontal handles forward away from the chest. **Highlight: pectorals, front deltoids, triceps.** | `chest-press-machine.png` |

---

## Output requirements

- **Format:** PNG
- **Size:** 1024×1024 (square). The card renders at ~168×141 CSS px, so 1024
  is generous; 512 is enough if you want smaller files.
- **Background:** pure white, flat. The card's media area is white, so a white
  background makes the figure look cut out and matches the reference exactly.
- **Filenames:** exactly as in the table. Lowercase, hyphen-separated.
- **Destination:** `public/assets/exercises/chest/`

Drop the files in and they appear automatically — no code change. Until then
each card shows a designed SVG fallback, never a broken image.

---

## Other muscle groups

Same Style block. Change the Subject line and the **Highlight:** list to the
target muscle. Save under `public/assets/exercises/<group>/<slug>.png` where
`<group>` is `back`, `shoulders`, `biceps`, `triceps`, `abs`, or `legs`, and
`<slug>` is the exercise's `id` in the `EXERCISES` array in `index.html`.

---

## Licensing

Only ship images you have the right to use. Check your image model's commercial
terms. Do not hotlink, scrape, or copy renders out of MuscleWiki, Fitness Point,
Muscle & Motion, or any other commercial fitness app.
