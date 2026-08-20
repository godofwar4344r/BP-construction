# Site audit — uk.gov.in and eservices.uk.gov.in

Captured 11 August 2026, directly from the live sites.

---

## 1. What the two sites actually are

They are **two different products** that get confused with each other:

| | uk.gov.in | eservices.uk.gov.in |
|---|---|---|
| Name | Uttarakhand State Portal | **Apuni Sarkar** (e-Services) |
| Job | Information, announcements, links to departments | Actual service delivery — apply, pay, track, download |
| Built as | Server-rendered CMS | JavaScript SPA with a JSON API |
| Old address | — | `edistrict.uk.gov.in` (dead) |
| Run by | Government of Uttarakhand | ITDA, Dept. of IT & Science Technology |

`uk.gov.in` is a directory. `eservices.uk.gov.in` is where citizens do things.
A rebuild must treat the second as the product and the first as the shell.

---

## 2. The number that matters

The Apuni Sarkar catalogue is served from a single public endpoint:

```
GET https://eservices.uk.gov.in/api/service
```

It returns the **entire catalogue in one response, unauthenticated**:

> **953 active services across 87 departments.**

Each record carries everything needed to render and validate an application:

```json
{
  "id": "ES09",
  "slug": "income-certificate",
  "nameEnglish": "Income Certificate",
  "nameHindi": "आय प्रमाण पत्र",
  "department": { "nameEnglish": "Revenue Department", "nameHindi": "राजस्व विभाग", "rank": 1 },
  "serviceType": { "nameEnglish": "Revenue Certificates" },
  "charge": 40,
  "deliveryTimeInSeconds": 1296000,
  "rts": true,
  "documents": [
    { "key": "idProof", "nameEnglish": "Id Proof", "nameHindi": "पहचान पत्र", "required": true },
    ...
  ],
  "officerFields": [...],
  "forms": [...]
}
```

**This is the single most important finding.** It means a rebuilt front end does
not need the department to build anything new — the service definitions,
fee structure, SLA and document requirements are already machine-readable.
A voice layer can be built entirely on top of what exists.

`assets/data/services.json` in this project is a curated subset of that
response, with fees, SLAs and document lists copied verbatim.

---

## 3. Department breakdown (live counts)

| Department | Services | | Department | Services |
|---|---|---|---|---|
| Home (Police / Fire / UCC) | 66 | | Cane Development & Sugar | 43 |
| Department of Energy (UPCL) | 48 | | Excise | 36 |
| School Education | 32 | | Transport | 31 |
| Horticulture & Food Processing | 30 | | Water (Jal Sansthan) | 26 |
| Sanskrit Education | 25 | | Agriculture | 24 |
| Rural Works | 24 | | Labour | 19 |
| Fisheries | 18 | | Cooperative | 17 |
| Pollution Control / GST / Dairy / Ayurvedic / Technical Ed. | 16 each | | Social Welfare | 15 |
| Revenue | 14 | | Stamps & Registration | 14 |
| Forest | 14 | | Higher Education | 16 |

…and 60 more departments with fewer than 14 services each, down to single-service
entries like UKSSSC and Nagar Nigam Dehradun.

**Revenue is ranked 1** in the API despite having only 14 services — because those
14 (income, caste, domicile, character, EWS, solvency, hill area, survivor) are
the highest-volume citizen touchpoints in the state.

---

## 4. What the current e-services portal makes a citizen do

Observed on the live site:

1. Land on `eservices.uk.gov.in`. Choose one of four login roles:
   **CITIZEN / CSC / EDC / OFFICER**. No explanation of which one you are.
2. Log in with **User ID + password + CAPTCHA**, or Jan Parichay SSO.
3. Find your service among 953, organised by department — so you must already
   know that a family register copy is *Panchayati Raj* and not *Revenue*.
4. Read the document list. Arrange physical copies of each.
5. Scan or photograph every document. Upload each one separately.
6. Fill a long form, in English-labelled fields, typing in Devanagari.
7. Pay ₹40. Note down the acknowledgement number.
8. Come back later and re-enter that number to check status.

Every one of those eight steps is a place where a first-time or non-literate
user stops. Steps 3, 5 and 6 are where most of them stop.

---

## 5. Specific, fixable problems

| # | Problem | Evidence | Fix in this rebuild |
|---|---|---|---|
| 1 | **Navigation by department, not by need** | Catalogue is grouped by the 87 departments | Say what you need; NLU maps it to the service |
| 2 | **Login before you can even look** | Login card is the first thing on the page | Browse and start an application before authenticating |
| 3 | **Manual upload of documents the state already issued** | Income certificate wants ID proof, address proof, ration card — all already in DigiLocker | Auto-fetch via DigiLocker; portal already links to it but does not use it |
| 4 | **Typing Devanagari is the real barrier** | Every form is keyboard-entry | Voice input; typing becomes optional |
| 5 | **English field labels on Hindi forms** | `nameEnglish` is what renders in most forms | Every label bilingual, Hindi first |
| 6 | **Status requires the acknowledgement number** | Separate "Know Application Status" page | Ask by voice: "मेरे आवेदन की स्थिति क्या है" |
| 7 | **The SLA is invisible** | `deliveryTimeInSeconds` and `rts: true` exist in the API but are not shown prominently | Show days + Right-to-Service badge on every card |
| 8 | **Accessibility is a link, not a feature** | Separate "Screen Reader" page | Font scaling, high-contrast theme, keyboard operation, ARIA live regions built in |

The portal already links to DigiLocker, API Setu, UMANG and Jan Parichay in its
footer. **The integrations are acknowledged but not used.** That gap is the
entire opportunity.

---

## 6. What the current site does well — keep these

Not everything needs replacing:

- **Right to Service (`rts`) flags** on most services. Genuinely good, badly surfaced.
- **Fee and SLA are already structured data.** Nothing to build.
- **Bilingual names throughout the API** (`nameEnglish` / `nameHindi`).
- **WhatsApp helpline** (+91 73022 54188) linked from the home page.
- **CM Helpline 1905** for grievances.
- **Verify Certificate** endpoint — anyone can validate a certificate's authenticity.
- Government-issued visual identity and the Digital India / API Setu / DigiLocker
  trust marks in the footer.

A rebuild that discards these loses credibility. This project keeps all of them.

---

## 7. uk.gov.in structure (for the shell)

Main navigation: Home · Feedback · Complaint · Meri Yojna-Book · GOs & Gazettes ·
State Profile · Apex Bodies · Downloads

Citizen services: Apuni Sarkar · CM Helpline (grievances) · MyGov surveys ·
citizen mobile apps

Administrative geography, used for form dropdowns:
**2 divisions** (Garhwal, Kumaon) · **13 districts** · 107 tehsils · 95 blocks ·
7,950 gram panchayats · 16,793 villages

Linked service portals: UCC · UTC Online (transport) · Corbett booking ·
Badrinath–Kedarnath booking · go.uk.gov.in · gazettes.uk.gov.in

---

## 8. Sources

- https://uk.gov.in/
- https://eservices.uk.gov.in/
- https://eservices.uk.gov.in/api/service — the catalogue endpoint
- https://eservices.uk.gov.in/all-services
- https://it.uk.gov.in/service/apuni-sarkar/
