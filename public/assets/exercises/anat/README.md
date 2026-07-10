# Exercise anatomy renders

Each exercise card shows the muscles that exercise trains: **primary in red,
secondary in amber**, on the same figure the 3D atlas uses. These are baked from
`../models/muscles.glb` with Blender, so they are the same anatomy — not clip art.

60 exercises collapse to **32 images**, because exercises that train the same
muscles share one render (every chest press looks the same from the muscle's
point of view). Filenames are a hash of `primary|secondary|view`; the
slug → hash map lives in `EX_ANAT` in `index.html`.

Format: 400×338 PNG, 64-colour palette, flattened onto `#f4f6f8`.
About 30 KB each, ~1 MB total.

**The plate colour is load-bearing.** `.fit-ex-media` in `index.html` is set to
the same `#f4f6f8`. Change one and you must change the other, or the card shows
a seam around the render.

## Regenerating

Needs Blender and `muscles.glb`. The script lives in the scratchpad, not the
repo, because it also needs the 306 MB Z-Anatomy source to rebuild the GLB.

```
blender -b --factory-startup --python render_exercises.py -- muscles.glb exercises.json out/
```

Then flatten and quantise (Pillow), and copy the PNGs here.

## Three things the renderer has to get right

**Blender's `ortho_scale` maps to the larger render dimension.** The cards are
wider than tall, so scaling the camera by body height silently crops the head
and feet.

**Framing needs a constant margin, not a constant multiplier.** Shoulders are
0.19 m tall and the lower back is 0.74 m. Multiplying either by the same number
gives a tight crop for one and a full-body shot for the other. The script adds a
fixed band of context around the primary muscle's bounding box instead.

**Some muscles are buried and must have the layers above them hidden.**
Verified by rendering with each candidate occluder hidden in turn:

| Muscle | Hidden by | Occluders removed |
|---|---|---|
| `abs` (rectus abdominis) | the oblique aponeurosis | `obliques` |
| `lowerback` (erector spinae) | superficial back muscles | `lats`, `traps`, `context` |

An occluder is dropped even when it is a *secondary* muscle for that exercise —
showing the primary in red beats keeping a secondary in amber. A deadlift
therefore shows the erector spinae without the lats on top.

Lighting is a point-light rig mirrored in Y for back views; a fixed front rig
leaves the back muddy. Energies are deliberately low, since a hot key washes the
reds out to pink at thumbnail size. `view_transform` is `Standard`, because
Filmic desaturates the accent reds.

## Licence

Derived from `../models/muscles.glb` — see `../models/ATTRIBUTION.md`.
These renders inherit **CC BY-SA 4.0** and the BodyParts3D / Z-Anatomy
attribution requirement.
