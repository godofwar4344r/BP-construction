# Architecture

## Principle

The citizen states an intent. The system does the clerical work.

Everything below follows from that one sentence. The form is an output, not an
input. Documents are fetched, not uploaded. The department is an implementation
detail the citizen never has to learn.

---

## Stack, and why it is deliberately boring

Vanilla HTML, CSS and ES5-compatible JavaScript. No framework, no build step,
no `node_modules` in the front end.

This is a considered choice, not laziness:

- **It runs anywhere.** Double-click `index.html` and it works. NIC hosting,
  a CSC kiosk, an air-gapped review machine, a USB stick handed to a secretary.
- **It survives handover.** A government IT team inherits readable files, not a
  toolchain that rots in eighteen months.
- **It is auditable.** Every line an officer needs to review is in the file
  they open. No transpiled output, no minified bundle.
- **It is fast on the network that matters.** The whole app is under 200 KB.
  In Pithoragarh that is the difference between usable and abandoned.

The one Node file (`server/server.js`) exists for two reasons only: the
microphone requires a secure context, and API keys must not reach the browser.
It has zero dependencies.

---

## Layers

```
┌──────────────────────────────────────────────────────────────┐
│  PAGES        index · services · apply · track · locker      │
│               bilingual, keyboard-operable, theme-aware      │
└──────────────────────────────────────────────────────────────┘
                              │
┌──────────────────────────────────────────────────────────────┐
│  app.js       chrome, i18n rendering, service cards, toasts  │
└──────────────────────────────────────────────────────────────┘
                              │
┌──────────────────────────────────────────────────────────────┐
│  agent.js     DIALOGUE MANAGER — explicit state machine      │
│               idle → confirmSvc → fetching → field →         │
│               confirmField → review → done                   │
└──────────────────────────────────────────────────────────────┘
        │                     │                      │
┌───────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  nlu.js       │   │  voice-engine.js │   │  digilocker.js   │
│  intent +     │   │  STT / TTS with  │   │  document fetch  │
│  slot filling │   │  swappable       │   │  mock ⇄ live     │
│  offline      │   │  providers       │   │                  │
└───────────────┘   └──────────────────┘   └──────────────────┘
                              │
┌──────────────────────────────────────────────────────────────┐
│  store.js     catalogue, applications, prefs, strings        │
└──────────────────────────────────────────────────────────────┘
```

Each box is replaceable without touching the others. That is the whole design.

---

## The dialogue manager is a state machine, not an LLM

This is the decision that makes the system defensible in a government review.

| | Rule-based state machine (chosen) | LLM |
|---|---|---|
| Cost per application | ₹0 | ₹2–8 |
| Works offline / on 2G | Yes | No |
| Can invent a service that doesn't exist | **No** | Yes |
| Can be talked out of a validation rule | **No** | Yes |
| Auditable by an officer | Every branch is readable | Not really |
| Latency | ~0 ms | 500–2000 ms |
| Handles unusual phrasing | Adequately | Better |

The last row is the only one where the LLM wins, and it is the row that matters
least when the vocabulary is "आय प्रमाण पत्र" and "वृद्धावस्था पेंशन".

**The upgrade path is left open.** `NLU.parse()` returns
`{ intent, service, confidence }`. To add an LLM, call a server endpoint that
returns the same shape and use it only when the rule-based confidence is below
threshold — a hybrid that keeps the cost near zero and the audit trail intact.

### The states

| State | What it is doing | Exits on |
|---|---|---|
| `idle` | Waiting for a service to be named | Service matched, or a navigation intent |
| `confirmSvc` | "You want an income certificate, correct?" | yes → form, no → idle |
| `fetching` | Pulling DigiLocker documents | Fetch completes |
| `field` | Asking for one specific value | Value extracted |
| `confirmField` | Reading a number back | yes → next field, no → re-ask |
| `review` | Reading the summary back | yes → submit |
| `done` | Submitted, guarded against re-submission | — |

Three details that matter more than they look:

1. **Numbers are always read back.** Aadhaar, mobile and bank account go through
   `confirmField`. A wrong Aadhaar is the most expensive error in the flow, and
   speech recognition is least reliable on digit strings.
2. **"पीछे" works at any point.** Steps back one field and clears it.
3. **High-confidence matches skip the confirmation turn.** Saying
   "मुझे आय प्रमाण पत्र बनवाना है" scores 1.0 and goes straight to the form —
   one fewer turn for the phrasing people actually use.

---

## NLU without a model

`nlu.js` is roughly 400 lines and does five things:

**Normalisation.** Devanagari digits (`०-९`) → ASCII, punctuation stripped,
case folded. Everything downstream sees one representation.

**Intent matching.** Longest-phrase-wins over a keyword table. This is why
"आवेदन की स्थिति" resolves to `track` and not `apply`, even though "आवेदन"
appears in both.

**Service matching.** Three-tier scoring — exact keyword, substring, token
overlap, then capped Levenshtein for short utterances to catch ASR near-misses
(आए → आय). **Below 0.5 confidence it returns null and the agent asks rather than
guesses.** Saying "पेंशन चाहिए" offers the four pension schemes instead of
picking one.

**Value extraction**, typed per field:

| Type | Handles |
|---|---|
| `aadhaar` / `mobile` | `9876543210`, `९८७६५४३२१०`, `नौ आठ सात छह…`, `nine eight seven…`, `double 5` |
| `amount` | `पचास हजार` → 50000, `दो लाख पचास हजार` → 250000, `1,20,000`, `₹75000`, `fifty thousand` |
| `date` | `15/05/1985`, `1985-05-15`, `15 मई 1985`, `12 August 1990` |
| `choice` | Matches option lists in either script, with fuzzy tolerance |
| `year`, `text` | Filler-stripped (`मेरा नाम … है` → the name) |

**Yes / no / skip.** Both scripts, including `जी हाँ`, `नहीं जी`, `पता नहीं`.

All of it verified — see the test log in the README.

---

## Voice engine: one interface, three providers

Nothing in the app calls a speech API. It calls `Voice.listen()` and
`Voice.speak()`.

| Provider | Path | Use |
|---|---|---|
| `webspeech` | Browser `SpeechRecognition` + `speechSynthesis` | Demo. Free, no key. |
| `bhashini` | `MediaRecorder` → `POST /api/asr` → ULCA | Production. Government-owned, India-hosted. |
| `custom` | Same, any REST endpoint | Self-hosted IndicWhisper / Vosk. |

Switching is one line:

```js
Voice.init({ provider: 'bhashini', lang: 'hi' });
```

See [03-VOICE-APIS.md](03-VOICE-APIS.md) for the full comparison and why
Bhashini is the right production answer.

Three implementation details that make voice actually work:

- **`speak()` returns a promise** and the agent waits for it before listening
  again — otherwise the assistant transcribes itself.
- **`warmUp()` on first click.** Browsers block audio before a user gesture and
  Chrome loads its voice list asynchronously; without this the first utterance
  is silently swallowed.
- **A timeout guard on TTS.** Chrome sometimes never fires `onend` for long
  strings. Without the guard the conversation deadlocks.

---

## DigiLocker: the part that removes the most work

`digilocker.js` runs in `mock` mode and is written against the real API shape,
so going live is a mode flip plus credentials.

**Real integration** — the state registers as a DigiLocker **Requester**:

```
GET  /public/oauth2/1/authorize      consent screen (citizen approves, per document)
POST /public/oauth2/1/token          code → access token   [server-side only]
GET  /public/oauth2/1/files/issued   list issued documents
GET  /public/oauth2/1/xml/{uri}      machine-readable document
```

Also available via **API Setu** (`apisetu.gov.in`) for per-issuer pulls.

The flow: each service's `docs[]` carries a `digilocker` key naming the source
document type. `autoFill()` walks the list, fetches each, merges the extracted
fields, and reports progress per document so the UI ticks them off live.
Each form field's `prefill` maps a DigiLocker field onto it.

Measured on the domicile certificate: **6 of 9 fields prefilled, 3 questions asked.**

Documents split three ways, and the UI shows which is which:

| | |
|---|---|
| 🗂️ From DigiLocker | Fetched automatically. Citizen does nothing. |
| ⚙️ Generated | Self-declarations and application forms the portal fills from the answers given. |
| 📎 Upload | Genuinely cannot be automated — a photo, a Gram Pradhan's physical verification. |

That third column is what honest scoping looks like, and it is why the demo is
credible rather than a magic trick.

---

## Accessibility

Not a compliance checkbox — the target users are precisely the ones who need it.

- **Voice-first**, with typing as an equal alternative on the same code path.
- **Font scaling** A− / A / A+, persisted.
- **Three themes** including a WCAG-AAA high-contrast mode (`data-theme="contrast"`).
- **Space bar as push-to-talk**, for users who cannot target a button.
- **`aria-live` regions** for status, so screen readers announce state changes.
- **Visible focus rings**, never suppressed.
- **`prefers-reduced-motion`** honoured — the mic pulse is disabled.
- **Skip link** on every page.
- **Bilingual labels everywhere**, Hindi first.
- Prints cleanly — the acknowledgement is a real receipt.

---

## Data and privacy

Current state is browser-local: `localStorage` only, nothing leaves the machine.

For production, the positions that need to be written down before a line of
backend code is committed:

1. **Voice is transient.** Transcribe and discard. Never store audio.
2. **Never store a full Aadhaar number.** Last four digits, always. The mock
   profile already models this (`XXXX XXXX 4728`).
3. **Consent is per-document and revocable**, captured on DigiLocker's own
   screen, not ours.
4. **Audit every document access** — which officer, which document, when.
5. **Data stays in India.** This is what rules out the browser engine for
   production and rules in Bhashini.

---

## What is real and what is mocked

Being precise about this is what makes the demo trustworthy.

| Real | Mocked |
|---|---|
| 953 services / 87 departments — live API figures | Document contents (realistic, not genuine) |
| Fees, SLAs, RTS flags, document requirements — verbatim | Application submission (localStorage) |
| Speech recognition and synthesis — actually working | Status progression (time-based) |
| NLU, dialogue, form filling — actually working | Payment |
| Bilingual UI, accessibility, themes | DigiLocker OAuth (call shapes are real) |
| Acknowledgement number format | |

---

## Path to production

**Phase 1 — Pilot, one district, three services.** Income, domicile, caste in
Dehradun. Bhashini for speech. Real DigiLocker. Postgres behind the existing
Apuni Sarkar API. Measure completion rate against the current portal.

**Phase 2 — All 953 services.** The catalogue is already machine-readable, so
this is generating voice schemas, not writing 953 forms. The `voiceForm` array
can largely be derived from the existing `documents[]` and `officerFields[]`.

**Phase 3 — Reach.** WhatsApp bot on the existing helpline number
(+91 73022 54188 already on the portal). IVR on 1905 for feature phones —
the same dialogue manager, different transport. Assisted mode at CSC kiosks
with offline Vosk.

**Phase 4 — Language.** Garhwali and Kumaoni. Bhashini's roadmap covers this,
and in Uttarakhand it is the difference between a portal for Dehradun and a
portal for the state.
