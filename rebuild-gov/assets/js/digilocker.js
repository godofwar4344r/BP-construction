/* ==========================================================================
   digilocker.js — document fetch adapter.

   Today: MOCK mode. Returns realistic issued-document payloads after a
   simulated network delay, so the whole citizen journey can be demonstrated
   without any onboarding paperwork.

   Production: flip MODE to 'live'. The call shapes below already follow the
   real integrations, so only the base URLs and the token exchange change:

     DigiLocker Partner API  — https://partners.digitallocker.gov.in
       OAuth 2.0 authorisation-code flow, then
       GET /public/oauth2/1/files/issued        list issued documents
       GET /public/oauth2/1/file/{uri}          pull a specific document
       POST /public/oauth2/1/xml/{uri}          pull machine-readable XML

     API Setu (NAD/DigiLocker gateway) — https://apisetu.gov.in
       Per-issuer endpoints, e.g. /certificate/v3/uidai/aadhr

   Both require the state to register as a Requester and to hold the client
   secret SERVER-SIDE. Nothing in this file should ever carry a real secret —
   the browser calls our own /api/digilocker/* proxy, which does the OAuth.
   ========================================================================== */

(function (global) {
  'use strict';

  var MODE = 'mock';           // 'mock' | 'live'
  var API_BASE = '/api/digilocker';

  /* --------------------------------------------------------- mock citizens */

  var MOCK_PROFILES = {
    'ramesh': {
      name: 'Ramesh Negi',
      nameHi: 'रमेश नेगी',
      fatherName: 'Bhagwan Singh Negi',
      fatherNameHi: 'भगवान सिंह नेगी',
      dob: '1979-04-12',
      gender: 'M',
      aadhaar: '4728',            // last 4 only — full number is never stored
      aadhaarMasked: 'XXXX XXXX 4728',
      mobile: '9412345678',
      district: 'dehradun',
      address: 'House 14, Rajpur Road, Dehradun, Uttarakhand 248001',
      addressHi: 'मकान 14, राजपुर रोड, देहरादून, उत्तराखंड 248001'
    }
  };

  var MOCK_DOCS = {
    AADHAAR: {
      type: 'AADHAAR', issuer: 'UIDAI', issuerHi: 'भारतीय विशिष्ट पहचान प्राधिकरण',
      name: 'Aadhaar Card', nameHi: 'आधार कार्ड', icon: '🆔',
      docId: 'UIDAI-XXXXXXXX4728', issuedOn: '2013-06-20',
      fields: ['name', 'fatherName', 'dob', 'gender', 'address', 'aadhaar']
    },
    RATION: {
      type: 'RATION', issuer: 'Food & Civil Supplies, Uttarakhand', issuerHi: 'खाद्य एवं नागरिक आपूर्ति विभाग',
      name: 'Ration Card / Family Register', nameHi: 'राशन कार्ड / परिवार रजिस्टर', icon: '👨‍👩‍👧',
      docId: 'UK-RC-05-2019-118342', issuedOn: '2019-11-02',
      fields: ['familyMembers', 'headOfFamily', 'cardType']
    },
    VOTER: {
      type: 'VOTER', issuer: 'Election Commission of India', issuerHi: 'भारत निर्वाचन आयोग',
      name: 'Voter ID (EPIC)', nameHi: 'मतदाता पहचान पत्र', icon: '🗳️',
      docId: 'UKD2938471', issuedOn: '2004-01-15',
      fields: ['name', 'fatherName', 'address']
    },
    LAND: {
      type: 'LAND', issuer: 'Revenue Department, Uttarakhand', issuerHi: 'राजस्व विभाग, उत्तराखंड',
      name: 'Khatauni / Record of Rights', nameHi: 'खतौनी / भू-अभिलेख', icon: '🌾',
      docId: 'UK-DDN-RJP-KH-2211', issuedOn: '2022-03-30',
      fields: ['khasraNo', 'area', 'village']
    },
    MARKSHEET: {
      type: 'MARKSHEET', issuer: 'Uttarakhand Board of School Education', issuerHi: 'उत्तराखंड विद्यालयी शिक्षा परिषद',
      name: 'Class 12 Marksheet', nameHi: 'कक्षा 12 अंकपत्र', icon: '🎓',
      docId: 'UBSE-2019-0448271', issuedOn: '1996-06-12',
      fields: ['board', 'year', 'percentage']
    },
    PAN: {
      type: 'PAN', issuer: 'Income Tax Department', issuerHi: 'आयकर विभाग',
      name: 'PAN Card', nameHi: 'पैन कार्ड', icon: '💳',
      docId: 'ABCPN****K', issuedOn: '2008-08-19',
      fields: ['pan', 'name', 'dob']
    },
    DEATH: {
      type: 'DEATH', issuer: 'Registrar of Births & Deaths, Uttarakhand', issuerHi: 'जन्म एवं मृत्यु रजिस्ट्रार',
      name: 'Death Certificate', nameHi: 'मृत्यु प्रमाण पत्र', icon: '📃',
      docId: 'UK-DC-2021-88213', issuedOn: '2021-05-18',
      fields: ['deceasedName', 'dateOfDeath']
    },
    APUNI_SARKAR: {
      type: 'APUNI_SARKAR', issuer: 'Apuni Sarkar, Government of Uttarakhand', issuerHi: 'अपुणि सरकार, उत्तराखंड सरकार',
      name: 'Previously issued certificate', nameHi: 'पूर्व में जारी प्रमाण पत्र', icon: '📜',
      docId: 'ES09-2024-DDN-77120', issuedOn: '2024-02-11',
      fields: ['certificateType', 'issuedOn']
    }
  };

  /* ------------------------------------------------------------------ util */

  function delay(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  /* ------------------------------------------------------------------- API */

  var DigiLocker = {
    mode: MODE,
    connected: false,
    profile: null,

    isConnected: function () {
      return this.connected || localStorage.getItem('rg_dl_connected') === '1';
    },

    /**
     * "Connect DigiLocker."
     * Live mode redirects to the DigiLocker consent screen; the citizen
     * approves each document type there, and we get a code back.
     * Mock mode just resolves after a beat.
     */
    connect: function () {
      var self = this;
      if (this.mode === 'live') {
        global.location.href = API_BASE + '/authorize?redirect=' +
          encodeURIComponent(global.location.pathname);
        return new Promise(function () {});   // navigating away
      }

      return delay(1400).then(function () {
        self.connected = true;
        self.profile = MOCK_PROFILES.ramesh;
        localStorage.setItem('rg_dl_connected', '1');
        localStorage.setItem('rg_dl_profile', JSON.stringify(self.profile));
        return self.profile;
      });
    },

    disconnect: function () {
      this.connected = false;
      this.profile = null;
      localStorage.removeItem('rg_dl_connected');
      localStorage.removeItem('rg_dl_profile');
    },

    getProfile: function () {
      if (this.profile) return this.profile;
      var raw = localStorage.getItem('rg_dl_profile');
      if (raw) { try { this.profile = JSON.parse(raw); } catch (e) {} }
      return this.profile;
    },

    /** List every document the citizen has consented to share. */
    listDocuments: function () {
      if (this.mode === 'live') {
        return fetch(API_BASE + '/issued', { credentials: 'include' })
          .then(function (r) { return r.json(); })
          .then(function (d) { return d.items || []; });
      }
      return delay(600).then(function () {
        return Object.keys(MOCK_DOCS).map(function (k) { return MOCK_DOCS[k]; });
      });
    },

    /**
     * Fetch one document by type.
     * Resolves to { doc, data } where `data` is the extracted field values
     * the form can be filled from.
     */
    fetchDocument: function (type) {
      var self = this;

      if (this.mode === 'live') {
        return fetch(API_BASE + '/file/' + encodeURIComponent(type), { credentials: 'include' })
          .then(function (r) {
            if (!r.ok) throw new Error('DigiLocker returned ' + r.status);
            return r.json();
          });
      }

      var doc = MOCK_DOCS[type];
      if (!doc) return Promise.resolve(null);

      // Stagger the delays a little so the demo looks like real network work.
      return delay(700 + Math.floor(Math.abs(Math.sin(type.length) * 900))).then(function () {
        var p = self.getProfile() || MOCK_PROFILES.ramesh;
        return {
          doc: doc,
          data: {
            name: p.name,
            nameHi: p.nameHi,
            fatherName: p.fatherName,
            fatherNameHi: p.fatherNameHi,
            dob: p.dob,
            gender: p.gender,
            aadhaar: p.aadhaarMasked,
            mobile: p.mobile,
            district: p.district,
            address: p.address,
            addressHi: p.addressHi,
            headOfFamily: p.fatherName,
            village: 'Rajpur',
            khasraNo: '221/1',
            area: '0.42 hectare'
          }
        };
      });
    },

    /**
     * Given a service definition, pull every document it needs that
     * DigiLocker can supply. Reports progress per document so the UI can
     * tick them off live.
     *
     * onProgress({ key, status: 'fetching'|'done'|'unavailable', doc })
     */
    autoFill: function (service, onProgress) {
      var self = this;
      var needed = (service.docs || []).filter(function (d) { return d.digilocker; });
      var results = { fields: {}, documents: [], unavailable: [] };

      var chain = Promise.resolve();

      needed.forEach(function (req) {
        chain = chain.then(function () {
          if (onProgress) onProgress({ key: req.key, status: 'fetching', req: req });

          return self.fetchDocument(req.digilocker).then(function (res) {
            if (!res) {
              results.unavailable.push(req);
              if (onProgress) onProgress({ key: req.key, status: 'unavailable', req: req });
              return;
            }
            results.documents.push({ req: req, doc: res.doc });
            Object.keys(res.data).forEach(function (k) {
              if (results.fields[k] == null) results.fields[k] = res.data[k];
            });
            if (onProgress) onProgress({ key: req.key, status: 'done', req: req, doc: res.doc });
          });
        });
      });

      return chain.then(function () { return results; });
    },

    /** Which required docs still need a manual upload. */
    manualDocs: function (service) {
      return (service.docs || []).filter(function (d) {
        return d.required && !d.digilocker && !d.autoGenerated;
      });
    },

    /** Docs the portal generates itself from the answers given. */
    generatedDocs: function (service) {
      return (service.docs || []).filter(function (d) { return d.autoGenerated; });
    }
  };

  global.DigiLocker = DigiLocker;
})(window);
