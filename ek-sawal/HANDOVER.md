# Ek Sawal — technical handover

**For:** Information Technology Development Agency (ITDA), Government of Uttarakhand
**From:** an unsolicited prototype, offered for evaluation
**Date:** 18 August 2026
**Status:** working prototype · not deployed · not an official government service

---

## 1. What this is, in one paragraph

A citizen asks a question in their own words, in their own language — by voice or
by typing — and gets four things back: **which documents to carry, what it costs,
how many working days it should take, and where to go.** There is no login, no
department tree, and no account. It ends by handing the citizen to the official
portal. It never submits anything and never issues a receipt.

It is a **front door**, not a replacement for e-District. The state keeps the
transaction. This only fixes the part that is currently broken: finding out what
you need before you set out.

---

## 2. Why we built it

Two measurements taken live on 16 August 2026, using the browser's own
Performance API. Both are reproducible in five minutes.

| | uk.gov.in | eservices.uk.gov.in | Ek Sawal |
|---|---|---|---|
| Page weight (gzipped) | 5.8 MB | **23.3 MB** | **42 KB** |
| Requests | 77 | 128 | 6 |
| Time to full load | 16.0 s | — | 0.08 s |
| Largest single file | 1.7 MB image | **17.8 MB GIF** | 62 KB of text |
| Search box | none | none | the whole page |
| Login before information | no | **yes** | no |
| `<h1>` headings | **0** | 2 | 1 |
| `lang` attribute vs content | ok | **`en` on Hindi content** | correct per language |

The single most consequential finding: **`eservices.uk.gov.in` loads a 17.8 MB
animated GIF** (`/media/images/monal.gif`) before a citizen reaches the login
form. On a rural 3G connection that is roughly five minutes of waiting and about
₹0.20 of a prepaid pack — spent on decoration, before any information is given.
That one file is larger than the entire uk.gov.in homepage.

Neither portal has a search box. Both require the citizen to know which
department owns their problem before they can begin — which is precisely the
knowledge they do not have.

---

## 3. Languages — please read this section carefully

This is the part most likely to be misunderstood in a demo, so it is stated
plainly. Support is in **three tiers** and the interface labels them.

| Tier | Languages | Interface | Service content | Voice input | Status |
|---|---|---|---|---|---|
| **1 — full** | Hindi, English | complete | complete | native model | **live** |
| **2 — spoken** | Garhwali, Kumaoni | complete | shown in Hindi | **Hindi model + regional vocabulary** | **live** |
| **3 — draft** | Punjabi, Urdu, Bengali, Nepali | translated, unreviewed | shown in Hindi | native model | **parked** |

Tier 3 is written and retained in `assets/i18n.js` but carries `live: false`, so
it does not appear in the language picker and cannot be selected even via a
saved preference or a `?lang=` link. Unreviewed text should not reach citizens
in a government service. When a native speaker signs a language off, flip that
one flag — nothing else changes.

### The Garhwali and Kumaoni problem, and how it is solved

**No speech-recognition model exists for Garhwali or Kumaoni** — not from
Google, not from Bhashini, not from anyone. This is a real constraint and no
amount of engineering removes it.

What we do instead: a Garhwali speaker's voice goes through the **Hindi** model,
which transcribes the sounds roughly as Devanagari. That mostly works, because
the vocabularies overlap heavily. What breaks is the handful of high-frequency
words that differ — and those are exactly the words describing the situation:

| Hindi | Garhwali | Kumaoni | meaning |
|---|---|---|---|
| बेटी | नौनी | चेली | daughter |
| माता | ब्वे | ईजा | mother |
| पिता | बुबा | बौज्यू | father |
| बूढ़ा | स्याणु | सयाण | elderly |
| सड़क | बाटु | बाट | road |

`assets/regional.js` adds **97 such words** across 14 services. With them,
*"मेरि नौनी की पढ़ै कु मदद चयेणि च"* correctly reaches the Nanda Gaura scheme.
Without them it scores zero. This file is a plain list — extending it is a
one-line edit and requires no other change.

> **Action needed from ITDA:** the Garhwali and Kumaoni spellings in
> `assets/regional.js` and `assets/i18n.js` are the common Devanagari
> renderings. These two ARE live, so a native speaker on staff should correct
> them before any public launch. The four parked languages need a reviewer each
> before they can be switched on.

If Bhashini later ships Garhwali or Kumaoni ASR, changing `asr: 'hi-IN'` to the
new code in `assets/i18n.js` is the entire migration.

---

## 4. Running it

Requires Node 18 or newer. No dependencies, no build step, no database.

```bash
node server.js
```

Then open <http://localhost:8090>. Two other pages:

- `/test.html` — 61 automated checks, run in the browser against the shipped files
- `data/services.json` — the knowledge base as plain JSON for your own systems

To regenerate the JSON after editing the knowledge base:

```bash
npm run export
```

---

## 5. File map

```
index.html               the citizen-facing page
test.html                self-test — open it, read the green
manifest.webmanifest     installable to a phone home screen
sw.js                    offline cache (stale-while-revalidate)
server.js                static host + security headers

assets/
  i18n.js                8 languages, all interface strings, tier metadata
  kb.js                  28 services: docs, fees, SLAs, appeal officers
  regional.js            Garhwali + Kumaoni vocabulary (97 words)
  match.js               tokeniser, scorer, rules, spoken-number validators
  app.js                 rendering, voice, checklist
  style.css              design tokens, both themes, print sheet
  test.js / test.css     the self-test

data/services.json       generated export — do not hand-edit
tools/export-json.js     generator
```

Roughly 3,200 lines total. No framework, no npm dependencies, no webfonts, no
analytics, no cookies, no third-party host of any kind.

---

## 6. How to change the things you will want to change

**A fee or an SLA changed.** Edit that service in `assets/kb.js` — the `fee` and
`days` fields. Set `src: 'portal'` once the department has confirmed it. Run
`npm run export`. Bump `CACHE` in `sw.js` so existing phones pick it up.

**Add a service.** Copy any block in `assets/kb.js`. The required fields are
enforced by the self-test — add the service, open `/test.html`, and it will tell
you what is missing.

**Add a language.** Add one object to `LANGS` and one string table in
`assets/i18n.js`. No other file changes. Missing keys fall back to Hindi, so a
partial translation is safe to ship.

**Add regional words.** One line in `assets/regional.js`.

**The knowledge base is the product.** The code is small and finished; the data
is what needs departmental ownership. Our recommendation is that each
department signs off its own rows once, then owns them.

---

## 7. Security posture

The previous iteration of this prototype was audited and four critical defects
were found and fixed. They are now regression-tested in `/test.html`.

| Control | Where |
|---|---|
| All user text escaped before `innerHTML` | `app.js` `esc()`, used on every interpolation |
| Content-Security-Policy: no inline script, no inline style, no external host | `server.js` |
| `form-action 'none'`, `base-uri 'none'`, `frame-ancestors 'none'` | `server.js` |
| `X-Content-Type-Options: nosniff`, `Referrer-Policy: same-origin` | `server.js` |
| Directory traversal guard | `server.js` `serveStatic` |
| No user data collected, stored or transmitted — anywhere | by design |
| No cookies, no analytics, no third-party requests | by design |

The CSP is strict enough that it blocked our own inline animation styles during
development; we moved those into classes rather than weaken it. **Please do not
add `'unsafe-inline'`** — that single change would reopen the defect class the
audit found.

**Deliberate limitation:** there is no submission and no status lookup. When
asked for an application status, the tool validates the ID format and then says
it cannot read the government database — rather than inventing a plausible
answer. The previous build returned one hardcoded citizen's record to every
query containing the word "status". We would rather say "I don't know".

---

## 8. Accessibility

Built to the floor set by GIGW and WCAG 2.1 AA, and verified rather than
claimed:

- Every tap target ≥ 44 px, measured at a 375 px viewport
- Base type 19 px, scalable to 27 px, choice persisted
- Body contrast 8.7:1 light / 10.9:1 dark; smallest label 5.5:1
- One `<h1>`, correct heading order, skip link, visible focus rings
- `lang` and `dir` set correctly per language, including RTL for Urdu
- All motion disabled under `prefers-reduced-motion`
- **Voice is never required** — every path works with keyboard and screen reader
- Works with no microphone, and on browsers with no speech support at all

---

## 8b. The end-to-end journey, and where the model goes

Pressing **Apply right here** on any answer opens a five-step flow that never
leaves the page: DigiLocker → details → documents → visit → review. Across all
28 services that is **279 form fields, of which 202 fill themselves — 72% of the
typing removed.** Old Age Pension goes from 12 fields to 3.

`assets/digilocker.js` is a local simulation shaped like the real OAuth flow
(disconnected → consent → connected → pulled) against one fictional citizen.
Swapping in the live API is a change to `connect()` and nothing else. Full
Aadhaar and account numbers are never returned to the interface — the module
hands back a masked value for display and the real value only into the field the
citizen is submitting.

Every answer also carries a **reasoning strip** showing what was understood
before the answer appears. Today those reasons come from the deterministic
matcher. Put a language model behind `Match.match()` and the same strip carries
its reasoning instead — that is the integration point, and it is one function
wide. Keeping the rules underneath matters: a citizen and an auditor can both
trace an answer to a line in a table, which a model alone cannot offer.

**Nothing is filed anywhere.** Every reference begins `DEMO-`, and the review
screen, the receipt and the print sheet all say so.

---

## 9. What we deliberately did not build

- **No real submission.** The full journey is demonstrated end to end, but
  nothing reaches a government system: there is no such API to call yet. A fake
  acknowledgement slip is worse for a citizen than no tool at all — they would
  wait out the statutory clock on an application that was never filed. Wiring
  the last step to e-District is item 3 below.
- **No accounts.** Information the state gives everyone for free must never sit
  behind a password.
- **No analytics or tracking.** Nothing about a citizen leaves their phone.
- **No AI model.** The matcher is deterministic, inspectable and testable. For
  a government service, an answer you can trace to a line of a table is worth
  more than one that is merely fluent.

---

## 10. If ITDA wants to take this forward

Roughly in order of value:

1. **Departmental sign-off on the data.** 13 of 28 services carry figures marked
   "confirm before use". Each department confirms its own rows once; we flip
   `src` to `portal`. This is the highest-value and lowest-effort step.
2. **Native review.** Garhwali and Kumaoni first — they are live. Then the four
   parked languages, roughly 40 strings each, to switch them on.
3. **Read-only status API from e-District.** Then tracking answers instead of
   handing over. One endpoint: application ID in, stage and date out.
4. **Fix the 17.8 MB GIF** on eservices.uk.gov.in. Independent of this project,
   and the single highest-impact change available anywhere on the state's web
   estate. Re-encoded as muted MP4 it lands under 400 KB — a 97% reduction.
5. **Add a search box to uk.gov.in.** Also independent of this project.
6. **Field test.** 20 citizens over 50 and 20 under 15, in Pithoragarh and in
   Dehradun, in Garhwali and Kumaoni as well as Hindi. Watch where they stop.
7. **1905 integration.** The same knowledge base could answer the most common
   helpline calls as an IVR tree — `data/services.json` is already the right
   shape for it.

---

## 11. Honest limitations

- **13 of 28 services carry unconfirmed fees or SLAs.** They are marked in the
  data and warned about in the interface. Not a single figure is presented as
  certain when it is not.
- **Four languages are parked** pending native review, not shipped.
- **Voice recognition requires Chrome, Edge or Safari** and an internet
  connection — it is a browser capability, not ours. Every path works without
  it; the page says so rather than failing silently.
- **28 services is not all of them.** eservices.uk.gov.in lists 60+ departments.
  We covered the highest-volume citizen services and the ones people phone 1905
  about. The structure scales; the data entry is the work.
- **This has not been tested with real citizens.** Everything above is measured
  or reasoned, not observed in the field. Point 6 exists for that reason.
- **The state emblem is deliberately absent** and a "proposed prototype" band is
  shown at all times. If ITDA adopts this, the branding is yours to apply; until
  then, presenting it as official would be misleading.

---

## 12. Licence and contact

Offered to the Government of Uttarakhand under the MIT licence (see `LICENSE`) —
free to use, modify, deploy and re-badge, with no obligation to the author and
no warranty. If it is useful, use it. If it is not, the measurements in section 2
are still worth acting on.
