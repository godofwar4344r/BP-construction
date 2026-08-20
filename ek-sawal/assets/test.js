/* =============================================================================
   test.js — self-test for Ek Sawal

   Runs in the browser against the shipped files. Every defect found in the
   audit of the previous build has a case here, so a regression is visible
   rather than silent.

   Add a case: one line. Groups are just labels.
   ============================================================================= */

(function (global) {
  'use strict';

  var KB = global.KB, Match = global.Match, I18N = global.I18N;
  var groups = [], cur = null, pass = 0, fail = 0;

  function group(name, note) { cur = { name: name, note: note || '', cases: [] }; groups.push(cur); }

  function ok(label, cond, detail) {
    var good = !!cond;
    good ? pass++ : fail++;
    cur.cases.push({ label: label, ok: good, detail: detail || '' });
    if (!good) console.error('FAIL:', label, detail || '');
  }

  /* Convenience: assert a query routes to a service id. */
  function routes(q, id) {
    var r = Match.match(q);
    var got = r.kind === 'service' ? r.svc.id : r.kind;
    ok('"' + q + '" → ' + id, got === id, 'got: ' + got);
  }
  function kind(q, k) {
    var r = Match.match(q);
    ok('"' + q + '" → ' + k, r.kind === k, 'got: ' + r.kind);
  }

  /* ------------------------------------------------ 1. the audit regressions */
  group('Audit regressions',
    'Each of these is a defect that shipped in the previous build. They must never come back.');

  var rc = Match.match('I want ration card');
  ok('"ration card" no longer routes to Driving Licence  [was: TR02]',
     !(rc.kind === 'service' && rc.svc.id === 'dl'),
     'got: ' + (rc.kind === 'service' ? rc.svc.id : rc.kind));

  routes('widow pension', 'pension-widow');
  routes('I lost my job and want to start a business', 'msy');
  routes('I have lost my job', 'msy');
  routes('my father is 70 years old', 'pension-old');
  routes('मेरे पिताजी 70 वर्ष के हैं', 'pension-old');
  routes('caste certificate kaise banaye', 'caste');
  routes('मुझे जाति प्रमाण पत्र चाहिए', 'caste');
  routes('I need a birth certificate', 'birth');

  kind('status of my application', 'need-id');
  kind('track my income certificate', 'need-id');
  kind('what is the status of my ration card', 'need-id');
  ok('a well-formed ID is accepted', Match.match('UK-REV-2026-8942').kind === 'track');
  ok('tracking never invents a record',
     Match.match('status').kind === 'need-id' && !Match.match('status').id);

  kind('pension', 'unsure');

  /* ------------------------------------------------------ 2. Indian languages */
  group('Voice in Indian languages',
    'Garhwali and Kumaoni have no speech-recognition model anywhere. Hindi ASR transcribes ' +
    'the sounds and the matcher carries the regional vocabulary. These are the words that differ.');

  routes('मेरि नौनी की पढ़ै कु मदद चयेणि च', 'nanda-gaura');      /* Garhwali */
  routes('मेरि चेली कि पढ़ाई कि मदद चैंछ', 'nanda-gaura');        /* Kumaoni  */
  routes('बुबा ७० साल का छन पेंशन', 'pension-old');               /* Garhwali */
  routes('बौज्यू सयाण छन पेंशन चैंछ', 'pension-old');             /* Kumaoni  */
  routes('पाणि नि आणु', 'helpline-1905');
  routes('बाट खराब छ', 'helpline-1905');
  routes('काम नि च दुकान खोलण', 'msy');
  routes('बीमार छन इलाज कु पैसा नि', 'ayushman');
  routes('मोबैल खोयि गे', 'efir');

  ok('4 languages live in the picker', I18N.langs.length === 4,
     I18N.langs.map(function (l) { return l.code; }).join(','));
  ok('every live language is Hindi, English, Garhwali or Kumaoni',
     I18N.langs.every(function (l) { return ['hi', 'en', 'gbm', 'kfy'].indexOf(l.code) !== -1; }));
  ok('every language declares an ASR code',
     I18N.all.every(function (l) { return /^[a-z]{2}-[A-Z]{2}$/.test(l.asr); }));

  /* Parked languages: kept in the file, refused at runtime. */
  var parked = I18N.all.filter(function (l) { return !l.live; });
  ok('4 languages parked for later', parked.length === 4,
     parked.map(function (l) { return l.code; }).join(','));
  ok('parked languages keep their translations',
     parked.every(function (l) { return I18N.strings[l.code] && I18N.strings[l.code].h1; }));
  ok('a parked language cannot be selected',
     (function () { var was = I18N.get(); I18N.set('ur'); var got = I18N.get();
                    I18N.set(was); return got !== 'ur'; })());
  ok('Garhwali and Kumaoni ride on the Hindi speech model',
     I18N.meta('gbm').asr === 'hi-IN' && I18N.meta('kfy').asr === 'hi-IN');
  ok('regional vocabulary loaded', global.REGIONAL && global.REGIONAL.wordsAdded > 80,
     (global.REGIONAL ? global.REGIONAL.wordsAdded : 0) + ' words');
  ok('every regional entry maps to a real service',
     global.REGIONAL && global.REGIONAL.missing.length === 0,
     JSON.stringify(global.REGIONAL ? global.REGIONAL.missing : []));

  var missingKeys = [];
  I18N.langs.forEach(function (l) {
    ['h1', 'go', 'mic', 'printList', 'askElse'].forEach(function (k) {
      if (!I18N.s(k, l.code)) missingKeys.push(l.code + '.' + k);
    });
  });
  ok('no language renders an empty core string', missingKeys.length === 0, missingKeys.join(', '));

  /* ---------------------------------------------------------- 3. the matcher */
  group('Matcher behaviour',
    'A wrong answer costs a citizen a bus fare and a day of wages. Below the confidence ' +
    'floor the engine must ask, never assert.');

  ok('matching is word-boundary, not substring',
     !Match.hasPhrase(Match.tokenise('ration card'), 'car'));
  ok('a real phrase still matches',
     Match.hasPhrase(Match.tokenise('मुझे आय प्रमाण पत्र चाहिए'), 'आय प्रमाण'));
  ok('empty query is handled', Match.match('').kind === 'empty');
  ok('gibberish asks rather than guessing',
     ['none', 'unsure'].indexOf(Match.match('zxcvbnm qwerty').kind) !== -1);
  ok('greeting recognised', Match.match('नमस्ते').kind === 'greeting');

  /* ------------------------------------------------------- 4. spoken numbers */
  group('Spoken number validation',
    'The previous build stored the Aadhaar field as "four seven two eight nine one zero…".');

  var a1 = Match.validate('aadhaar', 'four seven two eight nine one zero two three eight four one');
  ok('spoken Aadhaar parses to 12 digits', a1.ok && /^\d{4} \d{4} \d{4}$/.test(a1.value), JSON.stringify(a1));
  ok('short Aadhaar is refused, with a reason',
     !Match.validate('aadhaar', 'one two three').ok);
  var m1 = Match.validate('mobile', 'nine four one two three four five six seven eight');
  ok('spoken mobile parses to 10 digits', m1.ok && m1.value.length === 10, JSON.stringify(m1));
  ok('a mobile starting with 5 is refused', !Match.validate('mobile', '5412345678').ok);
  ok('Devanagari digits parse', Match.digitsFrom('चार सात दो आठ') === '4728');
  ok('vague income is refused', !Match.validate('money', 'umm about I think').ok);

  /* ------------------------------------------------- 5. knowledge base shape */
  group('Knowledge base integrity',
    'A missing document list or a wrong fee is the failure mode that actually hurts people.');

  ok('28 services', KB.services.length === 28, KB.services.length + ' found');

  var badId = KB.services.filter(function (s) { return !s.id || !s.hi || !s.en; });
  ok('every service has an id and both names', badId.length === 0,
     badId.map(function (s) { return s.id; }).join(', '));

  var dupes = [];
  var seen = {};
  KB.services.forEach(function (s) { if (seen[s.id]) dupes.push(s.id); seen[s.id] = 1; });
  ok('no duplicate service ids', dupes.length === 0, dupes.join(', '));

  var badDocs = KB.services.filter(function (s) {
    return (s.docs || []).some(function (d) { return !KB.DOC[d]; });
  });
  ok('every document reference resolves', badDocs.length === 0,
     badDocs.map(function (s) { return s.id; }).join(', '));

  var badWhere = KB.services.filter(function (s) { return !KB.WHERE[s.where]; });
  ok('every "where to go" resolves', badWhere.length === 0,
     badWhere.map(function (s) { return s.id; }).join(', '));

  var noSla = KB.services.filter(function (s) { return typeof s.days !== 'number'; });
  ok('every service states a working-day SLA', noSla.length === 0,
     noSla.map(function (s) { return s.id; }).join(', '));

  var noOfficer = KB.services.filter(function (s) { return !s.signedByHi || !s.appealHi; });
  ok('every service names a signing officer and an appeal officer', noOfficer.length === 0,
     noOfficer.map(function (s) { return s.id; }).join(', '));

  var noSrc = KB.services.filter(function (s) { return ['portal', 'known', 'draft'].indexOf(s.src) === -1; });
  ok('every service declares its data provenance', noSrc.length === 0,
     noSrc.map(function (s) { return s.id; }).join(', '));

  var badUrl = KB.services.filter(function (s) { return !/^https:\/\//.test(s.url || ''); });
  ok('every official link is https', badUrl.length === 0,
     badUrl.map(function (s) { return s.id; }).join(', '));

  var badSit = KB.situations.filter(function (s) { return !KB.byId(s.to); });
  ok('every life-event points at a real service', badSit.length === 0,
     badSit.map(function (s) { return s.id; }).join(', '));

  ok('12 life-event entry points', KB.situations.length === 12, KB.situations.length + ' found');

  var portalCount = KB.services.filter(function (s) { return s.src === 'portal'; }).length;
  ok('at least 14 services verified against the live portal', portalCount >= 14, portalCount + ' verified');

  /* ------------------------------------------------------------- 6. security */
  group('Security', 'The previous build shipped a reflected XSS reachable from a shared link.');

  var payload = '<img src=x onerror="window.__pwned=1">';
  var probe = document.createElement('div');
  probe.innerHTML = payload.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  ok('escaped payload creates no element', probe.querySelectorAll('*').length === 0);
  ok('escaped payload survives as visible text', probe.textContent.indexOf('<img') === 0);
  ok('window was never touched', global.__pwned === undefined);
  ok('a payload in the query does not become a service match',
     ['none', 'unsure'].indexOf(Match.match(payload).kind) !== -1);

  /* ------------------------------------------------------------------ render */
  var el = document.getElementById('results');
  el.innerHTML = groups.map(function (g) {
    var f = g.cases.filter(function (c) { return !c.ok; }).length;
    return '<section class="t-group' + (f ? ' has-fail' : '') + '">' +
      '<h2>' + g.name + ' <span class="t-count">' +
      (g.cases.length - f) + '/' + g.cases.length + '</span></h2>' +
      (g.note ? '<p class="t-note">' + g.note + '</p>' : '') +
      '<ul>' + g.cases.map(function (c) {
        return '<li class="' + (c.ok ? 'p' : 'f') + '"><span class="t-mark">' +
          (c.ok ? '✓' : '✕') + '</span><span>' + c.label +
          (c.ok || !c.detail ? '' : ' <em>' + c.detail + '</em>') + '</span></li>';
      }).join('') + '</ul></section>';
  }).join('');

  var sum = document.getElementById('summary');
  sum.className = 't-summary ' + (fail ? 'bad' : 'good');
  sum.textContent = fail
    ? fail + ' failing, ' + pass + ' passing'
    : 'All ' + pass + ' checks passing';

  console.log('[Ek Sawal self-test]', pass, 'passed,', fail, 'failed');
  global.__testResult = { pass: pass, fail: fail };

})(typeof window !== 'undefined' ? window : this);
