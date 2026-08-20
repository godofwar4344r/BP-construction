/* ==========================================================================
   agent.js — the dialogue manager.

   A deterministic state machine. Every turn is: hear text → interpret it in
   the current state → update the form → say the next thing. Because the
   states are explicit, an officer reviewing this can see exactly what the
   assistant will do in every situation, which is what makes it defensible
   for a government deployment.

   States
     idle          waiting for the citizen to name a service
     confirmSvc    "you want an income certificate, correct?"
     fetching      pulling documents from DigiLocker
     field         asking for one specific value
     confirmField  reading a value back for confirmation (numbers only)
     review        reading the summary back before submission
     done          submitted
   ========================================================================== */

(function (global) {
  'use strict';

  var Agent = {
    state: 'idle',
    service: null,
    values: {},
    sources: {},          // fieldId -> 'voice' | 'digilocker'
    fieldIndex: 0,
    pendingValue: null,
    lastPrompt: '',
    autoListen: true,
    lockerResult: null,
    _handlers: {},

    /* ---------------------------------------------------------------- events */

    on: function (evt, fn) {
      (this._handlers[evt] = this._handlers[evt] || []).push(fn);
      return this;
    },

    _emit: function (evt, payload) {
      (this._handlers[evt] || []).forEach(function (fn) {
        try { fn(payload); } catch (e) { console.error('[agent]', evt, e); }
      });
    },

    /* ----------------------------------------------------------------- utils */

    t: function (k, v) { return global.Store.t(k, v); },

    /** Say something, log it to the transcript, then reopen the mic. */
    say: function (text, opts) {
      opts = opts || {};
      this.lastPrompt = text;
      this._emit('say', text);

      var self = this;
      return global.Voice.speak(text).then(function () {
        if (self.autoListen && opts.listen !== false && self.state !== 'done') {
          // Small gap so the recogniser does not catch the tail of the TTS.
          setTimeout(function () {
            if (!global.Voice.isListening() && !global.Voice.isSpeaking()) global.Voice.listen();
          }, 350);
        }
      });
    },

    /** The current field definition, or null when the form is complete. */
    currentField: function () {
      if (!this.service || !this.service.voiceForm) return null;
      return this.service.voiceForm[this.fieldIndex] || null;
    },

    progress: function () {
      if (!this.service || !this.service.voiceForm || !this.service.voiceForm.length) return 0;
      var total = this.service.voiceForm.length;
      var filled = 0;
      var self = this;
      this.service.voiceForm.forEach(function (f) {
        if (self.values[f.id] != null && self.values[f.id] !== '') filled++;
      });
      return Math.round((filled / total) * 100);
    },

    /* ----------------------------------------------------------------- start */

    reset: function () {
      this.state = 'idle';
      this.service = null;
      this.values = {};
      this.sources = {};
      this.fieldIndex = 0;
      this.pendingValue = null;
      this.lockerResult = null;
      this.submitted = null;
      this._submitting = false;
      this._emit('reset');
    },

    greet: function () {
      this.reset();
      return this.say(this.t('greeting'));
    },

    /* ------------------------------------------------------- the turn handler */

    /**
     * Feed one utterance in. Everything flows through here — spoken text and
     * typed text take exactly the same path, which is what keeps the typed
     * fallback honest.
     */
    handle: function (text) {
      if (!text || !String(text).trim()) return;

      this._emit('heard', text);

      var nlu = global.NLU;

      // Global commands work in every state except mid-confirmation.
      var parsed = nlu.parse(text);

      if (parsed.intent === 'cancel') {
        this.reset();
        return this.say(this.t('cancelled'), { listen: false });
      }

      if (parsed.intent === 'repeat') {
        return this.say(this.lastPrompt || this.t('greeting'));
      }

      if (parsed.intent === 'help' && this.state === 'idle') {
        return this.say(this.t('helpText'));
      }

      switch (this.state) {
        case 'idle':          return this._onIdle(text, parsed);
        case 'confirmSvc':    return this._onConfirmService(text, parsed);
        case 'field':         return this._onField(text);
        case 'confirmField':  return this._onConfirmField(text);
        case 'review':        return this._onReview(text);
        default:              return this.say(this.t('notUnderstood'));
      }
    },

    /* ------------------------------------------------------------ idle state */

    _onIdle: function (text, parsed) {
      // Navigation intents hand control back to the page.
      if (['track', 'download', 'locker', 'list', 'home', 'grievance'].indexOf(parsed.intent) !== -1 && !parsed.service) {
        this._emit('navigate', parsed.intent);
        return;
      }

      if (!parsed.service) {
        var suggestions = global.NLU.searchServices(text, 4);
        if (suggestions.length) {
          this._emit('suggest', suggestions);
          var names = suggestions.slice(0, 3).map(function (s) { return global.Store.name(s); }).join(', ');
          return this.say(
            global.Store.lang === 'hi'
              ? 'मैं ठीक से समझ नहीं पाया। क्या आपका मतलब इनमें से किसी एक से है? ' + names
              : 'I did not quite catch that. Did you mean one of these? ' + names
          );
        }
        return this.say(this.t('notUnderstood'));
      }

      // Track / download for a named service goes straight to that page.
      if (parsed.intent === 'track' || parsed.intent === 'download') {
        this._emit('navigate', parsed.intent, parsed.service);
        return;
      }

      this.service = parsed.service;
      this._emit('service', this.service);

      // High confidence and a voice form ready → skip the confirmation turn.
      if (parsed.confidence >= 0.95 && this.service.voiceForm && this.service.voiceForm.length) {
        return this._beginForm();
      }

      this.state = 'confirmSvc';
      return this.say(this.t('foundService', { s: global.Store.name(this.service) }));
    },

    _onConfirmService: function (text, parsed) {
      var yn = global.NLU.yesNo(text);

      if (yn === 'no') {
        // They may have named the right service in the same breath.
        if (parsed.service && parsed.service.slug !== this.service.slug) {
          this.service = parsed.service;
          this._emit('service', this.service);
          return this.say(this.t('foundService', { s: global.Store.name(this.service) }));
        }
        this.state = 'idle';
        this.service = null;
        this._emit('service', null);
        return this.say(
          global.Store.lang === 'hi'
            ? 'ठीक है। तो आपको कौन सी सेवा चाहिए?'
            : 'Alright. Then which service do you need?'
        );
      }

      if (yn === 'yes') return this._beginForm();

      return this.say(
        global.Store.lang === 'hi'
          ? 'कृपया हाँ या नहीं में जवाब दीजिए।'
          : 'Please answer yes or no.'
      );
    },

    /* ------------------------------------------------------------- form start */

    _beginForm: function () {
      var self = this;

      if (!this.service.voiceForm || !this.service.voiceForm.length) {
        // Catalogue entry exists but no voice schema yet — hand off honestly
        // rather than pretending we can fill it.
        this.state = 'idle';
        this._emit('handoff', this.service);
        return this.say(
          global.Store.lang === 'hi'
            ? global.Store.name(this.service) + ' के लिए मैं आपको सही पेज पर ले जा रहा हूँ। आवाज़ से फ़ॉर्म भरना इस सेवा के लिए अभी उपलब्ध नहीं है।'
            : 'I am taking you to the right page for ' + global.Store.name(this.service) + '. Voice form filling is not available for this service yet.'
        );
      }

      this.values = {};
      this.sources = {};
      this.fieldIndex = 0;
      this._emit('form-start', this.service);

      // If DigiLocker is connected, harvest what we can before asking anything.
      if (global.DigiLocker.isConnected()) {
        this.state = 'fetching';
        return this.say(this.t('fetchingDocs'), { listen: false }).then(function () {
          return self._autoFill();
        });
      }

      return this.say(this.t('startingForm'), { listen: false }).then(function () {
        return self._askCurrent();
      });
    },

    _autoFill: function () {
      var self = this;

      return global.DigiLocker.autoFill(this.service, function (ev) {
        self._emit('locker-progress', ev);
      }).then(function (res) {
        self.lockerResult = res;
        self._emit('locker-done', res);

        // Map DigiLocker fields onto form fields via each field's `prefill`.
        self.service.voiceForm.forEach(function (f) {
          if (!f.prefill) return;
          var key = f.prefill.replace('digilocker.', '');
          var val = res.fields[key];
          if (val != null && val !== '') {
            self.values[f.id] = val;
            self.sources[f.id] = 'digilocker';
            self._emit('field-filled', { field: f, value: val, source: 'digilocker' });
          }
        });

        var n = res.documents.length;
        var msg = n ? self.t('docsFetched', { n: n }) : self.t('startingForm');

        return self.say(msg, { listen: false }).then(function () {
          return self._askCurrent();
        });
      });
    },

    /* ---------------------------------------------------------- field asking */

    /** Move to the next unanswered field and ask for it, or go to review. */
    _askCurrent: function () {
      var vf = this.service.voiceForm;

      while (this.fieldIndex < vf.length) {
        var f = vf[this.fieldIndex];
        if (this.values[f.id] == null || this.values[f.id] === '') break;
        this.fieldIndex++;
      }

      if (this.fieldIndex >= vf.length) return this._beginReview();

      var field = vf[this.fieldIndex];
      this.state = 'field';
      this._emit('field-active', field);

      var q = global.Store.lang === 'hi' ? field.askHi : field.askEn;
      return this.say(q);
    },

    _onField: function (text) {
      var field = this.currentField();
      if (!field) return this._beginReview();

      var parsed = global.NLU.parse(text);

      // "पीछे" / "back" — step back one field and clear it.
      if (parsed.intent === 'back') {
        if (this.fieldIndex > 0) {
          this.fieldIndex--;
          var prev = this.service.voiceForm[this.fieldIndex];
          delete this.values[prev.id];
          delete this.sources[prev.id];
          this._emit('field-cleared', prev);
        }
        return this._askCurrent();
      }

      var value = global.NLU.extract(field.type, text, field);

      if (value == null) {
        return this.say(
          global.Store.lang === 'hi'
            ? 'माफ़ कीजिए, मैं यह समझ नहीं पाया। ' + field.askHi
            : 'Sorry, I could not understand that. ' + field.askEn
        );
      }

      // Numbers get read back before being accepted. Getting an Aadhaar or a
      // bank account wrong is the single most expensive error in this flow.
      if (['aadhaar', 'mobile', 'account'].indexOf(field.type) !== -1) {
        this.pendingValue = value;
        this.state = 'confirmField';
        return this.say(this.t('confirmValue', { v: global.NLU.spellOut(value) }));
      }

      return this._acceptValue(field, value);
    },

    _acceptValue: function (field, value) {
      this.values[field.id] = value;
      this.sources[field.id] = 'voice';
      this.pendingValue = null;

      this._emit('field-filled', { field: field, value: value, source: 'voice' });

      this.fieldIndex++;
      this.state = 'field';
      return this._askCurrent();
    },

    _onConfirmField: function (text) {
      var field = this.currentField();
      var yn = global.NLU.yesNo(text);

      if (yn === 'yes') return this._acceptValue(field, this.pendingValue);

      if (yn === 'no') {
        this.pendingValue = null;
        this.state = 'field';
        return this.say(this.t('letsRedo') + ' ' + (global.Store.lang === 'hi' ? field.askHi : field.askEn));
      }

      // Not a yes/no — maybe they just said the number again.
      var retry = global.NLU.extract(field.type, text, field);
      if (retry != null) {
        this.pendingValue = retry;
        return this.say(this.t('confirmValue', { v: global.NLU.spellOut(retry) }));
      }

      return this.say(
        global.Store.lang === 'hi' ? 'कृपया हाँ या नहीं कहिए।' : 'Please say yes or no.'
      );
    },

    /* ---------------------------------------------------------------- review */

    _beginReview: function () {
      this.state = 'review';
      this._emit('review', this.summary());
      return this.say(this.summarySpoken() + ' ' + this.t('allDone'));
    },

    /** Structured summary for the on-screen review panel. */
    summary: function () {
      var self = this;
      if (!this.service) return [];
      return this.service.voiceForm.map(function (f) {
        return {
          field: f,
          label: global.Store.lang === 'hi' ? f.hi : f.en,
          value: self.displayValue(f),
          source: self.sources[f.id] || null
        };
      });
    },

    /** Short spoken read-back — full detail is on screen, not in the ear. */
    summarySpoken: function () {
      var self = this;
      var parts = [];
      var important = ['applicantName', 'district', 'annualIncome', 'mobile'];

      this.service.voiceForm.forEach(function (f) {
        if (important.indexOf(f.id) === -1) return;
        var v = self.displayValue(f);
        if (!v) return;
        var label = global.Store.lang === 'hi' ? f.hi : f.en;
        parts.push(label + ': ' + v);
      });

      var lead = global.Store.lang === 'hi'
        ? 'मैंने यह भरा है — '
        : 'Here is what I have filled in — ';

      return parts.length ? lead + parts.join(', ') + '.' : '';
    },

    displayValue: function (field) {
      var v = this.values[field.id];
      if (v == null || v === '') return '';
      if (field.type === 'choice') return global.NLU.labelFor(field, v, global.Store.lang);
      if (field.type === 'amount') return '₹ ' + Number(v).toLocaleString('en-IN');
      return String(v);
    },

    _onReview: function (text) {
      var yn = global.NLU.yesNo(text);
      var parsed = global.NLU.parse(text);

      if (parsed.intent === 'back' || yn === 'no') {
        // Let them fix a specific field by naming it.
        var target = this._findFieldByName(text);
        if (target) {
          this.fieldIndex = this.service.voiceForm.indexOf(target);
          delete this.values[target.id];
          delete this.sources[target.id];
          this._emit('field-cleared', target);
          this.state = 'field';
          return this._askCurrent();
        }
        return this.say(
          global.Store.lang === 'hi'
            ? 'कौन सी जानकारी बदलनी है? उसका नाम बोलिए।'
            : 'Which detail should I change? Please say its name.'
        );
      }

      if (yn === 'yes') return this.submit();

      return this.say(
        global.Store.lang === 'hi'
          ? 'क्या मैं आवेदन जमा कर दूँ? हाँ या नहीं कहिए।'
          : 'Shall I submit the application? Please say yes or no.'
      );
    },

    _findFieldByName: function (text) {
      var t = global.NLU.normalise(text);
      var best = null, bestLen = 0;
      this.service.voiceForm.forEach(function (f) {
        [f.hi, f.en].forEach(function (label) {
          var nl = global.NLU.normalise(label);
          if (nl && t.indexOf(nl) !== -1 && nl.length > bestLen) { best = f; bestLen = nl.length; }
        });
      });
      return best;
    },

    /* ---------------------------------------------------------------- submit */

    submit: function () {
      // The review turn and the on-screen Submit button can both land here.
      // Without this guard a citizen who says "हाँ" and also taps Submit
      // files the same application twice.
      if (this.state === 'done' || this._submitting) return Promise.resolve(this.submitted);
      this._submitting = true;

      var docs = (this.lockerResult && this.lockerResult.documents || []).map(function (d) {
        return { key: d.req.key, name: d.doc.name, nameHi: d.doc.nameHi, docId: d.doc.docId, issuer: d.doc.issuer };
      });

      var app = global.Store.saveApplication(this.service, this.values, {
        channel: 'voice',
        documents: docs
      });

      this.state = 'done';
      this.submitted = app;
      this._submitting = false;
      this._emit('submitted', app);

      var self = this;
      return this.say(
        this.t('submitted', { id: app.id, d: this.service.days }),
        { listen: false }
      ).then(function () {
        self.autoListen = false;
      });
    },

    /** Jump straight into a service — used when a card is clicked. */
    startService: function (service) {
      this.reset();
      this.service = service;
      this._emit('service', service);
      return this._beginForm();
    }
  };

  global.Agent = Agent;
})(window);
