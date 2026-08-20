/* =============================================================================
   store.js — applications and drafts, on the device only

   Nothing here is transmitted. There is no server, no account and no analytics;
   a citizen's application lives in their own browser and nowhere else. That is
   a deliberate property, not a limitation of the prototype — the information a
   person types before they have decided to apply should not be collected.

   Everything carries `demo: true`. Nothing in this file has been filed with any
   government office, and the UI must never suggest otherwise.
   ============================================================================= */

(function (global) {
  'use strict';

  var K_APPS = 'es_apps', K_DRAFT = 'es_draft';

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }   /* private mode, quota — never throw at the citizen */
  }

  /* A readable local reference. Deliberately prefixed DEMO so it can never be
     mistaken for a government application number on a printout. */
  function reference() {
    var n = Math.floor(1000 + Math.random() * 9000);
    var y = new Date().getFullYear();
    return 'DEMO-' + y + '-' + n;
  }

  function addWorkingDays(from, days) {
    var d = new Date(from.getTime());
    var added = 0;
    while (added < days) {
      d.setDate(d.getDate() + 1);
      var wd = d.getDay();
      if (wd !== 0 && wd !== 6) added++;   /* Sundays and Saturdays are not working days */
    }
    return d;
  }

  global.Store = {
    reference: reference,
    addWorkingDays: addWorkingDays,

    /* -------------------------------------------------------------- drafts */
    saveDraft: function (d) { return write(K_DRAFT, d); },
    draft: function () { return read(K_DRAFT, null); },
    clearDraft: function () { try { localStorage.removeItem(K_DRAFT); } catch (e) {} },

    /* -------------------------------------------------------- applications */
    all: function () { return read(K_APPS, []); },

    add: function (app) {
      var apps = read(K_APPS, []);
      app.ref = app.ref || reference();
      app.at = new Date().toISOString();
      app.demo = true;
      app.stage = 0;
      apps.unshift(app);
      write(K_APPS, apps);
      return app;
    },

    get: function (ref) {
      return read(K_APPS, []).filter(function (a) { return a.ref === ref; })[0] || null;
    },

    remove: function (ref) {
      write(K_APPS, read(K_APPS, []).filter(function (a) { return a.ref !== ref; }));
    },

    clearAll: function () { try { localStorage.removeItem(K_APPS); } catch (e) {} },

    count: function () { return read(K_APPS, []).length; }
  };

})(typeof window !== 'undefined' ? window : this);
