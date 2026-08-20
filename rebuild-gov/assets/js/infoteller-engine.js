/* ==========================================================================
   infoteller-engine.js — Siri / Alexa Style Autonomous Citizen Voice Copilot
   Features:
   - Crystal-Clear Neural Voice Engine (Clean Zira / Natural voices with no glitches)
   - Deep Text Normalization (Strips mixed-script parentheses, expands currency)
   - Web Audio API Signature Acoustic Earcons (Wake chimes, ack tones, success chords)
   - V8 Garbage Collection Safe Speech Synthesis (Prevents mid-speech dropouts)
   - Conversational Problem-to-Scheme Reasoning, Talk-to-Apply & DigiLocker
   ========================================================================== */

(function (global) {
  'use strict';

  // Global anchor to prevent V8 Garbage Collector from killing active speech synthesis
  window._activeSpeechUtterances = [];

  /* ------------------------------------------------------------- Web Audio FX */
  var SiriAudioFX = {
    ctx: null,

    getCtx: function () {
      if (!this.ctx) {
        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    },

    // Signature Siri-style wake chime
    playWakeChime: function () {
      var ctx = this.getCtx();
      if (!ctx) return;
      var now = ctx.currentTime;

      var osc1 = ctx.createOscillator();
      var gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880.00, now + 0.12); // A5
      gain1.gain.setValueAtTime(0.01, now);
      gain1.gain.linearRampToValueAtTime(0.18, now + 0.03);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.28);

      var osc2 = ctx.createOscillator();
      var gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1174.66, now + 0.08); // D6
      gain2.gain.setValueAtTime(0.01, now + 0.08);
      gain2.gain.linearRampToValueAtTime(0.15, now + 0.11);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.35);
    },

    // Soft acknowledge / processing chime
    playAckTone: function () {
      var ctx = this.getCtx();
      if (!ctx) return;
      var now = ctx.currentTime;

      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(784.00, now); // G5
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    },

    // Success confirmation chime (Harmonic 3-tone chord)
    playSuccessChord: function () {
      var ctx = this.getCtx();
      if (!ctx) return;
      var now = ctx.currentTime;
      var freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major

      freqs.forEach(function (f, i) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + (i * 0.04));
        gain.gain.setValueAtTime(0.01, now + (i * 0.04));
        gain.gain.linearRampToValueAtTime(0.10, now + (i * 0.04) + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + (i * 0.04));
        osc.stop(now + 0.45);
      });
    }
  };

  /* ------------------------------------------------------------- Engine Core */
  var InfoTeller = {
    lang: 'en', // 'en' | 'hi'
    isListening: false,
    isSpeaking: false,
    isMuted: false,
    currentService: null,
    recognition: null,
    synth: null,
    selectedVoiceEn: null,
    selectedVoiceHi: null,
    formSession: null,
    chatHistory: [],

    init: function () {
      this.initSynth();
      this.initRecognition();
      this.bindEvents();
      this.renderSampleQuestions();
      this.renderDepartments();
      this.renderInitialServices();

      var params = new URLSearchParams(window.location.search);
      var q = params.get('q') || params.get('svc');
      if (q) this.processQuery(q);
    },

    /* ------------------------------------------------------------- Language */
    setLanguage: function (lang) {
      this.lang = (lang === 'hi') ? 'hi' : 'en';
      document.documentElement.lang = this.lang;

      var btn = document.getElementById('btn-lang-toggle');
      if (btn) {
        btn.innerHTML = (this.lang === 'hi') ? '🇮🇳 English' : '🇮🇳 हिन्दी';
      }

      if (this.recognition) {
        this.recognition.lang = (this.lang === 'hi') ? 'hi-IN' : 'en-IN';
      }

      this.updateStaticCopy();
      this.renderSampleQuestions();
      this.renderDepartments();
      this.renderInitialServices();
    },

    updateStaticCopy: function () {
      var isHi = (this.lang === 'hi');
      var title = document.getElementById('hero-title-text');
      var sub = document.getElementById('hero-subtitle-text');
      var searchInput = document.getElementById('main-search-input');
      var searchBtn = document.getElementById('btn-search-submit');
      var quickHeader = document.getElementById('quick-header-text');
      var dirTitle = document.getElementById('dir-title-text');
      var dirSub = document.getElementById('dir-sub-text');
      var floatLabel = document.getElementById('float-assist-label');

      if (floatLabel) floatLabel.textContent = isHi ? "Siri/Alexa AI सहायक" : "Siri/Alexa AI Voice Desk";

      if (title) title.textContent = isHi 
        ? "उत्तराखंड AI नागरिक सहायक (Siri & Alexa Mode)" 
        : "Uttarakhand AI Citizen Voice (Siri & Alexa Mode)";

      if (sub) sub.textContent = isHi 
        ? "माइक दबाएं और सीधे बात करें: 'मुझे नया काम शुरू करना है, कोई योजना है?', 'बेटी की उच्च शिक्षा सहायता', 'आय प्रमाण पत्र' या 'पानी की शिकायत'। बोलने के लिए क्लिक करें।" 
        : "Click the glowing orb to speak: 'I lost my job, any business subsidy?', 'College grant for daughter', 'Income certificate docs', or 'Water complaint'.";

      if (searchInput) searchInput.placeholder = isHi 
        ? "यहाँ लिखें या ऊपर माइक से बात करें..." 
        : "Type issue or speak naturally to AI Copilot...";

      if (searchBtn) searchBtn.textContent = isHi ? "AI से पूछें 🚀" : "Ask Siri AI 🚀";
      if (quickHeader) quickHeader.textContent = isHi ? "💡 आम नागरिक समस्याएं एवं योजनाएं (बोलने हेतु क्लिक करें):" : "💡 Popular Citizen Inquiries (Click to Speak):";
      if (dirTitle) dirTitle.textContent = isHi ? "विभाग अनुसार मुख्य योजनाएं एवं सेवाएं" : "Key Uttarakhand Government Schemes & Services";
      if (dirSub) dirSub.textContent = isHi ? "उत्तराखंड सेवा का अधिकार (RTS) एवं कल्याणकारी योजनाएं।" : "Right to Service Act guaranteed services & welfare subsidy schemes.";
    },

    /* -------------------------------------------------------- Voice Synthesis */
    initSynth: function () {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
          speechSynthesis.onvoiceschanged = this.loadVoices.bind(this);
        }
      }
    },

    // Choose cleanest, clearest neural voice with no SAPI distortion
    loadVoices: function () {
      if (!this.synth) return;
      var voices = this.synth.getVoices();
      if (!voices || voices.length === 0) return;

      // For English: Microsoft Zira (Female, crisp, natural US/neutral English) or Google US/UK English
      this.selectedVoiceEn = voices.find(v => v.name.includes('Zira')) ||
                            voices.find(v => v.name.includes('Samantha')) ||
                            voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
                            voices.find(v => v.name.includes('Heera')) ||
                            voices.find(v => v.lang === 'en-US') ||
                            voices.find(v => v.lang.startsWith('en')) ||
                            voices[0];

      // For Hindi: Kalpana or Hemant or Hindi
      this.selectedVoiceHi = voices.find(v => v.lang.startsWith('hi') || v.name.includes('Hindi') || v.name.includes('Kalpana') || v.name.includes('Hemant')) ||
                            this.selectedVoiceEn;
    },

    // Deep text normalizer: strips foreign scripts & converts symbols to clear spoken words
    normalizeSpokenText: function (rawText, lang) {
      if (!rawText) return "";
      var t = rawText;

      // 1. Remove markdown symbols
      t = t.replace(/[*_#`~]/g, '');

      // 2. Remove URLs and markdown links
      t = t.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

      if (lang === 'en') {
        // Remove Hindi unicode characters from English speech (prevents English TTS from breaking)
        t = t.replace(/[\u0900-\u097F]+/g, '');
        // Clean up empty parentheses left behind
        t = t.replace(/\(\s*\)/g, '');
        t = t.replace(/\(\s*-\s*\)/g, '');

        // Normalize Indian currency & units for smooth English speech
        t = t.replace(/₹\s*([0-9,]+)\s*(Lakhs?|Crores?)?/gi, function(match, num, unit) {
          if (unit) {
            var cleanUnit = unit.replace(/s$/i, '');
            return num + ' ' + cleanUnit + ' Rupees';
          }
          return num + ' Rupees';
        });
        t = t.replace(/₹/g, 'Rupees ');
        t = t.replace(/\bMSY\b/g, 'M S Y');
        t = t.replace(/\bRTS\b/g, 'Right to Service');
        t = t.replace(/\bSLA\b/g, 'working days');
        t = t.replace(/\bDBT\b/g, 'direct bank transfer');
        t = t.replace(/·/g, ',');
      } else {
        // Hindi normalization
        t = t.replace(/₹\s*([0-9,]+)/g, '$1 रुपये');
        t = t.replace(/₹/g, 'रुपये ');
        t = t.replace(/\bSLA\b/g, 'दिन');
        t = t.replace(/\bDBT\b/g, 'सीधे बैंक खाते में');
      }

      // Clean up multiple spaces and dashes
      t = t.replace(/\s+/g, ' ').replace(/--+/g, ' - ').trim();
      return t;
    },

    speak: function (text, onEnd) {
      if (!this.synth || this.isMuted) {
        if (onEnd) onEnd();
        return;
      }

      this.stopSpeaking();

      var isHi = (this.lang === 'hi');
      var cleanText = this.normalizeSpokenText(text, this.lang);
      if (!cleanText) {
        if (onEnd) onEnd();
        return;
      }

      var utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.voice = isHi ? this.selectedVoiceHi : this.selectedVoiceEn;
      utterance.lang = isHi ? 'hi-IN' : 'en-US';
      
      // Standard rate and pitch (1.0) ensures crystal-clear non-distorted playback on all operating systems
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      var self = this;

      utterance.onstart = function () {
        self.isSpeaking = true;
        self.updateVoiceUI('speaking');
      };

      utterance.onend = function () {
        self.isSpeaking = false;
        self.updateVoiceUI('idle');
        // Clean from global anchor
        var idx = window._activeSpeechUtterances.indexOf(utterance);
        if (idx !== -1) window._activeSpeechUtterances.splice(idx, 1);
        if (onEnd) onEnd();
      };

      utterance.onerror = function () {
        self.isSpeaking = false;
        self.updateVoiceUI('idle');
        var idx = window._activeSpeechUtterances.indexOf(utterance);
        if (idx !== -1) window._activeSpeechUtterances.splice(idx, 1);
        if (onEnd) onEnd();
      };

      // Anchor to window to prevent V8 Garbage Collector bug
      window._activeSpeechUtterances.push(utterance);
      this.synth.speak(utterance);
    },

    stopSpeaking: function () {
      if (this.synth && this.synth.speaking) {
        this.synth.cancel();
      }
      window._activeSpeechUtterances = [];
      this.isSpeaking = false;
      this.updateVoiceUI('idle');
    },

    toggleMute: function () {
      this.isMuted = !this.isMuted;
      if (this.isMuted) this.stopSpeaking();
      var btn = document.getElementById('btn-mute-toggle');
      if (btn) {
        btn.innerHTML = this.isMuted ? '🔇 Voice Muted' : '🔊 Voice Active';
        btn.classList.toggle('muted-active', this.isMuted);
      }
    },

    /* ----------------------------------------------------- Speech Recognition */
    initRecognition: function () {
      var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) return;

      var rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = (this.lang === 'hi') ? 'hi-IN' : 'en-IN';

      var self = this;

      rec.onstart = function () {
        self.isListening = true;
        self.stopSpeaking(); // Instant barge-in: stop talking when user speaks
        self.updateVoiceUI('listening');
        self.setLiveTranscript(self.lang === 'hi' ? 'सुन रहे हैं... कृपया बोलें।' : 'Listening... Speak naturally.');
      };

      rec.onresult = function (event) {
        var transcript = '';
        for (var i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        self.setLiveTranscript('"' + transcript + '"');

        if (event.results[0].isFinal) {
          SiriAudioFX.playAckTone(); // Acknowledge user speech
          if (self.formSession && self.formSession.active) {
            self.handleFormVoiceInput(transcript);
          } else {
            self.processQuery(transcript);
          }
        }
      };

      rec.onerror = function () {
        self.isListening = false;
        self.updateVoiceUI('idle');
      };

      rec.onend = function () {
        self.isListening = false;
        if (!self.isSpeaking) self.updateVoiceUI('idle');
      };

      this.recognition = rec;
    },

    startListening: function () {
      if (!this.recognition) {
        alert('Voice input requires Google Chrome or Microsoft Edge with microphone enabled.');
        return;
      }
      try {
        SiriAudioFX.playWakeChime(); // Siri wake sound
        this.recognition.lang = (this.lang === 'hi') ? 'hi-IN' : 'en-IN';
        this.recognition.start();
      } catch (err) {
        // Recognition might already be running
      }
    },

    stopListening: function () {
      if (this.recognition && this.isListening) {
        this.recognition.stop();
      }
      this.isListening = false;
      this.updateVoiceUI('idle');
    },

    toggleListening: function () {
      if (this.isSpeaking) {
        this.stopSpeaking(); // Tap to interrupt
        return;
      }
      if (this.isListening) this.stopListening();
      else this.startListening();
    },

    /* ------------------------------------------------------------- Processing */
    processQuery: function (query) {
      if (!query || !query.trim()) return;
      var cleanQuery = query.trim();

      this.stopListening();
      this.updateVoiceUI('thinking');
      this.setLiveTranscript((this.lang === 'hi' ? 'उत्तर तैयार हो रहा है: "' : 'Thinking: "') + cleanQuery + '"...');

      var self = this;
      setTimeout(function () {
        var result = global.UK_KB.reasonCitizenIssue(cleanQuery);
        self.displayGPTConversationalResponse(cleanQuery, result);
      }, 250);
    },

    /* ------------------------------------------------------- UI State Updates */
    updateVoiceUI: function (state) {
      var micBtn = document.getElementById('hero-mic-btn');
      var waveContainer = document.getElementById('voice-waveform');
      var statusTag = document.getElementById('voice-status-tag');
      var orbGlow = document.getElementById('siri-orb-glow');

      if (micBtn) {
        micBtn.className = 'hero-mic-btn ' + state;
      }

      if (orbGlow) {
        orbGlow.className = 'siri-orb-glow ' + state;
      }

      var isHi = (this.lang === 'hi');

      if (state === 'listening') {
        if (waveContainer) waveContainer.className = 'voice-waveform active-listening';
        if (statusTag) {
          statusTag.textContent = isHi ? '🎤 आपकी बात सुन रहे हैं...' : '🎤 Listening to you... (Speak freely)';
          statusTag.className = 'status-tag listening';
        }
      } else if (state === 'speaking') {
        if (waveContainer) waveContainer.className = 'voice-waveform active-speaking';
        if (statusTag) {
          statusTag.textContent = isHi ? '🔊 AI सहायक बोल रहे हैं (रोकने हेतु टैप करें)' : '🔊 AI Copilot Speaking (Tap to interrupt)';
          statusTag.className = 'status-tag speaking';
        }
      } else if (state === 'thinking') {
        if (waveContainer) waveContainer.className = 'voice-waveform active-thinking';
        if (statusTag) {
          statusTag.textContent = isHi ? '⚡ योजना एवं नियमों का मिलान...' : '⚡ Processing with AI Engine...';
          statusTag.className = 'status-tag thinking';
        }
      } else {
        if (waveContainer) waveContainer.className = 'voice-waveform idle';
        if (statusTag) {
          statusTag.textContent = isHi ? 'माइक पर क्लिक करें या सीधे बोलें' : 'Click Orb to Speak to AI';
          statusTag.className = 'status-tag idle';
        }
      }
    },

    setLiveTranscript: function (text) {
      var el = document.getElementById('live-transcript');
      if (el) el.textContent = text;
    },

    /* ---------------------------------------- GPT Conversational Stream */
    displayGPTConversationalResponse: function (userQuery, reasonResult) {
      var isHi = (this.lang === 'hi');
      var container = document.getElementById('factsheet-container');
      if (!container) return;

      container.hidden = false;
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if (!reasonResult) {
        this.displayNotFound(userQuery);
        return;
      }

      if (reasonResult.isTracking) {
        this.displayTrackingCard(reasonResult.trackId);
        return;
      }

      if (reasonResult.isGreeting) {
        var reply = isHi ? reasonResult.replyHi : reasonResult.replyEn;
        var html = `
          <div class="gpt-response-card">
            <div class="gpt-head">
              <div class="siri-mini-orb"></div>
              <div>
                <h3>Uttarakhand AI Citizen Copilot</h3>
                <span class="live-dot-status">● ${isHi ? 'Siri/Alexa वॉइस मोड एक्टिव' : 'Siri / Alexa Voice Mode Active'}</span>
              </div>
            </div>
            <div class="gpt-message-body">
              <p>${reply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>
            </div>
            <div class="gpt-suggestions-chips">
              <button class="btn btn-sm btn-outline" onclick="InfoTeller.processQuery('I lost my job want to start homestay')">💼 ${isHi ? 'स्वरोजगार लोन (MSY)' : 'Start Business Loan'}</button>
              <button class="btn btn-sm btn-outline" onclick="InfoTeller.processQuery('Daughter passed 12th class scholarship')">👧 ${isHi ? 'बेटी उच्च शिक्षा (₹51,000)' : 'Daughter Grant'}</button>
              <button class="btn btn-sm btn-outline" onclick="InfoTeller.processQuery('Father is 65 years old pension')">👴 ${isHi ? 'वृद्धावस्था पेंशन' : 'Senior Pension'}</button>
              <button class="btn btn-sm btn-outline" onclick="InfoTeller.processQuery('Drinking water pipe broken')">📣 ${isHi ? 'शिकायत दर्ज करें (1905)' : 'Lodge Grievance'}</button>
            </div>
          </div>
        `;
        container.innerHTML = html;
        this.speak(reply);
        return;
      }

      var svc = reasonResult.matchedService;
      this.currentService = svc;

      var gptText = "";
      if (reasonResult.isIssueMatch) {
        gptText = isHi ? reasonResult.replyHi : reasonResult.replyEn;
      } else {
        gptText = isHi ? svc.voiceSummaryHi : svc.voiceSummary;
      }

      var title = isHi ? svc.titleHi : svc.title;
      var dept = isHi ? svc.deptHi : svc.dept;
      var desc = isHi ? svc.descriptionHi : svc.description;

      var html = `
        <div class="gpt-response-card" id="active-factsheet">
          
          <div class="gpt-head">
            <div class="siri-mini-orb"></div>
            <div class="gpt-head-title">
              <h3>Uttarakhand AI Citizen Copilot</h3>
              <span class="user-query-tag">"${userQuery}"</span>
            </div>
            <div class="header-right-badges">
              <span class="meta-badge rts-badge">⏱️ ${svc.slaDays} ${isHi ? 'दिन' : 'Days'} SLA</span>
              <span class="meta-badge fee-badge">💰 ${svc.fee}</span>
            </div>
          </div>

          <div class="gpt-message-body">
            <div class="message-bubble-main">
              <p id="voice-response-text">${gptText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>
            </div>
            <button class="btn btn-ghost btn-sm btn-replay" id="btn-replay-voice">
              🔊 ${isHi ? 'पुनः सुनें' : 'Replay Voice'}
            </button>
          </div>

          <div class="matched-scheme-hero">
            <div class="scheme-hero-head">
              <span class="svc-icon-lg">${svc.icon}</span>
              <div>
                <span class="scheme-badge">${svc.category} · ${dept}</span>
                <h2>${title}</h2>
                <p>${desc}</p>
              </div>
            </div>

            ${svc.benefit ? `
              <div class="scheme-benefit-highlight">
                <span class="benefit-icon">🎁</span>
                <div>
                  <strong>${isHi ? 'योजना के मुख्य लाभ:' : 'Key Government Benefit:'}</strong>
                  <p>${isHi ? svc.benefitHi : svc.benefit}</p>
                </div>
              </div>
            ` : ''}

            <div class="scheme-docs-summary">
              <h4>📄 ${isHi ? 'अनिवार्य दस्तावेज चेकलिस्ट (जांचें):' : 'Mandatory Documents Checklist (Check Readiness):'}</h4>
              <div class="docs-checklist-compact">
                ${svc.mandatoryDocs.map((doc, idx) => `
                  <label class="doc-item-compact" for="doc-${idx}">
                    <input type="checkbox" id="doc-${idx}" class="doc-checkbox">
                    <span>${isHi ? doc.nameHi : doc.name}</span>
                    ${doc.digilocker ? '<span class="digi-tag-sm">⚡ DigiLocker</span>' : ''}
                  </label>
                `).join('')}
              </div>
            </div>

            <div class="scheme-action-bar">
              ${svc.isExternal ? `
                <button class="btn btn-primary btn-lg" id="btn-open-external-guide">
                  🚀 ${isHi ? 'आधिकारिक पोर्टल पर आवेदन करें (मार्गदर्शन सहित)' : 'Apply on Official Portal (Guided Steps)'} →
                </button>
              ` : `
                <button class="btn btn-primary btn-lg" id="btn-start-voice-apply">
                  🎙️ ${isHi ? 'AI द्वारा बोल कर आवेदन भरें (Talk-to-Apply)' : 'Apply Now by Voice (Talk-to-Apply)'}
                </button>
              `}
              <button class="btn btn-secondary btn-lg" id="btn-print-checklist">
                🖨️ ${isHi ? 'दस्तावेज चेकलिस्ट प्रिंट करें' : 'Print Checklist'}
              </button>
            </div>
          </div>

        </div>
      `;

      container.innerHTML = html;
      this.speak(gptText);
      this.bindFactsheetEvents(svc);
    },

    bindFactsheetEvents: function (svc) {
      var self = this;

      var btnReplay = document.getElementById('btn-replay-voice');
      if (btnReplay) {
        btnReplay.addEventListener('click', function () {
          var textEl = document.getElementById('voice-response-text');
          if (textEl) self.speak(textEl.textContent);
        });
      }

      var btnApply = document.getElementById('btn-start-voice-apply');
      if (btnApply) {
        btnApply.addEventListener('click', function () {
          self.launchTalkToApplyModal(svc);
        });
      }

      var btnExternal = document.getElementById('btn-open-external-guide');
      if (btnExternal) {
        btnExternal.addEventListener('click', function () {
          self.launchExternalGuideModal(svc);
        });
      }

      var btnPrint = document.getElementById('btn-print-checklist');
      if (btnPrint) {
        btnPrint.addEventListener('click', function () {
          window.print();
        });
      }
    },

    /* ------------------------------------------------ Talk-to-Apply Modal */
    launchTalkToApplyModal: function (svc) {
      var isHi = (this.lang === 'hi');
      this.formSession = {
        active: true,
        svc: svc,
        currentFieldIndex: 0,
        values: {}
      };

      var fields = svc.voiceForm && svc.voiceForm.length > 0 ? svc.voiceForm : [
        { id: "applicantName", label: "Full Name", labelHi: "पूरा नाम", ask: "What is your full name?", askHi: "आपका पूरा नाम क्या है?", prefill: "Ramesh Negi" },
        { id: "fatherName", label: "Father's Name", labelHi: "पिता का नाम", ask: "What is your father's name?", askHi: "आपके पिता का नाम क्या है?", prefill: "Bhagwan Singh Negi" },
        { id: "aadhaar", label: "Aadhaar Number", labelHi: "आधार संख्या", ask: "State your Aadhaar number.", askHi: "अपना आधार नंबर बोलिए।", prefill: "4728 9102 3841" },
        { id: "district", label: "District", labelHi: "जनपद", ask: "Which district do you live in?", askHi: "आप किस जनपद में रहते हैं?", prefill: "Dehradun" }
      ];

      this.formSession.fields = fields;

      var modalHtml = `
        <div class="apply-modal-overlay" id="apply-modal">
          <div class="apply-modal-container">
            <div class="modal-top-bar">
              <div class="modal-title-group">
                <span class="badge-tag">Talk-to-Apply AI Studio</span>
                <h2>${svc.icon} ${isHi ? svc.titleHi : svc.title}</h2>
              </div>
              <button class="modal-close-btn" id="btn-close-modal">✕</button>
            </div>

            <div class="digilocker-banner">
              <div class="digi-left">
                <span class="digi-icon">⚡</span>
                <div>
                  <strong>${isHi ? 'डिजिलॉकर द्वारा 1-क्लिक ऑटो-फिल' : '1-Click Auto-Fill from DigiLocker'}</strong>
                  <p>${isHi ? 'आधार एवं परिवार रजिस्टर से प्रमाणित जानकारी स्वतः भरें' : 'Instantly pull verified Aadhaar & Pariwar Register identity'}</p>
                </div>
              </div>
              <button class="btn btn-sm btn-digi" id="btn-digi-autofill">
                ⚡ ${isHi ? 'डिजिलॉकर से भरें' : 'Auto-Fill from DigiLocker'}
              </button>
            </div>

            <div class="apply-split-grid">
              
              <div class="dialogue-pane">
                <div class="voice-assistant-head">
                  <div class="siri-mini-orb"></div>
                  <div>
                    <h4>UK Gov Citizen Voice Agent</h4>
                    <span class="live-dot-status">● ${isHi ? 'लाइव संवाद' : 'Live Dialogue'}</span>
                  </div>
                </div>

                <div class="dialogue-chat-box" id="dialogue-chat-box">
                  <div class="chat-bubble ai">
                    ${isHi ? `नमस्ते! आइए मिलकर ${svc.titleHi} का आवेदन भरते हैं।` : `Hello! Let's fill out your application for ${svc.title}.`}
                  </div>
                </div>

                <div class="dialogue-mic-controller">
                  <button type="button" class="dialogue-mic-btn" id="btn-dialogue-mic">
                    🎙️
                  </button>
                  <span id="dialogue-mic-hint">${isHi ? 'उत्तर बोलने हेतु माइक दबाएँ' : 'Click Mic to Speak Answer'}</span>
                </div>

                <div class="manual-type-row">
                  <input type="text" id="manual-type-input" placeholder="${isHi ? 'या यहाँ उत्तर टाइप करें...' : 'Or type answer here...'}">
                  <button type="button" class="btn btn-sm btn-primary" id="btn-manual-submit">${isHi ? 'दर्ज करें' : 'Submit'}</button>
                </div>
              </div>

              <div class="form-pane">
                <div class="form-pane-head">
                  <span class="form-dept-label">Government of Uttarakhand · ${isHi ? svc.deptHi : svc.dept}</span>
                  <h3>Official e-District Application Form</h3>
                  <div class="form-progress-bar">
                    <div class="form-progress-fill" id="form-progress-fill" style="width: 10%"></div>
                  </div>
                </div>

                <form class="official-gov-form" id="official-gov-form" onsubmit="return false;">
                  ${fields.map((f, idx) => `
                    <div class="gov-form-group ${idx === 0 ? 'active-group' : ''}" id="group-${f.id}">
                      <label for="input-${f.id}">
                        ${isHi ? f.labelHi : f.label}
                        <span class="req-star">*</span>
                      </label>
                      <div class="input-wrap">
                        <input type="text" id="input-${f.id}" class="gov-input" readonly placeholder="${isHi ? 'आवाज़ द्वारा भरा जाएगा...' : 'Awaiting voice input...'}">
                        <span class="field-status-icon" id="status-${f.id}">⚪</span>
                      </div>
                    </div>
                  `).join('')}

                  <div class="form-submit-row" id="final-submit-row" hidden>
                    <button type="button" class="btn btn-primary btn-lg" id="btn-final-submit-form">
                      ✅ ${isHi ? 'आवेदन जमा करें (Submit Application)' : 'Submit Official Application'}
                    </button>
                  </div>
                </form>
              </div>

            </div>

            <div id="receipt-container" hidden></div>

          </div>
        </div>
      `;

      var modalRoot = document.getElementById('modal-root');
      if (!modalRoot) {
        modalRoot = document.createElement('div');
        modalRoot.id = 'modal-root';
        document.body.appendChild(modalRoot);
      }
      modalRoot.innerHTML = modalHtml;

      this.bindModalEvents(svc);
      this.promptNextFormField();
    },

    bindModalEvents: function (svc) {
      var self = this;

      var btnClose = document.getElementById('btn-close-modal');
      if (btnClose) {
        btnClose.addEventListener('click', function () {
          self.closeModal();
        });
      }

      var btnDigi = document.getElementById('btn-digi-autofill');
      if (btnDigi) {
        btnDigi.addEventListener('click', function () {
          self.simulateDigiLockerFill();
        });
      }

      var btnMic = document.getElementById('btn-dialogue-mic');
      if (btnMic) {
        btnMic.addEventListener('click', function () {
          self.startListening();
        });
      }

      var btnManual = document.getElementById('btn-manual-submit');
      var manualInput = document.getElementById('manual-type-input');
      if (btnManual && manualInput) {
        btnManual.addEventListener('click', function () {
          if (manualInput.value.trim()) {
            self.handleFormVoiceInput(manualInput.value.trim());
            manualInput.value = '';
          }
        });
        manualInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' && manualInput.value.trim()) {
            self.handleFormVoiceInput(manualInput.value.trim());
            manualInput.value = '';
          }
        });
      }

      var btnSubmit = document.getElementById('btn-final-submit-form');
      if (btnSubmit) {
        btnSubmit.addEventListener('click', function () {
          self.generateSubmissionReceipt(svc);
        });
      }
    },

    promptNextFormField: function () {
      if (!this.formSession || !this.formSession.active) return;

      var fields = this.formSession.fields;
      var idx = this.formSession.currentFieldIndex;
      var isHi = (this.lang === 'hi');

      if (idx >= fields.length) {
        var submitRow = document.getElementById('final-submit-row');
        if (submitRow) submitRow.hidden = false;

        var progressFill = document.getElementById('form-progress-fill');
        if (progressFill) progressFill.style.width = '100%';

        var allDoneMsg = isHi 
          ? "सभी विवरण सफलतापूर्वक भर दिए गए हैं! कृपया 'आवेदन जमा करें' पर क्लिक करें।"
          : "All details have been filled successfully! Please click 'Submit Official Application'.";
        
        this.addChatBubble('ai', allDoneMsg);
        this.speak(allDoneMsg);
        return;
      }

      var field = fields[idx];

      document.querySelectorAll('.gov-form-group').forEach(el => el.classList.remove('active-group'));
      var currentGroup = document.getElementById('group-' + field.id);
      if (currentGroup) currentGroup.classList.add('active-group');

      var progress = Math.round((idx / fields.length) * 100);
      var progressFill = document.getElementById('form-progress-fill');
      if (progressFill) progressFill.style.width = Math.max(10, progress) + '%';

      var askText = isHi ? field.askHi : field.ask;
      this.addChatBubble('ai', askText);
      
      var self = this;
      this.speak(askText, function () {
        setTimeout(function () {
          self.startListening();
        }, 300);
      });
    },

    handleFormVoiceInput: function (spokenAnswer) {
      if (!this.formSession || !this.formSession.active) return;
      var fields = this.formSession.fields;
      var idx = this.formSession.currentFieldIndex;

      if (idx >= fields.length) return;

      var field = fields[idx];
      var val = spokenAnswer.replace(/^[".]+|[".]+$/g, '').trim();

      var inputEl = document.getElementById('input-' + field.id);
      var statusEl = document.getElementById('status-' + field.id);

      if (inputEl) {
        inputEl.value = val;
        inputEl.classList.add('field-filled');
      }
      if (statusEl) {
        statusEl.textContent = '✅';
      }

      this.formSession.values[field.id] = val;
      this.addChatBubble('user', val);

      this.formSession.currentFieldIndex++;
      var self = this;
      setTimeout(function () {
        self.promptNextFormField();
      }, 400);
    },

    simulateDigiLockerFill: function () {
      if (!this.formSession || !this.formSession.active) return;
      var fields = this.formSession.fields;
      var isHi = (this.lang === 'hi');

      SiriAudioFX.playSuccessChord();

      this.addChatBubble('ai', isHi 
        ? "⚡ डिजिलॉकर से आधार एवं परिवार रजिस्टर डेटा सफलतापूर्वक सिंक किया गया!"
        : "⚡ Successfully fetched verified Aadhaar & Pariwar Register data from DigiLocker!");

      var self = this;
      fields.forEach(function (f) {
        var inputEl = document.getElementById('input-' + f.id);
        var statusEl = document.getElementById('status-' + f.id);
        if (inputEl && f.prefill) {
          inputEl.value = f.prefill;
          inputEl.classList.add('field-filled', 'field-digilocker');
        }
        if (statusEl) {
          statusEl.textContent = '⚡ Verified';
          statusEl.className = 'field-status-icon digi-verified';
        }
        self.formSession.values[f.id] = f.prefill;
      });

      this.formSession.currentFieldIndex = fields.length;
      var submitRow = document.getElementById('final-submit-row');
      if (submitRow) submitRow.hidden = false;

      var progressFill = document.getElementById('form-progress-fill');
      if (progressFill) progressFill.style.width = '100%';

      var msg = isHi 
        ? "सभी विवरण डिजिलॉकर द्वारा स्वतः भर दिए गए हैं! अब आप सीधे आवेदन जमा कर सकते हैं।"
        : "All fields have been auto-populated from DigiLocker! You can now submit your application.";

      this.speak(msg);
    },

    generateSubmissionReceipt: function (svc) {
      var isHi = (this.lang === 'hi');
      var appId = "UK-REV-2026-" + Math.floor(1000 + Math.random() * 9000);
      var dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

      SiriAudioFX.playSuccessChord();

      var receiptHtml = `
        <div class="receipt-card">
          <div class="receipt-stamp">✅ SUBMITTED</div>
          <div class="receipt-head">
            <span class="uk-badge">Government of Uttarakhand · Apuni Sarkar</span>
            <h2>Official Application Acknowledgement Slip</h2>
            <p>Application ID: <strong>${appId}</strong></p>
          </div>

          <div class="receipt-grid">
            <div class="receipt-item">
              <span class="r-label">Service:</span>
              <span class="r-val">${isHi ? svc.titleHi : svc.title}</span>
            </div>
            <div class="receipt-item">
              <span class="r-label">Department:</span>
              <span class="r-val">${isHi ? svc.deptHi : svc.dept}</span>
            </div>
            <div class="receipt-item">
              <span class="r-label">Applied Date:</span>
              <span class="r-val">${dateStr}</span>
            </div>
            <div class="receipt-item">
              <span class="r-label">RTS SLA Target:</span>
              <span class="r-val"><strong>${svc.slaDays} Working Days</strong></span>
            </div>
            <div class="receipt-item">
              <span class="r-label">Fee Paid:</span>
              <span class="r-val">${svc.fee}</span>
            </div>
            <div class="receipt-item">
              <span class="r-label">Assigned Officer:</span>
              <span class="r-val">${isHi ? svc.officerHi : svc.officer}</span>
            </div>
          </div>

          <div class="receipt-actions">
            <button class="btn btn-primary" onclick="window.print()">🖨️ Print Receipt</button>
            <button class="btn btn-secondary" id="btn-track-this-app">🔍 Track Status</button>
          </div>
        </div>
      `;

      var splitGrid = document.querySelector('.apply-split-grid');
      if (splitGrid) splitGrid.style.display = 'none';

      var digiBanner = document.querySelector('.digilocker-banner');
      if (digiBanner) digiBanner.style.display = 'none';

      var receiptContainer = document.getElementById('receipt-container');
      if (receiptContainer) {
        receiptContainer.hidden = false;
        receiptContainer.style.display = 'block';
        receiptContainer.innerHTML = receiptHtml;
      }

      var confMsg = isHi 
        ? `बधाई हो! आपका आवेदन सफलतापूर्वक जमा हो गया है। आपकी आवेदन संख्या है ${appId}।`
        : `Congratulations! Your application has been submitted successfully with Application ID ${appId}.`;

      this.speak(confMsg);

      var btnTrack = document.getElementById('btn-track-this-app');
      var self = this;
      if (btnTrack) {
        btnTrack.addEventListener('click', function () {
          self.closeModal();
          self.displayTrackingCard(appId);
        });
      }
    },

    addChatBubble: function (sender, text) {
      var box = document.getElementById('dialogue-chat-box');
      if (!box) return;
      var bubble = document.createElement('div');
      bubble.className = 'chat-bubble ' + sender;
      bubble.textContent = text;
      box.appendChild(bubble);
      box.scrollTop = box.scrollHeight;
    },

    closeModal: function () {
      this.formSession = null;
      var modal = document.getElementById('apply-modal');
      if (modal) modal.remove();
      this.stopSpeaking();
      this.stopListening();
    },

    /* ------------------------------------------- External Guided Modal */
    launchExternalGuideModal: function (svc) {
      var isHi = (this.lang === 'hi');
      var steps = isHi ? svc.externalStepsHi : svc.externalSteps;

      var modalHtml = `
        <div class="apply-modal-overlay" id="apply-modal">
          <div class="apply-modal-container external-guide-container">
            <div class="modal-top-bar">
              <div class="modal-title-group">
                <span class="badge-tag">Official External Portal Guide</span>
                <h2>${svc.icon} ${isHi ? svc.titleHi : svc.title}</h2>
              </div>
              <button class="modal-close-btn" id="btn-close-modal">✕</button>
            </div>

            <div class="external-guide-body">
              <p class="guide-intro">${isHi ? 'यह सेवा भारत सरकार के अधिकृत पोर्टल द्वारा संचालित होती है। कृपया नीचे दिए गए 3 चरणों का पालन करें:' : 'This service is operated directly by the Government of India portal. Follow these 3 quick steps on the official site:'}</p>

              <div class="guide-steps-list">
                ${steps.map((st, i) => `
                  <div class="guide-step-card">
                    <span class="step-badge">${i + 1}</span>
                    <p>${st}</p>
                  </div>
                `).join('')}
              </div>

              <div class="guide-action-row">
                <a href="${svc.externalUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-lg">
                  🚀 ${isHi ? 'आधिकारिक पोर्टल खोलें' : 'Open Official Portal'} (${svc.externalUrl.replace('https://', '').split('/')[0]}) →
                </a>
              </div>
            </div>
          </div>
        </div>
      `;

      var modalRoot = document.getElementById('modal-root');
      if (!modalRoot) {
        modalRoot = document.createElement('div');
        modalRoot.id = 'modal-root';
        document.body.appendChild(modalRoot);
      }
      modalRoot.innerHTML = modalHtml;

      var btnClose = document.getElementById('btn-close-modal');
      var self = this;
      if (btnClose) {
        btnClose.addEventListener('click', function () {
          self.closeModal();
        });
      }

      var guideMsg = isHi 
        ? `हम आपको ${svc.titleHi} के आधिकारिक पोर्टल पर निर्देशित कर रहे हैं।`
        : `Guiding you to the official portal for ${svc.title}.`;
      this.speak(guideMsg);
    },

    /* ------------------------------------------- Application Status Tracking */
    displayTrackingCard: function (appId) {
      var isHi = (this.lang === 'hi');
      var app = global.UK_KB.mockApplications[appId] || {
        id: appId,
        serviceName: "Citizen Service Application",
        serviceNameHi: "नागरिक सेवा आवेदन",
        applicant: "Ramesh Negi",
        applicantHi: "रमेश नेगी",
        appliedOn: "12 Aug 2026",
        targetDate: "27 Aug 2026 (15 Days RTS)",
        status: "In Progress",
        statusHi: "प्रक्रियाधीन",
        timeline: [
          { title: "Application Submitted Online", titleHi: "आवेदन ऑनलाइन जमा हुआ", date: "12 Aug 2026", done: true },
          { title: "Field Verification by Patwari", titleHi: "पटवारी द्वारा स्थलीय सत्यापन", date: "In Progress", done: true },
          { title: "Tehsildar Digital Signature", titleHi: "तहसीलदार डिजिटल हस्ताक्षर", date: "Pending", done: false }
        ]
      };

      var container = document.getElementById('factsheet-container');
      if (!container) return;

      container.hidden = false;
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });

      var html = `
        <div class="factsheet-card tracking-factsheet-card">
          <div class="tracking-header">
            <div class="header-left">
              <span class="service-id-badge">Live Application Status Tracking</span>
              <h2 class="service-title">🔍 Application ID: ${app.id}</h2>
              <p class="service-desc">${isHi ? app.serviceNameHi : app.serviceName} · Applicant: <strong>${isHi ? app.applicantHi : app.applicant}</strong></p>
            </div>
            <div class="header-right">
              <span class="status-badge-lg ${app.statusCode === 'approved' ? 'status-approved' : 'status-progress'}">
                ● ${isHi ? app.statusHi : app.status}
              </span>
            </div>
          </div>

          <div class="status-timeline">
            ${app.timeline.map((item, i) => `
              <div class="status-timeline-node ${item.done ? 'node-done' : 'node-pending'}">
                <div class="node-icon">${item.done ? '✓' : '⏳'}</div>
                <div class="node-info">
                  <h4>${isHi ? item.titleHi : item.title}</h4>
                  <span class="node-date">${item.date}</span>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="tracking-footer">
            <p>⏱️ Guaranteed Delivery Date: <strong>${app.targetDate}</strong> (Under Uttarakhand RTS Act)</p>
            <button class="btn btn-outline btn-sm" id="btn-back-to-home">← Ask Another Question</button>
          </div>
        </div>
      `;

      container.innerHTML = html;

      var spokenStatus = isHi 
        ? `आवेदन संख्या ${app.id} वर्तमान में ${app.statusHi} है। अनुमानित डिलीवरी तिथि ${app.targetDate} है।`
        : `Application ID ${app.id} is currently ${app.status}. Expected delivery target is ${app.targetDate}.`;

      this.speak(spokenStatus);

      var btnBack = document.getElementById('btn-back-to-home');
      if (btnBack) {
        btnBack.addEventListener('click', function () {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }
    },

    displayNotFound: function (userQuery) {
      var container = document.getElementById('factsheet-container');
      if (!container) return;

      container.hidden = false;
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });

      var isHi = (this.lang === 'hi');

      var html = `
        <div class="factsheet-card not-found-card">
          <div class="not-found-header">
            <span class="icon">🤖</span>
            <h2>${isHi ? `उत्तराखंड AI सहायक: "${userQuery}"` : `UK AI Copilot Advisory for: "${userQuery}"`}</h2>
            <p>${isHi ? 'मैं आपकी समस्या का समाधान खोजने में मदद कर रहा हूँ। यहाँ संबंधित सरकारी योजनाएं हैं, जिन्हें आप सीधे चुन सकते हैं:' : 'I am matching your issue with Uttarakhand Government programs. Here are the top relevant schemes you can explore:'}</p>
          </div>
          <div class="grid grid-3 not-found-grid">
            ${global.UK_KB.services.slice(0, 6).map(s => `
              <div class="service-quick-card" data-svcid="${s.id}">
                <div class="card-top">
                  <span class="q-icon">${s.icon}</span>
                  <span class="q-sla">⏱️ ${s.slaDays} ${isHi ? 'दिन' : 'Days'}</span>
                </div>
                <h4>${isHi ? s.titleHi : s.title}</h4>
                <p>${isHi ? s.deptHi : s.dept}</p>
                <div class="card-bottom">
                  <span class="q-fee">${s.fee}</span>
                  <button class="btn btn-sm btn-ghost">View Info →</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      container.innerHTML = html;

      var speechMsg = isHi 
        ? `मैं आपकी समस्या का समाधान खोजने में मदद कर रहा हूँ। यहाँ मुख्य सरकारी योजनाएं उपलब्ध हैं।`
        : `I am here to assist you with this issue. Here are the top relevant government schemes.`;
      this.speak(speechMsg);

      var cards = container.querySelectorAll('.service-quick-card');
      var self = this;
      cards.forEach(function (c) {
        c.addEventListener('click', function () {
          var id = this.getAttribute('data-svcid');
          var matched = global.UK_KB.services.find(s => s.id === id);
          if (matched) self.displayGPTConversationalResponse(matched.title, { isDirectService: true, matchedService: matched });
        });
      });
    },

    /* -------------------------------------------------- Rendering Catalogues */
    renderSampleQuestions: function () {
      var container = document.getElementById('sample-questions-chips');
      if (!container) return;

      var self = this;
      var isHi = (this.lang === 'hi');
      var list = isHi ? global.UK_KB.questionsHi : global.UK_KB.questionsEn;

      container.innerHTML = list.map(function (q) {
        return `<button type="button" class="question-chip" data-query="${q.text}" data-svcid="${q.svcId || ''}" data-track="${q.isTrack ? q.trackId : ''}">
          <span class="chip-tag">${q.tag}</span>
          <span class="chip-text">"${q.text}"</span>
        </button>`;
      }).join('');

      container.querySelectorAll('.question-chip').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var text = this.getAttribute('data-query');
          self.processQuery(text);
        });
      });
    },

    renderDepartments: function () {
      var container = document.getElementById('department-tabs');
      if (!container) return;

      var self = this;
      var isHi = (this.lang === 'hi');

      container.innerHTML = global.UK_KB.departments.map(function (dept, i) {
        return `<button type="button" class="dept-tab ${i === 0 ? 'active' : ''}" data-dept="${dept.id}">
          <span class="dept-icon">${dept.icon}</span>
          <span class="dept-name">${isHi ? dept.nameHi : dept.name}</span>
          <span class="dept-count">(${dept.count})</span>
        </button>`;
      }).join('');

      container.querySelectorAll('.dept-tab').forEach(function (btn) {
        btn.addEventListener('click', function () {
          container.querySelectorAll('.dept-tab').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          var deptId = this.getAttribute('data-dept');
          self.filterServicesByDept(deptId);
        });
      });
    },

    renderInitialServices: function () {
      this.filterServicesByDept('all');
    },

    filterServicesByDept: function (deptId) {
      var grid = document.getElementById('services-catalogue-grid');
      if (!grid) return;

      var isHi = (this.lang === 'hi');
      var list = (deptId === 'all') 
        ? global.UK_KB.services 
        : global.UK_KB.services.filter(s => s.deptSlug === deptId);

      var self = this;
      grid.innerHTML = list.map(function (svc) {
        return `
          <div class="service-card" data-svcid="${svc.id}">
            <div class="svc-card-header">
              <span class="svc-icon">${svc.icon}</span>
              <span class="svc-sla-badge">⏱️ ${svc.slaDays} ${isHi ? 'दिन' : 'Days'} SLA</span>
            </div>
            <h3 class="svc-card-title">${isHi ? svc.titleHi : svc.title}</h3>
            <p class="svc-card-dept">${isHi ? svc.deptHi : svc.dept}</p>
            <p class="svc-card-desc">${(isHi ? svc.descriptionHi : svc.description).substring(0, 95)}...</p>
            <div class="svc-card-footer">
              <span class="svc-fee-tag">${isHi ? 'लाभ/शुल्क:' : 'Benefit/Fee:'} <strong>${svc.benefit ? '₹ Subsidy' : svc.fee}</strong></span>
              <button class="btn btn-outline btn-sm">${isHi ? 'AI से पूछें 🎙️' : 'Ask AI Copilot 🎙️'}</button>
            </div>
          </div>
        `;
      }).join('');

      grid.querySelectorAll('.service-card').forEach(function (card) {
        card.addEventListener('click', function () {
          var id = this.getAttribute('data-svcid');
          var matched = global.UK_KB.services.find(s => s.id === id);
          if (matched) {
            self.displayGPTConversationalResponse(matched.title, { isDirectService: true, matchedService: matched });
          }
        });
      });
    },

    /* ------------------------------------------------------- Event Bindings */
    bindEvents: function () {
      var self = this;

      var langBtn = document.getElementById('btn-lang-toggle');
      if (langBtn) {
        langBtn.addEventListener('click', function () {
          self.setLanguage(self.lang === 'en' ? 'hi' : 'en');
        });
      }

      var micBtn = document.getElementById('hero-mic-btn');
      if (micBtn) {
        micBtn.addEventListener('click', function () {
          self.toggleListening();
        });
      }

      var muteBtn = document.getElementById('btn-mute-toggle');
      if (muteBtn) {
        muteBtn.addEventListener('click', function () {
          self.toggleMute();
        });
      }

      var searchInput = document.getElementById('main-search-input');
      var searchBtn = document.getElementById('btn-search-submit');

      if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function () {
          self.processQuery(searchInput.value);
        });

        searchInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            self.processQuery(searchInput.value);
          }
        });
      }

      var floatAssistBtn = document.getElementById('btn-float-assist');
      if (floatAssistBtn) {
        floatAssistBtn.addEventListener('click', function () {
          self.startListening();
        });
      }

      var contrastBtn = document.getElementById('btn-contrast-toggle');
      if (contrastBtn) {
        contrastBtn.addEventListener('click', function () {
          document.body.classList.toggle('high-contrast');
          var isHigh = document.body.classList.contains('high-contrast');
          this.textContent = isHigh ? '👁️ Standard Mode' : '👁️ High Contrast';
        });
      }

      var fontIncBtn = document.getElementById('btn-font-increase');
      var fontDecBtn = document.getElementById('btn-font-decrease');
      var fontResetBtn = document.getElementById('btn-font-reset');

      if (fontIncBtn) fontIncBtn.addEventListener('click', () => document.documentElement.style.fontSize = '18px');
      if (fontDecBtn) fontDecBtn.addEventListener('click', () => document.documentElement.style.fontSize = '14px');
      if (fontResetBtn) fontResetBtn.addEventListener('click', () => document.documentElement.style.fontSize = '16px');
    }
  };

  global.InfoTeller = InfoTeller;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => InfoTeller.init());
  } else {
    InfoTeller.init();
  }

})(typeof window !== 'undefined' ? window : this);
