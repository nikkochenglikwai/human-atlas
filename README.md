# Brain & Psychology Atlas

An interactive 3D atlas that connects brain anatomy to the questions psychologists ask. Orbit and take apart **123 individually selectable structures** from the BodyParts3D adult male reference brain, then apply one of **ten psychology lenses** (executive control, emotion and threat, memory, reward and habit, language, perception and attention, skill learning, social cognition, stress, arousal and sleep) to light up the structures involved, with landmark studies, clinical relevance, what the model leaves out, and why each claim should be read with care.

Built with React, Three.js and shadcn/ui, styled after the Dala dark-stage reference from [Refero Styles](https://styles.refero.design).

## Explore

- Orbit, zoom and select structures directly on the brain.
- Toggle eleven functional regions, or switch between cortex and deep structures.
- Open a psychology lens to isolate its structures and read the evidence, with a stated limit for every lens.
- Select any structure to see which lenses involve it and what role research assigns it.
- Separate the brain into a spaced inventory of every structure; show a glass skull for context.
- Search 187 named concepts and source identifiers.

## Run locally

Requires Node.js 22.13 or newer. No API keys or accounts are needed.

```sh
npm ci
npm run dev
```

Open http://localhost:3016. To build the static site, run `npm run build`; the output is in `dist/` (about 9 MB, of which 3.2 MB is the compressed model).

## Where things live

| Concern | Location | Edit it to |
| --- | --- | --- |
| Psychology content | `app/psychology.json` | Add or revise a lens, role, study or caution. No code change needed. |
| Regions and colours | `app/anatomy.ts` and the rules in `scripts/build-brain.mjs` | Regroup structures or recolour regions. |
| 3D data | `public/models/` (generated) | Never edit by hand; rebuild with `npm run build:brain`. |
| Full-body source | `raw/bodyparts3d/` | Leave unmodified; it is the immutable input to the build. |

## Validate

```sh
npm run check
npm run validate
npm run build
```

`validate` runs three checks: mesh buffers, names and concept membership (`validate-atlas.mjs`); that every lens resolves to real meshes, carries at least two dated evidence items, a clinical or applied entry, a "not modeled" statement and a caution (`validate-psychology.mjs`); and exploded-layout, search and tap-versus-drag contracts (`validate-interactions.mjs`). A lens that loses its evidence or points at a structure that no longer exists fails the build. Browser checks have exercised the desktop layout, the lens flow and a 390×844 phone layout; physical-device performance and real multitouch hardware have not been tested.

## Reading the psychology layer

Lens content is a teaching summary written for this atlas. Citations are given by author, year and journal reference so they can be checked; verify them against the primary papers before citing them. Lenses describe group-level associations from lesion, stimulation, recording and imaging studies. They do not diagnose individuals, and a region responding to a task does not show it performs that function alone (reverse inference). Mesh boundaries follow anatomical convention rather than functional parcellation, so a gyrus approximates, and sometimes spans, a functional area. Structures central to some circuits are not in the dataset: the nucleus accumbens, ventral tegmental area, substantia nigra, locus coeruleus, raphe nuclei and individual amygdala and thalamic nuclei. Each lens states which of these it is missing.

## Anatomy data

The viewer uses a subset of **BodyParts3D 4.0**, an adult male reference anatomy, licensed **CC BY 4.0**. It represents one reference male, not population variation. The subset, selection rules and adaptations are documented in `public/ATTRIBUTION.md`.
