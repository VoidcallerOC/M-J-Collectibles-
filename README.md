# M&J Video Games & Collectibles

Marketing site for **M&J Video Games & Collectibles** — Southington, CT's home for
retro & modern video games, consoles, Funko Pops, action figures, trading cards,
and vintage wrestling & sports memorabilia. *For all your retro-gaming and
memorabilia needs.*

A fast, static, single-page site — built to look distinct from a card shop, with
a warm retro-collector look and an arcade-styled hero.

## Structure

```
index.html            All page content & sections
assets/css/styles.css Design system + layout
assets/js/main.js     Nav, scroll reveals, live "open now" hours, hero effects
assets/img/           Brand marks (favicon.svg, mark.svg)
vercel.json           Static hosting config (clean URLs, asset caching)
```

## Store details (single source of truth)

| | |
|---|---|
| **Address** | 847 Queen St, Southington, CT 06489 |
| **Phone** | (860) 479-9223 |
| **Hours** | 11:00 AM – 7:00 PM, every day (Mon–Sun) |
| **eBay** | https://www.ebay.com/str/mjvideogamesct1 |
| **Facebook** | https://www.facebook.com/MJVideoGamesandSportsCollectibles |

## Editing common things

- **Hours** — edit the `HOURS` array near the top of `assets/js/main.js` *and* the
  matching `<li>` rows in the Visit section of `index.html`. The "Open now / Closed"
  badge is computed live from `HOURS`.
- **What we carry** — edit the `.cat` cards in the `#carry` section of `index.html`.
- **Phone / address** — search `index.html` for `860-479-9223` and `847 Queen St`
  (they also appear in the structured-data block in `<head>`).
- **Contact form** — the **Contact Us** section (`#contact`) ships a terminal-styled
  form. The site is static (no backend), so `assets/js/main.js` composes a pre-filled
  `mailto:` to the shop address in the `CONTACT_EMAIL` constant at the top of the
  contact-form handler. Set the shop email there to enable email delivery; if left
  empty, the form status line routes visitors to call/text or Facebook Messenger.
- **Colors / fonts** — all design tokens live in `:root` at the top of
  `assets/css/styles.css`.

## Local preview

Any static server works, e.g.:

```
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy

Static site — deploy the repo root to any static host (Vercel, Netlify, etc.).
`vercel.json` enables clean URLs and long-cache headers on `/assets/*`.
