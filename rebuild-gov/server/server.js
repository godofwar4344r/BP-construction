#!/usr/bin/env node
/* ==========================================================================
   server.js — static host + speech/DigiLocker proxy.

   Zero dependencies. Node 18+ only (uses the built-in fetch).

     node server/server.js
     → http://localhost:8080

   Why a server at all when the front end is static:

   1. getUserMedia and the Web Speech API require a SECURE CONTEXT.
      http://localhost counts as secure; opening index.html via file://
      does not, and the microphone will silently refuse to start.

   2. API keys must never reach the browser. When you move off the free
      browser engine, the Bhashini / DigiLocker credentials live here.

   Endpoints
     POST /api/asr              multipart audio → { text }
     POST /api/tts              { text, lang }  → audio/wav
     GET  /api/digilocker/*     OAuth + document proxy (stub)
     GET  /api/health           liveness
   ========================================================================== */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 8080;
const ROOT = path.resolve(__dirname, '..');

/* -------------------------------------------------------------- credentials */
/* Set these in the environment. Never commit them.
     BHASHINI_USER_ID, BHASHINI_API_KEY, BHASHINI_PIPELINE_ID
     DIGILOCKER_CLIENT_ID, DIGILOCKER_CLIENT_SECRET                        */

const BHASHINI = {
  userId: process.env.BHASHINI_USER_ID || '',
  apiKey: process.env.BHASHINI_API_KEY || '',
  pipelineId: process.env.BHASHINI_PIPELINE_ID || '64392f96daac500b55c543cd',
  configUrl: 'https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline'
};

const configured = () => Boolean(BHASHINI.userId && BHASHINI.apiKey);

/* -------------------------------------------------------------- static files */

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.ico':  'image/x-icon',
  '.woff2': 'font/woff2',
  '.md':   'text/markdown; charset=utf-8'
};

function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel === '/') rel = '/index.html';

  const filePath = path.join(ROOT, rel);

  // Directory traversal guard.
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404</h1><p>Not found: ' + rel + '</p><p><a href="/">Home</a></p>');
      return;
    }

    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

/* ------------------------------------------------------------------ helpers */

function readBody(req, limitBytes = 12 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limitBytes) {
        reject(new Error('Payload too large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);
}

/**
 * Minimal multipart/form-data parser — enough for one audio part plus a
 * couple of text fields. Avoids pulling in a dependency for the one place
 * we need it.
 */
function parseMultipart(buffer, contentType) {
  const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || '');
  if (!m) return {};

  const boundary = '--' + (m[1] || m[2]).trim();
  const parts = {};
  let start = buffer.indexOf(boundary);

  while (start !== -1) {
    const headerEnd = buffer.indexOf('\r\n\r\n', start);
    if (headerEnd === -1) break;

    const headers = buffer.slice(start + boundary.length, headerEnd).toString('utf8');
    const next = buffer.indexOf(boundary, headerEnd);
    if (next === -1) break;

    const content = buffer.slice(headerEnd + 4, next - 2);  // strip trailing CRLF
    const nameMatch = /name="([^"]+)"/.exec(headers);

    if (nameMatch) {
      parts[nameMatch[1]] = /filename="/.test(headers) ? content : content.toString('utf8');
    }

    start = next;
    if (buffer.slice(next, next + boundary.length + 2).toString() === boundary + '--') break;
  }

  return parts;
}

/* ------------------------------------------------------------ Bhashini calls */

let pipelineCache = null;

/**
 * Bhashini is two-step: ask the ULCA config endpoint which model serves your
 * language pair, then call the inference endpoint it hands back. The config
 * response is stable, so cache it.
 */
async function getPipeline(task, lang) {
  const cacheKey = task + ':' + lang;
  if (pipelineCache && pipelineCache[cacheKey]) return pipelineCache[cacheKey];

  const res = await fetch(BHASHINI.configUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      userID: BHASHINI.userId,
      ulcaApiKey: BHASHINI.apiKey
    },
    body: JSON.stringify({
      pipelineTasks: [{ taskType: task, config: { language: { sourceLanguage: lang } } }],
      pipelineRequestConfig: { pipelineId: BHASHINI.pipelineId }
    })
  });

  if (!res.ok) throw new Error('Bhashini config failed: ' + res.status + ' ' + await res.text());

  const cfg = await res.json();
  const taskCfg = cfg.pipelineResponseConfig?.[0]?.config?.[0];
  const endpoint = cfg.pipelineInferenceAPIEndPoint;

  const entry = {
    serviceId: taskCfg?.serviceId,
    endpoint: endpoint?.callbackUrl,
    authKey: endpoint?.inferenceApiKey?.name,
    authValue: endpoint?.inferenceApiKey?.value
  };

  pipelineCache = pipelineCache || {};
  pipelineCache[cacheKey] = entry;
  return entry;
}

async function bhashiniASR(audioBuffer, lang) {
  const p = await getPipeline('asr', lang);

  const res = await fetch(p.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', [p.authKey]: p.authValue },
    body: JSON.stringify({
      pipelineTasks: [{
        taskType: 'asr',
        config: {
          language: { sourceLanguage: lang },
          serviceId: p.serviceId,
          audioFormat: 'webm',
          samplingRate: 16000
        }
      }],
      inputData: { audio: [{ audioContent: audioBuffer.toString('base64') }] }
    })
  });

  if (!res.ok) throw new Error('Bhashini ASR failed: ' + res.status);
  const out = await res.json();
  return out.pipelineResponse?.[0]?.output?.[0]?.source || '';
}

async function bhashiniTTS(text, lang) {
  const p = await getPipeline('tts', lang);

  const res = await fetch(p.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', [p.authKey]: p.authValue },
    body: JSON.stringify({
      pipelineTasks: [{
        taskType: 'tts',
        config: {
          language: { sourceLanguage: lang },
          serviceId: p.serviceId,
          gender: 'female',
          samplingRate: 22050
        }
      }],
      inputData: { input: [{ source: text }] }
    })
  });

  if (!res.ok) throw new Error('Bhashini TTS failed: ' + res.status);
  const out = await res.json();
  const b64 = out.pipelineResponse?.[0]?.audio?.[0]?.audioContent;
  if (!b64) throw new Error('Bhashini TTS returned no audio');
  return Buffer.from(b64, 'base64');
}

/* --------------------------------------------------------------- API routes */

async function handleApi(req, res, url) {
  const route = url.pathname;

  if (route === '/api/health') {
    return json(res, 200, {
      ok: true,
      bhashini: configured() ? 'configured' : 'not configured — front end will use the browser engine',
      node: process.version
    });
  }

  if (route === '/api/asr' && req.method === 'POST') {
    if (!configured()) {
      return json(res, 501, {
        error: 'not_configured',
        message: 'Set BHASHINI_USER_ID and BHASHINI_API_KEY to enable server-side ASR. ' +
                 'The front end falls back to the browser Web Speech API.'
      });
    }
    try {
      const body = await readBody(req);
      const parts = parseMultipart(body, req.headers['content-type']);
      const text = await bhashiniASR(parts.audio, parts.lang || 'hi');
      return json(res, 200, { text });
    } catch (e) {
      console.error('[asr]', e);
      return json(res, 500, { error: 'asr_failed', message: e.message });
    }
  }

  if (route === '/api/tts' && req.method === 'POST') {
    if (!configured()) {
      return json(res, 501, { error: 'not_configured', message: 'Set BHASHINI_USER_ID and BHASHINI_API_KEY.' });
    }
    try {
      const body = JSON.parse((await readBody(req)).toString('utf8'));
      const audio = await bhashiniTTS(body.text, body.lang || 'hi');
      res.writeHead(200, { 'Content-Type': 'audio/wav', 'Content-Length': audio.length });
      return res.end(audio);
    } catch (e) {
      console.error('[tts]', e);
      return json(res, 500, { error: 'tts_failed', message: e.message });
    }
  }

  /* ------------------------------------------------------------ DigiLocker */

  if (route === '/api/digilocker/authorize') {
    // Real flow: redirect to DigiLocker's consent screen.
    //   https://api.digitallocker.gov.in/public/oauth2/1/authorize
    //     ?response_type=code&client_id=...&redirect_uri=...&state=...
    // The citizen approves there; DigiLocker calls our /callback with a code;
    // we exchange it for a token and keep the token server-side only.
    return json(res, 501, {
      error: 'not_configured',
      message: 'Register the state as a DigiLocker Requester and set DIGILOCKER_CLIENT_ID / DIGILOCKER_CLIENT_SECRET. ' +
               'The front end runs in mock mode until then.'
    });
  }

  if (route.startsWith('/api/digilocker/')) {
    return json(res, 501, { error: 'not_configured', message: 'DigiLocker proxy not configured.' });
  }

  return json(res, 404, { error: 'not_found', route });
}

/* ------------------------------------------------------------------- server */

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');

  if (url.pathname.startsWith('/api/')) {
    handleApi(req, res, url).catch((e) => {
      console.error(e);
      json(res, 500, { error: 'server_error', message: e.message });
    });
    return;
  }

  serveStatic(req, res, url.pathname);
});

server.listen(PORT, () => {
  console.log('');
  console.log('  rebuild-gov  ·  voice-first services portal');
  console.log('  ──────────────────────────────────────────');
  console.log('  →  http://localhost:' + PORT);
  console.log('');
  console.log('  Speech engine : ' + (configured() ? 'Bhashini (server-side)' : 'browser Web Speech API (free, no key)'));
  console.log('  DigiLocker    : ' + (process.env.DIGILOCKER_CLIENT_ID ? 'live' : 'mock'));
  console.log('');
  console.log('  Open in Chrome or Edge — Firefox has no speech recognition.');
  console.log('');
});
