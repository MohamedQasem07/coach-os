# muscles.glb — attribution and licence

**This attribution is a licence condition, not a courtesy. It must be shown somewhere
in the shipped app (an About / Credits screen is enough) and must stay with the file.**

## Required attribution

```
3D anatomy derived from:
BodyParts3D — The Database Center for Life Science — CC BY-SA 2.1 Japan
Z-Anatomy — The libre 3D atlas of anatomy — CC BY-SA 4.0
```

## Licence

`muscles.glb` is a derivative work of [Z-Anatomy](https://github.com/Z-Anatomy/Models-of-human-anatomy),
which is itself derived from [BodyParts3D](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/).

Z-Anatomy is licensed **CC BY-SA 4.0**. ShareAlike is viral over the *model*, so:

- `muscles.glb` **must** be distributed under CC BY-SA 4.0.
- Attribution above **must** be preserved.
- **This does not force Coach OS itself to be open source.** The ShareAlike obligation
  attaches to the model file and to modifications of it, not to the application that
  merely loads and displays it.

If that is ever unacceptable commercially, replace this file with a royalty-free
anatomical model; nothing else in the fitness section needs to change, because the code
only depends on the mesh names listed below.

### One thing that was deliberately left out

The full Z-Anatomy distribution bundles a few structures under **CC BY-NC** licences
(non-commercial only) — the inner ear and a kidney model. Shipping those in a commercial
app would breach their terms. The extraction pipeline takes muscle bellies only, so no
NC-licensed geometry is present in `muscles.glb`.

## What is in the file

15 meshes, 247,996 triangles, Draco-compressed, 862 KB. Y-up, feet on the ground plane,
1.80 m tall, centred on X/Z.

| Mesh name | Triangles | Notes |
|---|---|---|
| `chest` | 12,000 | pectoralis major + minor |
| `shoulders` | 11,998 | deltoid, all three parts |
| `biceps` | 12,000 | biceps brachii, brachialis, coracobrachialis |
| `triceps` | 12,000 | triceps brachii (3 heads) + anconeus |
| `forearms` | 11,998 | brachioradialis, carpi flexors/extensors, pronator teres |
| `abs` | 12,000 | rectus abdominis |
| `obliques` | 12,000 | external + internal oblique, transversus abdominis |
| `lats` | 12,000 | latissimus dorsi |
| `traps` | 12,000 | trapezius, all three parts |
| `lowerback` | 11,992 | erector spinae, longissimus, iliocostalis, quadratus lumborum |
| `glutes` | 11,998 | gluteus maximus / medius / minimus |
| `quads` | 12,000 | rectus femoris + three vasti |
| `hamstrings` | 11,998 | biceps femoris, semitendinosus, semimembranosus |
| `calves` | 11,996 | gastrocnemius, soleus, plantaris |
| `context` | 79,960 | every other muscle — not pickable, keeps the figure whole |

The 14 pickable names match the muscle ids used in `index.html` exactly. `context` is
decorative: render it grey and exclude it from raycasting.

`KHR_draco_mesh_compression` is **required**, so the loader must register a `DRACOLoader`.

## Reproducing this file

The pipeline lives in the scratchpad, not the repo, because it needs a 306 MB source file.

1. `winget install BlenderFoundation.Blender`
2. Download `Z-Anatomy.zip` (86 MB) from the repo above; unzip to get `Startup.blend`.
3. Run `blender -b Startup.blend --factory-startup --python export_glb.py -- muscles.glb`

Two things that pipeline has to get right, learned the hard way:

- Left/right muscles often **share one mesh datablock** and mirror through a
  negative-scale object matrix. Bake `matrix_world` per object and reverse the face
  winding when `determinant() < 0`, or the whole right-hand side renders inside-out.
- Objects named `... .el / .er / .ol / .or / .o1l …` are **origin/insertion markers**
  (50–150 vertices) in the `2: Muscular insertions` collection, not muscle bellies.
  Only `.l` / `.r` / `.j` objects inside `4: Muscular system` are real geometry.
