# Shop photos

Every photo on the site lives in this folder. The page references each file
by its exact name in `index.html`; until a file exists, its slot shows a
labelled placeholder (the `<img>` has `onerror="this.remove()"`, so a missing
file just falls back to the placeholder).

## How images are referenced

- **Game Select tiles** (`#select` section) — category cards, displayed in a
  3-column grid. The hero image of each card.
- **Trade-In section** (`#howto`) — a strip of example trade-in photos
  (`.tradein-photos`), plus the `flyer-trade.jpg` and `flyer-bst.jpg` flyers.
- **About section** (`#about`) — the owners photo and the buy/sell/trade flyer.
- **Photo Mode gallery** (`#photos`) — the "Inside the Shop" grid.

All filenames use the `shop-N.jpg` pattern (N = 1–20). Photos are JPG,
landscape works best, ~1600px on the long edge is plenty.

## Current filename → slot map

### Game Select tiles (`#select`)

| File | Tile |
|---|---|
| `shop-10.jpg` | 01 — Retro & Modern Games (game-case wall) |
| `shop-14.jpg` | 02 — Consoles (boxed systems: Atari, Wii, PS, Commodore) |
| `shop-2.jpg`  | 03 — Funko Pops (the packed wall) |
| `shop-20.jpg` | 04 — Action Figures (KISS / boxed figures) |
| `shop-13.jpg` | 05 — Trading Cards (glass cases) |
| `shop-16.jpg` | 06 — Wrestling & Sports (WWE figures + sports cards) |

Attract-mode hero (title screen, looping): `shop-1` (aisle) → `shop-10` (games) → `shop-2` (Funko) → `shop-14` (consoles).

### Trade-In photos (`.tradein-photos`, in `#howto`)

| File | Slot |
|---|---|
| `shop-17.jpg` | Consoles / games wall |
| `shop-16.jpg` | Wrestling figures & sports cards |
| `shop-10.jpg` | The game-case wall |
| `shop-18.jpg` | Funko / figures wall |
| `shop-19.jpg` | Sports memorabilia wall |
| `shop-20.jpg` | Boxed figures |

### Photo Mode gallery (`#photos`)

| File | Frame |
|---|---|
| `shop-1.jpg`  | 01 — The Aisle |
| `shop-2.jpg`  | 02 — Funko Wall |
| `shop-3.jpg`  | 03 — Funko Racks |
| `shop-14.jpg` | 04 — Consoles |
| `shop-13.jpg` | 05 — Card Case |
| `shop-12.jpg` | 06 — Game Aisle |
| `shop-7.jpg`  | 07 — Comics |
| `shop-8.jpg`  | 08 — The Counter |
| `shop-19.jpg` | 09 — Sports Wall |
| `shop-4.jpg`  | 10 — The Floor |
| `shop-5.jpg`  | 11 — The Aisles |
| `shop-6.jpg`  | 12 — New Arrivals |

### Other photos

| File | Where |
|---|---|
| `about-owners.jpg` | About section — the owners |
| `flyer-bst.jpg`    | About section — buy/sell/trade flyer |
| `flyer-trade.jpg`  | Trade-In section — trade-in flyer |

## Unused / spare files

These exist in the folder but are not currently referenced by the page
(kept as spares or from earlier layouts):

- `shop-4.jpg`, `shop-5.jpg`, `shop-6.jpg`

> `shop-21.jpg` was removed — it was a byte-identical duplicate of
> `shop-13.jpg` (Card Case) and appeared as a redundant gallery tile.

## Swapping a photo

Replace the file **in place** (same filename) — the page picks it up on the
next deploy. To force browsers to fetch the new version, bump the `?v=N`
query string on that `<img>`'s `src` in `index.html` (the `?v=` param is the
cache-bust key; `vercel.json` caches `/assets/*` for a year).

When you add a brand-new photo, give it the next free `shop-N.jpg` number and
add a matching `<figure>` in the relevant section of `index.html`.

## Image loading notes

- Gallery/trade-in images use `loading="lazy"` so they don't block initial paint.
- The Game Select hero tile images and the logo load eagerly (above the fold).
- All `/assets/*` responses are sent with a long-lived immutable cache header
  (see `vercel.json`); always bump `?v=` when replacing a file.
