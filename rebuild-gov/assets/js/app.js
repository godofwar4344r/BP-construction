/* ==========================================================================
   app.js — shared chrome and renderers.

   Builds the three-bar government header (utility strip · masthead · nav),
   breadcrumbs, footer with trust marks, and the service-card component every
   page uses. Keeping this in one place is why the five pages stay consistent.
   ========================================================================== */

(function (global) {
  'use strict';

  var NAV = [
    { id: 'home',     href: 'index.html',        key: 'navHome',     icon: 'home' },
    { id: 'services', href: 'app/services.html', key: 'navServices', icon: 'grid' },
    { id: 'apply',    href: 'app/apply.html',    key: 'navApply',    icon: 'mic' },
    { id: 'track',    href: 'app/track.html',    key: 'navTrack',    icon: 'search' },
    { id: 'locker',   href: 'app/locker.html',   key: 'navLocker',   icon: 'folder' }
  ];

  var TRUST = [
    { label: 'Digital India',  href: 'https://www.digitalindia.gov.in',  icon: 'globe' },
    { label: 'DigiLocker',     href: 'https://www.digilocker.gov.in',    icon: 'folder' },
    { label: 'API Setu',       href: 'https://apisetu.gov.in',           icon: 'settings' },
    { label: 'UMANG',          href: 'https://web.umang.gov.in',         icon: 'grid' },
    { label: 'india.gov.in',   href: 'https://www.india.gov.in',         icon: 'building' },
    { label: 'Bhashini',       href: 'https://bhashini.gov.in',          icon: 'mic' }
  ];

  var App = {
    base: '',
    page: '',

    /* ------------------------------------------------------------------ boot */

    init: function (opts) {
      opts = opts || {};
      this.base = opts.base || '';
      this.page = opts.page || '';
      this.crumbs = opts.crumbs || null;

      var prefs = global.Store.prefs();
      global.Store.lang = prefs.lang || 'hi';
      document.documentElement.lang = global.Store.lang;
      this.applyTheme(prefs.theme || 'light');
      this.applyFontScale(prefs.fontScale || 1);

      this.renderChrome();

      var self = this;
      return global.Store.load(this.base)
        .then(function (data) { self.data = data; return data; })
        .catch(function (err) {
          self.toast('Could not load the service catalogue. Open this over http://localhost, not file://');
          console.error(err);
          throw err;
        });
    },

    icon: function (name, size, cls) { return global.Icons.get(name, size, cls); },

    /* ---------------------------------------------------------------- chrome */

    renderChrome: function () {
      this._govstrip();
      this._masthead();
      this._navbar();
      this._breadcrumb();
      this._sidebar();
      this._footer();
    },

    /** Bar 1 — national attribution, accessibility tools, language. */
    _govstrip: function () {
      var el = document.getElementById('site-govstrip');
      if (!el) return;

      var hi = global.Store.lang === 'hi';
      var I = this.icon;

      el.className = 'govstrip';
      el.innerHTML =
        '<div class="govstrip-inner">' +
          '<span>' + (hi ? 'भारत सरकार' : 'Government of India') + '</span>' +
          '<span class="sep" aria-hidden="true"></span>' +
          '<span class="hide-sm">' + (hi ? 'सूचना प्रौद्योगिकी विकास अभिकरण, उत्तराखंड'
                                         : 'Information Technology Development Agency, Uttarakhand') + '</span>' +
          '<span class="govstrip-spacer"></span>' +

          '<a href="#main" class="hide-sm">' + (hi ? 'मुख्य सामग्री' : 'Main content') + '</a>' +
          '<span class="sep hide-sm" aria-hidden="true"></span>' +

          '<span class="lang-toggle" role="group" aria-label="' + (hi ? 'भाषा' : 'Language') + '">' +
            '<button type="button" data-lang="hi" aria-pressed="' + hi + '">हिंदी</button>' +
            '<button type="button" data-lang="en" aria-pressed="' + !hi + '">English</button>' +
          '</span>' +

          '<span class="sep" aria-hidden="true"></span>' +

          '<button class="tbtn" data-font="down" aria-label="' + (hi ? 'अक्षर छोटे करें' : 'Decrease text size') + '">A−</button>' +
          '<button class="tbtn" data-font="reset" aria-label="' + (hi ? 'सामान्य आकार' : 'Normal text size') + '">A</button>' +
          '<button class="tbtn" data-font="up" aria-label="' + (hi ? 'अक्षर बड़े करें' : 'Increase text size') + '">A+</button>' +
          '<button class="tbtn" data-theme-cycle aria-label="' + (hi ? 'रंग बदलें' : 'Change theme') + '">' +
            I('contrast', 13) + '</button>' +
        '</div>';

      var self = this;
      el.querySelectorAll('[data-lang]').forEach(function (b) {
        b.addEventListener('click', function () { self.setLang(b.dataset.lang); });
      });
      el.querySelectorAll('[data-font]').forEach(function (b) {
        b.addEventListener('click', function () { self.changeFont(b.dataset.font); });
      });
      var t = el.querySelector('[data-theme-cycle]');
      if (t) t.addEventListener('click', function () { self.cycleTheme(); });
    },

    /** Bar 2 — emblem, portal identity, helpline. */
    _masthead: function () {
      var el = document.getElementById('site-masthead');
      if (!el) return;

      var hi = global.Store.lang === 'hi';

      el.className = 'masthead';
      el.innerHTML =
        '<div class="masthead-inner">' +
          '<a class="brand" href="' + this.base + 'index.html">' +
            '<span class="brand-mark">' + global.Icons.emblem(46) + '</span>' +
            '<span class="brand-text">' +
              '<span class="l1">' + (hi ? 'उत्तराखंड सरकार' : 'Government of Uttarakhand') + '</span>' +
              '<span class="l2">' + (hi ? 'अपुणि सरकार' : 'Apuni Sarkar') + '</span>' +
              '<span class="l3">' + (hi ? 'आवाज़ से नागरिक सेवाएं' : 'Citizen services by voice') + '</span>' +
            '</span>' +
          '</a>' +
          '<span class="masthead-spacer"></span>' +
          '<a class="helpline" href="tel:1905">' +
            this.icon('phone', 18) +
            '<span>' + (hi ? 'सीएम हेल्पलाइन' : 'CM Helpline') +
              '<br><span class="num">1905</span></span>' +
          '</a>' +
        '</div>';
    },

    /** Bar 3 — primary navigation, sticky. */
    _navbar: function () {
      var el = document.getElementById('site-navbar');
      if (!el) return;

      var self = this;
      el.className = 'navbar';
      el.innerHTML =
        '<nav class="navbar-inner" aria-label="' +
          (global.Store.lang === 'hi' ? 'मुख्य मेन्यू' : 'Main menu') + '">' +
          NAV.map(function (n) {
            return '<a class="navlink" href="' + self.base + n.href + '"' +
                   (self.page === n.id ? ' aria-current="page"' : '') + '>' +
                   self.icon(n.icon, 17) + global.Store.t(n.key) + '</a>';
          }).join('') +
        '</nav>';
    },

    /** Trail. Pass `crumbs: [{label, href}]` to App.init; last is current. */
    _breadcrumb: function () {
      var el = document.getElementById('site-breadcrumb');
      if (!el) return;

      var hi = global.Store.lang === 'hi';
      var crumbs = this.crumbs;

      if (!crumbs) {
        var nav = NAV.filter(function (n) { return n.id === this.page; }.bind(this))[0];
        crumbs = nav && nav.id !== 'home' ? [{ label: global.Store.t(nav.key) }] : null;
      }
      if (!crumbs || !crumbs.length) { el.innerHTML = ''; return; }

      var self = this;
      el.className = 'breadcrumb';
      el.setAttribute('aria-label', hi ? 'पथ' : 'Breadcrumb');
      el.innerHTML =
        '<a href="' + this.base + 'index.html">' + (hi ? 'मुख्य पृष्ठ' : 'Home') + '</a>' +
        crumbs.map(function (c, i) {
          var last = i === crumbs.length - 1;
          return '<span class="sep">' + self.icon('chevron', 12) + '</span>' +
                 (last || !c.href
                   ? '<span class="current" aria-current="page">' + self.escape(c.label) + '</span>'
                   : '<a href="' + c.href + '">' + self.escape(c.label) + '</a>');
        }).join('');
    },

    _sidebar: function () {
      var el = document.getElementById('site-sidebar');
      if (!el) return;

      var hi = global.Store.lang === 'hi';
      var self = this;

      el.innerHTML =
        '<div class="sidebar-label">' + (hi ? 'सेवाएं' : 'Services') + '</div>' +
        '<nav>' + NAV.map(function (n) {
          return '<a href="' + self.base + n.href + '"' +
                 (self.page === n.id ? ' aria-current="page"' : '') + '>' +
                 self.icon(n.icon, 18) + global.Store.t(n.key) + '</a>';
        }).join('') + '</nav>' +
        '<hr>' +
        '<div class="sidebar-label">' + (hi ? 'सरकारी लिंक' : 'Government links') + '</div>' +
        '<nav>' +
          '<a href="https://uk.gov.in" target="_blank" rel="noopener">' +
            self.icon('external', 18) + 'uk.gov.in</a>' +
          '<a href="https://eservices.uk.gov.in" target="_blank" rel="noopener">' +
            self.icon('external', 18) + 'Apuni Sarkar</a>' +
          '<a href="https://www.digilocker.gov.in" target="_blank" rel="noopener">' +
            self.icon('external', 18) + 'DigiLocker</a>' +
          '<a href="https://cmhelpline.uk.gov.in" target="_blank" rel="noopener">' +
            self.icon('megaphone', 18) + (hi ? 'शिकायत दर्ज करें' : 'File a grievance') + '</a>' +
        '</nav>';
    },

    _footer: function () {
      var el = document.getElementById('site-footer');
      if (!el) return;

      var hi = global.Store.lang === 'hi';
      var self = this;
      var b = this.base;

      var cols = [
        {
          h: hi ? 'सेवाएं' : 'Services',
          links: NAV.slice(1).map(function (n) {
            return { t: global.Store.t(n.key), u: b + n.href };
          })
        },
        {
          h: hi ? 'नीतियाँ' : 'Policies',
          links: [
            { t: hi ? 'गोपनीयता नीति' : 'Privacy Policy',      u: 'https://uk.gov.in/pages/privacy-policy' },
            { t: hi ? 'नियम एवं शर्तें' : 'Terms & Conditions', u: 'https://uk.gov.in/pages/terms-&-conditions' },
            { t: hi ? 'अस्वीकरण' : 'Disclaimer',               u: 'https://uk.gov.in/pages/disclaimer' },
            { t: hi ? 'सुगम्यता विवरण' : 'Accessibility',       u: 'https://uk.gov.in/pages/accessibility-statement' }
          ]
        },
        {
          h: hi ? 'सहायता' : 'Help',
          links: [
            { t: hi ? 'सीएम हेल्पलाइन 1905' : 'CM Helpline 1905', u: 'https://cmhelpline.uk.gov.in' },
            { t: hi ? 'व्हाट्सएप सहायता' : 'WhatsApp support',
              u: 'https://api.whatsapp.com/send/?phone=%2B917302254188' },
            { t: hi ? 'प्रमाण पत्र सत्यापन' : 'Verify a certificate',
              u: 'https://eservices.uk.gov.in/officer/public/application/verify/certificate/' },
            { t: hi ? 'संपर्क करें' : 'Contact us', u: 'https://uk.gov.in/pages/contact-us-at' }
          ]
        },
        {
          h: hi ? 'राज्य' : 'State',
          links: [
            { t: hi ? 'राज्य पोर्टल' : 'State Portal',   u: 'https://uk.gov.in' },
            { t: hi ? 'मुख्यमंत्री कार्यालय' : "CM's Office", u: 'https://cm.uk.gov.in' },
            { t: hi ? 'शासनादेश' : 'Government Orders',  u: 'https://go.uk.gov.in' },
            { t: hi ? 'उत्तराखंड पर्यटन' : 'Uttarakhand Tourism', u: 'https://uttarakhandtourism.gov.in' }
          ]
        }
      ];

      el.className = 'footer';
      el.innerHTML =
        '<div class="footer-inner">' +

          '<div class="footer-cols">' +
            cols.map(function (c) {
              return '<div class="footer-col"><h3>' + c.h + '</h3><ul>' +
                c.links.map(function (l) {
                  var ext = l.u.indexOf('http') === 0;
                  return '<li><a href="' + l.u + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' +
                         self.escape(l.t) + '</a></li>';
                }).join('') +
              '</ul></div>';
            }).join('') +
          '</div>' +

          '<div class="trustbar">' +
            TRUST.map(function (t) {
              return '<a class="trustmark" href="' + t.href + '" target="_blank" rel="noopener">' +
                     self.icon(t.icon, 15) + t.label + '</a>';
            }).join('') +
          '</div>' +

          '<div class="footer-meta">' +
            '<div>' +
              (hi ? 'इस पोर्टल की सामग्री सूचना प्रौद्योगिकी विकास अभिकरण (ITDA), उत्तराखंड द्वारा प्रबंधित है।'
                  : 'Content on this portal is managed by the Information Technology Development Agency (ITDA), Uttarakhand.') +
              '<br><strong>' +
              (hi ? 'यह एक प्रोटोटाइप है — आधिकारिक पोर्टल नहीं।'
                  : 'This is a prototype — not the official portal.') +
              '</strong>' +
            '</div>' +
            '<div style="text-align:right">' +
              (hi ? 'अंतिम अद्यतन' : 'Last updated') + ': ' + this.formatDate(new Date().toISOString()) +
              '<br>' + (hi ? 'GIGW के अनुरूप · WCAG 2.1 AA' : 'GIGW compliant · WCAG 2.1 AA') +
            '</div>' +
          '</div>' +

        '</div>';
    },

    /* ----------------------------------------------------------- preferences */

    setLang: function (lang) {
      global.Store.lang = lang;
      global.Store.setPref('lang', lang);
      if (global.Voice) global.Voice.setLang(lang);
      document.documentElement.lang = lang;
      global.location.reload();
    },

    applyTheme: function (theme) {
      document.documentElement.setAttribute('data-theme', theme);
      global.Store.setPref('theme', theme);
    },

    cycleTheme: function () {
      var order = ['light', 'dark', 'contrast'];
      var names = {
        light:    { hi: 'सामान्य',       en: 'Light' },
        dark:     { hi: 'गहरा',          en: 'Dark' },
        contrast: { hi: 'उच्च कंट्रास्ट', en: 'High contrast' }
      };
      var cur = document.documentElement.getAttribute('data-theme') || 'light';
      var next = order[(order.indexOf(cur) + 1) % order.length];
      this.applyTheme(next);
      this.toast(names[next][global.Store.lang] || names[next].en);
    },

    applyFontScale: function (scale) {
      scale = Math.min(1.6, Math.max(0.85, Math.round(scale * 100) / 100));
      document.documentElement.style.setProperty('--fs', (16 * scale) + 'px');
      global.Store.setPref('fontScale', scale);
    },

    changeFont: function (dir) {
      var cur = global.Store.prefs().fontScale || 1;
      if (dir === 'up') cur += 0.12;
      else if (dir === 'down') cur -= 0.12;
      else cur = 1;
      this.applyFontScale(cur);
    },

    /* ---------------------------------------------------------------- toasts */

    toast: function (msg, ms) {
      var wrap = document.querySelector('.toast-wrap');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.className = 'toast-wrap';
        document.body.appendChild(wrap);
      }
      var el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      el.textContent = msg;
      wrap.appendChild(el);
      setTimeout(function () { el.remove(); }, ms || 3200);
    },

    /* ------------------------------------------------------------- renderers */

    /** The service card, used on every page that lists services. */
    serviceCard: function (svc, onClick) {
      var hi = global.Store.lang === 'hi';
      var el = document.createElement('button');
      el.type = 'button';
      el.className = 'svc';

      var voiceReady = svc.voiceForm && svc.voiceForm.length;

      el.innerHTML =
        '<span class="svc-icon">' + global.Icons.forService(svc, 21) + '</span>' +
        '<span class="svc-name">' + this.escape(hi ? svc.hi : svc.en) + '</span>' +
        '<span class="svc-name-alt">' + this.escape(hi ? svc.en : svc.hi) + '</span>' +
        '<span class="svc-dept">' + this.escape(hi ? svc.deptHi : svc.deptEn) + '</span>' +
        '<span class="svc-meta">' +
          '<span class="pill">' + (svc.charge ? '₹' + svc.charge : global.Store.t('free')) + '</span>' +
          (svc.days ? '<span class="pill">' + svc.days + ' ' + global.Store.t('days') + '</span>' : '') +
          (svc.rts ? '<span class="pill pill-green">' + this.icon('check', 12) + 'RTS</span>' : '') +
          (voiceReady ? '<span class="pill pill-blue">' + this.icon('mic', 12) +
                        (hi ? 'आवाज़' : 'Voice') + '</span>' : '') +
        '</span>';

      el.addEventListener('click', function () { onClick(svc); });
      return el;
    },

    /** Compact tile for quick-action rows. */
    tile: function (opts) {
      var a = document.createElement('a');
      a.href = opts.href;
      a.className = 'tile';
      a.innerHTML =
        '<span class="tile-icon">' + this.icon(opts.icon, 22) + '</span>' +
        '<span class="tile-name">' + this.escape(opts.name) + '</span>' +
        (opts.sub ? '<span class="tile-sub">' + this.escape(opts.sub) + '</span>' : '');
      return a;
    },

    mountFab: function (onClick) {
      var fab = document.createElement('button');
      fab.className = 'fab';
      fab.type = 'button';
      fab.setAttribute('aria-label', global.Store.t('tapToSpeak'));
      fab.innerHTML = this.icon('mic', 24);
      fab.addEventListener('click', onClick);
      document.body.appendChild(fab);
      return fab;
    },

    /* ----------------------------------------------------------------- utils */

    param: function (name) {
      return new URLSearchParams(global.location.search).get(name);
    },

    escape: function (s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    },

    formatDate: function (iso) {
      if (!iso) return '';
      var d = new Date(iso);
      if (isNaN(d)) return iso;
      return d.toLocaleDateString(global.Store.lang === 'hi' ? 'hi-IN' : 'en-IN',
        { day: 'numeric', month: 'short', year: 'numeric' });
    },

    formatDateTime: function (iso) {
      if (!iso) return '';
      var d = new Date(iso);
      if (isNaN(d)) return iso;
      return d.toLocaleString(global.Store.lang === 'hi' ? 'hi-IN' : 'en-IN',
        { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  global.App = App;
})(window);
