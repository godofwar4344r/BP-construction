/* ==========================================================================
   icons.js — inline SVG icon set.

   Emoji were a prototyping shortcut. They render differently on every OS,
   cannot be recoloured, look informal, and immediately read as "mockup".
   A government portal needs a consistent, monochrome, scalable icon set that
   inherits text colour — which is what this is.

   24×24 grid, 1.75 stroke, round caps. Icons inherit `currentColor`.
   ========================================================================== */

(function (global) {
  'use strict';

  var P = {
    /* --- navigation ------------------------------------------------------ */
    home:      '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/><path d="M9.5 21v-6h5v6"/>',
    grid:      '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
    mic:       '<rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10.5a7 7 0 0 0 14 0"/><path d="M12 17.5V21"/><path d="M8.5 21h7"/>',
    search:    '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.9-3.9"/>',
    folder:    '<path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4.4a1.5 1.5 0 0 1 1.2.6l1 1.4h7.4A1.5 1.5 0 0 1 20 9.5v9A1.5 1.5 0 0 1 18.5 20h-14A1.5 1.5 0 0 1 3 18.5Z"/>',
    help:      '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.5v.4"/><path d="M12 17.2h.01"/>',

    /* --- documents & certificates ---------------------------------------- */
    certificate: '<path d="M6 3h8l4 4v10.5A1.5 1.5 0 0 1 16.5 19h-10A1.5 1.5 0 0 1 5 17.5v-13A1.5 1.5 0 0 1 6.5 3Z"/><path d="M14 3v4h4"/><circle cx="12" cy="19" r="2.4"/><path d="m10.2 20.7-.7 2.6 2.5-1.2 2.5 1.2-.7-2.6"/>',
    document:  '<path d="M6.5 3h7L18 7.5v13A1.5 1.5 0 0 1 16.5 22h-10A1.5 1.5 0 0 1 5 20.5v-16A1.5 1.5 0 0 1 6.5 3Z"/><path d="M13.5 3v4.5H18"/><path d="M8.5 12.5h7"/><path d="M8.5 16h5"/>',
    rupee:     '<circle cx="12" cy="12" r="9"/><path d="M9 8h6"/><path d="M9 11h6"/><path d="M12.5 11c0-1.7-1.1-3-3.5-3"/><path d="M9 11c3 0 4 1.2 4 2.6 0 1.3-1.1 2.4-3 2.4H9l4.5 4"/>',
    idcard:    '<rect x="2.5" y="5" width="19" height="14" rx="2"/><circle cx="8.5" cy="11" r="2.2"/><path d="M5 16.2c.5-1.4 1.9-2.2 3.5-2.2s3 .8 3.5 2.2"/><path d="M15 10h4"/><path d="M15 13.5h4"/>',
    house:     '<path d="M3.5 10.8 12 4l8.5 6.8"/><path d="M5.5 9.8V19a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5V9.8"/><rect x="10" y="13.5" width="4" height="7"/>',
    family:    '<circle cx="8" cy="7.5" r="2.8"/><circle cx="16.5" cy="8.5" r="2.2"/><path d="M3 19.5c0-2.8 2.2-4.8 5-4.8s5 2 5 4.8"/><path d="M14 19.5c0-2.2 1.2-3.8 3.2-3.8S21 17.3 21 19.5"/>',
    shield:    '<path d="M12 3 5 6v6c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
    scales:    '<path d="M12 3.5v17"/><path d="M7 20.5h10"/><path d="M4 8h16"/><path d="M6.5 8 4 14h5Z"/><path d="M17.5 8 15 14h5Z"/><circle cx="12" cy="5.5" r="1.4"/>',

    /* --- people & welfare ------------------------------------------------ */
    elder:     '<circle cx="12" cy="6" r="3"/><path d="M9 21v-5l-1.5-3.5A3 3 0 0 1 10.3 9h3.4a3 3 0 0 1 2.8 3.5L15 16v5"/><path d="M18.5 21V12"/>',
    heart:     '<path d="M12 20s-7-4.4-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.6 12 20 12 20Z"/>',
    accessible:'<circle cx="12" cy="4.5" r="1.8"/><path d="M8 8.5h8"/><path d="M12 8.5v6h4"/><path d="M15.5 20.5a5 5 0 1 1-3.9-8.2"/>',
    graduation:'<path d="m2.5 8.5 9.5-4 9.5 4-9.5 4Z"/><path d="M6.5 10.6V16c0 1.5 2.5 2.8 5.5 2.8s5.5-1.3 5.5-2.8v-5.4"/><path d="M21.5 8.5V14"/>',
    briefcase: '<rect x="2.5" y="7" width="19" height="13" rx="2"/><path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7"/><path d="M2.5 12.5h19"/>',
    ring:      '<circle cx="12" cy="14.5" r="5"/><path d="m9 7 3-3.5L15 7"/><path d="m10.5 9.6 1.5-2.6 1.5 2.6"/>',

    /* --- infrastructure -------------------------------------------------- */
    bolt:      '<path d="M13.5 2 4 13.5h6L9.5 22 20 10.5h-6.5Z"/>',
    droplet:   '<path d="M12 3s6 6.2 6 10.2A6 6 0 0 1 6 13.2C6 9.2 12 3 12 3Z"/>',
    car:       '<path d="M4.5 15.5V19a1 1 0 0 0 1 1h1.5a1 1 0 0 0 1-1v-1.5"/><path d="M15 17.5V19a1 1 0 0 0 1 1h1.5a1 1 0 0 0 1-1v-3.5"/><path d="M3.5 15.5h17V11l-1.8-4.2a2 2 0 0 0-1.8-1.2H8.1a2 2 0 0 0-1.8 1.2L4.5 11Z"/><circle cx="7.5" cy="13" r="1"/><circle cx="16.5" cy="13" r="1"/>',
    wheat:     '<path d="M12 21V9"/><path d="M12 12c-2.5 0-4-1.6-4-4 2.5 0 4 1.6 4 4Z"/><path d="M12 12c2.5 0 4-1.6 4-4-2.5 0-4 1.6-4 4Z"/><path d="M12 7.5c-2 0-3.2-1.3-3.2-3.2 2 0 3.2 1.3 3.2 3.2Z"/><path d="M12 7.5c2 0 3.2-1.3 3.2-3.2-2 0-3.2 1.3-3.2 3.2Z"/><path d="M12 16.5c-2.5 0-4-1.6-4-4 2.5 0 4 1.6 4 4Z"/><path d="M12 16.5c2.5 0 4-1.6 4-4-2.5 0-4 1.6-4 4Z"/>',
    mountain:  '<path d="m2.5 19 6-11 4 6.5 2.5-4L21.5 19Z"/><path d="m8.5 8 2 3.4"/>',
    factory:   '<path d="M3 20.5V10l6 4V10l6 4V6h6v14.5Z"/><path d="M7 17.5h2"/><path d="M13 17.5h2"/><path d="M18 17.5h1.5"/>',
    building:  '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M8 7h2"/><path d="M14 7h2"/><path d="M8 11h2"/><path d="M14 11h2"/><path d="M8 15h2"/><path d="M14 15h2"/><path d="M10 21v-3h4v3"/>',

    /* --- civic ----------------------------------------------------------- */
    ballot:    '<rect x="3.5" y="10" width="17" height="10.5" rx="1.5"/><path d="M8 10V4.5h8V10"/><path d="M10 7h4"/><path d="M9.5 15.2h5"/>',
    passport:  '<rect x="5" y="2.5" width="14" height="19" rx="2"/><circle cx="12" cy="10" r="3.2"/><path d="M8.8 10h6.4"/><path d="M12 6.8c1.6 1.9 1.6 4.5 0 6.4-1.6-1.9-1.6-4.5 0-6.4Z"/><path d="M9.5 17.5h5"/>',
    alert:     '<path d="M12 3.5 21 19.5H3Z"/><path d="M12 10v4"/><path d="M12 16.8h.01"/>',
    megaphone: '<path d="M3.5 10v4a1.5 1.5 0 0 0 1.5 1.5h2L15 20V4L7 8.5H5A1.5 1.5 0 0 0 3.5 10Z"/><path d="M18.5 9a4 4 0 0 1 0 6"/><path d="M7 15.5V20"/>',

    /* --- ui affordances -------------------------------------------------- */
    check:     '<path d="m4.5 12.5 5 5 10-11"/>',
    close:     '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
    arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',
    chevron:   '<path d="m9 5 7 7-7 7"/>',
    external:  '<path d="M14 4h6v6"/><path d="M20 4 10.5 13.5"/><path d="M18 14v5.5A1.5 1.5 0 0 1 16.5 21h-11A1.5 1.5 0 0 1 4 19.5v-11A1.5 1.5 0 0 1 5.5 7H11"/>',
    upload:    '<path d="M12 15.5V4"/><path d="m7.5 8.5 4.5-4.5 4.5 4.5"/><path d="M4 15v4.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V15"/>',
    download:  '<path d="M12 4v11.5"/><path d="M7.5 11 12 15.5 16.5 11"/><path d="M4 15v4.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V15"/>',
    clock:     '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.4 2"/>',
    printer:   '<path d="M7 9V3.5h10V9"/><rect x="3.5" y="9" width="17" height="7.5" rx="1.5"/><path d="M7 14h10v6.5H7Z"/>',
    settings:  '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3"/>',
    user:      '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5c0-3.6 3.4-6.2 7.5-6.2s7.5 2.6 7.5 6.2"/>',
    lock:      '<rect x="4.5" y="10" width="15" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14.5v2.5"/>',
    sparkle:   '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z"/>',
    contrast:  '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" stroke="none"/>',
    globe:     '<circle cx="12" cy="12" r="9"/><path d="M3.2 9.5h17.6M3.2 14.5h17.6"/><path d="M12 3c2.4 2.4 3.6 5.4 3.6 9S14.4 18.6 12 21c-2.4-2.4-3.6-5.4-3.6-9S9.6 5.4 12 3Z"/>',
    phone:     '<path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z"/>'
  };

  /* Service slug → icon. Keeps assets/data/services.json exactly as captured
     from the live API — presentation choices do not belong in the data file. */
  var SERVICE_ICONS = {
    'income-certificate': 'rupee',
    'domicile-certificate': 'house',
    'caste-certificate': 'certificate',
    'character-certificate-general': 'shield',
    'hill-area-certificate': 'mountain',
    'uttarjivi-certificate': 'document',
    'economically-weaker-section-ews-certificate': 'rupee',
    'copy-family-register': 'family',
    'add-a-family': 'family',
    'toilet-certificate': 'house',
    'old-age-pension': 'elder',
    'widow-pension': 'heart',
    'disability-pension': 'accessible',
    'farmer-pension': 'wheat',
    'marriage-grant-new': 'ring',
    'scholarship-regarding-students-in-state': 'graduation',
    'apply-for-driving-license': 'car',
    'apply-for-learning-license': 'car',
    'register-fir': 'alert',
    'registration-of-marriage': 'ring',
    'payment-of-challan': 'document',
    'tenant-verification-within-state-outside-state': 'search',
    'new-domestic-connection-lt': 'bolt',
    'e-payment-of-bills': 'bolt',
    'water-connection-15-mm-redirect': 'droplet',
    'voter-registration': 'ballot',
    'search-name-in-voter-list': 'ballot',
    'update-aadhar': 'idcard',
    'downlaod-aadhar': 'idcard',
    'pan-card-for-indian-citizen-nri': 'idcard',
    'new-employment-registration': 'briefcase',
    'online-land-property-registration': 'building',
    'submit-request': 'folder',
    'get-certificate': 'heart',
    'passport-new-registration': 'passport'
  };

  var DEPT_ICONS = {
    'revenue-department': 'certificate',
    'panchayati-raj-development': 'family',
    'social-welfare-development': 'heart',
    'transport-department': 'car',
    'home-department': 'shield',
    'upcl-department': 'bolt',
    'water-department': 'droplet',
    'employment-dept': 'briefcase',
    'election-commision': 'ballot',
    'uidai': 'idcard',
    'pan': 'idcard',
    'department-of-stamps-and-registration': 'building',
    'agriculture-department': 'wheat',
    'school-education': 'graduation',
    'labour-department': 'settings',
    'passport-seva': 'passport',
    'rti': 'folder',
    'excise-department': 'factory',
    'jeevan-praman': 'heart'
  };

  var Icons = {
    /**
     * Render an icon as an SVG string.
     * @param {string} name  key from P
     * @param {number} size  px, default 24
     * @param {string} cls   extra class names
     */
    get: function (name, size, cls) {
      var d = P[name] || P.document;
      return '<svg class="icon ' + (cls || '') + '" width="' + (size || 24) + '" height="' + (size || 24) +
             '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" ' +
             'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
             d + '</svg>';
    },

    forService: function (svc, size, cls) {
      var key = SERVICE_ICONS[svc && svc.slug];
      if (!key) key = DEPT_ICONS[svc && svc.dept] || 'document';
      return this.get(key, size, cls);
    },

    forDept: function (slug, size, cls) {
      return this.get(DEPT_ICONS[slug] || 'building', size, cls);
    },

    has: function (name) { return !!P[name]; },

    /**
     * The Uttarakhand state emblem, simplified for small sizes.
     * Three peaks over the Ganga — the elements of the official emblem —
     * drawn as a mark rather than reproducing the state seal, which may
     * not be altered or used decoratively.
     */
    emblem: function (size) {
      var s = size || 40;
      return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false">' +
        '<circle cx="20" cy="20" r="19" fill="currentColor" opacity=".08"/>' +
        '<circle cx="20" cy="20" r="18.25" stroke="currentColor" stroke-width="1.5" opacity=".35"/>' +
        '<path d="M8 25.5 14.5 14l4 6.8L23 12l9 13.5Z" fill="currentColor" opacity=".9"/>' +
        '<path d="M7.5 29c2.2 0 2.2 1.6 4.4 1.6S14.1 29 16.3 29s2.2 1.6 4.4 1.6S22.9 29 25.1 29s2.2 1.6 4.4 1.6S31.7 29 33 29" ' +
          'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".75"/>' +
      '</svg>';
    }
  };

  global.Icons = Icons;
})(window);
