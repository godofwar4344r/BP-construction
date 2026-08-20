/* ==========================================================================
   nlu.js — understanding what the citizen said. Runs entirely in the browser.

   Deliberately NOT an LLM. For an MVP that a government has to trust, a
   deterministic rule + fuzzy-match layer is the right call:
     - it works offline and on a 2G connection,
     - it costs nothing per request,
     - every decision is inspectable and auditable,
     - it cannot hallucinate a service that does not exist.

   The LLM upgrade path is documented in docs/02-ARCHITECTURE.md — swap
   NLU.parse() for a server call and keep the same return shape.
   ========================================================================== */

(function (global) {
  'use strict';

  /* ------------------------------------------------------------ normalising */

  var DEVANAGARI_DIGITS = { '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9' };

  // Spoken digits, both scripts. People read Aadhaar/mobile numbers digit by digit.
  var DIGIT_WORDS = {
    'शून्य': 0, 'सुन्न': 0, 'जीरो': 0, 'zero': 0, 'oh': 0,
    'एक': 1, 'one': 1, 'इक': 1,
    'दो': 2, 'two': 2, 'दुई': 2,
    'तीन': 3, 'three': 3,
    'चार': 4, 'four': 4,
    'पांच': 5, 'पाँच': 5, 'five': 5,
    'छह': 6, 'छै': 6, 'छ': 6, 'six': 6,
    'सात': 7, 'seven': 7,
    'आठ': 8, 'eight': 8,
    'नौ': 9, 'nine': 9
  };

  // Multipliers for spoken amounts: "पचास हजार", "two lakh fifty thousand"
  var MULTIPLIERS = {
    'सौ': 100, 'hundred': 100,
    'हजार': 1000, 'हज़ार': 1000, 'thousand': 1000, 'k': 1000,
    'लाख': 100000, 'lakh': 100000, 'lac': 100000,
    'करोड़': 10000000, 'करोड': 10000000, 'crore': 10000000
  };

  // Compound Hindi numbers up to 100 — enough for incomes, years and ages.
  var HINDI_NUMBERS = {
    'दस': 10, 'ग्यारह': 11, 'बारह': 12, 'तेरह': 13, 'चौदह': 14, 'पंद्रह': 15, 'पन्द्रह': 15,
    'सोलह': 16, 'सत्रह': 17, 'अठारह': 18, 'उन्नीस': 19, 'बीस': 20, 'पच्चीस': 25,
    'तीस': 30, 'पैंतीस': 35, 'चालीस': 40, 'पैंतालीस': 45, 'पचास': 50, 'पचपन': 55,
    'साठ': 60, 'पैंसठ': 65, 'सत्तर': 70, 'पचहत्तर': 75, 'अस्सी': 80, 'पचासी': 85,
    'नब्बे': 90, 'पंचानबे': 95, 'सौ': 100,
    'ten': 10, 'eleven': 11, 'twelve': 12, 'fifteen': 15, 'twenty': 20, 'twenty five': 25,
    'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90
  };

  var MONTHS = {
    'जनवरी': 1, 'january': 1, 'jan': 1,
    'फरवरी': 2, 'february': 2, 'feb': 2,
    'मार्च': 3, 'march': 3, 'mar': 3,
    'अप्रैल': 4, 'april': 4, 'apr': 4,
    'मई': 5, 'may': 5,
    'जून': 6, 'june': 6, 'jun': 6,
    'जुलाई': 7, 'july': 7, 'jul': 7,
    'अगस्त': 8, 'august': 8, 'aug': 8,
    'सितंबर': 9, 'सितम्बर': 9, 'september': 9, 'sep': 9, 'sept': 9,
    'अक्टूबर': 10, 'october': 10, 'oct': 10,
    'नवंबर': 11, 'नवम्बर': 11, 'november': 11, 'nov': 11,
    'दिसंबर': 12, 'दिसम्बर': 12, 'december': 12, 'dec': 12
  };

  function normalise(s) {
    if (!s) return '';
    return String(s)
      .replace(/[०-९]/g, function (d) { return DEVANAGARI_DIGITS[d]; })
      .replace(/[।,.!?;:"'`]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  /* ---------------------------------------------------------------- intents */

  var INTENT_PATTERNS = [
    { intent: 'cancel', words: ['रद्द', 'कैंसिल', 'बंद करो', 'रुको', 'छोड़ो', 'cancel', 'stop', 'quit', 'exit', 'nevermind'] },
    { intent: 'repeat', words: ['फिर से', 'दोबारा', 'दुबारा', 'दोहराओ', 'क्या कहा', 'समझ नहीं', 'repeat', 'again', 'say again', 'pardon', 'what did you say'] },
    { intent: 'back',   words: ['पीछे', 'वापस', 'पिछला', 'गलत हो गया', 'back', 'previous', 'go back', 'undo', 'correct that'] },
    { intent: 'help',   words: ['मदद', 'सहायता', 'हेल्प', 'क्या कर सकते', 'कैसे', 'help', 'what can you do', 'how do i', 'guide me'] },
    { intent: 'track',  words: ['स्थिति', 'स्टेटस', 'कहाँ पहुंचा', 'कहां पहुंचा', 'ट्रैक', 'आवेदन की स्थिति', 'track', 'status', 'where is my application', 'check application'] },
    { intent: 'download', words: ['डाउनलोड', 'प्रमाणपत्र निकालो', 'सर्टिफिकेट डाउनलोड', 'download', 'get certificate', 'my certificate'] },
    { intent: 'locker', words: ['डिजिलॉकर', 'डिजी लॉकर', 'मेरे दस्तावेज', 'मेरे कागज', 'digilocker', 'my documents', 'my papers'] },
    { intent: 'list',   words: ['सेवाएं', 'सेवाएँ', 'सूची', 'क्या क्या', 'सब दिखाओ', 'services', 'list services', 'show all', 'what services'] },
    { intent: 'grievance', words: ['शिकायत', 'समस्या', 'परेशानी', 'complaint', 'grievance', 'problem'] },
    { intent: 'home',   words: ['होम', 'मुख्य पृष्ठ', 'शुरू से', 'home', 'main page', 'start over'] },
    { intent: 'apply',  words: ['आवेदन', 'अप्लाई', 'बनवाना', 'बनवाना है', 'चाहिए', 'बनाना है', 'apply', 'i need', 'i want', 'make me', 'get me'] }
  ];

  var YES = ['हाँ', 'हां', 'हा', 'जी', 'जी हाँ', 'ठीक', 'ठीक है', 'सही', 'सही है', 'बिलकुल', 'हाँ जी', 'ok', 'okay', 'yes', 'yeah', 'yep', 'correct', 'right', 'sure', 'confirm', 'proceed'];
  var NO  = ['नहीं', 'ना', 'नही', 'गलत', 'गलत है', 'नहीं जी', 'no', 'nope', 'wrong', 'incorrect', 'not right'];
  var SKIP = ['छोड़ो', 'स्किप', 'पता नहीं', 'नहीं पता', 'बाद में', 'skip', 'later', 'dont know', "don't know", 'not sure', 'pass'];

  /* ------------------------------------------------------------ text search */

  /** Cheap token-overlap score. Good enough, and explainable. */
  function tokenScore(query, target) {
    var q = normalise(query).split(' ').filter(function (t) { return t.length > 1; });
    var t = normalise(target);
    if (!q.length) return 0;
    var hits = 0;
    q.forEach(function (tok) { if (t.indexOf(tok) !== -1) hits++; });
    return hits / q.length;
  }

  /** Levenshtein, capped — catches ASR near-misses like "आए" for "आय". */
  function editDistance(a, b) {
    a = normalise(a); b = normalise(b);
    if (a === b) return 0;
    if (Math.abs(a.length - b.length) > 4) return 99;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur[0] = i;
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur.slice();
    }
    return prev[b.length];
  }

  /* ------------------------------------------------------------------- API */

  var NLU = {
    services: [],
    districts: [],

    load: function (data) {
      this.services = data.services || [];
      this.districts = data.districts || [];
      return this;
    },

    normalise: normalise,

    /** Simple yes / no / skip classification for confirmation turns. */
    yesNo: function (text) {
      var t = normalise(text);
      if (SKIP.some(function (w) { return t.indexOf(normalise(w)) !== -1; })) return 'skip';
      if (NO.some(function (w) { return t === normalise(w) || t.indexOf(normalise(w)) !== -1; })) return 'no';
      if (YES.some(function (w) { return t === normalise(w) || t.indexOf(normalise(w)) !== -1; })) return 'yes';
      return 'unknown';
    },

    /**
     * Top-level parse. Returns:
     *   { intent, service, confidence, raw }
     * `service` is populated whenever the utterance names a service, whatever
     * the intent — "आय प्रमाण पत्र की स्थिति" is intent=track, service=income.
     */
    parse: function (text) {
      var raw = String(text || '');
      var t = normalise(raw);

      var result = { intent: null, service: null, confidence: 0, raw: raw };
      if (!t) return result;

      // 1. Which service was named? Do this first — it is the strongest signal.
      var match = this.matchService(raw);
      if (match) {
        result.service = match.service;
        result.confidence = match.score;
      }

      // 2. Which intent? Longest matching phrase wins so "आवेदन की स्थिति"
      //    resolves to track, not apply.
      var best = null, bestLen = 0;
      INTENT_PATTERNS.forEach(function (p) {
        p.words.forEach(function (w) {
          var nw = normalise(w);
          if (t.indexOf(nw) !== -1 && nw.length > bestLen) {
            best = p.intent;
            bestLen = nw.length;
          }
        });
      });

      result.intent = best;

      // A named service with no explicit verb means "apply".
      if (!result.intent && result.service) result.intent = 'apply';
      if (!result.intent) result.intent = 'unknown';

      return result;
    },

    /**
     * Find the service the citizen means.
     * Scores keywords, then names, then fuzzy — returns null below threshold
     * so the agent asks rather than guessing wrong.
     */
    matchService: function (text) {
      var t = normalise(text);
      if (t.length < 2) return null;

      var scored = [];

      this.services.forEach(function (svc) {
        var score = 0;

        (svc.keywords || []).forEach(function (kw) {
          var nk = normalise(kw);
          if (!nk) return;
          if (t === nk) score = Math.max(score, 1.0);
          else if (t.indexOf(nk) !== -1) score = Math.max(score, 0.85 + Math.min(nk.length / 100, 0.1));
          else if (nk.indexOf(t) !== -1 && t.length > 3) score = Math.max(score, 0.7);
        });

        score = Math.max(score, tokenScore(text, svc.hi) * 0.8);
        score = Math.max(score, tokenScore(text, svc.en) * 0.8);

        // Fuzzy last resort, only for short utterances (a bare service name).
        if (score < 0.5 && t.split(' ').length <= 4) {
          var d = Math.min(editDistance(t, svc.hi), editDistance(t, svc.en));
          if (d <= 2) score = Math.max(score, 0.65);
        }

        if (score > 0) scored.push({ service: svc, score: score });
      });

      if (!scored.length) return null;
      scored.sort(function (a, b) { return b.score - a.score; });

      return scored[0].score >= 0.5 ? scored[0] : null;
    },

    /** Ranked list, for the search box and the "did you mean" prompt. */
    searchServices: function (text, limit) {
      var t = normalise(text);
      if (!t) return this.services.slice(0, limit || 20);

      var out = [];
      this.services.forEach(function (svc) {
        var s = 0;
        (svc.keywords || []).forEach(function (kw) {
          if (normalise(kw).indexOf(t) !== -1 || t.indexOf(normalise(kw)) !== -1) s = Math.max(s, 0.9);
        });
        s = Math.max(s, tokenScore(text, svc.en + ' ' + svc.hi + ' ' + svc.deptEn + ' ' + svc.deptHi));
        if (normalise(svc.en).indexOf(t) !== -1 || normalise(svc.hi).indexOf(t) !== -1) s = Math.max(s, 0.95);
        if (s > 0.15) out.push({ svc: svc, s: s });
      });

      out.sort(function (a, b) { return b.s - a.s; });
      return out.slice(0, limit || 20).map(function (o) { return o.svc; });
    },

    /* ---------------------------------------------------- value extraction */

    /**
     * Turn what was said into the value a form field needs.
     * Returns null when nothing usable was heard, so the agent re-asks
     * instead of storing garbage.
     */
    extract: function (type, text, field) {
      var t = normalise(text);
      if (!t) return null;

      switch (type) {
        case 'aadhaar':  return this._digits(t, 12);
        case 'mobile':   return this._digits(t, 10);
        case 'account':  return this._digits(t, 0);
        case 'amount':   return this._amount(t);
        case 'year':     return this._year(t);
        case 'date':     return this._date(t);
        case 'choice':   return this._choice(t, field);
        default:         return this._text(text);
      }
    },

    /** Pull `len` digits out, accepting both "9876543210" and "नौ आठ सात…". */
    _digits: function (t, len) {
      var direct = t.replace(/[^0-9]/g, '');
      if (len ? direct.length === len : direct.length >= 6) return direct;

      var words = t.split(' ');
      var digits = '';
      words.forEach(function (w) {
        if (/^\d+$/.test(w)) { digits += w; return; }
        if (DIGIT_WORDS.hasOwnProperty(w)) { digits += DIGIT_WORDS[w]; return; }
        // "double 5" / "डबल पांच"
        if (w === 'double' || w === 'डबल') digits += '__DOUBLE__';
      });

      digits = digits.replace(/__DOUBLE__(\d)/g, '$1$1').replace(/__DOUBLE__/g, '');

      if (len && digits.length === len) return digits;
      if (!len && digits.length >= 6) return digits;

      // Fall back to whatever digits we did find, so the UI can show it as
      // a partial value the citizen can correct.
      if (direct.length >= 4) return direct;
      return null;
    },

    /** "पचास हजार", "2.5 lakh", "₹1,20,000" → integer rupees. */
    _amount: function (t) {
      var cleaned = t.replace(/[₹,]/g, ' ').replace(/\s+/g, ' ').trim();

      var plain = cleaned.replace(/[^0-9.]/g, '');
      var hasMultiplier = Object.keys(MULTIPLIERS).some(function (m) { return cleaned.indexOf(m) !== -1; });

      if (plain && !hasMultiplier) {
        var n = parseFloat(plain);
        return isNaN(n) ? null : Math.round(n);
      }

      var total = 0, current = 0, found = false;
      cleaned.split(' ').forEach(function (w) {
        if (/^[\d.]+$/.test(w)) { current += parseFloat(w); found = true; return; }
        if (HINDI_NUMBERS.hasOwnProperty(w)) { current += HINDI_NUMBERS[w]; found = true; return; }
        if (DIGIT_WORDS.hasOwnProperty(w)) { current += DIGIT_WORDS[w]; found = true; return; }
        if (MULTIPLIERS.hasOwnProperty(w)) {
          var m = MULTIPLIERS[w];
          current = (current || 1) * m;
          if (m >= 1000) { total += current; current = 0; }
          found = true;
        }
      });

      var val = Math.round(total + current);
      return found && val > 0 ? val : null;
    },

    _year: function (t) {
      var m = t.match(/\b(19\d{2}|20\d{2})\b/);
      if (m) return m[1];
      var d = this._digits(t, 4);
      return d && /^(19|20)/.test(d) ? d : null;
    },

    /** Accepts "15 मई 1985", "15/05/1985", "1985-05-15". */
    _date: function (t) {
      var iso = t.match(/\b(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})\b/);
      if (iso) return this._iso(iso[1], iso[2], iso[3]);

      var dmy = t.match(/\b(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})\b/);
      if (dmy) {
        var y = dmy[3].length === 2 ? (parseInt(dmy[3], 10) > 30 ? '19' + dmy[3] : '20' + dmy[3]) : dmy[3];
        return this._iso(y, dmy[2], dmy[1]);
      }

      // Spoken: day, month name, year
      var monthNum = null, monthWord = null;
      Object.keys(MONTHS).forEach(function (name) {
        if (t.indexOf(name) !== -1 && (!monthWord || name.length > monthWord.length)) {
          monthWord = name; monthNum = MONTHS[name];
        }
      });

      if (monthNum) {
        var yearM = t.match(/\b(19\d{2}|20\d{2})\b/);
        var before = t.split(monthWord)[0];
        var dayM = (before.match(/(\d{1,2})\s*$/) || [])[1] || (t.match(/\b(\d{1,2})\b/) || [])[1];
        if (yearM && dayM) return this._iso(yearM[1], monthNum, dayM);
      }

      return null;
    },

    _iso: function (y, m, d) {
      m = String(parseInt(m, 10)); d = String(parseInt(d, 10));
      if (!(+m >= 1 && +m <= 12) || !(+d >= 1 && +d <= 31)) return null;
      return y + '-' + (m.length < 2 ? '0' + m : m) + '-' + (d.length < 2 ? '0' + d : d);
    },

    /** Match against the field's option list, in either language. */
    _choice: function (t, field) {
      if (!field) return null;
      var options = field.options || (field.optionsRef === 'districts' ? this.districts : null);
      if (!options) return null;

      var best = null, bestScore = 0;
      options.forEach(function (o) {
        var candidates = [o.hi, o.en, o.v];
        candidates.forEach(function (c) {
          if (!c) return;
          var nc = normalise(c);
          var s = 0;
          if (t === nc) s = 1;
          else if (t.indexOf(nc) !== -1) s = 0.9;
          else if (editDistance(t, nc) <= 2) s = 0.7;
          if (s > bestScore) { bestScore = s; best = o; }
        });
      });

      return bestScore >= 0.6 ? best.v : null;
    },

    _text: function (raw) {
      var s = String(raw).trim()
        .replace(/^(मेरा नाम|my name is|mera naam|it is|is|यह है)\s+/i, '')
        .replace(/\s*(है|hai)\.?$/i, '')
        .trim();
      return s.length ? s : null;
    },

    /** Human-readable label for a stored choice value. */
    labelFor: function (field, value, lang) {
      var options = (field && field.options) || (field && field.optionsRef === 'districts' ? this.districts : null);
      if (!options) return value;
      var hit = options.filter(function (o) { return o.v === value; })[0];
      return hit ? (lang === 'hi' ? hit.hi : hit.en) : value;
    },

    /** Speak digits one at a time so read-back is actually intelligible. */
    spellOut: function (value) {
      return String(value).split('').join(' ');
    }
  };

  global.NLU = NLU;
})(window);
