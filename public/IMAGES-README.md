# Image assets — where each file goes

Save the files you sent me at exactly these paths and filenames. Every one is
already referenced in code, so the site picks them up on the next reload with
no further changes.

## Brand

| Save as | Which image | Notes |
| --- | --- | --- |
| `public/brand/yadims-logo.png` | The full circular logo — wordmark, needle, "The Art Of Fine Fabrics" | Keep the transparent background |
| `public/brand/yadims-mark.png` | The small green circle with the needle-and-thread only | Square crop, transparent or green background |
| `src/app/icon.png` | Same needle-and-thread mark | **512×512 square.** Next turns this into the browser favicon automatically |
| `src/app/apple-icon.png` | Same mark | 180×180. Optional — for iOS home-screen bookmarks |

## Shop photography

| Save as | Which image |
| --- | --- |
| `public/shop/bolt-wall.jpg` | Cube shelving — pinks, purples, brocades and metallic jacquards |
| `public/shop/lace-shelves.jpg` | The lace corner — sequin, beaded and embroidered lace on shelves |
| `public/shop/mannequin-drape.jpg` | Mannequin draped in black embroidered lace, measuring tape alongside |
| `public/shop/display-wall.jpg` | Wider shelving view with packaged lengths in front |

### Before you save

Resize the four photos to **1600px on the long edge** and export as JPEG at
around 80% quality. They arrive from a phone at several megabytes each; at
1600px they land around 300–400KB and look identical on screen. Next.js
converts them to AVIF/WebP and generates responsive sizes from there.

## Where each one appears

- **bolt-wall** — Services page banner, About page banner and story, gallery, Instagram grid
- **lace-shelves** — Home hero background, sign-in page, collections banner, gallery
- **mannequin-drape** — Home hero floating card, gallery, About
- **display-wall** — Contact banner (site-wide footer CTA), About story, gallery

All four also stand in as product imagery until individual fabrics are
photographed — see the note in `src/data/catalogue.ts`.

## Adding real product photos later

Open `src/data/catalogue.ts`, find the `IMAGES` map at the top, and replace a
value with a path to the new photograph:

```ts
const IMAGES = {
  lace1: "/products/alencon-corded-lace.jpg",   // was shopPhotos.laceShelves
  ...
};
```

Drop the file in `public/products/`. Nothing else changes.
