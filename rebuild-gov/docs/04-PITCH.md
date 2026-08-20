# Pitch notes — presenting this to the government

A demo script and the answers to the questions that will be asked.
Structured for a 15-minute slot with a Secretary / ITDA Director.

---

## The one sentence

> Uttarakhand already has 953 services online. This makes them usable by the
> people who currently cannot use them — by letting a citizen speak instead
> of type, and by fetching the documents the state has already issued.

Note what that sentence does **not** say. It does not say the current portal is
bad. It says the last mile is missing. Never open by attacking Apuni Sarkar —
the person across the table probably built it.

---

## The problem, in their language

Apuni Sarkar works well for a citizen who:

- knows that a family register copy is a *Panchayati Raj* service, not *Revenue*
- can type in Devanagari
- owns a scanner or can photograph eight documents legibly
- has an email address and can complete a CAPTCHA
- can navigate 953 services grouped by 87 departments

In Uttarakhand, the citizen who most needs a pension, a caste certificate or a
family register copy is frequently none of those things. The portal is not
failing them at the last step. It is failing them at the first.

**So they go to a CSC and pay an agent ₹100–300 for a ₹40 service.** That is
the actual current state, and everyone in the room knows it.

---

## The 3-minute demo

Run it live. Chrome or Edge, `http://localhost:8080`. Microphone on.

**1. Open the home page.** One large microphone. Not a login form.
> "This is the whole interface. There is nothing to read."

**2. Press the mic and say, in Hindi:**
> **"मुझे आय प्रमाण पत्र बनवाना है"**

It replies in Hindi and starts the form. Point out: nobody chose a department.
The citizen did not need to know income certificate is Revenue Department, ES09.

**3. Let it ask, and answer naturally.**
- Say the Aadhaar number as digits: *"चार सात दो आठ…"* → it fills correctly and
  **reads it back for confirmation**.
- Say the income as *"पचास हजार"* → **₹50,000**. Not "50000". The way people speak.
- Say *"खेती"* for source of income → matched to the correct option.

**4. The part that lands hardest.** Go back and connect DigiLocker first, then
restart with the domicile certificate. Documents tick off one by one on screen,
and the form is **6 of 9 fields already filled** before a single question is asked.
> "Aadhaar, khatauni, marksheet, ration card, voter ID. The state issued all of
> these. It should not be asking the citizen to bring them back."

**5. Submit.** A real acknowledgement number in the department's own format,
`ES09/2026/DEH/100125`, with the ₹40 fee and 15-day Right-to-Service SLA shown.

**6. Say "मेरे आवेदन की स्थिति क्या है"** → tracking page, five-stage timeline
matching the real workflow.

**Total elapsed: about two minutes.** Then say the number out loud:

> "On the current portal this same application is eight steps, a login, and
> eight uploaded documents."

---

## The slide that wins the meeting

| | Today | With this |
|---|---|---|
| Steps to apply | 8 | 1 (speak) |
| Documents to upload | up to 8 | 0–1 |
| Typing required | Full form in Devanagari | None |
| Must know the department | Yes | No |
| Login before starting | Yes | No |
| Works for a non-literate citizen | No | **Yes** |
| Cost to the citizen | ₹40 + ₹100–300 agent fee | ₹40 |
| Cost to the state per application | — | **₹0 speech cost with Bhashini** |

---

## Questions that will be asked, and the answers

**"Where does the citizen's voice go?"**

The single most important question, and the reason to lead with Bhashini.
> "In this demo, the browser's built-in engine — which is why it is a demo.
> In production, **Bhashini** — MeitY's own National Language Translation
> Mission. Free for government use, 22 Indian languages, hosted in India.
> The voice never leaves government infrastructure. The switch is one
> configuration line; the code is already written."

**"What does it cost?"**

> "Speech: zero, with Bhashini. DigiLocker: zero, the state registers as a
> Requester. The catalogue already exists as an API. The cost is integration
> work, not licences. Commercial alternatives would run ₹40,000–1,20,000 a month
> at 50,000 applications — that is the cost of *not* using Bhashini."

**"Will it understand our people? Garhwali? Kumaoni?"**

Do not oversell this.
> "Hindi and English work today. Garhwali and Kumaoni are on Bhashini's roadmap
> and this is exactly the state that should push for them. Until then there is
> always a typed fallback on the same screen — voice is never the only way in."

**"What if it mishears an Aadhaar number?"**

> "It reads every number back before accepting it. Say 'नहीं' and it re-asks.
> That is built in, because digit strings are where speech recognition is
> weakest and where errors are most expensive."

**"Is this AI? Will it hallucinate? Can someone talk it into approving something?"**

Important to answer clearly.
> "No. There is deliberately no language model in the decision path. It is a
> rule-based state machine — every branch is readable in the source. It cannot
> invent a service that does not exist, and it cannot be argued out of a
> validation rule. It also costs nothing per request and works on 2G."

**"Do we have to replace Apuni Sarkar?"**

> "No, and you should not. This sits on top. It reads the same catalogue API you
> already publish and would submit to the same backend. It is a new front door,
> not a new building."

**"How long to a pilot?"**

> "One district, three services — income, domicile, caste — with real Bhashini
> and real DigiLocker: a small team, a few months. The catalogue work is done;
> the integration work is the schedule."

**"Who maintains it?"**

> "It is plain HTML and JavaScript with no framework and no build step. Any NIC
> or ITDA developer can open a file and read it. That was a deliberate choice
> for exactly this question."

---

## What to be honest about

Say these before they are found. Credibility is worth more than polish.

- DigiLocker documents in the demo are **mock**. The API call shapes are real;
  the state must register as a Requester.
- Submission writes to browser storage, not a real backend.
- **7 services** have full voice forms. The other 946 are in the catalogue and
  browsable, but hand off to the existing flow. Extending is schema work, not
  new engineering — the `documents[]` and `officerFields[]` already in the API
  are most of what a voice schema needs.
- Firefox has no speech recognition. Chrome and Edge only.
- Payment is not implemented.

---

## The closing line

> "The state has already done the hard part. 953 services are online, the fees
> and timelines are defined, Right to Service is legislated, and DigiLocker
> already holds the documents. What is missing is a way in for the citizen who
> cannot type. That is what this is — and the speech is free, because it is the
> Government of India's own."

---

## Leave-behind

- This folder, runnable with `node server/server.js`
- [01-RESEARCH.md](01-RESEARCH.md) — the audit, with the 953/87 finding
- [02-ARCHITECTURE.md](02-ARCHITECTURE.md) — how it works, phased plan
- [03-VOICE-APIS.md](03-VOICE-APIS.md) — Bhashini, and the cost comparison

If only one thing is left behind, leave the cost table from 03-VOICE-APIS.md.
