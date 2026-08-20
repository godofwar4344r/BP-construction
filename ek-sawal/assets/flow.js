/* =============================================================================
   flow.js — the application itself, in one place

   This is the part the earlier build refused to do. It used to end with
   "go to the official portal"; now the citizen stays here:

     1  DigiLocker   connect once, and most of the form is already answered
     2  Details      only what the state does not already know, validated
     3  Documents    ticked automatically from the locker, rest listed
     4  Visit        pick the day and time for the in-person step
     5  Review       everything on one screen before anything is committed
     ✓  Saved        a reference, a timeline, and a date to turn up

   THE HONESTY LINE, and it is not negotiable: nothing here is filed with any
   government office. Every reference begins DEMO-, every receipt says so on
   its face, and the print sheet repeats it. The previous build printed
   "✅ SUBMITTED" over a random number and told the citizen to wait — a person
   would have sat out the fifteen-day statutory clock on an application that
   never existed. The whole journey is worth building; the lie is not.
   ============================================================================= */

(function (global) {
  'use strict';

  var KB = global.KB, I18N = global.I18N, Match = global.Match,
      FORMS = global.FORMS, Locker = global.Locker,
      Store = global.Store, Schedule = global.Schedule;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function T(k) { return I18N.s(k); }
  function $(id) { return document.getElementById(id); }
  function cl() { return I18N.contentLang(); }
  function nm(o) { return cl() === 'en' ? o.en : o.hi; }
  function C(o, b) { return cl() === 'en' ? o[b + 'En'] : o[b + 'Hi']; }
  function L(o, key) { return cl() === 'en' ? (o[key + 'En'] || o[key]) : (o[key + 'Hi'] || o[key]); }

  var ICO = {
    lock:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5 9.5 18 20 6"/></svg>',
    cal:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    user:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    doc:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h7l4 4v13a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M15 3v5h5"/></svg>',
    eye:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    back:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
    fwd:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
    x:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2"/><path d="M6 14h12v7H6z"/></svg>',
    mic:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5"/></svg>'
  };

  /* --------------------------------------------------------------- session */
  var F = null;   /* { svc, fields, values, filled, step, date, slot } */

  var STEPS = ['locker', 'details', 'docs', 'visit', 'review'];

  function stepLabel(k) {
    return { locker: T('stLocker'), details: T('stDetails'), docs: T('stDocs'),
             visit: T('stVisit'), review: T('stReview') }[k];
  }

  /* ------------------------------------------------------------------ open */
  function start(svc) {
    F = {
      svc: svc,
      fields: FORMS.fieldsFor(svc.id),
      values: {},
      filled: {},          /* fieldId -> true when DigiLocker supplied it */
      step: Locker.connected() ? 1 : 0,
      date: null, slot: null,
      errors: {}
    };
    if (Locker.connected()) autofill();
    $('flow').hidden = false;
    document.body.classList.add('locked');
    render();
    $('flow').scrollTop = 0;
  }

  function close() {
    $('flow').hidden = true;
    document.body.classList.remove('locked');
    F = null;
  }

  function autofill() {
    var p = Locker.profile(cl());
    F.fields.forEach(function (f) {
      if (f.from && p[f.from]) {
        F.values[f.id] = p[f.from].value;
        F.filled[f.id] = p[f.from].masked;
      }
    });
  }

  /* ---------------------------------------------------------------- render */
  function render() {
    var k = STEPS[F.step];
    var body =
      k === 'locker'  ? viewLocker()  :
      k === 'details' ? viewDetails() :
      k === 'docs'    ? viewDocs()    :
      k === 'visit'   ? viewVisit()   : viewReview();

    $('flow').innerHTML =
      '<div class="fl-wrap">' +
        '<div class="fl-bar">' +
          '<button type="button" class="chip chip-sq" id="fl-close" aria-label="' + esc(T('close')) + '">' + ICO.x + '</button>' +
          '<div class="fl-title"><b>' + esc(nm(F.svc)) + '</b><i>' + esc(C(F.svc, 'dept')) + '</i></div>' +
        '</div>' +
        steps() +
        '<div class="fl-body">' + body + '</div>' +
      '</div>';

    $('fl-close').addEventListener('click', function () {
      if (F.step > 0 && F.step < 4) saveDraftQuiet();
      close();
      global.EkSawal && global.EkSawal.refreshApps && global.EkSawal.refreshApps();
    });
    wire(k);
    $('flow').scrollTop = 0;
  }

  function steps() {
    return '<ol class="fl-steps">' + STEPS.map(function (k, i) {
      var cls = i < F.step ? 'done' : (i === F.step ? 'now' : '');
      return '<li class="' + cls + '"><span class="dot">' +
        (i < F.step ? ICO.check : String(i + 1)) + '</span>' +
        '<span class="lb">' + esc(stepLabel(k)) + '</span></li>';
    }).join('') + '</ol>';
  }

  function nav(backLabel, nextLabel, nextId, disabled) {
    return '<div class="fl-nav">' +
      (F.step > 0 ? '<button type="button" class="btn btn-q" id="fl-back">' + ICO.back +
        esc(backLabel || T('back')) + '</button>' : '<span></span>') +
      '<button type="button" class="btn btn-go" id="' + (nextId || 'fl-next') + '"' +
        (disabled ? ' disabled' : '') + '>' + esc(nextLabel) + ICO.fwd + '</button>' +
    '</div>';
  }

  /* ------------------------------------------------------ 1 · DigiLocker */
  function viewLocker() {
    var total = F.fields.length;
    var can = FORMS.autoFillable(F.svc.id);
    var cov = Locker.coverage(F.svc.docs);

    if (!Locker.connected()) {
      return '<div class="fl-hero">' +
        '<span class="fl-ico">' + ICO.lock + '</span>' +
        '<h2>' + esc(T('lkTitle')) + '</h2>' +
        '<p>' + esc(T('lkBody')) + '</p>' +
        '<div class="fl-stat"><b>' + can + ' / ' + total + '</b><span>' + esc(T('lkFills')) + '</span></div>' +
        '<div class="note warn"><b>!</b><span>' + esc(T('lkDemo')) + '</span></div>' +
        '<div class="fl-nav one">' +
          '<button type="button" class="btn btn-go" id="fl-connect">' + ICO.lock + esc(T('lkConnect')) + '</button>' +
          '<button type="button" class="btn btn-q" id="fl-skip">' + esc(T('lkSkip')) + '</button>' +
        '</div></div>';
    }

    return '<div class="fl-hero">' +
      '<span class="fl-ico ok">' + ICO.check + '</span>' +
      '<h2>' + esc(T('lkOn')) + '</h2>' +
      '<p>' + esc(Locker.demoName(cl())) + '</p>' +
      '<div class="fl-stat"><b>' + can + ' / ' + total + '</b><span>' + esc(T('lkFilled')) + '</span></div>' +
      '</div>' +
      '<h3 class="fl-h3">' + esc(T('lkDocs')) + '</h3>' +
      '<ul class="vault">' + Locker.issued().map(function (d) {
        var need = (F.svc.docs || []).indexOf(d.doc) !== -1;
        return '<li class="' + (need ? 'need' : '') + '">' +
          '<span class="vk">' + ICO.doc + '</span>' +
          '<span class="vn"><b>' + esc(cl() === 'en' ? d.en : d.hi) + '</b><i>' + esc(d.issuer) + ' · ' + esc(d.no) + '</i></span>' +
          (need ? '<span class="vt">' + ICO.check + '</span>' : '') + '</li>';
      }).join('') + '</ul>' +
      (cov.missing.length ? '<div class="note info"><b>' + ICO.doc + '</b><span>' +
        esc(T('lkMissing')) + ' ' + esc(cov.missing.map(function (id) {
          return nm(KB.DOC[id]); }).join(', ')) + '</span></div>' : '') +
      nav(null, T('next'));
  }

  /* --------------------------------------------------------- 2 · details */
  function viewDetails() {
    return '<h2 class="fl-h2">' + esc(T('stDetails')) + '</h2>' +
      '<p class="fl-lead">' + esc(Locker.connected() ? T('dtLeadOn') : T('dtLeadOff')) + '</p>' +
      '<div class="form">' + F.fields.map(field).join('') + '</div>' +
      nav(null, T('next'));
  }

  function field(f) {
    var v = F.values[f.id] || '';
    var auto = !!F.filled[f.id];
    var err = F.errors[f.id];
    var shown = (auto && f.mask) ? F.filled[f.id] : v;
    var id = 'ff-' + f.id;

    var input;
    if (f.type === 'choice') {
      input = '<div class="chips">' + f.choices.map(function (c) {
        return '<button type="button" class="pick' + (v === c.v ? ' on' : '') +
          '" data-f="' + esc(f.id) + '" data-v="' + esc(c.v) + '">' + esc(nm(c)) + '</button>';
      }).join('') + '</div>';
    } else if (f.type === 'select') {
      var opts = cl() === 'en' ? f.optionsEn : f.options;
      input = '<select class="in" id="' + id + '" data-f="' + esc(f.id) + '">' +
        '<option value="">' + esc(T('choose')) + '</option>' +
        opts.map(function (o) {
          return '<option value="' + esc(o) + '"' + (v === o ? ' selected' : '') + '>' + esc(o) + '</option>';
        }).join('') + '</select>';
    } else if (f.type === 'textarea') {
      input = '<textarea class="in" id="' + id + '" rows="3" data-f="' + esc(f.id) + '">' + esc(v) + '</textarea>';
    } else {
      input = '<input class="in" id="' + id + '" type="' + (f.type === 'date' ? 'date' : 'text') +
        '" inputmode="' + (f.type === 'tel' ? 'numeric' : 'text') +
        '" data-f="' + esc(f.id) + '" value="' + esc(shown) + '"' + (auto && f.mask ? ' readonly' : '') + '>';
    }

    return '<div class="fg' + (err ? ' bad' : '') + (auto ? ' auto' : '') + '">' +
      '<label for="' + id + '">' + esc(L(f, '')) +
        (f.req ? '<i class="rq">*</i>' : '') +
        (auto ? '<span class="from">' + ICO.check + esc(T('fromLocker')) + '</span>' : '') +
      '</label>' +
      input +
      (f.hintHi || f.hintEn ? '<p class="hint">' + esc(L(f, 'hint')) + '</p>' : '') +
      (err ? '<p class="err">' + esc(err) + '</p>' : '') +
      (auto && f.mask ? '<button type="button" class="edit" data-edit="' + esc(f.id) + '">' + esc(T('changeIt')) + '</button>' : '') +
      (f.askHi && !auto ? '<button type="button" class="fmic" data-mic="' + esc(f.id) + '" aria-label="' + esc(T('mic')) + '">' + ICO.mic + '</button>' : '') +
    '</div>';
  }

  function collect() {
    F.errors = {};
    F.fields.forEach(function (f) {
      var el = $('ff-' + f.id);
      if (el && !(F.filled[f.id] && f.mask)) F.values[f.id] = el.value.trim();
      var v = F.values[f.id] || '';

      if (f.req && !v) { F.errors[f.id] = T('required'); return; }
      if (v && f.validate) {
        var r = Match.validate(f.validate, v);
        if (!r.ok) F.errors[f.id] = cl() === 'en' ? r.reasonEn : r.reasonHi;
        else F.values[f.id] = r.value;
      }
    });
    return Object.keys(F.errors).length === 0;
  }

  /* ------------------------------------------------------- 3 · documents */
  function viewDocs() {
    var cov = Locker.coverage(F.svc.docs);
    return '<h2 class="fl-h2">' + esc(T('stDocs')) + '</h2>' +
      '<p class="fl-lead">' + esc(T('dcLead')) + '</p>' +
      '<ul class="docs">' + (F.svc.docs || []).map(function (id) {
        var d = KB.DOC[id];
        var have = cov.have[id];
        return '<li class="doc ' + (have ? 'have' : 'bring') + '">' +
          '<span class="bx' + (have ? ' on' : '') + '" aria-hidden="true">' + (have ? ICO.check : '') + '</span>' +
          '<span class="nm">' + esc(nm(d)) +
            '<i>' + esc(have ? T('dcHave') : T('dcBring')) + '</i></span>' +
          (d.digilocker && !have ? '<span class="dl">DigiLocker</span>' : '') + '</li>';
      }).join('') + '</ul>' +
      (cov.missing.length
        ? '<div class="note warn"><b>!</b><span>' + esc(T('dcCarry')) + '</span></div>'
        : '<div class="note good"><b>' + ICO.check + '</b><span>' + esc(T('dcAll')) + '</span></div>') +
      nav(null, T('next'));
  }

  /* ----------------------------------------------------------- 4 · visit */
  function viewVisit() {
    var where = KB.WHERE[F.svc.where] || KB.WHERE.csc;
    var days = Schedule.days(8);
    if (!F.date) F.date = Schedule.iso(days[0]);

    var chosen = days.filter(function (d) { return Schedule.iso(d) === F.date; })[0] || days[0];
    var slots = Schedule.slotsFor(chosen);

    return '<h2 class="fl-h2">' + esc(T('stVisit')) + '</h2>' +
      '<p class="fl-lead">' + esc(T('vsLead')) + ' <b>' + esc(nm(where)) + '</b></p>' +
      '<div class="days">' + days.map(function (d) {
        var iso = Schedule.iso(d);
        return '<button type="button" class="day' + (iso === F.date ? ' on' : '') + '" data-day="' + iso + '">' +
          '<b>' + esc(Schedule.format(d, cl())) + '</b></button>';
      }).join('') + '</div>' +
      '<h3 class="fl-h3">' + esc(T('vsTime')) + '</h3>' +
      '<div class="slots">' + slots.map(function (s) {
        return '<button type="button" class="slot' + (F.slot === s.time.v ? ' on' : '') +
          (s.free ? '' : ' full') + '" data-slot="' + esc(s.time.v) + '"' + (s.free ? '' : ' disabled') + '>' +
          esc(nm(s.time)) + (s.free ? '' : '<i>' + esc(T('vsFull')) + '</i>') + '</button>';
      }).join('') + '</div>' +
      '<div class="note info"><b>' + ICO.cal + '</b><span>' + esc(T('vsNote')) + '</span></div>' +
      nav(null, T('next'), 'fl-next', !F.slot);
  }

  /* ---------------------------------------------------------- 5 · review */
  function viewReview() {
    var where = KB.WHERE[F.svc.where] || KB.WHERE.csc;
    var by = Store.addWorkingDays(new Date(), F.svc.days);
    var rows = F.fields.filter(function (f) { return F.values[f.id]; }).map(function (f) {
      var val = (f.mask && F.filled[f.id]) ? F.filled[f.id]
              : (f.mask ? '•'.repeat(Math.max(0, String(F.values[f.id]).length - 4)) + String(F.values[f.id]).slice(-4)
              : F.values[f.id]);
      return '<li><span class="k">' + esc(L(f, '')) + '</span><span class="v">' + esc(val) + '</span></li>';
    }).join('');

    return '<h2 class="fl-h2">' + esc(T('stReview')) + '</h2>' +
      '<p class="fl-lead">' + esc(T('rvLead')) + '</p>' +
      '<ul class="kv boxed">' + rows + '</ul>' +
      '<h3 class="fl-h3">' + esc(T('rvVisit')) + '</h3>' +
      '<div class="rv-visit"><span>' + ICO.cal + '</span><div><b>' +
        esc(prettyDate()) + ' · ' + esc(F.slot) + '</b><i>' + esc(nm(where)) + '</i></div></div>' +
      '<div class="rv-sla"><span>' + esc(T('rvBy')) + '</span><b>' +
        esc(Schedule.format(by, cl())) + '</b><i>' + esc(F.svc.days + ' ' + T('dayUnit')) + '</i></div>' +
      '<div class="note warn big"><b>!</b><span>' + esc(T('rvDemo')) + '</span></div>' +
      '<div class="fl-nav">' +
        '<button type="button" class="btn btn-q" id="fl-back">' + ICO.back + esc(T('back')) + '</button>' +
        '<button type="button" class="btn btn-go" id="fl-save">' + ICO.check + esc(T('rvSave')) + '</button>' +
      '</div>';
  }

  function prettyDate() {
    var d = new Date(F.date + 'T00:00:00');
    return Schedule.format(d, cl());
  }

  /* ----------------------------------------------------------- committed */
  function saveDraftQuiet() {
    Store.saveDraft({ svcId: F.svc.id, values: F.values, filled: F.filled, step: F.step });
  }

  function commit() {
    var where = KB.WHERE[F.svc.where] || KB.WHERE.csc;
    var app = Store.add({
      svcId: F.svc.id,
      svcHi: F.svc.hi, svcEn: F.svc.en,
      deptHi: F.svc.deptHi, deptEn: F.svc.deptEn,
      values: F.values,
      masked: F.filled,
      visitDate: F.date, visitSlot: F.slot,
      whereHi: where.hi, whereEn: where.en,
      days: F.svc.days,
      dueBy: Store.addWorkingDays(new Date(), F.svc.days).toISOString(),
      url: F.svc.url
    });
    Store.clearDraft();

    $('flow').innerHTML =
      '<div class="fl-wrap"><div class="fl-bar">' +
      '<button type="button" class="chip chip-sq" id="fl-close" aria-label="' + esc(T('close')) + '">' + ICO.x + '</button>' +
      '<div class="fl-title"><b>' + esc(T('dnTitle')) + '</b></div></div>' +
      '<div class="fl-body"><div class="done">' +
        '<span class="done-ico">' + ICO.check + '</span>' +
        '<h2>' + esc(T('dnHead')) + '</h2>' +
        '<p class="ref">' + esc(app.ref) + '</p>' +
        '<div class="note warn big"><b>!</b><span>' + esc(T('dnDemo')) + '</span></div>' +
        '<ul class="tl">' +
          '<li class="on"><b>' + esc(T('tl1')) + '</b><i>' + esc(Schedule.format(new Date(), cl())) + '</i></li>' +
          '<li><b>' + esc(T('tl2')) + '</b><i>' + esc(prettyDate()) + ' · ' + esc(F.slot) + '</i></li>' +
          '<li><b>' + esc(T('tl3')) + '</b><i>' + esc(Schedule.format(new Date(app.dueBy), cl())) + '</i></li>' +
        '</ul>' +
        '<div class="acts">' +
          '<button type="button" class="btn btn-go" data-print>' + ICO.print + esc(T('printList')) + '</button>' +
          '<a class="btn btn-q" href="' + esc(F.svc.url) + '" target="_blank" rel="noopener noreferrer">' +
            esc(T('dnReal')) + '</a>' +
          '<button type="button" class="btn btn-q wide" id="fl-done">' + esc(T('dnClose')) + '</button>' +
        '</div>' +
      '</div></div></div>';

    $('fl-close').addEventListener('click', finish);
    $('fl-done').addEventListener('click', finish);
    var p = $('flow').querySelector('[data-print]');
    if (p) p.addEventListener('click', function () { window.print(); });
  }

  function finish() {
    close();
    global.EkSawal && global.EkSawal.refreshApps && global.EkSawal.refreshApps();
  }

  /* -------------------------------------------------------------- wiring */
  function wire(k) {
    var b = $('fl-back');
    if (b) b.addEventListener('click', function () { F.step--; render(); });

    var n = $('fl-next');
    if (n) n.addEventListener('click', function () {
      if (k === 'details' && !collect()) { render(); focusFirstError(); return; }
      if (k === 'details') saveDraftQuiet();
      F.step++; render();
    });

    var c = $('fl-connect');
    if (c) c.addEventListener('click', function () {
      this.disabled = true;
      this.innerHTML = '<span class="spin" aria-hidden="true"></span>' + esc(T('lkWait'));
      Locker.connect(function () { autofill(); render(); });
    });

    var s = $('fl-skip');
    if (s) s.addEventListener('click', function () { F.step = 1; render(); });

    var sv = $('fl-save');
    if (sv) sv.addEventListener('click', commit);

    /* choice chips */
    Array.prototype.forEach.call($('flow').querySelectorAll('[data-f][data-v]'), function (el) {
      el.addEventListener('click', function () {
        F.values[this.getAttribute('data-f')] = this.getAttribute('data-v');
        render();
      });
    });

    /* unlock a locker-filled field so it can be corrected */
    Array.prototype.forEach.call($('flow').querySelectorAll('[data-edit]'), function (el) {
      el.addEventListener('click', function () {
        var id = this.getAttribute('data-edit');
        delete F.filled[id];
        F.values[id] = '';
        render();
        var f = $('ff-' + id); if (f) f.focus();
      });
    });

    /* per-field dictation */
    Array.prototype.forEach.call($('flow').querySelectorAll('[data-mic]'), function (el) {
      el.addEventListener('click', function () { dictate(this.getAttribute('data-mic')); });
    });

    /* day / slot */
    Array.prototype.forEach.call($('flow').querySelectorAll('[data-day]'), function (el) {
      el.addEventListener('click', function () { F.date = this.getAttribute('data-day'); F.slot = null; render(); });
    });
    Array.prototype.forEach.call($('flow').querySelectorAll('[data-slot]'), function (el) {
      el.addEventListener('click', function () { F.slot = this.getAttribute('data-slot'); render(); });
    });

    /* keep typed values across re-renders */
    Array.prototype.forEach.call($('flow').querySelectorAll('.in[data-f]'), function (el) {
      el.addEventListener('input', function () { F.values[this.getAttribute('data-f')] = this.value; });
    });
  }

  function focusFirstError() {
    var first = $('flow').querySelector('.fg.bad .in');
    if (first) { first.focus(); first.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  }

  /* Dictate one field: speak the prompt, listen, validate, write it back. */
  function dictate(fieldId) {
    var f = F.fields.filter(function (x) { return x.id === fieldId; })[0];
    if (!f) return;
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    var el = $('ff-' + fieldId);
    var btn = $('flow').querySelector('[data-mic="' + fieldId + '"]');
    if (btn) btn.classList.add('on');

    try {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(L(f, 'ask'));
        u.lang = I18N.meta().tts; u.rate = .96;
        speechSynthesis.speak(u);
      }
    } catch (e) {}

    var r = new SR();
    r.lang = I18N.meta().asr;
    r.interimResults = false;
    r.onresult = function (e) {
      var txt = e.results[0][0].transcript;
      /* Spoken digits become digits, and a bad number is rejected out loud
         rather than stored as words. */
      if (f.validate) {
        var v = Match.validate(f.validate, txt);
        if (!v.ok) { F.errors[fieldId] = cl() === 'en' ? v.reasonEn : v.reasonHi; render(); return; }
        F.values[fieldId] = v.value;
      } else {
        F.values[fieldId] = txt.trim();
      }
      delete F.errors[fieldId];
      render();
    };
    r.onerror = function () { if (btn) btn.classList.remove('on'); };
    r.onend = function () { if (btn) btn.classList.remove('on'); };
    try { r.start(); } catch (e) { if (btn) btn.classList.remove('on'); }
  }

  global.Flow = { start: start, close: close, open: function () { return !!F; } };

})(typeof window !== 'undefined' ? window : this);
