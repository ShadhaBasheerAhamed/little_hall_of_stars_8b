# The Little Hall of Stars — Class 8B

## Publish it (no coding needed)
1. Build with your own teacher passcode:  `ADMIN_PASSCODE="your-secret" node build.mjs`
2. Upload everything inside the `dist/` folder to any static host (Netlify Drop, GitHub Pages, Cloudflare Pages…).
3. Open `https://your-site/#/admin`, sign in, go to **QR cards**, type your real site address, and print.

### Deploy with Netlify
- Import this GitHub repository in Netlify. The included `netlify.toml` builds with `npm run build` and publishes `dist/`.
- In Netlify's site environment variables, set `ADMIN_PASSCODE` before the first deploy to replace the default teacher passcode.
- After deploy, open your live URL followed by `#/admin`, sign in, and go to **QR cards**. The live address is prefilled; print or download the cards so their QR codes open the deployed site.

Students open the site (or scan their QR card) and type their 3-digit PIN. Teacher desk: `#/admin`.

## Editing content
- Teacher desk → Edit student → Save. Edits live on the device you used.
- To publish edits for everyone: **Save my edits** (downloads overrides.json) → put it in `src/data/` → rebuild → re-upload.

## Commands
`node build.mjs` build · `node build.mjs --serve` local preview · `node scripts/validate-data.mjs` check all 29 students

## Important
PINs and content ship inside the page, so this is a gift-grade lock, not strong security. For real privacy later, move PIN checks and content to a backend.

## Children's Day AR flower gift (add-on)
- Each student's gift page: `https://your-site/#/gift/<slug>` (e.g. `#/gift/aarya`, `#/gift/sri-sharini-selvan`). No PIN needed.
- Teacher desk → **AR gifts**: type your real https address, then download QR/card PNGs, ZIP everything, or print all cards (A4, 4 per page; choose "Save as PDF" for one PDF).
- Student names, slugs and the wishes live in `src/data/gifts.js`. The 3D bouquet is `public/models/bouquet.glb` (made by `python3 scripts/make-bouquet.py`; swap in any other .glb with the same name).
- AR uses Google model-viewer (loaded from a CDN, free). AR only works on a phone over **https**: Chrome on Android (ARCore) and Safari on iPhone. Anywhere else the bouquet can still be rotated in 3D, and if the viewer can't load a still bouquet is shown.
