/* =============================================================================
   match.js — intent matching for Ek Sawal

   Replaces the substring scan that routed "ration card" to the RTO because
   "ration CARd" contains "car".

   Rules this engine follows:
     1. Match on whole words, never on substrings inside a word.
     2. Longer, more specific phrases outrank single generic words.
     3. Below a confidence floor, ASK — never assert. A wrong answer costs a
        citizen a bus fare and a day's wage; "I'm not sure, is it one of these?"
        costs nothing.
     4. Never guess an application ID. No ID, no tracking result.
   ============================================================================= */

(function (global) {
  'use strict';

  var KB = global.KB;

  /* Devanagari matras and halant must survive tokenisation, so we split on
     anything that is not a letter, a mark or a number. */
  var SPLIT = /[^\p{L}\p{M}\p{N}]+/u;

  /* Words carrying no routing signal in either language. */
  var STOP = ('the a an of for to in on at is are was be my me i we our your you '
    + 'how what where when which who can do does need want get make take give '
    + 'please kindly kaise kya kahan kab kaun mujhe mera meri hume chahiye '
    + 'का की के को में से पर है हैं था थी और या भी ही तो कि जो यह वह मुझे मेरा मेरी '
    + 'हमें चाहिए कैसे क्या कहाँ कब कौन करना होगा बनवाना लेना चाहता चाहती').split(/\s+/);

  var STOPSET = Object.create(null);
  STOP.forEach(function (w) { STOPSET[w] = true; });

  function normalise(s) {
    return String(s == null ? '' : s).toLowerCase().normalize('NFC').trim();
  }

  function tokenise(s) {
    return normalise(s).split(SPLIT).filter(function (t) {
      return t && !STOPSET[t];
    });
  }

  /* True only when `phrase` appears in `tokens` as a run of whole words. */
  function hasPhrase(tokens, phrase) {
    var p = tokenise(phrase);
    if (!p.length) return false;
    for (var i = 0; i + p.length <= tokens.length; i++) {
      var ok = true;
      for (var j = 0; j < p.length; j++) {
        if (tokens[i + j] !== p[j]) { ok = false; break; }
      }
      if (ok) return true;
    }
    return false;
  }

  /* A multi-word phrase is strong evidence; a lone common word is weak. */
  function weightOf(phrase) {
    var words = tokenise(phrase).length;
    if (words >= 3) return 10;
    if (words === 2) return 6;
    return phrase.length >= 6 ? 3 : 2;
  }

  var ID_RE = /\b([A-Z]{2}-[A-Z]{2,4}-\d{4}-\d{3,6})\b/i;

  var GREET = ['hello', 'hi', 'hey', 'namaste', 'namaskar', 'नमस्ते', 'नमस्कार', 'help', 'मदद', 'सहायता'];

  /* ------------------------------------------------------------------ rules
     A few situations carry meaning that keyword weights cannot see. "My father
     is 70" names no service at all, yet the answer is unambiguous. These run
     before scoring and win outright.

     The old build hardcoded the trigger "father is 65", so a 70-year-old — more
     eligible, not less — got nothing. Rules read the number instead. */

  /* Garhwali and Kumaoni kinship terms included — see regional.js.
     A Kumaoni speaker says बौज्यू, never पिताजी. */
  var ELDER = /(father|mother|papa|dad|mom|parent|grand|पिता|पिताजी|माता|माताजी|मम्मी|पापा|दादा|दादी|नाना|नानी|बुज़ुर्ग|बुजुर्ग|बूढ़े|बुढ़े|ब्वे|ईजा|बुबा|बाब|बौज्यू|बुबू|बोज्यू|आमा|दादु|दादि|स्याणु|स्याण|सयाण|बुड्या|बुडा|बुढ़िया)/u;
  var SELF  = /\b(i|me|my|मैं|मुझे|मेरी|मेरा)\b/u;
  var AGE   = /(\d{1,3})\s*(?:years?|saal|साल|वर्ष|की|का|के)?/u;

  function ageIn(text) {
    var m = String(text).match(/\b(\d{1,3})\b/);
    if (m) {
      var n = parseInt(m[1], 10);
      if (n >= 1 && n <= 120) return n;
    }
    /* spoken: "seventy", "सत्तर" */
    var words = { seventy: 70, sixty: 60, eighty: 80, ninety: 90, fifty: 50,
                  'सत्तर': 70, 'साठ': 60, 'अस्सी': 80, 'नब्बे': 90, 'पचास': 50, 'पैंसठ': 65 };
    var found = null;
    tokenise(text).forEach(function (t) {
      if (!found && Object.prototype.hasOwnProperty.call(words, t)) found = words[t];
    });
    return found;
  }

  function applyRules(raw, flat) {
    var age = ageIn(raw);

    /* Age 60+ mentioned with a person → old age pension, whatever words follow. */
    if (age != null && age >= 60 && (ELDER.test(flat) || SELF.test(flat) || /pension|पेंशन/u.test(flat))) {
      return { kind: 'service', svc: KB.byId('pension-old'), rule: 'age60', score: 99, alternates: [] };
    }

    /* An elder named alongside the word pension, with no age given. */
    if (ELDER.test(flat) && /pension|पेंशन/u.test(flat)) {
      return { kind: 'service', svc: KB.byId('pension-old'), rule: 'elder', score: 99, alternates: [] };
    }

    /* A girl and Class 12 in the same breath is always Nanda Gaura. */
    if (/(daughter|girl|बेटी|लड़की|बालिका)/u.test(flat) && /(12|twelfth|इंटर|बारहवीं|12वीं)/u.test(flat)) {
      return { kind: 'service', svc: KB.byId('nanda-gaura'), rule: 'girl12', score: 99, alternates: [] };
    }
    return null;
  }

  /* ------------------------------------------------------------------ score */
  function scoreService(tokens, svc) {
    var score = 0;
    var hits = [];

    (svc.terms || []).forEach(function (t) {
      if (hasPhrase(tokens, t)) { score += weightOf(t); hits.push(t); }
    });

    /* Situation words ("lost job", "पानी नहीं आ रहा") route the problem to the
       remedy. Weighted slightly below a direct service name so that asking for
       a service by name always wins. */
    (svc.needs || []).forEach(function (t) {
      if (hasPhrase(tokens, t)) { score += weightOf(t) * 0.8; hits.push(t); }
    });

    return { svc: svc, score: score, hits: hits };
  }

  /* ------------------------------------------------------------------ match */
  function match(query) {
    var raw = String(query == null ? '' : query).trim();
    if (!raw) return { kind: 'empty' };

    var tokens = tokenise(raw);
    var flat = normalise(raw);

    if (tokens.length === 1 && GREET.indexOf(tokens[0]) !== -1) {
      return { kind: 'greeting' };
    }

    /* Tracking requires a real, well-formed ID. Asking "what is my status"
       without one returns a prompt, not somebody else's file. */
    var idHit = raw.match(ID_RE);
    if (idHit) return { kind: 'track', id: idHit[1].toUpperCase() };

    if (/\b(track|status|स्थिति|स्टेटस|कहाँ पहुँचा|kahan pahucha)\b/u.test(flat)) {
      return { kind: 'need-id' };
    }

    var ruled = applyRules(raw, flat);
    if (ruled) return ruled;

    var ranked = KB.services
      .map(function (s) { return scoreService(tokens, s); })
      .filter(function (r) { return r.score > 0; })
      .sort(function (a, b) { return b.score - a.score; });

    if (!ranked.length) return { kind: 'none', query: raw };

    var best = ranked[0];
    var runnerUp = ranked[1];

    /* Two plausible readings — ask rather than pick. "pension" alone is the
       classic case: old age, widow and disability are three different forms.
       Only worth asking when there is genuinely more than one candidate. */
    if (runnerUp && runnerUp.score >= best.score * 0.8) {
      return {
        kind: 'unsure',
        query: raw,
        options: ranked.filter(function (r) { return r.score >= best.score * 0.6; })
          .slice(0, 4).map(function (r) { return r.svc; })
      };
    }

    /* Confidence floor. One weak word is not proof — but if it points at
       exactly one service, showing a single-item menu is worse for the citizen
       than answering with a visible "did you mean this?" they can correct.
       Answer softly and keep the alternatives one tap away. */
    if (best.score < 3) {
      if (ranked.length === 1) {
        return { kind: 'service', svc: best.svc, soft: true, score: best.score, alternates: [] };
      }
      return { kind: 'unsure', query: raw, options: ranked.slice(0, 4).map(function (r) { return r.svc; }) };
    }

    /* Did a life-situation phrase drive this? If so we can open with a sentence
       about the situation instead of a sentence about the paperwork. */
    var situation = null;
    KB.situations.forEach(function (sit) {
      if (sit.to === best.svc.id && !situation) {
        var sitTokens = (best.svc.needs || []);
        for (var i = 0; i < sitTokens.length; i++) {
          if (hasPhrase(tokens, sitTokens[i])) { situation = sit; break; }
        }
      }
    });

    return {
      kind: 'service',
      svc: best.svc,
      situation: situation,
      score: best.score,
      alternates: ranked.slice(1, 3).map(function (r) { return r.svc; })
    };
  }

  /* ------------------------------------------------------------- validation
     Spoken numbers arrive as words. Parse them, and refuse anything that is
     not the right shape rather than storing "four seven two eight". */
  var DIGIT_WORDS = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
    oh: 0, o: 0, nought: 0,
    'शून्य': 0, 'सुन्न': 0, 'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5, 'पाँच': 5,
    'छह': 6, 'छः': 6, 'सात': 7, 'आठ': 8, 'नौ': 9
  };

  function digitsFrom(text) {
    var out = '';
    tokenise(text).forEach(function (t) {
      if (/^\d+$/.test(t)) { out += t; return; }
      if (Object.prototype.hasOwnProperty.call(DIGIT_WORDS, t)) out += DIGIT_WORDS[t];
    });
    return out;
  }

  var VALIDATORS = {
    aadhaar: function (text) {
      var d = digitsFrom(text);
      if (d.length !== 12) {
        return { ok: false, reasonHi: 'आधार नंबर 12 अंकों का होता है, आपने ' + d.length + ' अंक बोले। दोबारा बोलिए।',
                 reasonEn: 'An Aadhaar number is 12 digits; ' + d.length + ' were heard. Please say it again.' };
      }
      return { ok: true, value: d.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3'),
               maskedHi: 'XXXX XXXX ' + d.slice(-4), maskedEn: 'XXXX XXXX ' + d.slice(-4) };
    },
    mobile: function (text) {
      var d = digitsFrom(text);
      if (d.length === 12 && d.indexOf('91') === 0) d = d.slice(2);
      if (d.length !== 10 || !/^[6-9]/.test(d)) {
        return { ok: false, reasonHi: 'मोबाइल नंबर 10 अंकों का होता है और 6, 7, 8 या 9 से शुरू होता है। दोबारा बोलिए।',
                 reasonEn: 'A mobile number is 10 digits starting with 6, 7, 8 or 9. Please say it again.' };
      }
      return { ok: true, value: d };
    },
    account: function (text) {
      var d = digitsFrom(text);
      if (d.length < 9 || d.length > 18) {
        return { ok: false, reasonHi: 'बैंक खाता संख्या 9 से 18 अंकों की होती है। दोबारा बोलिए।',
                 reasonEn: 'A bank account number is 9 to 18 digits. Please say it again.' };
      }
      return { ok: true, value: d, maskedHi: '••••' + d.slice(-4), maskedEn: '••••' + d.slice(-4) };
    },
    age: function (text) {
      var d = parseInt(digitsFrom(text), 10);
      if (!d || d < 1 || d > 120) {
        return { ok: false, reasonHi: 'उम्र समझ नहीं आई। सिर्फ़ संख्या बोलिए, जैसे "पैंसठ"।',
                 reasonEn: 'That age was not clear. Say just the number, like "sixty five".' };
      }
      return { ok: true, value: String(d) };
    },
    money: function (text) {
      var d = digitsFrom(text);
      if (!d) {
        return { ok: false, reasonHi: 'रकम समझ नहीं आई। संख्या में बोलिए, जैसे "पचानवे हज़ार"।',
                 reasonEn: 'That amount was not clear. Say it as a number, like "ninety five thousand".' };
      }
      return { ok: true, value: Number(d).toLocaleString('en-IN') };
    },
    text: function (text) {
      var v = String(text).trim();
      if (v.length < 2) {
        return { ok: false, reasonHi: 'यह बहुत छोटा है। दोबारा बोलिए।', reasonEn: 'That is too short. Please say it again.' };
      }
      return { ok: true, value: v };
    }
  };

  global.Match = {
    match: match,
    tokenise: tokenise,
    hasPhrase: hasPhrase,
    digitsFrom: digitsFrom,
    validate: function (type, text) {
      return (VALIDATORS[type] || VALIDATORS.text)(text);
    }
  };

})(typeof window !== 'undefined' ? window : this);
