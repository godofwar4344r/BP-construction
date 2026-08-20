# BP Engineer's & Construction — Haldwani

Landing page for a design-and-build practice in Haldwani, Uttarakhand, built
around a scroll-scrubbed architectural frame sequence: a modern house
disassembles into an exploded component view as you scroll, then reassembles.

## Client details wired into the page

| | |
|---|---|
| WhatsApp / phone | `+91 63958 44412` — `WHATSAPP` const in `src/main.js`, plus `tel:`/`wa.me` links in `index.html` |
| Instagram | [@bpengineersandconstruction](https://www.instagram.com/bpengineersandconstruction/) |
| Brand colours | `--blue: #1450B4`, `--orange: #F59B1C` in `:root` (`src/style.css`) |
| Logo | `public/logo.png` (nav, favicon) and `public/logo-white.png` (dark preloader). Both are derived from the client's official `BP Engineer.png`, kept at `public/bp-logo-original.png` — the circular badge is cropped off, the artwork trimmed tight and the white background knocked out to transparency. Regenerate with `scratchpad/logo-prep.mjs` if the source changes. |

Copy is Hinglish throughout, matching the voice the client already uses on
Instagram. All of it lives in `index.html`.

The contact form has no backend — it composes the enquiry and opens WhatsApp,
which is where this client's leads actually arrive. See the `submit` handler in
`initChrome()` (`src/main.js`).

```bash
npm install
npm run dev
```

Build: `npm run build` → `dist/`. Preview the build: `npm run preview`.

No runtime dependencies. Vite is the only devDependency.

---

## The scroll theatre

One pinned section (`.theatre`, 760vh) drives everything. All timings are
fractions of that section's own scroll, defined once in `src/main.js`:

```js
const T = {
  camera:   0.105,          // hero framing → centred framing
  heroOut:  [0.012, 0.072],
  explode:  [0.050, 0.480], // frame 1 → 201
  hold:     [0.480, 0.560], // held open — the "4,180 components" beat
  assemble: [0.560, 0.928], // frame 201 → 1
};
```

Everything else keys off the same progress value `p` (0 → 1):

| Element | Driven by |
|---|---|
| Frame index | `frameAt(p)` — explode, hold, reassemble |
| Camera push/settle | `T.camera` — model yields the left third to the headline |
| Hero copy | `T.heroOut` — fades, drifts up, blurs out |
| Spec cards | `data-in` / `data-out` on each `.card` |
| Statement beats | `data-in` / `data-out` on each `.beat` |
| Build HUD | `PHASES` table + tick positions in the markup |

### Retiming a card

Each card carries its own window and vertical offset in the markup:

```html
<article class="card card--l" data-in="0.075" data-out="0.158" style="--y:-16%">
```

`card--l` / `card--r` sets the side. `--y` nudges it off centre. On portrait a
media query overrides `--y` so cards sit below the model instead of on top of it.

If you move a card window, update the matching entry in `PHASES` (`src/main.js`)
so the HUD never names a phase other than the one on screen.

---

## Swapping in your own sequence

1. Drop numbered frames into `public/construction/`.
2. Update `TOTAL_FRAMES` and `framePath()` at the top of `src/main.js`.

```js
const TOTAL_FRAMES = 201;
const framePath = (n) => `/construction/frame_${String(n).padStart(3, '0')}.jpg`;
```

The renderer (`src/lib/frame-sequence.js`) handles the rest:

- **Two-wave loading** — a strided skeleton pass (every 6th frame) gets the page
  interactive fast; the in-between frames fill in silently afterwards.
- **Nearest-loaded fallback** — a frame that hasn't arrived never blanks the stage.
- **Edge extension** — a 16:9 plate can't cover a tall phone screen without
  wrecking the composition, so it letterboxes; the plate's own top and bottom
  edge rows are stretched to fill the bands, which reads as one continuous
  surface instead of grey bars with a seam.
- **ResizeObserver** — a stage that is measured at zero (hidden tab, late layout)
  repaints as soon as it has real dimensions.

Frames are the whole payload: 201 × ~113 KB ≈ 22 MB. Fewer, or smaller, if you
need a faster first paint.

---

## Content you'll want to change

| What | Where |
|---|---|
| Brand name, nav, all copy | `index.html` |
| Project cards | `.works__grid` — `--pos` sets the crop, `--z` the zoom |
| Palette, type, rhythm | `:root` in `src/style.css` |
| Stat counters | `data-count`, `data-decimals`, `data-suffix` |

The contact form is presentational — wire up the `submit` handler in
`initChrome()` (`src/main.js`) to a real endpoint.

---

## Notes

- Smooth scroll drives the real window scroll position rather than transforming
  a wrapper, so `position: sticky`, anchors and the hash all behave normally. It
  opts out on touch and on `prefers-reduced-motion`.
- `prefers-reduced-motion` disables the grain, the custom cursor, magnetics,
  split-text and the smooth scroll; the sequence still scrubs.
- `?__pin=` is a dev-only capture hook that pins the page at a scroll position
  and settles every entrance animation, for headless screenshots
  (`?__pin=t0.29` = fraction of the theatre, `?__pin=0.42` = fraction of the
  document, `?__pin=3200` = pixels). It is compiled out of production builds.
  A normal visit always starts at the top.

The previous waffle experiment in this folder is preserved under `archive/`.
