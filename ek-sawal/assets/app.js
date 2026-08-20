/* =============================================================================
   app.js — एक सवाल · Ek Sawal

   A conversation, not a form. The citizen asks; a turn is appended; the answer
   builds in place. Same guarantees as before:

     1. No user text ever reaches innerHTML unescaped.       (audit A-01)
     2. Nothing is ever called "submitted" that was not.     (audit A-02)
     3. Voice accelerates, never gates. Every path works with a keyboard,
        a screen reader, and no microphone.                  (audit A-10)
     4. Every visible string comes from i18n.js.
   ============================================================================= */

(function (global) {
  'use strict';

  var KB = global.KB, Match = global.Match, I18N = global.I18N,
      Store = global.Store, Schedule = global.Schedule;

  /* Stamped into the footer so a stale tab is obvious at a glance. If this
     does not match the latest build, the page is cached — reload it. */
  var ES_BUILD = 'v1615';

  var S = { theme: 'light', listening: false, rec: null, current: null,
            asrFellBack: false, started: false, busy: false };

  /* ------------------------------------------------------------------ utils */

  /* The single most important function in this file. */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function T(k) { return I18N.s(k); }
  function $(id) { return document.getElementById(id); }

  /* Service content exists in Hindi and English only. Garhwali and Kumaoni
     readers read Devanagari, so they get Hindi. */
  function cl() { return I18N.contentLang(); }
  function C(o, base) { return cl() === 'en' ? o[base + 'En'] : o[base + 'Hi']; }
  function nm(o) { return cl() === 'en' ? o.en : o.hi; }

  /* ------------------------------------------------------------------ icons */
  var I = {
    logo:  '<svg viewBox="0 0 40 40" fill="none"><path d="M4 29 L13 13 L19 21 L26 9 L36 29 Z" fill="currentColor"/></svg>',
    doc:   '<svg viewBox="0 0 24 24"><path d="M9 3h7l4 4v13a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M15 3v5h5M11 12h6M11 16h6"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M4 12.5 9.5 18 20 6"/></svg>',
    tick:  '<svg viewBox="0 0 24 24"><path d="M5 12.5 10 17.5 19 7"/></svg>',
    info:  '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/></svg>',
    print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2"/><path d="M6 14h12v7H6z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
    out:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
    sun:   '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"/>',
    moon:  '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'
  };

  /* --------------------------------------------------------------- speaking */
  function say(text) {
    if (!('speechSynthesis' in window) || !text) return;
    try {
      speechSynthesis.cancel();
      var m = I18N.meta();
      var u = new SpeechSynthesisUtterance(
        String(text).replace(/₹\s*/g, cl() === 'en' ? 'rupees ' : 'रुपये '));
      /* With no installed voice for this language, Hindi beats the browser
         default, which would read Devanagari with an English voice. */
      var voices = speechSynthesis.getVoices() || [];
      var base = m.tts.split('-')[0];
      var has = voices.some(function (v) { return v.lang && v.lang.indexOf(base) === 0; });
      u.lang = has ? m.tts : (cl() === 'en' ? 'en-IN' : 'hi-IN');
      u.rate = 0.96;
      speechSynthesis.speak(u);
    } catch (e) { /* speech is optional; never block on it */ }
  }
  function hush() { try { speechSynthesis.cancel(); } catch (e) {} }

  /* -------------------------------------------------------------- listening */
  function initMic() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var btn = $('mic'), note = $('nomic');
    if (!SR) { if (btn) btn.hidden = true; if (note) note.hidden = false; return; }

    var r = new SR();
    r.continuous = false; r.interimResults = true;

    r.onstart = function () {
      S.listening = true; hush();
      btn.classList.add('on'); btn.setAttribute('aria-pressed', 'true');
      micState(S.asrFellBack ? T('micNoLang') : T('listening'));
    };
    r.onresult = function (e) {
      var txt = '';
      for (var i = e.resultIndex; i < e.results.length; i++) txt += e.results[i][0].transcript;
      micState('“' + txt + '”');
      if (e.results[0].isFinal) { $('q').value = txt; ask(txt); }
    };
    r.onerror = function (e) {
      stopMic();
      if (e.error === 'language-not-supported') {
        /* Garhwali and Kumaoni have no ASR model. Fall back to Hindi out loud
           rather than failing silently. */
        S.asrFellBack = true;
        micState(T('micNoLang'));
        try { S.rec.lang = 'hi-IN'; S.rec.start(); } catch (err) {}
        return;
      }
      micState(e.error === 'not-allowed' ? T('micDenied') : T('micUnclear'));
    };
    r.onend = function () { stopMic(); };
    S.rec = r;
  }
  function micState(m) { var el = $('micstate'); if (!el) return; el.textContent = m; el.hidden = !m; }
  function stopMic() {
    S.listening = false;
    var b = $('mic'); if (b) { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); }
  }
  function toggleMic() {
    if (!S.rec) return;
    if (S.listening) { S.rec.stop(); return; }
    S.asrFellBack = false;
    try { S.rec.lang = I18N.meta().asr; S.rec.start(); } catch (e) {}
  }

  /* ------------------------------------------------------------ conversation */
  function scrollDown() {
    var t = $('thread');
    requestAnimationFrame(function () { t.scrollTop = t.scrollHeight; });
  }

  function addTurn(userText) {
    if (!S.started) { S.started = true; $('hello').classList.add('gone'); }
    var turn = document.createElement('div');
    turn.className = 'turn';
    if (userText) {
      var you = document.createElement('div');
      you.className = 'you';
      you.textContent = userText;          /* textContent — never innerHTML */
      turn.appendChild(you);
    }
    var bot = document.createElement('div');
    bot.className = 'bot';
    bot.innerHTML = '<div class="bot-avatar" aria-hidden="true">' + I.logo + '</div>' +
                    '<div class="bot-body"><div class="think"><i></i><i></i><i></i></div></div>';
    turn.appendChild(bot);
    $('msgs').appendChild(turn);
    scrollDown();
    return bot.querySelector('.bot-body');
  }

  /* Land the answer after a beat so the thinking state is legible. A tiny,
     honest delay reads as considered; instant reads as canned. */
  function reply(slot, html, spoken) {
    setTimeout(function () {
      slot.innerHTML = '<div class="ans">' + html + '</div>';
      var i = 0;
      Array.prototype.forEach.call(slot.querySelectorAll('.ans > *'), function (el) {
        el.classList.add('d' + Math.min(++i, 14));
      });
      wire(slot);
      scrollDown();
      S.busy = false;
      if (spoken) say(spoken);
    }, 340);
  }

  function ask(query) {
    if (S.busy) return;
    var q = String(query == null ? '' : query).trim();
    if (!q) return;
    hush();
    S.busy = true;
    $('q').value = '';
    micState('');

    var slot = addTurn(q);
    var r = Match.match(q);

    switch (r.kind) {
      case 'greeting': return reply(slot, greetingHTML(), T('greeting'));
      case 'track':    return trackHTML(slot, r.id);
      case 'need-id':  return reply(slot, needIdHTML(), T('needIdHead') + '. ' + T('needIdBody'));
      case 'service':  return reply(slot, whyHTML(q, r) + serviceHTML(r.svc, r.situation, r.soft), spokenFor(r.svc, r.situation));
      case 'unsure':   return reply(slot, chooseHTML(r.options, false), T('chooseHead'));
      default:         return reply(slot, chooseHTML(
                          KB.situations.slice(0, 6).map(function (s) { return KB.byId(s.to); }), true),
                          T('unknownHead'));
    }
  }

  /* Ask on the citizen's behalf, with the question shown as if they typed it. */
  function askAs(text, svc, situation) {
    if (S.busy) return;
    hush(); S.busy = true;
    var slot = addTurn(text);
    /* Tapping a card is the path most people take, so it must show the
       reasoning strip too — otherwise the one thing that demonstrates the
       model is invisible exactly where it is seen most. */
    var pseudo = { svc: svc, situation: situation, rule: null };
    reply(slot, whyHTML(text, pseudo) + serviceHTML(svc, situation, false),
          spokenFor(svc, situation));
  }

  /* ------------------------------------------------------------------- HTML */

  function greetingHTML() {
    return '<div class="ans-head"><p class="ans-kicker">' + esc(T('greetHead')) + '</p></div>' +
           '<p class="plain">' + esc(T('greeting')) + '</p>';
  }

  function needIdHTML() {
    return '<div class="ans-head"><p class="ans-kicker">' + esc(T('status')) + '</p>' +
           '<h2 class="ans-title">' + esc(T('needIdHead')) + '</h2></div>' +
           '<p class="plain">' + esc(T('needIdBody')) + '</p>' +
           '<div class="note info"><b>' + I.info + '</b><span>' + esc(T('needIdNote')) + '</span></div>';
  }

  function trackHTML(slot, id) {
    /* No read connection to e-District, so we say exactly that. We never
       invent a status and never show somebody else's record. */
    reply(slot,
      '<div class="ans-head"><p class="ans-kicker">' + esc(T('status')) + '</p>' +
      '<h2 class="ans-title">' + esc(id) + '</h2></div>' +
      '<p class="plain">' + esc(T('trackBody')) + '</p>' +
      '<div class="acts"><a class="btn btn-go wide" target="_blank" rel="noopener noreferrer" ' +
      'href="https://eservices.uk.gov.in/">' + I.out + esc(T('openStatus')) + '</a></div>' +
      '<p class="src">' + esc(T('nothingGuessed')) + '</p>',
      id + '. ' + T('trackBody'));
    try { navigator.clipboard && navigator.clipboard.writeText(id); } catch (e) {}
  }

  function chooseHTML(options, unknown) {
    var head = unknown ? T('unknownHead') : T('chooseHead');
    var sub  = unknown ? T('unknownSub')  : T('chooseSub');
    return '<div class="ans-head"><p class="ans-kicker">' + esc(T('tellMore')) + '</p>' +
      '<h2 class="ans-title">' + esc(head) + '</h2><p class="ans-dept">' + esc(sub) + '</p></div>' +
      '<div class="picks">' + options.map(function (s) {
        return '<button type="button" class="starter" data-svc="' + esc(s.id) + '">' +
          '<span class="ico" aria-hidden="true">' + esc(s.icon) + '</span>' +
          '<span>' + esc(nm(s)) + '</span>' +
          '<span class="arw" aria-hidden="true">' + I.arrow + '</span></button>';
      }).join('') + '</div>';
  }

  function spokenFor(svc, situation) {
    var lead = situation ? (cl() === 'en' ? situation.sayEn : situation.sayHi) : C(svc, 'plain');
    var fee = svc.fee === 0 ? T('free') : (svc.fee == null ? T('ask') : '₹' + svc.fee);
    return nm(svc) + '. ' + lead + ' ' + T('cost') + ' ' + fee + '. ' + svc.days + ' ' + T('dayUnit') + '.';
  }

  function serviceHTML(svc, situation, soft) {
    var lead  = situation ? (cl() === 'en' ? situation.sayEn : situation.sayHi) : C(svc, 'plain');
    var where = KB.WHERE[svc.where] || KB.WHERE.csc;
    var free  = svc.fee === 0;
    var fee   = free ? T('free') : (svc.fee == null ? T('ask') : '₹' + svc.fee);
    S.current = svc;

    var docs = (svc.docs || []).map(function (id, i) {
      var d = KB.DOC[id];
      if (!d) return '';
      return '<li><label class="doc"><input type="checkbox" class="dchk" id="d' + i + '">' +
        '<span class="bx" aria-hidden="true">' + I.check + '</span>' +
        '<span class="nm">' + esc(nm(d)) + '</span>' +
        (d.digilocker ? '<span class="dl">DigiLocker</span>' : '') + '</label></li>';
    }).join('');

    var elig = C(svc, 'elig') || [];

    return (
      /* When the match was weak, say so and keep the exit visible. Quiet
         confidence about a guess sends people to the wrong counter. */
      (soft ? '<div class="soft"><b>?</b><span>' + esc(T('softNote')) + '</span></div>' : '') +

      '<div class="ans-head"><p class="ans-kicker">' + esc(T('eyebrow')) + '</p>' +
        '<h2 class="ans-title">' + esc(nm(svc)) + '</h2>' +
        '<p class="ans-dept">' + esc(C(svc, 'dept')) + '</p></div>' +

      '<div class="facts">' +
        '<div class="fact"><div class="k">' + esc(T('cost')) + '</div>' +
          '<div class="v' + (free ? ' free' : '') + '">' + esc(fee) + '</div>' +
          (free ? '<span class="tag">' + esc(T('noFees')) + '</span>' : '') + '</div>' +
        '<div class="fact"><div class="k">' + esc(T('days')) + '</div>' +
          '<div class="v">' + esc(String(svc.days)) + '<span class="u">' + esc(T('dayUnit')) + '</span></div>' +
          (svc.rts ? '<span class="tag">' + esc(T('guaranteed')) + '</span>' : '') + '</div>' +
        '<div class="fact"><div class="k">' + esc(T('whereToGo')) + '</div>' +
          '<div class="v sm">' + esc(nm(where)) + '</div></div>' +
      '</div>' +

      (svc.money ? '<div class="money"><span aria-hidden="true">🎁</span><b>' +
        esc(cl() === 'en' ? svc.money.en : svc.money.hi) + '</b></div>' : '') +

      '<div class="blk"><div class="blk-h"><span class="bdg" aria-hidden="true">' + I.info + '</span>' +
        '<h3>' + esc(T('plainWords')) + '</h3></div>' +
        '<p class="plain">' + esc(lead) + '</p></div>' +

      '<div class="blk"><div class="blk-h"><span class="bdg" aria-hidden="true">' + I.doc + '</span>' +
        '<div><h3>' + esc(T('docsRequired')) + '</h3>' +
        '<span class="n">' + (svc.docs || []).length + ' ' + esc(T('documents')) + '</span></div></div>' +
        '<ul class="docs">' + docs + '</ul>' +
        '<div class="prog" hidden></div>' +
        '<div class="note info"><b aria-hidden="true">📱</b><span>' + esc(T('digilocker')) + '</span></div></div>' +

      (elig.length ? '<div class="blk"><div class="blk-h"><span class="bdg" aria-hidden="true">' + I.tick +
        '</span><h3>' + esc(T('whoCanGet')) + '</h3></div><ul class="elig">' +
        elig.map(function (e) { return '<li>' + I.tick + '<span>' + esc(e) + '</span></li>'; }).join('') +
        '</ul></div>' : '') +

      '<div class="blk"><div class="blk-h"><span class="bdg" aria-hidden="true">' + I.tick + '</span>' +
        '<h3>' + esc(T('otherThings')) + '</h3></div><ul class="kv">' +
        '<li><span class="k">' + esc(T('whoSigns')) + '</span><span class="v">' + esc(C(svc, 'signedBy')) + '</span></li>' +
        '<li><span class="k">' + esc(T('ifLate')) + '</span><span class="v">' + esc(C(svc, 'appeal')) +
          ' — <em>' + esc(T('appealHere')) + '</em></span></li>' +
        '<li><span class="k">' + esc(T('howLongValid')) + '</span><span class="v">' + esc(C(svc, 'valid')) + '</span></li>' +
        '</ul>' +
        (svc.src !== 'portal' ? '<div class="note warn"><b>!</b><span>' + esc(T('srcWarn')) + '</span></div>' : '') +
      '</div>' +

      '<div class="acts">' +
        /* The whole point of the rebuild: apply here, not somewhere else. */
        '<button type="button" class="btn btn-go wide" data-apply="' + esc(svc.id) + '">' +
          I.check + esc(T('applyNow')) + '</button>' +
        (svc.phone ? '<a class="btn btn-q" href="tel:' + esc(svc.phone) + '">' + I.phone +
          esc(svc.phone) + '</a>' : '') +
        '<button type="button" class="btn btn-q" data-print>' + I.print + esc(T('printList')) + '</button>' +
        '<a class="btn btn-q' + (svc.phone ? ' wide' : '') + '" href="' + esc(svc.url) + '" target="_blank" rel="noopener noreferrer">' +
          I.out + esc(T('officialPortal')) + '</a>' +
      '</div>' +

      '<p class="src">' + esc(svc.src === 'portal' ? T('srcPortal') : T('srcKnown')) + '</p>' +
      '<p class="print-only src">' + esc(T('printFooter')) + '</p>'
    );
  }


  /* ------------------------------------------------------- reasoning trace
     Shows what the assistant actually understood before it answers. Today the
     reasons come from the deterministic matcher — an age rule fired, a keyword
     hit. When a language model is put behind this, the same strip carries its
     reasoning instead. Making the machine show its working is what separates a
     service a citizen can trust from one they simply have to believe. */
  function whyHTML(query, r) {
    var tags = [];
    var age = (String(query).match(/\b(\d{1,3})\b/) || [])[1];

    if (r.rule === 'age60' && age) tags.push({ t: age + (cl() === 'en' ? ' years' : ' वर्ष'), hit: true });
    if (r.rule === 'age60' || r.rule === 'elder') tags.push({ t: cl() === 'en' ? 'elderly person' : 'बुज़ुर्ग', hit: true });
    if (r.rule === 'girl12') tags.push({ t: cl() === 'en' ? 'girl · class 12' : 'बालिका · 12वीं', hit: true });
    if (r.situation) tags.push({ t: nm(r.situation).slice(0, 34), hit: false });
    tags.push({ t: C(r.svc, 'dept'), hit: false });
    if (r.soft) tags.push({ t: cl() === 'en' ? 'low confidence' : 'पक्का नहीं', hit: true });

    return '<div class="why"><span class="why-k">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M12 3v3M5.6 5.6l2.1 2.1M3 12h3M18 12h3M16.3 7.7l2.1-2.1"/><path d="M9 18h6M10 21h4"/>' +
      '<path d="M12 9a3 3 0 0 1 3 3c0 1.3-.8 2-1.5 2.7V18h-3v-3.3C9.8 14 9 13.3 9 12a3 3 0 0 1 3-3z"/></svg>' +
      esc(T('aiRead')) + '</span>' +
      tags.map(function (x, i) {
        return '<span class="why-t' + (x.hit ? ' hit' : '') + ' d' + Math.min(i + 1, 14) + '">' + esc(x.t) + '</span>';
      }).join('') + '</div>';
  }

  /* --------------------------------------------------------- applications */
  function refreshApps() {
    var n = Store.count(), b = $('appsbtn');
    if (!b) return;
    b.hidden = n === 0;
    $('appscount').textContent = String(n);
    b.setAttribute('aria-label', T('myApps'));
  }

  function showApps() {
    var apps = Store.all();
    if (!apps.length) return;
    if (S.busy) return;
    hush(); S.busy = true;
    var slot = addTurn(T('myApps'));
    reply(slot,
      '<div class="ans-head"><p class="ans-kicker">' + esc(T('myApps')) + '</p>' +
      '<h2 class="ans-title">' + apps.length + '</h2></div>' +
      '<div class="apps">' + apps.map(function (a) {
        var svc = KB.byId(a.svcId);
        var due = new Date(a.dueBy);
        return '<div class="app-card"><span class="ac-i" aria-hidden="true">' +
          esc(svc ? svc.icon : '📄') + '</span>' +
          '<span class="ac-t"><b>' + esc(cl() === 'en' ? a.svcEn : a.svcHi) + '</b>' +
          '<i>' + esc(a.ref) + '</i></span>' +
          '<span class="ac-d"><b>' + esc(Schedule.format(due, cl())) + '</b>' +
          '<i>' + esc(T('rvBy')) + '</i></span></div>';
      }).join('') + '</div>' +
      '<div class="note warn"><b>!</b><span>' + esc(T('rvDemo')) + '</span></div>',
      T('myApps'));
  }

  /* ------------------------------------------------------------------ wiring */
  function wire(scope) {
    var root = scope || document;

    Array.prototype.forEach.call(root.querySelectorAll('[data-print]'), function (b) {
      b.addEventListener('click', function () { hush(); window.print(); });
    });

    Array.prototype.forEach.call(root.querySelectorAll('[data-svc]'), function (b) {
      b.addEventListener('click', function () {
        var s = KB.byId(this.getAttribute('data-svc'));
        if (s) askAs(nm(s), s, null);
      });
    });

    Array.prototype.forEach.call(root.querySelectorAll('[data-apply]'), function (b) {
      b.addEventListener('click', function () {
        var s = KB.byId(this.getAttribute('data-apply'));
        if (s && global.Flow) global.Flow.start(s);
      });
    });

    Array.prototype.forEach.call(root.querySelectorAll('.dchk'), function (c) {
      c.addEventListener('change', function () { progress(this.closest('.blk')); });
    });
  }

  function progress(blk) {
    if (!blk) return;
    var boxes = blk.querySelectorAll('.dchk'), el = blk.querySelector('.prog');
    if (!el || !boxes.length) return;
    var done = blk.querySelectorAll('.dchk:checked').length;
    if (!done) { el.hidden = true; return; }
    el.hidden = false;
    el.textContent = done === boxes.length
      ? T('readyAll') : done + ' / ' + boxes.length + ' ' + T('readyN');
  }

  /* ------------------------------------------------------------- starters */
  function renderStarters() {
    var g = $('sits');
    if (!g) return;
    g.innerHTML = KB.situations.map(function (s, i) {
      return '<button type="button" class="starter rise d' + Math.min(i + 6, 14) +
        '" data-sit="' + esc(s.id) + '">' +
        '<span class="ico" aria-hidden="true">' + esc(s.icon) + '</span>' +
        '<span>' + esc(nm(s)) + '</span>' +
        '<span class="arw" aria-hidden="true">' + I.arrow + '</span></button>';
    }).join('');
    Array.prototype.forEach.call(g.querySelectorAll('[data-sit]'), function (b) {
      b.addEventListener('click', function () {
        var id = this.getAttribute('data-sit');
        var sit = KB.situations.filter(function (x) { return x.id === id; })[0];
        if (sit) askAs(nm(sit), KB.byId(sit.to), sit);
      });
    });
  }

  /* -------------------------------------------------------- language picker */
  function openSheet() {
    var box = $('lang-list');
    box.innerHTML = I18N.langs.map(function (l) {
      var on = l.code === I18N.get();
      var note = l.tier === 2 ? (cl() === 'en' ? 'spoken' : 'बोलकर') : '';
      return '<button type="button" class="langopt' + (on ? ' on' : '') + '" data-lang="' +
        esc(l.code) + '" aria-pressed="' + on + '"><span class="ln">' + esc(l.name) + '</span>' +
        '<span class="le">' + esc(l.en) + (note ? ' · ' + esc(note) : '') + '</span></button>';
    }).join('');
    Array.prototype.forEach.call(box.querySelectorAll('[data-lang]'), function (b) {
      b.addEventListener('click', function () { setLang(this.getAttribute('data-lang')); closeSheet(); });
    });
    $('sheet').hidden = false;
    document.body.classList.add('locked');
    $('sheet-close').focus();
  }
  function closeSheet() {
    $('sheet').hidden = true;
    document.body.classList.remove('locked');
    $('langbtn').focus();
  }
  function setLang(code) {
    if (code === I18N.get()) return;
    hush(); I18N.set(code);
    try { localStorage.setItem('es_lang', code); } catch (e) {}
    applyLang();
  }

  /* ------------------------------------------------------------------ chrome */
  function applyLang() {
    var m = I18N.meta();
    document.documentElement.lang = m.code;
    document.documentElement.dir = m.dir;

    ['eyebrow', 'h1', 'sub', 'sitsub', 'nomic', 'f2'].forEach(function (k) {
      var el = $(k); if (el) el.textContent = T(k);
    });
    var vb = $('es-build'); if (vb) vb.textContent = ES_BUILD;
    $('brand1').textContent = T('b1');
    $('brand2').textContent = T('b2');
    $('q').placeholder = T('ph');
    $('q').setAttribute('aria-label', T('ph'));
    $('mic').setAttribute('aria-label', T('mic'));
    $('go').setAttribute('aria-label', T('go'));
    $('proto1').textContent = T('proto1');
    $('proto2').textContent = T('proto2');
    $('langbtn').setAttribute('aria-label', T('langPick'));
    $('langcode').textContent = m.name;
    $('sheet-title').textContent = T('langPick');
    $('sheet-close').setAttribute('aria-label', T('close'));

    var dw = $('draftwarn');
    dw.hidden = !I18N.isDraft(m.code);
    if (!dw.hidden) dw.textContent = T('draftWarn');

    renderStarters();
    /* Re-render the last answer so a mid-conversation language switch applies. */
    if (S.current && S.started) {
      var last = $('msgs').querySelector('.turn:last-child .bot-body');
      if (last && last.querySelector('.ans')) {
        last.innerHTML = '<div class="ans">' + serviceHTML(S.current, null, false) + '</div>';
        wire(last);
      }
    }
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', S.theme);
    var dark = S.theme === 'dark';
    $('theme-ico').innerHTML = dark ? I.sun : I.moon;
    $('theme').setAttribute('aria-label', dark ? 'Light mode' : 'Dark mode');
  }

  function initChrome() {
    try {
      var sz = localStorage.getItem('es_size');
      if (sz) document.documentElement.setAttribute('data-size', sz);
      var lg = localStorage.getItem('es_lang'); if (lg) I18N.set(lg);
      var th = localStorage.getItem('es_theme');
      if (th === 'dark' || th === 'light') S.theme = th;
      else if (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) S.theme = 'dark';
    } catch (e) {}

    $('langbtn').addEventListener('click', openSheet);
    $('sheet-close').addEventListener('click', closeSheet);
    $('sheet').addEventListener('click', function (e) { if (e.target === this) closeSheet(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !$('sheet').hidden) closeSheet();
    });

    $('theme').addEventListener('click', function () {
      S.theme = S.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('es_theme', S.theme); } catch (e) {}
      applyTheme();
    });

    $('go').addEventListener('click', function () { ask($('q').value); });
    $('q').addEventListener('keydown', function (e) { if (e.key === 'Enter') ask(this.value); });
    $('mic').addEventListener('click', toggleMic);
    $('appsbtn').addEventListener('click', showApps);

    function net() {
      var b = $('offline'); if (!b) return;
      b.hidden = navigator.onLine !== false;
      if (!b.hidden) b.textContent = T('offline');
    }
    window.addEventListener('online', net);
    window.addEventListener('offline', net);
    net();
  }

  /* -------------------------------------------------------------------- boot */
  function boot() {
    initChrome();
    applyTheme();
    initMic();
    applyLang();
    refreshApps();

    /* A shared link may carry a question. It is escaped on the way out, so a
       payload here renders as visible text and nothing more. */
    var p = new URLSearchParams(location.search);
    var lg = p.get('lang'); if (lg) { I18N.set(lg); applyLang(); }
    var q = p.get('q'); if (q) ask(q);

    /* Offline caching in production only.
         file://   a single-file build has nothing to register against
         localhost a stale worker serves yesterday's JavaScript to today's
                   developer, which costs more hours than it saves
       Any worker left from an earlier session is cleared, so neither a dev
       machine nor a downloaded copy can get stuck on an old build. */
    var servedOverHttp = /^https?:$/.test(location.protocol);
    var isLocal = /^(localhost|127[.]0[.]0[.]1|\[::1\])$/.test(location.hostname);
    if ('serviceWorker' in navigator) {
      if (servedOverHttp && !isLocal) {
        navigator.serviceWorker.register('sw.js').catch(function () {});
      } else {
        navigator.serviceWorker.getRegistrations().then(function (rs) {
          rs.forEach(function (r) { r.unregister(); });
        }).catch(function () {});
      }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  global.EkSawal = { ask: ask, esc: esc, state: S, setLang: setLang, refreshApps: refreshApps };

})(typeof window !== 'undefined' ? window : this);
