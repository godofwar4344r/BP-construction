/* =============================================================================
   digilocker.js — the document vault

   DEMO VAULT. This is a local simulation of DigiLocker, shaped like the real
   thing so that swapping in the live API is a contained change:

     real flow   → redirect to api.digitallocker.gov.in/public/oauth2/1/authorize
                 → citizen consents on DigiLocker's own screen
                 → callback returns a code, server exchanges it for a token
                 → server pulls issued documents, token never touches the browser
     this file   → the same states (disconnected → consent → connected → pulled)
                   against a fixed demo citizen, entirely on this device

   Everything here is invented data for one fictional person. No real Aadhaar,
   no real account, nothing leaves the device. `connect()` is the only function
   that would change against the live API.

   PRIVACY RULE, enforced here and not left to the UI: full Aadhaar and full
   bank account numbers are never returned. `.masked` is what the interface is
   allowed to render; `.value` is only ever written into the form field the
   citizen is submitting themselves.
   ============================================================================= */

(function (global) {
  'use strict';

  /* One fictional citizen. Names and numbers are invented. */
  var DEMO = {
    name: 'सुनीता देवी',
    nameEn: 'Sunita Devi',
    fatherName: 'भगवान सिंह नेगी',
    fatherNameEn: 'Bhagwan Singh Negi',
    dob: '1962-04-11',
    age: '64',
    gender: 'F',
    aadhaar: '478291023841',
    district: 'पौड़ी गढ़वाल',
    districtEn: 'Pauri Garhwal',
    village: 'सतपुली',
    villageEn: 'Satpuli',
    address: 'ग्राम सतपुली, तहसील सतपुली, जनपद पौड़ी गढ़वाल, उत्तराखंड 246172',
    addressEn: 'Village Satpuli, Tehsil Satpuli, District Pauri Garhwal, Uttarakhand 246172',
    bankAccount: '50100482910384',
    ifsc: 'SBIN0007392',
    bankName: 'भारतीय स्टेट बैंक, सतपुली'
  };

  /* Documents this citizen has issued into their locker, keyed by the DOC id
     used in kb.js so a checklist can tick itself. */
  var ISSUED = [
    { doc: 'aadhaar',  issuer: 'UIDAI',                        hi: 'आधार कार्ड',            en: 'Aadhaar card',            no: 'XXXX XXXX 3841', on: '2012-06-20' },
    { doc: 'pariwar',  issuer: 'पंचायती राज विभाग, उत्तराखंड',  hi: 'परिवार रजिस्टर नकल',    en: 'Pariwar Register copy',   no: 'PR/PAU/2019/8841', on: '2019-11-02' },
    { doc: 'ration',   issuer: 'खाद्य एवं नागरिक आपूर्ति विभाग', hi: 'राशन कार्ड',            en: 'Ration card',             no: 'UK-05-0392841', on: '2021-01-14' },
    { doc: 'tenth',    issuer: 'उत्तराखंड विद्यालयी शिक्षा परिषद', hi: '10वीं की अंकतालिका',   en: 'Class 10 marksheet',      no: 'UBSE/1978/34112', on: '1978-06-30' },
    { doc: 'khatauni', issuer: 'राजस्व विभाग, उत्तराखंड',        hi: 'ज़मीन की खतौनी',        en: 'Land record (khatauni)',  no: 'KH/SAT/114/22', on: '2022-08-19' },
    { doc: 'income',   issuer: 'राजस्व विभाग, उत्तराखंड',        hi: 'आय प्रमाण पत्र',        en: 'Income certificate',      no: 'UK-INC-2026-2201', on: '2026-02-11', expires: '2026-08-11' }
  ];

  var KEY = 'es_locker';
  var state = { connected: false, at: null };

  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && saved.connected) state = saved;
  } catch (e) {}

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function mask(v, keep) {
    var s = String(v);
    return s.length <= keep ? s : '•'.repeat(Math.max(0, s.length - keep)) + s.slice(-keep);
  }

  /* Values available to auto-fill a form, keyed by FIELD.from. */
  function profile(lang) {
    var en = lang === 'en';
    return {
      name:        { value: en ? DEMO.nameEn : DEMO.name,       masked: en ? DEMO.nameEn : DEMO.name },
      fatherName:  { value: en ? DEMO.fatherNameEn : DEMO.fatherName, masked: en ? DEMO.fatherNameEn : DEMO.fatherName },
      dob:         { value: DEMO.dob,      masked: DEMO.dob },
      age:         { value: DEMO.age,      masked: DEMO.age },
      gender:      { value: DEMO.gender,   masked: DEMO.gender },
      /* Full Aadhaar goes into the field the citizen submits, but the screen
         only ever shows the last four. */
      aadhaar:     { value: DEMO.aadhaar,  masked: 'XXXX XXXX ' + DEMO.aadhaar.slice(-4) },
      district:    { value: en ? DEMO.districtEn : DEMO.district, masked: en ? DEMO.districtEn : DEMO.district },
      village:     { value: en ? DEMO.villageEn : DEMO.village,   masked: en ? DEMO.villageEn : DEMO.village },
      address:     { value: en ? DEMO.addressEn : DEMO.address,   masked: en ? DEMO.addressEn : DEMO.address },
      bankAccount: { value: DEMO.bankAccount, masked: mask(DEMO.bankAccount, 4) },
      ifsc:        { value: DEMO.ifsc,     masked: DEMO.ifsc }
    };
  }

  global.Locker = {
    isDemo: true,
    demoName: function (lang) { return lang === 'en' ? DEMO.nameEn : DEMO.name; },
    bankName: DEMO.bankName,

    connected: function () { return !!state.connected; },
    connectedAt: function () { return state.at; },

    /* Stands in for the OAuth round trip. The delay is deliberate: it is the
       shape of a real consent screen, and the UI should be built to wait. */
    connect: function (cb) {
      setTimeout(function () {
        state = { connected: true, at: new Date().toISOString() };
        persist();
        cb && cb(true);
      }, 900);
    },

    disconnect: function () {
      state = { connected: false, at: null };
      persist();
    },

    profile: profile,
    issued: function () { return state.connected ? ISSUED.slice() : []; },

    /* Which of a service's required documents are already in the locker? */
    coverage: function (docIds) {
      var have = {};
      (state.connected ? ISSUED : []).forEach(function (d) { have[d.doc] = d; });
      var got = [], missing = [];
      (docIds || []).forEach(function (id) {
        (have[id] ? got : missing).push(id);
      });
      return { got: got, missing: missing, have: have };
    }
  };

})(typeof window !== 'undefined' ? window : this);
