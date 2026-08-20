/* ==========================================================================
   store.js — data loading, applications, preferences, i18n strings.
   localStorage only. Swap Store.save/load for API calls to go server-backed.
   ========================================================================== */

(function (global) {
  'use strict';

  var KEYS = {
    apps: 'rg_applications',
    prefs: 'rg_prefs',
    draft: 'rg_draft'
  };

  var STRINGS = {
    /* --- chrome --- */
    portalName:    { hi: 'उत्तराखंड सरकार',            en: 'Government of Uttarakhand' },
    portalTag:     { hi: 'अपुणि सरकार · आवाज़ सेवा',    en: 'Apuni Sarkar · Voice Services' },
    navHome:       { hi: 'मुख्य पृष्ठ',                 en: 'Home' },
    navServices:   { hi: 'सभी सेवाएं',                  en: 'All Services' },
    navApply:      { hi: 'आवेदन करें',                  en: 'Apply' },
    navTrack:      { hi: 'स्थिति देखें',                en: 'Track Application' },
    navLocker:     { hi: 'मेरे दस्तावेज़',              en: 'My Documents' },
    navHelp:       { hi: 'सहायता',                      en: 'Help' },

    /* --- hero --- */
    heroTitle:     { hi: 'बोलिए, हम आपका काम कर देंगे', en: 'Just speak. We will do the rest.' },
    heroSub:       { hi: 'माइक दबाइए और अपनी भाषा में बताइए कि आपको क्या चाहिए। फ़ॉर्म हम भरेंगे, दस्तावेज़ डिजिलॉकर से खुद ले लेंगे।',
                     en: 'Press the mic and say what you need in your own language. We fill the form and pull your documents from DigiLocker automatically.' },
    tapToSpeak:    { hi: 'बोलने के लिए दबाइए',          en: 'Tap to speak' },
    listening:     { hi: 'सुन रहा हूँ…',                en: 'Listening…' },
    thinking:      { hi: 'समझ रहा हूँ…',                en: 'Understanding…' },
    speakingNow:   { hi: 'बोल रहा हूँ…',                en: 'Speaking…' },
    tryS:          { hi: 'ऐसे बोल कर देखिए:',           en: 'Try saying:' },

    /* --- agent --- */
    greeting:      { hi: 'नमस्ते! मैं उत्तराखंड सरकार की सेवा सहायक हूँ। बताइए, आपको कौन सी सेवा चाहिए?',
                     en: 'Namaste! I am the Government of Uttarakhand service assistant. Which service do you need?' },
    notUnderstood: { hi: 'माफ़ कीजिए, मैं समझ नहीं पाया। कृपया दोबारा बोलिए।',
                     en: 'Sorry, I did not understand. Please say that again.' },
    foundService:  { hi: 'ठीक है। आप {s} के लिए आवेदन करना चाहते हैं। क्या यह सही है?',
                     en: 'Alright. You want to apply for {s}. Is that correct?' },
    startingForm:  { hi: 'बहुत अच्छा। अब मैं आपसे कुछ जानकारी पूछूँगा। आप बोल कर जवाब दे सकते हैं।',
                     en: 'Very good. I will now ask you a few questions. You can answer by speaking.' },
    fetchingDocs:  { hi: 'मैं आपके डिजिलॉकर से दस्तावेज़ ले रहा हूँ। एक क्षण रुकिए।',
                     en: 'I am fetching your documents from DigiLocker. One moment please.' },
    docsFetched:   { hi: 'आपके {n} दस्तावेज़ मिल गए। इनसे मैंने कुछ जानकारी अपने आप भर दी है।',
                     en: 'I found {n} of your documents and filled in some details automatically.' },
    confirmValue:  { hi: 'मैंने लिखा है: {v}. क्या यह सही है?',
                     en: 'I have written: {v}. Is that correct?' },
    okNext:        { hi: 'ठीक है।',                     en: 'Alright.' },
    letsRedo:      { hi: 'कोई बात नहीं, फिर से बोलिए।', en: 'No problem, please say it again.' },
    allDone:       { hi: 'सारी जानकारी भर गई है। क्या मैं आवेदन जमा कर दूँ?',
                     en: 'All the details are filled in. Shall I submit the application?' },
    submitted:     { hi: 'आपका आवेदन जमा हो गया है। आवेदन संख्या है {id}. इसे लिख लीजिए। {d} दिन में आपको SMS मिलेगा।',
                     en: 'Your application has been submitted. The application number is {id}. Please note it down. You will get an SMS within {d} days.' },
    cancelled:     { hi: 'ठीक है, मैंने रोक दिया।',     en: 'Alright, I have stopped.' },
    helpText:      { hi: 'आप मुझसे कह सकते हैं: आय प्रमाण पत्र बनवाना है, मेरे आवेदन की स्थिति क्या है, या मेरे दस्तावेज़ दिखाओ।',
                     en: 'You can say: I need an income certificate, what is my application status, or show my documents.' },

    /* --- forms & lists --- */
    searchPlaceholder: { hi: 'सेवा खोजें… जैसे "आय प्रमाण पत्र"', en: 'Search services… e.g. "income certificate"' },
    fee:           { hi: 'शुल्क',                       en: 'Fee' },
    free:          { hi: 'निःशुल्क',                    en: 'Free' },
    days:          { hi: 'दिन',                         en: 'days' },
    rtsCovered:    { hi: 'सेवा का अधिकार',              en: 'Right to Service' },
    department:    { hi: 'विभाग',                       en: 'Department' },
    documents:     { hi: 'आवश्यक दस्तावेज़',            en: 'Required documents' },
    fromLocker:    { hi: 'डिजिलॉकर से',                 en: 'From DigiLocker' },
    uploadNeeded:  { hi: 'अपलोड करना होगा',             en: 'Upload needed' },
    autoGen:       { hi: 'हम बना देंगे',                en: 'We generate this' },
    applyNow:      { hi: 'आवाज़ से आवेदन करें',         en: 'Apply by voice' },
    submit:        { hi: 'आवेदन जमा करें',              en: 'Submit application' },
    noApplications:{ hi: 'अभी तक कोई आवेदन नहीं है।',   en: 'No applications yet.' },
    appNumber:     { hi: 'आवेदन संख्या',                en: 'Application number' },
    typeInstead:   { hi: 'या यहाँ टाइप कीजिए',          en: 'Or type here instead' },
    send:          { hi: 'भेजें',                       en: 'Send' },

    /* --- status --- */
    st_submitted:  { hi: 'आवेदन जमा',                   en: 'Application submitted' },
    st_verify:     { hi: 'दस्तावेज़ सत्यापन',           en: 'Document verification' },
    st_field:      { hi: 'क्षेत्रीय जाँच (लेखपाल)',     en: 'Field inquiry (Lekhpal)' },
    st_approval:   { hi: 'अधिकारी की स्वीकृति',         en: 'Officer approval' },
    st_issued:     { hi: 'प्रमाण पत्र जारी',            en: 'Certificate issued' },

    /* --- misc --- */
    noSpeech:      { hi: 'इस ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं है। कृपया Chrome या Edge इस्तेमाल कीजिए, या नीचे टाइप कीजिए।',
                     en: 'Speech recognition is not available in this browser. Please use Chrome or Edge, or type below.' },
    connectLocker: { hi: 'डिजिलॉकर जोड़ें',             en: 'Connect DigiLocker' },
    lockerOn:      { hi: 'डिजिलॉकर जुड़ा है',           en: 'DigiLocker connected' }
  };

  var Store = {
    data: null,
    lang: 'hi',

    /* ------------------------------------------------------------- catalogue */

    load: function (base) {
      var self = this;
      if (this.data) return Promise.resolve(this.data);
      return fetch((base || '') + 'assets/data/services.json')
        .then(function (r) {
          if (!r.ok) throw new Error('Could not load service catalogue (' + r.status + ')');
          return r.json();
        })
        .then(function (d) {
          self.data = d;
          if (global.NLU) global.NLU.load(d);
          return d;
        });
    },

    service: function (slug) {
      if (!this.data) return null;
      return this.data.services.filter(function (s) { return s.slug === slug; })[0] || null;
    },

    department: function (slug) {
      if (!this.data) return null;
      return this.data.departments.filter(function (d) { return d.slug === slug; })[0] || null;
    },

    popularServices: function () {
      if (!this.data) return [];
      return this.data.services.filter(function (s) { return s.popular; });
    },

    voiceReadyServices: function () {
      if (!this.data) return [];
      return this.data.services.filter(function (s) { return s.voiceForm && s.voiceForm.length; });
    },

    /* ----------------------------------------------------------------- i18n */

    t: function (key, vars) {
      var entry = STRINGS[key];
      if (!entry) return key;
      var s = entry[this.lang] || entry.en || key;
      if (vars) {
        Object.keys(vars).forEach(function (k) {
          s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
        });
      }
      return s;
    },

    /** Language-appropriate name of a service / department / field. */
    name: function (obj) {
      if (!obj) return '';
      return this.lang === 'hi' ? (obj.hi || obj.en) : (obj.en || obj.hi);
    },

    /* ------------------------------------------------------------ preferences */

    prefs: function () {
      try { return JSON.parse(localStorage.getItem(KEYS.prefs)) || {}; }
      catch (e) { return {}; }
    },

    setPref: function (k, v) {
      var p = this.prefs();
      p[k] = v;
      localStorage.setItem(KEYS.prefs, JSON.stringify(p));
      return p;
    },

    /* ---------------------------------------------------------- applications */

    applications: function () {
      try { return JSON.parse(localStorage.getItem(KEYS.apps)) || []; }
      catch (e) { return []; }
    },

    application: function (id) {
      return this.applications().filter(function (a) { return a.id === id; })[0] || null;
    },

    /**
     * Persist a submitted application and give it a realistic reference
     * number: <SERVICE_ID>/<YEAR>/<DISTRICT>/<SEQ>, matching how Apuni
     * Sarkar numbers its acknowledgements.
     */
    saveApplication: function (service, values, meta) {
      var apps = this.applications();
      var year = new Date().getFullYear();
      var seq = String(100000 + apps.length * 37 + (apps.length + 7) * 11).slice(0, 6);
      var dist = (values.district || 'ukd').slice(0, 3).toUpperCase();

      var app = {
        id: service.id + '/' + year + '/' + dist + '/' + seq,
        serviceSlug: service.slug,
        serviceEn: service.en,
        serviceHi: service.hi,
        deptEn: service.deptEn,
        deptHi: service.deptHi,
        values: values,
        charge: service.charge,
        slaDays: service.days,
        submittedAt: new Date().toISOString(),
        stage: 1,
        channel: (meta && meta.channel) || 'voice',
        documents: (meta && meta.documents) || []
      };

      apps.unshift(app);
      localStorage.setItem(KEYS.apps, JSON.stringify(apps));
      return app;
    },

    /** Five-stage pipeline mirroring the real Apuni Sarkar workflow. */
    stages: function () {
      return ['st_submitted', 'st_verify', 'st_field', 'st_approval', 'st_issued'];
    },

    /**
     * Demo progression: applications advance with elapsed time so the
     * tracking page shows movement without any backend.
     */
    stageOf: function (app) {
      var mins = (Date.now() - new Date(app.submittedAt).getTime()) / 60000;
      if (mins < 1) return 1;
      if (mins < 3) return 2;
      if (mins < 6) return 3;
      if (mins < 10) return 4;
      return 5;
    },

    /* ---------------------------------------------------------------- drafts */

    saveDraft: function (d) { localStorage.setItem(KEYS.draft, JSON.stringify(d)); },
    draft: function () {
      try { return JSON.parse(localStorage.getItem(KEYS.draft)); } catch (e) { return null; }
    },
    clearDraft: function () { localStorage.removeItem(KEYS.draft); },

    reset: function () {
      Object.keys(KEYS).forEach(function (k) { localStorage.removeItem(KEYS[k]); });
    }
  };

  global.Store = Store;
  global.STRINGS = STRINGS;
})(window);
