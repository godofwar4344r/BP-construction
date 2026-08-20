# Deploying Ek Sawal

It is a static site. Any web server works; there is no database, no runtime and
no build step. Two things matter: **serve it over HTTPS** (the microphone will
not start otherwise) and **keep the security headers**.

## Option A — the bundled Node server

```bash
node server.js          # port 8090, or set PORT
```

Fine for a demo or an internal pilot. Put nginx or Apache in front for
production TLS.

## Option B — nginx (recommended for NIC hosting)

```nginx
server {
    listen 443 ssl http2;
    server_name eksawal.uk.gov.in;

    root /var/www/ek-sawal;
    index index.html;

    # Microphone requires a secure context. Non-negotiable.
    ssl_certificate     /etc/ssl/certs/uk.gov.in.crt;
    ssl_certificate_key /etc/ssl/private/uk.gov.in.key;

    # Do NOT add 'unsafe-inline'. The strict policy is what makes the
    # cross-site-scripting class of defect impossible here.
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; form-action 'none'; base-uri 'none'; frame-ancestors 'none'" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "same-origin" always;
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header Permissions-Policy "microphone=(self), geolocation=(), camera=()" always;

    gzip on;
    gzip_types text/css text/javascript application/javascript application/json image/svg+xml;

    # The service worker must never be cached, or updates never land.
    location = /sw.js {
        add_header Cache-Control "no-cache, must-revalidate";
    }

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
}
```

## Option C — Apache

```apache
<VirtualHost *:443>
    ServerName eksawal.uk.gov.in
    DocumentRoot /var/www/ek-sawal

    Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; form-action 'none'; base-uri 'none'; frame-ancestors 'none'"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "same-origin"
    Header always set Strict-Transport-Security "max-age=31536000"
    Header always set Permissions-Policy "microphone=(self), geolocation=(), camera=()"

    <Files "sw.js">
        Header set Cache-Control "no-cache, must-revalidate"
    </Files>
</VirtualHost>
```

## After any content change

1. Edit `assets/kb.js`
2. `npm run export` — regenerates `data/services.json`
3. Open `/test.html` — all checks must be green
4. **Bump `CACHE` in `sw.js`** (`ek-sawal-v2` → `v3`) so phones already carrying
   the old copy pick up the change
5. Deploy

Step 4 is the one that gets forgotten. Without it, a corrected fee will not
reach a phone that has already cached the old one.

## Checks before going live

- [ ] HTTPS, valid certificate — microphone will not work otherwise
- [ ] `/test.html` fully green on the deployed URL, not just locally
- [ ] All 13 `src: 'known'` services confirmed by their department, flipped to `'portal'`
- [ ] Garhwali, Kumaoni, Punjabi, Urdu, Bengali, Nepali strings reviewed by native speakers
- [ ] Prototype band removed **only** if the state formally adopts it — and the
      emblem added at the same time, never before
- [ ] Tested on a real ₹6,000 Android phone on a real 3G connection, not on desk wifi
