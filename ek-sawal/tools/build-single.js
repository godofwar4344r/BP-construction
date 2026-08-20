#!/usr/bin/env node
/* tools/build-single.js — fold the whole app into one self-contained .html

   The multi-file version is the real one. A single file is what you can email,
   put on a USB stick, open from a phone's Downloads folder with no server, or
   hand to someone who will not run `node`.

   Output: dist/ek-sawal-single.html — fully offline, no network request of any
   kind once the file has landed.

   Dropped, because neither means anything without real URLs: the service
   worker and the web manifest. Everything else is identical.

   Run:  npm run single
*/

'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const CSS = ['assets/style.css', 'assets/flow.css'];

const JS = [
  'assets/i18n.js',
  'assets/kb.js',
  'assets/regional.js',
  'assets/match.js',
  'assets/forms.js',
  'assets/digilocker.js',
  'assets/store.js',
  'assets/schedule.js',
  'assets/flow.js',
  'assets/app.js'
];

const html = read('index.html');

/* Strip the document shell — the host page supplies it. */
let body = html.split(/<body[^>]*>/i)[1].split(/<\/body>/i)[0];

/* Remove external references; their content is inlined below. */
body = body.replace(/\s*<script src="[^"]*"><\/script>/g, '');
body = body.replace(/\s*<link rel="stylesheet"[^>]*>/g, '');

const css = CSS.map(read).join('\n');

/* A service worker cannot register from a single file. */
const js = JS.map(read).join('\n\n').replace(
  /var isLocal =[\s\S]*?\n    \}\n  \}/,
  '/* service worker omitted in the single-file build */'
);

/* Gallery and tab name: the product name only, no descriptive tail. */
const out =
  '<title>एक सवाल · Ek Sawal</title>\n' +
  '<style>\n' + css + '\n</style>\n' +
  body + '\n' +
  '<script>\n' + js + '\n</script>\n';

const dir = path.join(ROOT, 'dist');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);
const dest = path.join(dir, 'ek-sawal-single.html');
fs.writeFileSync(dest, out, 'utf8');

console.log('wrote dist/ek-sawal-single.html ·',
  (fs.statSync(dest).size / 1024).toFixed(1) + ' KB · opens with no server');
