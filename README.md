# M&J Video Games & Collectibles

Marketing site for **M&J Video Games & Collectibles** in Southington, Connecticut. It is a fast, static, single-page site with a retro arcade-cabinet visual system, real shop photography, store details, trade-in information, repairs, eBay consignment, charity auctions, a map, and a customer contact form.

## Project structure

```text
index.html            All page content, local business data, and structured data
assets/css/styles.css Design tokens, visual system, responsive layout, and components
assets/js/main.js     Navigation, store-hours status, gallery filter, and contact flow
assets/img/           Brand assets and shop photography
vercel.json           Static-host routing, caching, and security headers
```

## Store data to maintain

| Item | Current value | Where to update |
|---|---|---|
| Address | 847 Queen St, Unit 12, Southington, CT 06489 | `index.html`: visible Visit section, Google Maps links, and JSON-LD address |
| Phone | (860) 479-9223 | Search `index.html` for `860-479-9223` |
| Hours | 11:00 AM–7:00 PM, daily | `assets/js/main.js` `HOURS` array, the visible Visit-section fallback text, and JSON-LD hours |
| Contact inbox | rockytherockcat1@aol.com | `index.html` form action and mailto fallback; `assets/js/main.js` fallback address |
| Social and marketplace links | eBay, Facebook, Instagram | Search `index.html` for the relevant service URL |

> **Keep business data synchronized.** The site deliberately contains visible, structured-data, and operational fallbacks so it remains useful even when JavaScript is unavailable. When an address, phone number, hours, or inbox changes, update every location shown in the table.

## Editing site content

Product categories, trade-in content, repairs, consignment, charity auctions, gallery captions, and calls to action all live in `index.html`. Color and typography tokens are at the top of `assets/css/styles.css`. The photo-slot workflow is documented in [`assets/img/photos/README.md`](assets/img/photos/README.md).

The contact form posts to FormSubmit and shows a yellow fallback notice only when it opens the visitor’s mail application; this is **not** a confirmed message delivery. After a contact configuration change, submit one controlled test and confirm the recipient receives it before publishing.

## Local preview

Run any static server from the repository root, then open the shown local address in a browser.

```bash
python3 -m http.server 8000
```

## Deployment and final launch check

Deploy the repository root to a static host. The included Vercel configuration enables clean URLs, immutable caching for versioned local assets, and headers that permit only this site’s required fonts, map frame, and contact provider.

Before announcing a release, verify the official domain is attached to the intended deployment, test the contact form, review the address and hours, and test a shared link preview. The configured canonical and social URLs should be changed only after the final official domain is connected.
