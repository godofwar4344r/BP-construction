# rebuild-gov

**A voice-first rebuild of the Government of Uttarakhand citizen services portal.**

A citizen speaks — in Hindi or English — and the application fills itself.
Documents are pulled from DigiLocker instead of being uploaded. No login before
you start, no department to guess, no Devanagari typing.

Built on the real Apuni Sarkar catalogue: **953 services across 87 departments**,
with the actual fees, SLAs and document requirements.

---

## Run it

Needs Node 18+. From the `rebuild-gov` folder:

```bash
node server/server.js
```

Then open **http://localhost:8080** in **Chrome or Edge**.

> Firefox has no speech recognition. And open it over `http://localhost`, not by
> double-clicking the file — the microphone requires a secure context, and
> `file://` is not one.

No `npm install`. No dependencies. No build step.

---

## Try this first

Press the big microphone and say:

> **"मुझे आय प्रमाण पत्र बनवाना है"**

Then answer as it asks. Say the Aadhaar as digits — *"चार सात दो आठ…"*. Say the
income as *"पचास हजार"*. It handles both.

For the part that lands hardest: open **मेरे दस्तावेज़ → डिजिलॉकर जोड़ें** first,
then start a **स्थाई निवास प्रमाण पत्र**. Six of the nine fields fill themselves
before you are asked anything.

In English: *"I need an income certificate"* — switch language in the header.

---

## What's in here

```
rebuild-gov/
├── index.html              voice-first home — one big mic, not a login form
├── app/
│   ├── services.html       all 953 services, searchable by voice
│   ├── apply.html          the application workspace: live form + conversation
│   ├── track.html          five-stage status timeline, voice lookup
│   └── locker.html         DigiLocker: documents, consent, what it unlocks
├── assets/
│   ├── css/style.css       design system — 3 themes, font scaling, print
│   ├── js/
│   │   ├── voice-engine.js STT/TTS with swappable providers
│   │   ├── nlu.js          intent + slot filling, offline, no model
│   │   ├── agent.js        dialogue state machine
│   │   ├── digilocker.js   document fetch adapter (mock ⇄ live)
│   │   ├── store.js        catalogue, applications, i18n
│   │   └── app.js          shared chrome
│   └── data/services.json  catalogue — real fees, SLAs, document lists
├── server/server.js        static host + Bhashini proxy (zero dependencies)
└── docs/
    ├── 01-RESEARCH.md      audit of uk.gov.in and eservices.uk.gov.in
    ├── 02-ARCHITECTURE.md  how it works, and the path to production
    ├── 03-VOICE-APIS.md    free voice API providers ← read this one
    └── 04-PITCH.md         demo script + the questions they will ask
```

---

## Voice APIs

Full comparison in **[docs/03-VOICE-APIS.md](docs/03-VOICE-APIS.md)**. The short version:

| | Use | Cost |
|---|---|---|
| **Web Speech API** | What this demo runs on. Zero setup. | Free, unlimited |
| **Bhashini** (MeitY, Govt. of India) | **What to propose for production** | Free, 22 Indian languages, India-hosted |
| Groq / Sarvam / Deepgram | Good free tiers if Bhashini is unavailable | Free tier, then paid |
| IndicWhisper / Vosk / Piper | Self-hosted, offline, for CSC kiosks | Free forever |

Switching engines is one line — the app never calls a speech API directly:

```js
Voice.init({ provider: 'bhashini', lang: 'hi' });   // was 'webspeech'
```

The Bhashini ASR and TTS calls are already implemented in `server/server.js`.
Set `BHASHINI_USER_ID` and `BHASHINI_API_KEY` and it takes over.

---

## Verified working

Tested in-browser, driving the real UI:

- **Full Hindi conversation** — service identification → 10 fields → review → submit
- **Spoken digits** — `नौ आठ सात छह पांच चार तीन दो एक शून्य` → `9876543210`
- **Devanagari digits** — `९८७६५४३२१०` → `9876543210`
- **Spoken amounts** — `पचास हजार` → 50000 · `दो लाख पचास हजार` → 250000 · `1,20,000` → 120000
- **Dates** — `15/05/1985`, `15 मई 1985`, `12 August 1990` all parse
- **Correction flow** — reject a read-back number, say it again, accepted
- **"पीछे"** — steps back one field and clears it
- **Ambiguity** — `पेंशन चाहिए` offers the four pension schemes instead of guessing
- **DigiLocker autofill** — domicile certificate: 6 of 9 fields prefilled
- **English mode** — same journey, `I need an income certificate`
- **Double-submit guard** — voice "हाँ" plus the button files one application, not two

No console errors on any page.

---

## Honest scope

| Real | Mocked |
|---|---|
| 953 services / 87 departments — from the live API | DigiLocker documents (call shapes are real) |
| Fees, SLAs, RTS flags, document lists — verbatim | Submission (localStorage) |
| Speech recognition and synthesis | Status progression (time-based) |
| NLU, dialogue, form filling | Payment |
| Bilingual UI, 3 themes, accessibility | |

**7 services** have full voice forms. The other 946 are browsable and hand off to
the existing flow — extending them is schema work, not new engineering.

This is a prototype, not the official portal.

---

## Data sources

- https://eservices.uk.gov.in/api/service — the public catalogue endpoint, unauthenticated,
  returns all 953 services with documents, fees and SLAs. The key finding of the audit.
- https://uk.gov.in/ — portal structure, districts, department directory
- https://it.uk.gov.in/service/apuni-sarkar/ — programme background
