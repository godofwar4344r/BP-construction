# Put Ek Sawal live on Vercel

Two commands. No build step, no dependencies, no configuration to fill in —
`vercel.json` in this folder already carries the security headers and the
service-worker cache rule.

```bash
cd ek-sawal
npx vercel deploy --prod
```

The first run asks you to log in (browser opens once) and then four questions.
Answer them like this:

| Question | Answer |
|---|---|
| Set up and deploy? | **y** |
| Which scope? | your account |
| Link to existing project? | **n** |
| Project name? | **ek-sawal** |
| In which directory is your code? | **./** (just press Enter) |

It prints a URL like `https://ek-sawal.vercel.app`. That is the live site.

## Why HTTPS matters here

Voice input needs a secure context. On `http://` the microphone silently
refuses to start. Vercel gives you HTTPS automatically, so **voice works on the
deployed URL** — including on a phone, which is where it actually matters.

## After any later change

```bash
npx vercel deploy --prod
```

If you edited the knowledge base, do this first:

```bash
npm run export          # regenerate data/services.json
```

…open `/test.html` on the deployed URL and confirm all 61 checks are green, and
bump `CACHE` in `sw.js` (`ek-sawal-v2` → `v3`) so phones already carrying the
old copy pick up the change. That last step is the one people forget: without
it a corrected fee never reaches a phone that cached the old one.

## A custom domain

If ITDA wants `eksawal.uk.gov.in`, that is a CNAME onto the Vercel deployment
plus one entry in the Vercel dashboard. For NIC-hosted infrastructure instead,
`DEPLOY.md` has the nginx and Apache configs — the site is plain static files
and will serve from anything.

## What gets deployed

Only this folder. 11 runtime files, about 165 KB, no dependencies to install
and nothing to compile.
