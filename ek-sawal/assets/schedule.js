/* =============================================================================
   schedule.js — appointment slots for the in-person step

   Most Uttarakhand services still need one physical visit: biometric capture,
   a Patwari verification, a signature. The portal today leaves the citizen to
   guess when to turn up. This gives them a time.

   DEMO AVAILABILITY. Slots are generated locally from working-day rules, not
   read from any office diary. Against a real system this file is replaced by a
   call to the office's calendar; the shape of `slotsFor()` stays the same.
   ============================================================================= */

(function (global) {
  'use strict';

  var TIMES = [
    { v: '10:00', hi: 'सुबह 10:00', en: '10:00 am' },
    { v: '11:00', hi: 'सुबह 11:00', en: '11:00 am' },
    { v: '12:00', hi: 'दोपहर 12:00', en: '12:00 noon' },
    { v: '14:00', hi: 'दोपहर 2:00', en: '2:00 pm' },
    { v: '15:00', hi: 'दोपहर 3:00', en: '3:00 pm' }
  ];

  var DAY_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
  var MON_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितम्बर', 'अक्टूबर', 'नवम्बर', 'दिसम्बर'];

  function fmt(d, lang) {
    if (lang === 'en') {
      return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    }
    return DAY_HI[d.getDay()] + ', ' + d.getDate() + ' ' + MON_HI[d.getMonth()];
  }

  /* The next `count` working days, starting tomorrow — nobody can reach a
     tehsil the same hour they apply. */
  function days(count) {
    var out = [], d = new Date();
    d.setHours(0, 0, 0, 0);
    while (out.length < count) {
      d.setDate(d.getDate() + 1);
      var wd = d.getDay();
      if (wd === 0 || wd === 6) continue;
      out.push(new Date(d.getTime()));
    }
    return out;
  }

  global.Schedule = {
    times: TIMES,
    format: fmt,

    /* A stable pseudo-availability so the same day does not flicker between
       full and free as the citizen taps around. */
    slotsFor: function (date) {
      var seed = date.getDate() + date.getMonth() * 31;
      return TIMES.map(function (t, i) {
        return { time: t, free: ((seed + i * 7) % 5) !== 0 };
      });
    },

    days: days,

    iso: function (d) {
      return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
    }
  };

})(typeof window !== 'undefined' ? window : this);
