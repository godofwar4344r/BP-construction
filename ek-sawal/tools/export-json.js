#!/usr/bin/env node
/* tools/export-json.js — emit the knowledge base as plain JSON.

   kb.js is the single source of truth, but ITDA's own systems (the e-District
   CMS, a chatbot, an IVR tree for 1905) will want data, not JavaScript.
   Run this after any KB edit:   npm run export

   The output is deliberately flat and self-describing. Every record keeps its
   `src` provenance so a downstream consumer can filter to portal-verified rows
   only if it needs to. */

'use strict';
const fs = require('fs');
const path = require('path');

/* The asset files are browser modules that attach to `window`. Give them one. */
const w = {};
global.window = w;
require(path.join(__dirname, '..', 'assets', 'kb.js'));
require(path.join(__dirname, '..', 'assets', 'regional.js'));
require(path.join(__dirname, '..', 'assets', 'i18n.js'));

const KB = w.KB, I18N = w.I18N, REG = w.REGIONAL;

const out = {
  meta: {
    project: 'Ek Sawal',
    purpose: 'Life-event index of Uttarakhand citizen services',
    generated: process.env.BUILD_DATE || new Date().toISOString().slice(0, 10),
    provenance: {
      portal: 'Listed on eservices.uk.gov.in, verified 16 Aug 2026. Fee/SLA from department RTS notification.',
      known: 'Publicly published scheme figures. Confirm against the current government order.',
      draft: 'Placeholder. Not shown to citizens without a warning.'
    },
    counts: {
      services: KB.services.length,
      portalVerified: KB.services.filter(s => s.src === 'portal').length,
      needsConfirmation: KB.services.filter(s => s.src !== 'portal').length,
      lifeEvents: KB.situations.length,
      documents: Object.keys(KB.DOC).length,
      languages: I18N.langs.length,
      regionalWords: REG ? REG.wordsAdded : 0
    }
  },
  languages: I18N.langs,
  documents: KB.DOC,
  offices: KB.WHERE,
  services: KB.services.map(s => ({
    id: s.id,
    name: { hi: s.hi, en: s.en },
    department: { hi: s.deptHi, en: s.deptEn },
    feeRupees: s.fee,
    slaWorkingDays: s.days,
    rtsGuaranteed: !!s.rts,
    benefit: s.money || null,
    plainLanguage: { hi: s.plainHi, en: s.plainEn },
    documents: s.docs || [],
    eligibility: { hi: s.eligHi || [], en: s.eligEn || [] },
    signedBy: { hi: s.signedByHi, en: s.signedByEn },
    appealTo: { hi: s.appealHi, en: s.appealEn },
    validity: { hi: s.validHi, en: s.validEn },
    applyAt: s.where,
    officialUrl: s.url,
    phone: s.phone || null,
    provenance: s.src,
    matchTerms: s.terms || [],
    situationTerms: s.needs || []
  })),
  lifeEvents: KB.situations.map(s => ({
    id: s.id, icon: s.icon, routesTo: s.to,
    prompt: { hi: s.hi, en: s.en },
    answer: { hi: s.sayHi, en: s.sayEn }
  }))
};

const dest = path.join(__dirname, '..', 'data', 'services.json');
fs.writeFileSync(dest, JSON.stringify(out, null, 2), 'utf8');
console.log('wrote', path.relative(process.cwd(), dest),
            '·', out.meta.counts.services, 'services',
            '·', (fs.statSync(dest).size / 1024).toFixed(1) + ' KB');
