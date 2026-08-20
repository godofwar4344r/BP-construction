/* ==========================================================================
   voice-engine.js — speech in / speech out, with swappable providers.

   The whole point of this file: the rest of the app never talks to a speech
   API directly. It calls Voice.listen() and Voice.speak(). Which engine
   actually does the work is a config choice, so the MVP can demo on the free
   browser engine today and switch to Bhashini (MeitY's own, India-hosted)
   for production without any change to the UI code.

   Providers
     webspeech : Web Speech API. Free, no key, works offline-ish in Chrome/Edge.
                 NOTE: Chrome streams audio to Google servers. Fine for a demo,
                 NOT acceptable for production citizen data. See docs/03-VOICE-APIS.md
     bhashini  : Government of India's Bhashini / ULCA ASR + TTS, via our own
                 /api proxy (server/server.js) so the key never reaches the client.
     custom    : any REST endpoint returning {text} for ASR and audio for TTS.
   ========================================================================== */

(function (global) {
  'use strict';

  var LANG_MAP = {
    hi: { speech: 'hi-IN', bhashini: 'hi', label: 'हिंदी' },
    en: { speech: 'en-IN', bhashini: 'en', label: 'English' }
  };

  var Voice = {
    provider: 'webspeech',
    lang: 'hi',
    apiBase: '/api',

    // Runtime state
    _rec: null,
    _listening: false,
    _speaking: false,
    _mediaRecorder: null,
    _chunks: [],
    _handlers: {},

    /* ---------------------------------------------------------------- setup */

    init: function (opts) {
      opts = opts || {};
      this.provider = opts.provider || this.provider;
      this.lang = opts.lang || this.lang;
      this.apiBase = opts.apiBase || this.apiBase;
      return this;
    },

    on: function (evt, fn) {
      (this._handlers[evt] = this._handlers[evt] || []).push(fn);
      return this;
    },

    _emit: function (evt, payload) {
      (this._handlers[evt] || []).forEach(function (fn) {
        try { fn(payload); } catch (e) { console.error('[voice] handler error', evt, e); }
      });
    },

    setLang: function (lang) {
      this.lang = lang;
      if (this._rec) this._rec.lang = LANG_MAP[lang].speech;
    },

    /** What this browser can actually do — drives the fallback banner. */
    capabilities: function () {
      var SR = global.SpeechRecognition || global.webkitSpeechRecognition;
      return {
        stt: !!SR || this.provider !== 'webspeech',
        tts: 'speechSynthesis' in global,
        mediaRecorder: typeof MediaRecorder !== 'undefined',
        secureContext: global.isSecureContext !== false
      };
    },

    isListening: function () { return this._listening; },
    isSpeaking: function () { return this._speaking; },

    /* --------------------------------------------------------------- listen */

    /**
     * Start listening. Emits:
     *   'start'    → ()
     *   'partial'  → (interimText)   live captions while the citizen speaks
     *   'result'   → (finalText)
     *   'end'      → ()
     *   'error'    → ({code, message})
     */
    listen: function () {
      if (this._listening) return;
      if (this._speaking) this.stopSpeaking();

      if (this.provider === 'webspeech') return this._listenWebSpeech();
      return this._listenRecorded();
    },

    stopListening: function () {
      if (!this._listening) return;
      if (this.provider === 'webspeech') {
        if (this._rec) { try { this._rec.stop(); } catch (e) {} }
      } else if (this._mediaRecorder && this._mediaRecorder.state === 'recording') {
        this._mediaRecorder.stop();
      }
    },

    toggle: function () { this._listening ? this.stopListening() : this.listen(); },

    _listenWebSpeech: function () {
      var SR = global.SpeechRecognition || global.webkitSpeechRecognition;
      if (!SR) {
        this._emit('error', { code: 'unsupported', message: 'Speech recognition not supported in this browser.' });
        return;
      }

      var self = this;
      var rec = new SR();
      this._rec = rec;

      rec.lang = LANG_MAP[this.lang].speech;
      rec.interimResults = true;
      rec.continuous = false;
      rec.maxAlternatives = 3;

      var finalText = '';

      rec.onstart = function () {
        self._listening = true;
        self._emit('start');
      };

      rec.onresult = function (ev) {
        var interim = '';
        for (var i = ev.resultIndex; i < ev.results.length; i++) {
          var r = ev.results[i];
          if (r.isFinal) finalText += r[0].transcript;
          else interim += r[0].transcript;
        }
        if (interim) self._emit('partial', interim);
      };

      rec.onerror = function (ev) {
        var msg = {
          'no-speech': 'I did not hear anything. Please try again.',
          'audio-capture': 'No microphone found.',
          'not-allowed': 'Microphone permission was denied.',
          'network': 'Network error reaching the speech service.'
        }[ev.error] || ev.error;
        self._emit('error', { code: ev.error, message: msg });
      };

      rec.onend = function () {
        self._listening = false;
        self._emit('end');
        var text = finalText.trim();
        if (text) self._emit('result', text);
      };

      try {
        rec.start();
      } catch (e) {
        this._emit('error', { code: 'start-failed', message: String(e) });
      }
    },

    /**
     * Record audio and post it to a server-side ASR (Bhashini or custom).
     * Used for every non-webspeech provider — the audio never goes to a
     * third party the state has not approved.
     */
    _listenRecorded: function () {
      var self = this;

      if (!navigator.mediaDevices || typeof MediaRecorder === 'undefined') {
        this._emit('error', { code: 'unsupported', message: 'Audio recording not supported in this browser.' });
        return;
      }

      navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, sampleRate: 16000 } })
        .then(function (stream) {
          var mr = new MediaRecorder(stream);
          self._mediaRecorder = mr;
          self._chunks = [];

          mr.ondataavailable = function (e) { if (e.data.size) self._chunks.push(e.data); };

          mr.onstart = function () {
            self._listening = true;
            self._emit('start');
          };

          mr.onstop = function () {
            self._listening = false;
            self._emit('end');
            stream.getTracks().forEach(function (t) { t.stop(); });

            var blob = new Blob(self._chunks, { type: mr.mimeType || 'audio/webm' });
            self._emit('partial', '…');
            self._transcribe(blob)
              .then(function (text) { if (text) self._emit('result', text); })
              .catch(function (err) {
                self._emit('error', { code: 'asr-failed', message: err.message || String(err) });
              });
          };

          mr.start();

          // Hard cap so a stuck recorder never runs forever.
          setTimeout(function () {
            if (mr.state === 'recording') mr.stop();
          }, 15000);
        })
        .catch(function (err) {
          self._emit('error', { code: 'mic-denied', message: 'Microphone permission was denied.' });
          console.error(err);
        });
    },

    /** POST recorded audio to our own proxy, which holds the API key. */
    _transcribe: function (blob) {
      var fd = new FormData();
      fd.append('audio', blob, 'speech.webm');
      fd.append('lang', LANG_MAP[this.lang].bhashini);
      fd.append('provider', this.provider);

      return fetch(this.apiBase + '/asr', { method: 'POST', body: fd })
        .then(function (r) {
          if (!r.ok) throw new Error('ASR service returned ' + r.status);
          return r.json();
        })
        .then(function (d) { return (d.text || '').trim(); });
    },

    /* ---------------------------------------------------------------- speak */

    /**
     * Speak `text`. Returns a Promise that resolves when playback finishes,
     * so the dialogue manager can wait before it starts listening again —
     * otherwise the assistant hears itself.
     */
    speak: function (text, opts) {
      opts = opts || {};
      if (!text) return Promise.resolve();

      this.stopSpeaking();
      this._emit('speak-start', text);

      var self = this;
      var done = (this.provider === 'webspeech' || !opts.forceRemote)
        ? this._speakWebSpeech(text, opts)
        : this._speakRemote(text, opts);

      return done.then(function () {
        self._speaking = false;
        self._emit('speak-end', text);
      }).catch(function (e) {
        self._speaking = false;
        self._emit('speak-end', text);
        console.warn('[voice] tts failed', e);
      });
    },

    stopSpeaking: function () {
      if ('speechSynthesis' in global) global.speechSynthesis.cancel();
      if (this._audio) { try { this._audio.pause(); } catch (e) {} this._audio = null; }
      this._speaking = false;
    },

    _speakWebSpeech: function (text, opts) {
      var self = this;
      return new Promise(function (resolve) {
        if (!('speechSynthesis' in global)) return resolve();

        var u = new SpeechSynthesisUtterance(text);
        u.lang = LANG_MAP[self.lang].speech;
        u.rate = opts.rate || 0.94;   // slightly slow — many users are first-time
        u.pitch = opts.pitch || 1;
        u.volume = 1;

        var voice = self._pickVoice(u.lang);
        if (voice) u.voice = voice;

        u.onstart = function () { self._speaking = true; };
        u.onend = function () { resolve(); };
        u.onerror = function () { resolve(); };

        // Chrome drops queued utterances if the tab was backgrounded; cancel first.
        global.speechSynthesis.cancel();
        global.speechSynthesis.speak(u);

        // Safety net: Chrome sometimes never fires onend for long strings.
        var guard = Math.max(4000, text.length * 90);
        setTimeout(resolve, guard);
      });
    },

    _pickVoice: function (langTag) {
      if (!('speechSynthesis' in global)) return null;
      var voices = global.speechSynthesis.getVoices() || [];
      var exact = voices.filter(function (v) { return v.lang === langTag; });
      if (exact.length) {
        // Prefer a local (on-device) voice — lower latency, works offline.
        var local = exact.filter(function (v) { return v.localService; });
        return (local[0] || exact[0]);
      }
      var base = langTag.split('-')[0];
      return voices.filter(function (v) { return v.lang.indexOf(base) === 0; })[0] || null;
    },

    _speakRemote: function (text) {
      var self = this;
      return fetch(this.apiBase + '/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          lang: LANG_MAP[this.lang].bhashini,
          provider: this.provider
        })
      })
        .then(function (r) {
          if (!r.ok) throw new Error('TTS service returned ' + r.status);
          return r.blob();
        })
        .then(function (blob) {
          return new Promise(function (resolve) {
            var audio = new Audio(URL.createObjectURL(blob));
            self._audio = audio;
            self._speaking = true;
            audio.onended = resolve;
            audio.onerror = resolve;
            audio.play().catch(resolve);
          });
        });
    },

    /* ------------------------------------------------------------- warm-up */

    /**
     * Browsers only allow audio after a user gesture, and Chrome loads its
     * voice list asynchronously. Call this once from the first click so the
     * first real utterance is not swallowed.
     */
    warmUp: function () {
      if (!('speechSynthesis' in global)) return;
      global.speechSynthesis.getVoices();
      var u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      try { global.speechSynthesis.speak(u); } catch (e) {}
    }
  };

  if ('speechSynthesis' in global) {
    global.speechSynthesis.onvoiceschanged = function () { global.speechSynthesis.getVoices(); };
  }

  global.Voice = Voice;
})(window);
