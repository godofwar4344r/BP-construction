# Free voice APIs for Hindi + Indian languages

This is the answer to "if API needed then tell me free API provider for voice."

Short version: **use the browser engine for the demo, and Bhashini for the real
thing.** Both are free. Everything else on this page is a fallback.

---

## The two that actually matter

### 1. Web Speech API — what this MVP runs on today

Built into Chrome and Edge. No key, no account, no server, no cost, no limit.

```js
const rec = new webkitSpeechRecognition();
rec.lang = 'hi-IN';          // also en-IN, bn-IN, ta-IN, te-IN, mr-IN, gu-IN, kn-IN, ml-IN, pa-IN, ur-IN
rec.onresult = e => console.log(e.results[0][0].transcript);
rec.start();

speechSynthesis.speak(Object.assign(new SpeechSynthesisUtterance('नमस्ते'), { lang: 'hi-IN' }));
```

| | |
|---|---|
| Cost | ₹0, unlimited |
| Hindi quality | Good — Google's production model |
| Setup time | Zero |
| Works in Firefox | **No** (no `SpeechRecognition`) |
| Works offline | TTS yes, STT no |
| Needs HTTPS | Yes (or `localhost`) |

**The catch, and it is the important one:** Chrome streams the audio to Google's
servers. For a demo that is fine. For a live government portal handling citizen
voice data it is a data-sovereignty problem, and someone in the room will ask
about it. Have the Bhashini answer ready.

---

### 2. Bhashini — the one to propose to the government

**https://bhashini.gov.in** · National Language Translation Mission, MeitY,
Government of India.

This is the correct production answer and it is a strong point in the pitch:

- **It is the government's own.** Built by MeitY. You are not asking a state
  government to send citizen voice data to a US company — you are asking them
  to use another arm of their own government.
- **Free for government and public-interest use.** Register on the ULCA
  platform for a `userID` and `ulcaApiKey`.
- **22 scheduled languages**, including Hindi, plus ASR, TTS and translation
  in one pipeline. Garhwali and Kumaoni are on the roadmap, which matters in
  Uttarakhand.
- **Hosted in India.** Data sovereignty is satisfied by construction.

It is a two-step API — ask ULCA which model serves your language, then call
the endpoint it returns. Both calls are already implemented in
[`server/server.js`](../server/server.js) (`getPipeline`, `bhashiniASR`,
`bhashiniTTS`). To switch the whole app over:

```bash
set BHASHINI_USER_ID=your-user-id
set BHASHINI_API_KEY=your-ulca-api-key
node server/server.js
```

then change one line in the page:

```js
Voice.init({ provider: 'bhashini', lang: 'hi' });   // was 'webspeech'
```

Nothing else in the application changes. That is the whole point of the
provider abstraction in `voice-engine.js`.

---

## Everything else, ranked by how useful it actually is here

### Free tier, cloud

| Provider | Free allowance | Hindi | Notes |
|---|---|---|---|
| **Groq** | Generous free tier, no card | Very good | `whisper-large-v3`. Fastest hosted Whisper anywhere. STT only — pair with a separate TTS. |
| **Sarvam AI** | Free credits on signup | Excellent | Indian company, Indian-language specialist. Best non-government Hindi quality. STT + TTS. |
| **Deepgram** | $200 free credit | Good | Nova model, low latency, clean SDK. Credit runs out. |
| **AssemblyAI** | Free hours on signup | Fair | Weaker on Indian languages than the above. |
| **ElevenLabs** | 10k chars/month | Very good TTS | TTS only, and the free tier is too small for a portal. Good for recording a demo video. |
| **Azure Speech** | 5 hrs/month free (12 months) | Very good | Best commercial Hindi TTS voices. Needs a card. |
| **Google Cloud STT** | 60 min/month free | Very good | Same engine as the browser API, but billed and with a contract. |

### Free forever, self-hosted — the realistic production alternative

If the state will not use Bhashini, this is the fallback that keeps data in the
NIC data centre:

| Model | What it is | Why it fits |
|---|---|---|
| **AI4Bharat IndicWhisper / IndicConformer** | IIT Madras, open source | Purpose-built for Indian languages. Beats generic Whisper on Hindi. |
| **AI4Bharat IndicTTS / Indic-Parler-TTS** | IIT Madras, open source | Natural Hindi TTS, self-hostable. |
| **faster-whisper** | CTranslate2 port of Whisper | 4× faster than reference Whisper, runs on CPU. `whisper-small` is enough for form filling. |
| **Vosk** | Kaldi-based, offline | Tiny models (~50 MB). Runs on a ₹15,000 kiosk PC with no internet — relevant for CSCs in hill districts. |
| **Piper TTS** | Fast neural TTS | Runs on a Raspberry Pi. Has a Hindi voice. |
| **Coqui TTS** | Open source TTS toolkit | Good if you want to train a Garhwali/Kumaoni voice later. |

---

## What I would actually recommend

| Phase | STT | TTS | Why |
|---|---|---|---|
| **Demo to the government (now)** | Web Speech API | `speechSynthesis` | Works today, costs nothing, nothing to install. Already built. |
| **Pilot in one district** | Bhashini | Bhashini | Government-owned, free, India-hosted. Answers the sovereignty question before it is asked. |
| **Statewide production** | Bhashini primary, self-hosted IndicWhisper as fallback | Bhashini + Piper on-device | No single point of failure; CSC kiosks keep working when the link drops. |

Do **not** put OpenAI, Google Cloud or AWS in a government proposal as the
primary engine. Not because they are bad — because the first question in the
room will be "where does the citizen's voice go", and Bhashini is the answer
that ends that conversation instead of starting it.

---

## Signing up for Bhashini

1. Go to **https://bhashini.gov.in** → *Compute / ULCA* → register.
2. Create an application; you get a `userID` and a `ulcaApiKey`.
3. Pipeline discovery endpoint:
   `https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline`
4. Default public pipeline ID: `64392f96daac500b55c543cd`
5. Docs and playground: **https://bhashini.gov.in/ulca**

For an official state project, the ITDA (Information Technology Development
Agency, Uttarakhand) can request a dedicated pipeline and higher limits
directly from MeitY rather than using the public one.

---

## Cost if you ignore all of the above and go commercial

Rough, at ~50,000 applications/month, ~2 minutes of speech each:

| | Monthly |
|---|---|
| Google Cloud STT | ~₹1,20,000 |
| Deepgram | ~₹55,000 |
| Sarvam AI | ~₹40,000 |
| **Bhashini** | **₹0** |
| **Self-hosted IndicWhisper on one GPU box** | **~₹8,000 amortised** |

That table is worth a slide on its own.
