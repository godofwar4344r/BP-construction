# एक सवाल · Ek Sawal

**Ask in your own words, in your own language. Get the four things that matter:
which documents, what it costs, how many days, where to go.**

No login. No department tree. No fake receipts.

```bash
node server.js
```

Then open <http://localhost:8090>. Node 18+, zero dependencies, no build step.

| | |
|---|---|
| Citizen page | <http://localhost:8090> |
| Self-test (61 checks) | <http://localhost:8090/test.html> |
| Deploy live | [DEPLOY-VERCEL.md](DEPLOY-VERCEL.md) |
| Data export | `data/services.json` |
| Full handover doc | [HANDOVER.md](HANDOVER.md) |
| Deployment | [DEPLOY.md](DEPLOY.md) |

---

## Try these

Type or speak any of these — they are the cases that broke the previous build:

| Say this | What happens |
|---|---|
| `मेरे पिताजी 70 वर्ष के हैं` | Old age pension. A rule reads the *number*, so 70 works, not only 65. |
| `मेरि नौनी की पढ़ै कु मदद चयेणि च` | Garhwali → Nanda Gaura scheme, ₹51,000 |
| `बौज्यू सयाण छन पेंशन चैंछ` | Kumaoni → old age pension |
| `I want ration card` | Ration card — **not** Driving Licence |
| `pension` | Asks which of the three, rather than guessing |
| `status of my application` | Asks for an ID. Never shows a stranger's record. |

---

## Four languages live

| Tier | Languages | Interface | Content | Voice |
|---|---|---|---|---|
| **full** | Hindi, English | ✓ | ✓ | native model |
| **spoken** | Garhwali, Kumaoni | ✓ | Hindi | Hindi model + 97 regional words |

Punjabi, Urdu, Bengali and Nepali are **parked** — their translations are written
and kept in `assets/i18n.js`, but `live: false` until a native speaker signs each
one off. Unreviewed text should not reach citizens in a government service.
Turning one back on is that single flag; nothing else in the codebase changes.

**No ASR model exists for Garhwali or Kumaoni** — not from Google, not from
Bhashini. So their speech runs through the Hindi model, and `assets/regional.js`
teaches the matcher the words that actually differ:

| Hindi | Garhwali | Kumaoni | |
|---|---|---|---|
| बेटी | नौनी | चेली | daughter |
| पिता | बुबा | बौज्यू | father |
| बूढ़ा | स्याणु | सयाण | elderly |
| सड़क | बाटु | बाट | road |

Without those words, *"मेरि नौनी की पढ़ै कु मदद चयेणि च"* scores zero. With them
it lands on the right scheme.

---

## It does the job — it does not hand you off

The earlier build ended with "now go to the official portal". This one does not.
Press **यहीं आवेदन कीजिए / Apply right here** on any answer and the whole thing
happens in five steps, without leaving the page:

| Step | What happens |
|---|---|
| **1 · DigiLocker** | Connect once. The documents the state already holds fill the form. |
| **2 · Your details** | Only what is left. Validated. 🎙️ on every field to speak it. |
| **3 · Documents** | Ticked automatically from the locker; the rest listed to carry. |
| **4 · Visit** | Pick the day and time for the in-person step. No queue. |
| **5 · Check** | Everything on one screen, then saved with a reference and a timeline. |

**Across all 28 services: 279 form fields, 202 filled automatically — 72% of the
typing gone.** Old Age Pension drops from 12 fields to 3.

What the government already knows, it should not ask you twice.

### The honesty line

Nothing is filed with any government office. Every reference begins `DEMO-`,
the review screen says so, the receipt says so, and the print sheet repeats it.
The DigiLocker vault holds one fictional citizen — no real Aadhaar or account
number exists anywhere in this code.

That distinction is the whole reason the earlier build failed its audit: it
printed "✅ SUBMITTED" over a random number, and a citizen would have waited out
the fifteen-day statutory clock on an application that never existed. The full
journey is worth demonstrating. The lie is not.

---

## Where the language model goes

The brain is not wired up yet, and the demo is explicit about that. Every answer
carries a **reasoning strip** showing what was understood — `70 वर्ष · बुज़ुर्ग ·
समाज कल्याण विभाग` — before the answer itself.

Today those reasons come from a deterministic matcher: an age rule fired, a
keyword hit, confidence was low. Put a model behind `Match.match()` and the same
strip carries its reasoning instead. Nothing else in the interface changes.

That is the integration point, and it is one function wide. It is also why the
matcher is deterministic today: for a government service, an answer you can
trace to a line in a table is worth more than one that is merely fluent — and a
model should be added on top of that floor, not instead of it.

---

## Why it exists

Measured live on 16 August 2026 with the browser Performance API:

| | uk.gov.in | eservices.uk.gov.in | **Ek Sawal** |
|---|---|---|---|
| Page weight (gzipped) | 5.8 MB | **23.3 MB** | **61 KB** |
| Requests | 77 | 128 | **6** |
| Load complete | 16.0 s | — | **0.08 s** |
| Largest single file | 1.7 MB image | **17.8 MB GIF** | 62 KB of text |
| Search box | none | none | **the whole page** |
| Login before info | no | **yes** | no |
| `<h1>` headings | **0** | 2 | 1 |

The state's own service portal ships a **17.8 MB animated GIF** before a citizen
reaches the login form — about five minutes and ₹0.20 of a prepaid pack on rural
3G, spent on decoration. That one file is bigger than the entire uk.gov.in
homepage.

---

## Design rules, and the defect each one closes

Every rule traces to a defect found in the audit of the earlier prototype.
All of them are regression-tested in `/test.html`.

| Rule | Closes |
|---|---|
| All user text through `esc()` before `innerHTML` | Reflected XSS via `?q=` |
| Strict CSP: no inline script, no inline style, no external host | the whole XSS class |
| Never print the word "submitted" | Fake acknowledgement slips |
| Tracking needs a well-formed ID; no ID, no record | Returning a stranger's application |
| Word-boundary matching, not `String.includes` | "ration **car**d" → Driving Licence |
| Confidence floor: below it, ask | Confident wrong answers |
| Rules read the *number* in "father is 70" | Trigger hardcoded to `father is 65` |
| Spoken digits parsed and validated | Aadhaar stored as `"four seven two eight"` |
| Every tap target ≥ 44 px | 22 px accessibility buttons |
| Voice optional everywhere | Firefox users got an `alert()` |
| Hindi is the default; `lang`/`dir` correct per language | Hindi content served as `lang="en"` |
| Permanent "not a government site" band | Emblem + fake receipt = phishing |

---

## Layout

```
index.html               citizen page
test.html                57 checks, run in the browser
sw.js                    offline cache (stale-while-revalidate)
manifest.webmanifest     installable to a home screen
server.js                static host + security headers

assets/
  i18n.js       8 languages · all interface strings · tier metadata
  kb.js         28 services · documents · fees · SLAs · appeal officers
  regional.js   97 Garhwali + Kumaoni words across 14 services
  match.js      tokeniser · scorer · rules · spoken-number validators
  app.js        rendering · voice · checklist
  style.css     tokens · light + dark themes · print sheet

data/services.json       generated export for other systems
tools/export-json.js     generator (npm run export)
```

No framework. No npm dependencies. No webfonts. No analytics. No cookies.
No third-party host of any kind — the CSP forbids it.

---

## Data honesty

Every service record carries a `src` field:

- **`portal`** (15 services) — verified present on eservices.uk.gov.in on
  16 Aug 2026; fee and SLA from the department's RTS notification
- **`known`** (13 services) — publicly published figures. The interface shows an
  amber band telling the citizen to confirm on 1905 before applying.

Nothing is presented as certain that has not been checked. A wrong fee costs
somebody a bus fare and a day of wages.

---

## What is deliberately not here

- **No submission.** The state owns the transaction. This ends with a printed
  checklist and a deep link. A fake receipt is worse than no tool — the citizen
  waits out the statutory clock on an application that was never filed.
- **No accounts.** Information the state gives free should never sit behind a
  password.
- **No analytics, no third-party scripts, no cookies.**
- **No AI model.** The matcher is deterministic and inspectable. For a
  government service, an answer traceable to a line in a table beats one that is
  merely fluent.

---

## Status

Working prototype, offered to ITDA Uttarakhand for evaluation under the MIT
licence. Not deployed. Not an official government service — a band saying so is
shown at all times and the state emblem is deliberately absent.

Known limitations are listed honestly in [HANDOVER.md §11](HANDOVER.md).
The most important: 13 of 28 services carry unconfirmed figures,
and **this has not yet been tested with real citizens.**
