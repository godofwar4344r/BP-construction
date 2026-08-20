/* =============================================================================
   regional.js — Garhwali and Kumaoni vocabulary

   No speech-recognition model exists for Garhwali or Kumaoni, from Google or
   anyone else. A Garhwali speaker's voice therefore arrives here through the
   HINDI model, which transcribes the sounds roughly as written below.

   That is workable, because the two languages share most of their Devanagari
   vocabulary with Hindi. What breaks is the handful of high-frequency words
   that differ — and those words are exactly the ones a citizen uses to
   describe their situation:

       Hindi        Garhwali      Kumaoni      meaning
       बेटी          नौनी          चेली         daughter
       माता          ब्वे           ईजा          mother
       पिता          बुबा          बौज्यू        father
       बूढ़ा          स्याणु         सयाण         elderly

   Ask for a daughter's scholarship in Garhwali and the Hindi-only matcher
   scores zero. Add these thirty-odd words and it answers.

   This file only ADDS synonyms to services already defined in kb.js. It never
   changes a fee, a document list or an SLA — those stay in one place.

   NATIVE REVIEW PENDING. Spellings here are the common Devanagari renderings;
   a Garhwali/Kumaoni speaker at ITDA should correct them before launch. Adding
   a word is a one-line edit and nothing else in the system needs to change.
   ============================================================================= */

(function (global) {
  'use strict';

  var KB = global.KB;
  if (!KB) return;

  /* serviceId -> extra spoken words that should route to it */
  var EXTRA = {
    'nanda-gaura': [
      'नौनी', 'नौनि', 'चेली', 'चेलि',              /* daughter */
      'नौनी की पढ़ै', 'चेली कि पढ़ाई',
      'नौनी कु पढ़ै', 'चेली कि पढ़ै',
      'बेटि', 'लौंडिया'
    ],
    'pension-old': [
      'स्याणु', 'स्याण', 'सयाण', 'सयाणि',           /* elderly */
      'बुड्या', 'बुड्ढ़ा', 'बुडा', 'बुढ़िया',
      'बुबा', 'बाब', 'बौज्यू', 'बुबू',              /* father / grandfather */
      'ब्वे', 'ईजा', 'बोज्यू', 'आमा',               /* mother / grandmother */
      'दादु', 'दादि',
      'बुढ़ापा कि पेंशन', 'स्याणु कि पेंशन'
    ],
    'pension-widow': [
      'रांड', 'बिधवा', 'विधवा ह्वेगे', 'स्वामी नि रैनि'
    ],
    'pension-divyang': [
      'अपंग', 'लंगड़ु', 'दिव्यांग च', 'अपाहिज'
    ],
    'helpline-1905': [
      'पाणि', 'पाणी', 'पाणि नि आणु', 'पाणि नैं आ रौ',
      'बिजली नि आणि', 'बत्ती नि आणि',
      'बाटु', 'बाट', 'बाटु खराब', 'बाट खराब',       /* road */
      'नाली', 'कूड़ा', 'सफै',
      'शिकैत', 'शिकायत करण'
    ],
    'ayushman': [
      'बीमार', 'बिमार', 'बीमारि', 'दवै', 'दवाई कु खर्च',
      'अस्पताल जाण', 'इलाज कु पैसा', 'ऑपरेशन कु खर्च'
    ],
    'msy': [
      'रोजगार नि', 'काम नि', 'काम नैं', 'नौकरी नि रैगे',
      'दुकान खोलण', 'दुकान खोल्ण', 'अपणु काम',
      'होमस्टे खोलण', 'गोठ', 'डेरी कु काम'
    ],
    'income': [
      'आमदनि', 'कमै', 'कमाई कु कागज', 'आय कु कागद'
    ],
    'domicile': [
      'मूल निवास कु कागज', 'यख कु रैवासि', 'यखै कु छ्यूं'
    ],
    'caste': [
      'जाति कु कागज', 'जात कु प्रमाण', 'जात कु कागद'
    ],
    'pariwar-register': [
      'कुटुंब रजिस्टर', 'परिवार कि नकल', 'कुनबा रजिस्टर'
    ],
    'birth': [
      'नौनु ह्वे', 'नौनी ह्वे', 'बच्चा ह्वे', 'जनम कु कागज', 'ज्यूँ कु कागद'
    ],
    'death': [
      'मरि गे', 'नि रैनि', 'स्वर्गवास ह्वे', 'मौत कु कागज'
    ],
    'efir': [
      'मोबैल खोयि', 'फोन खोयि', 'चोरि ह्वे', 'सामान खोयु'
    ]
  };

  /* Situation phrases carry slightly less weight than a service name, which is
     the right precedence: naming the service beats describing the problem. */
  var applied = 0, missing = [];

  Object.keys(EXTRA).forEach(function (id) {
    var svc = KB.byId(id);
    if (!svc) { missing.push(id); return; }
    svc.needs = (svc.needs || []).concat(EXTRA[id]);
    applied += EXTRA[id].length;
  });

  global.REGIONAL = {
    wordsAdded: applied,
    servicesTouched: Object.keys(EXTRA).length - missing.length,
    missing: missing,
    map: EXTRA
  };

})(typeof window !== 'undefined' ? window : this);
