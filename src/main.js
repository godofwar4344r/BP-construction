/* ═══════════════════════════════════════════════════════════════
   BP Engineer's & Construction — Haldwani
   Scroll choreography, frame theatre and interaction layer.
   ═══════════════════════════════════════════════════════════════ */

import { FrameSequence } from './lib/frame-sequence.js';
import { SmoothScroll } from './lib/smooth-scroll.js';
import './chatbot.css';
import { BPChatbot } from './chatbot.js';

/** Client's WhatsApp number, digits only, with country code. */
const WHATSAPP = '916395844412';

const TOTAL_FRAMES = 201;
// BASE_URL keeps the sequence resolvable whether the site is served from a
// domain root or a subfolder. See `base` in vite.config.js.
const framePath = (n) => `${import.meta.env.BASE_URL}construction/frame_${String(n).padStart(3, '0')}.jpg`;

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a, b, t) => a + (b - a) * t;

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ───────────────────────────────────────────────────────────────
   THEATRE TIMELINE
   Fractions of the pinned section's scroll length.

     0.00 ─ 0.05   assembled, hero copy holds
     0.05 ─ 0.48   the house comes apart          (frame 1 → 201)
     0.48 ─ 0.56   held open — the count beat
     0.56 ─ 0.93   it comes back together         (frame 201 → 1)
     0.93 ─ 1.00   assembled, closing beat
   ─────────────────────────────────────────────────────────────── */
/* Retimed for a 640vh theatre with the holds squeezed out. The pixel length
   of `explode` and `assemble` is the same as it was at 760vh — only the
   waiting either side of them was removed. */
const T = {
  camera:   0.080,          // hero framing → centred framing
  heroOut:  [0.008, 0.055],
  explode:  [0.020, 0.512],
  hold:     [0.512, 0.545],
  assemble: [0.545, 0.984],
};

/* Kept in lockstep with the card windows below, so the readout never
   names a phase other than the one on screen. */
const PHASES = [
  [0.000, 'Ready to build'],
  [0.080, 'Drawings & approval'],
  [0.220, 'Structure'],
  [0.380, 'Envelope & services'],
  [0.512, 'Full component view'],
  [0.620, 'Interiors'],
  [0.860, 'Handover'],
  [0.955, 'Keys ready'],
];

/* ═══════════ 1. FRAME THEATRE ═══════════ */

const canvas   = $('#stageCanvas');
const theatre  = $('.theatre');
const hero     = $('#hero');
const lead     = $('#stageLead');
const hud      = $('#hud');
const hudFill  = $('#hudFill');
const hudPct   = $('#hudPct');
const hudPhase = $('#hudPhase');

const seq = new FrameSequence(canvas, {
  total: TOTAL_FRAMES,
  path: framePath,
  backdrop: ['#C9C8CD', '#A4A3A9'],
  zoomCap: window.innerWidth < 820 ? 1.55 : 1.24,
});

const cards = $$('.card').map((el) => ({
  el,
  in: parseFloat(el.dataset.in),
  out: parseFloat(el.dataset.out),
  shown: false,
}));

const beats = $$('.beat').map((el) => ({
  el,
  in: parseFloat(el.dataset.in),
  out: parseFloat(el.dataset.out),
  shown: false,
}));

function frameAt(p) {
  const last = TOTAL_FRAMES - 1;
  if (p <= T.explode[0]) return 0;
  if (p < T.explode[1]) {
    return last * ((p - T.explode[0]) / (T.explode[1] - T.explode[0]));
  }
  if (p < T.hold[1]) return last;
  if (p < T.assemble[1]) {
    return last * (1 - (p - T.assemble[0]) / (T.assemble[1] - T.assemble[0]));
  }
  return 0;
}

function phaseAt(p) {
  let label = PHASES[0][1];
  for (const [at, name] of PHASES) if (p >= at) label = name;
  return label;
}

/**
 * Windowed opacity: ramps in, holds, ramps out.
 * Ramps are deliberately short — a long crossfade leaves two adjacent cards
 * both sitting at ~20%, which reads as a rendering fault rather than a
 * transition. Snap in, hold, snap out.
 */
function windowed(t) {
  const fin  = clamp01((t + 0.04) / 0.13);
  const fout = 1 - clamp01((t - 0.88) / 0.13);
  return Math.min(fin, fout);
}

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function paintTheatre(p) {
  seq.setFrame(frameAt(p));

  /* camera — the model yields the left third to the headline, then eases
     back to centre and full size for the disassembly */
  const cam = easeInOut(clamp01(p / T.camera));
  const portrait = window.innerWidth < 820;
  seq.setFraming({
    // Portrait keeps the model in the upper field throughout — the copy and
    // the spec cards own the lower half.
    shiftX: portrait ? 0 : lerp(0.115, 0, cam),
    shiftY: portrait ? lerp(-0.19, -0.13, cam) : lerp(0.028, 0, cam),
    zoomBoost: lerp(portrait ? 1.12 : 1.15, 1, cam),
  });

  /* hero — dissolves upward as the first joint opens */
  const h = clamp01((p - T.heroOut[0]) / (T.heroOut[1] - T.heroOut[0]));
  hero.style.opacity = String(1 - h);
  hero.style.transform = `translate3d(0, ${-h * 70}px, 0)`;
  hero.style.filter = h > 0.01 ? `blur(${(h * 7).toFixed(2)}px)` : 'none';
  hero.style.visibility = h >= 0.995 ? 'hidden' : 'visible';
  lead.style.opacity = String(1 - clamp01(h * 1.05));

  /* spec cards */
  for (const c of cards) {
    const t = (p - c.in) / (c.out - c.in);
    if (t < -0.14 || t > 1.16) {
      if (c.shown) { c.el.style.visibility = 'hidden'; c.el.style.opacity = '0'; c.shown = false; }
      continue;
    }
    const o = windowed(t);
    const y = (0.42 - t) * 46;
    const s = lerp(0.972, 1, clamp01(o));
    c.el.style.visibility = 'visible';
    c.el.style.opacity = String(o);
    c.el.style.transform =
      `translate(var(--tx, 0px), calc(-50% + var(--y, 0%) + ${y.toFixed(2)}px)) scale(${s.toFixed(4)})`;
    c.el.style.setProperty('--p', clamp01(t).toFixed(3));
    c.shown = true;
  }

  /* full-bleed statement beats */
  for (const b of beats) {
    const t = (p - b.in) / (b.out - b.in);
    if (t < -0.14 || t > 1.16) {
      if (b.shown) { b.el.style.visibility = 'hidden'; b.el.style.opacity = '0'; b.shown = false; }
      continue;
    }
    const o = windowed(t);
    b.el.style.visibility = 'visible';
    b.el.style.opacity = String(o);
    b.el.style.transform = `translate3d(0, ${((0.5 - t) * 34).toFixed(2)}px, 0) scale(${lerp(0.985, 1, o).toFixed(4)})`;
    b.shown = true;
  }

  /* build HUD */
  hud.classList.toggle('on', p > 0.035 && p < 0.985);
  hudFill.style.width = `${(p * 100).toFixed(2)}%`;
  hudPct.textContent = Math.round(p * 100);
  const label = phaseAt(p);
  if (hudPhase.textContent !== label) hudPhase.textContent = label;
}

let theatreTop = 0;
let theatreSpan = 1;
let theatreP = 0;
let lastP = -1;
let rafPending = false;

function measureTheatre() {
  const rect = theatre.getBoundingClientRect();
  theatreTop = rect.top + window.scrollY;
  theatreSpan = Math.max(1, theatre.offsetHeight - window.innerHeight);
  theatreP = clamp01((window.scrollY - theatreTop) / theatreSpan);
}

function updateFrame() {
  const y = window.scrollY;
  theatreP = clamp01((y - theatreTop) / theatreSpan);
  if (Math.abs(theatreP - lastP) > 0.0004) {
    paintTheatre(theatreP);
    lastP = theatreP;
  }
}

function onScroll() {
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(() => {
      updateFrame();
      rafPending = false;
    });
  }
}

/* ═══════════ 2. SMOOTH SCROLL ═══════════ */

const smooth = new SmoothScroll({ lerp: 0.09 });

/* ═══════════ 3. RENDER LOOP ═══════════ */

function startScrollSync() {
  measureTheatre();
  updateFrame();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('touchmove', onScroll, { passive: true });
}

/* ═══════════ 4. REVEALS & SPLIT TEXT ═══════════ */

function splitWords(el) {
  let i = 0;
  const walk = (node) => {
    const frag = document.createDocumentFragment();
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
          const wrap = document.createElement('span');
          wrap.className = 'sw';
          const inner = document.createElement('i');
          inner.textContent = part;
          // Capped, so a long statement doesn't trail for seconds.
          inner.style.transitionDelay = `${Math.min(i++ * 0.024, 0.42).toFixed(3)}s`;
          wrap.appendChild(inner);
          frag.appendChild(wrap);
        });
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        if (child.tagName === 'BR') { frag.appendChild(child.cloneNode(false)); return; }
        const clone = child.cloneNode(false);
        clone.appendChild(walk(child));
        frag.appendChild(clone);
      }
    });
    return frag;
  };
  const built = walk(el);
  el.textContent = '';
  el.appendChild(built);
}

function countUp(node) {
  const to = parseFloat(node.dataset.count);
  const dec = parseInt(node.dataset.decimals || '0', 10);
  const suffix = node.dataset.suffix || '';
  if (reduced) { node.textContent = to.toFixed(dec) + suffix; return; }

  const dur = 1700;
  const t0 = performance.now();
  const step = (now) => {
    const t = clamp01((now - t0) / dur);
    const eased = 1 - Math.pow(1 - t, 4);
    node.textContent = (to * eased).toFixed(dec) + suffix;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/**
 * Tag every section below the sequence for the stacking treatment — each
 * pins to the top and the next rides up over it. The theatre is skipped
 * (it IS the sequence; pinning it would fight its own sticky stage) and the
 * footer is left alone so the page has somewhere to land.
 */
function initSectionStack() {
  const sections = $$('main > section').filter((s) => (
    !s.classList.contains('theatre') &&
    // `.quote` is skipped: it holds a position:sticky inner stage, and a
    // transform on an ancestor makes that stage's containing block the
    // ancestor, which kills the pin. Its contents animate via [data-reveal].
    !s.classList.contains('quote')
  ));

  sections.forEach((s) => s.classList.add('sec'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('sec-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -10% 0px' });

  sections.forEach((s) => io.observe(s));
}

function initReveals() {
  if (!reduced) $$('[data-split]').forEach(splitWords);

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      const n = e.target.querySelector('[data-count]');
      if (n) countUp(n);
      io.unobserve(e.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

  $$('[data-reveal], [data-split]').forEach((el, i) => {
    if (el.hasAttribute('data-reveal')) el.style.transitionDelay = `${((i % 4) * 0.07).toFixed(2)}s`;
    io.observe(el);
  });
}

/* ═══════════ 5. NAV, MENU, ANCHORS ═══════════ */

function initChrome() {
  const nav = $('#nav');
  const burger = $('#burger');
  let last = window.scrollY;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('solid', y > 40);
    if (!document.body.classList.contains('menu-open')) {
      nav.classList.toggle('hide', y > last && y > 320);
    }
    last = y;
  }, { passive: true });

  const closeMenu = () => {
    document.body.classList.remove('menu-open');
    smooth.resume();
  };

  burger.addEventListener('click', () => {
    // The menu locks body scroll, so the easing has to stand down or it
    // keeps writing scroll positions behind the overlay.
    if (document.body.classList.toggle('menu-open')) smooth.pause();
    else smooth.resume();
  });

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      if (document.body.classList.contains('menu-open')) closeMenu();
      const y = target.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : 10);
      if (smooth.enabled) smooth.scrollTo(y);
      else window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  /* No backend: the form composes the enquiry and hands it to WhatsApp,
     which is where this client's leads actually arrive. */
  $('.form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = (id) => $(id)?.value.trim() || '—';
    const msg = [
      "Hello BP Engineer's — I'd like an estimate.",
      '',
      `Name: ${val('#f-name')}`,
      `Phone: ${val('#f-phone')}`,
      `Plot: ${val('#f-loc')}`,
      `Scope: ${$('#f-scope')?.value || '—'}`,
      `Details: ${val('#f-msg')}`,
    ].join('\n');
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });
}

/* ═══════════ 6. REVIEW SLIDER ═══════════ */

function initReviews() {
  const root = $('#revShow');
  if (!root) return;

  const cards = $$('.rev', root);
  const dotsWrap = $('#revDots');
  const idxEl = $('#revIdx');
  const prog = $('#revProg');
  if (!cards.length) return;

  let index = -1;

  function go(n) {
    const next = Math.max(0, Math.min(cards.length - 1, n));
    if (next === index) return;
    index = next;
    cards.forEach((c, k) => {
      const on = k === index;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    dots.forEach((d, k) => {
      d.classList.toggle('on', k === index);
      d.setAttribute('aria-selected', k === index ? 'true' : 'false');
    });
    if (idxEl) idxEl.textContent = String(index + 1).padStart(2, '0');
  }

  /* The cards advance on their own. Driving them from scroll position meant
     pinning the section for ~2 screens, during which scrolling appeared to
     do nothing — the page has to behave like an ordinary page first. */
  const DWELL = 5200;
  let timer = null;

  function restart() {
    if (timer) clearInterval(timer);
    if (!reduced) timer = setInterval(() => go(index + 1 >= cards.length ? 0 : index + 1), DWELL);
    if (prog && !reduced) {
      prog.style.animation = 'none';
      void prog.offsetWidth;
      prog.style.animation = `revProg ${DWELL}ms linear forwards`;
    }
  }
  const halt = () => { if (timer) { clearInterval(timer); timer = null; } };

  function seek(n) {
    const wrapped = n < 0 ? cards.length - 1 : n >= cards.length ? 0 : n;
    go(wrapped);
    restart();
  }

  cards.forEach((_, n) => {
    const dot = document.createElement('button');
    dot.className = 'revshow__dot';
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Review ${n + 1} of ${cards.length}`);
    dot.addEventListener('click', () => seek(n));
    dotsWrap?.appendChild(dot);
  });
  const dots = $$('.revshow__dot', dotsWrap);

  $('[data-rev-next]', root)?.addEventListener('click', () => seek(index + 1));
  $('[data-rev-prev]', root)?.addEventListener('click', () => seek(index - 1));

  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); seek(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); seek(index - 1); }
  });

  go(0);

  // Pause while the pointer or keyboard focus is on the slider.
  root.addEventListener('mouseenter', halt);
  root.addEventListener('mouseleave', restart);
  root.addEventListener('focusin', halt);
  root.addEventListener('focusout', restart);

  let swipeX = null;
  root.addEventListener('touchstart', (e) => { swipeX = e.touches[0].clientX; }, { passive: true });
  root.addEventListener('touchend', (e) => {
    if (swipeX === null) return;
    const dx = e.changedTouches[0].clientX - swipeX;
    swipeX = null;
    if (Math.abs(dx) > 45) seek(dx < 0 ? index + 1 : index - 1);
  }, { passive: true });

  // Only run the clock while the slider is actually on screen.
  new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? restart() : halt()));
  }, { threshold: 0.25 }).observe(root);

  /* Pointer tilt — the card leans toward the cursor and a sheen tracks it */
  const stage = $('.revshow__stage', root);
  if (stage && !reduced && !window.matchMedia('(hover: none)').matches) {
    const active = () => cards[Math.max(0, index)];

    stage.addEventListener('pointermove', (e) => {
      const card = active();
      if (!card) return;
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.classList.add('is-tilting');
      card.style.setProperty('--tx', `${(px * 11).toFixed(2)}deg`);
      card.style.setProperty('--ty', `${(-py * 7).toFixed(2)}deg`);
      card.style.setProperty('--mx', `${((px + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${((py + 0.5) * 100).toFixed(1)}%`);
    });

    stage.addEventListener('pointerleave', () => {
      cards.forEach((c) => {
        c.classList.remove('is-tilting');
        c.style.setProperty('--tx', '0deg');
        c.style.setProperty('--ty', '0deg');
      });
    });
  }
}

/* ═══════════ 7. CURSOR & MAGNETICS ═══════════ */

function initCursor() {
  if (window.matchMedia('(hover: none)').matches || reduced) return;

  const cur = $('.cursor');
  const dot = $('.cursor__dot');
  const ring = $('.cursor__ring');
  let mx = innerWidth / 2, my = innerHeight / 2;
  let dx = mx, dy = my, rx = mx, ry = my;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    cur.classList.add('on');
  }, { passive: true });

  document.addEventListener('mouseleave', () => cur.classList.remove('on'));

  const paint = () => {
    dx = lerp(dx, mx, 0.55); dy = lerp(dy, my, 0.55);
    rx = lerp(rx, mx, 0.16); ry = lerp(ry, my, 0.16);
    dot.style.transform  = `translate3d(${dx}px, ${dy}px, 0) translate(-50%,-50%)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%,-50%)`;
    requestAnimationFrame(paint);
  };
  paint();

  const STATES = ['is-link', 'is-hover', 'is-view'];
  document.addEventListener('mouseover', (e) => {
    const hit = e.target.closest('[data-cursor]');
    cur.classList.remove(...STATES);
    if (hit) cur.classList.add(`is-${hit.dataset.cursor}`);
  });
}

function initMagnetic() {
  if (window.matchMedia('(hover: none)').matches || reduced) return;

  $$('[data-magnetic]').forEach((el) => {
    let raf = null, tx = 0, ty = 0, cx = 0, cy = 0;

    const run = () => {
      cx = lerp(cx, tx, 0.18); cy = lerp(cy, ty, 0.18);
      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      if (Math.abs(cx - tx) > 0.1 || Math.abs(cy - ty) > 0.1) raf = requestAnimationFrame(run);
      else raf = null;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(run); };

    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) * 0.28;
      ty = (e.clientY - (r.top + r.height / 2)) * 0.42;
      kick();
    });
    el.addEventListener('mouseleave', () => { tx = 0; ty = 0; kick(); });
  });
}

/* ═══════════ 8. BOOT ═══════════ */

const loader      = $('#loader');
const loaderBar   = $('#loaderBar');
const loaderPct   = $('#loaderPct');
const loaderLabel = $('#loaderLabel');

/* Section snapping lived here and has been removed. It swallowed the wheel
   event and jumped a whole section per tick behind a 650ms lockout, so the
   page could not be scrolled by hand at any normal pace. The scroll is now
   entirely the browser's. */

async function boot() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  seq.resize();

  const isMobile = window.innerWidth < 820;
  const t0 = performance.now();
  await seq.loadSkeleton(isMobile ? 8 : 6, (p) => {
    const pct = Math.round(p * 100);
    loaderBar.style.width = `${pct}%`;
    loaderPct.textContent = String(pct).padStart(2, '0');
    if (pct > 55) loaderLabel.textContent = 'Resolving components';
    if (pct > 88) loaderLabel.textContent = 'Ready';
  });

  // Hold the curtain long enough for the mark to register.
  const pinned = import.meta.env.DEV && new URLSearchParams(location.search).has('__pin');
  const elapsed = performance.now() - t0;
  if (!pinned && elapsed < 1100) await new Promise((r) => setTimeout(r, 1100 - elapsed));

  seq.jumpTo(0);
  seq.start();

  loader.classList.add('done');
  setTimeout(() => loader.remove(), 1100);
  document.body.classList.remove('is-loading');
  requestAnimationFrame(() => document.body.classList.add('ready'));

  initSectionStack();
  initReveals();
  initChrome();
  initReviews();
  initCursor();
  initMagnetic();
  new BPChatbot();

  if (!reduced) smooth.enable();
  startScrollSync();

  // Fill in the in-between frames once the entrance has played out.
  setTimeout(() => seq.loadRest(isMobile ? 3 : 5), isMobile ? 1200 : 900);

  window.addEventListener('resize', () => {
    seq.zoomCap = window.innerWidth < 820 ? 1.55 : 1.24;
    measureTheatre();
    updateFrame();
  }, { passive: true });

  if (pinned) {
    // Deterministic capture: every frame present before we settle the pose.
    await seq.loadRest(8);
    devPin();
  }
}

/**
 * Dev-only capture hook. Pins the page at a scroll position and settles every
 * entrance animation so a headless screenshot can inspect any beat of the
 * sequence:
 *
 *   ?__pin=t0.29   fraction of the theatre's own scroll
 *   ?__pin=0.42    fraction of the whole document
 *   ?__pin=3200    absolute pixels
 *
 * Double-underscored so it reads as internal and can't be tripped by a
 * stray or shared link. Compiled out of production builds entirely.
 */
function devPin() {
  const raw = new URLSearchParams(location.search).get('__pin');
  if (raw === null) return;

  // `t0.29` = fraction of the theatre's own scroll; `0.4` = fraction of the
  // whole document; `3200` = absolute pixels.
  const theatreRel = raw[0] === 't';
  const v = parseFloat(theatreRel ? raw.slice(1) : raw);
  if (Number.isNaN(v)) return;

  let y;
  if (theatreRel) {
    y = theatre.offsetTop + v * (theatre.offsetHeight - window.innerHeight);
  } else {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    y = v <= 1 ? v * max : v;
  }

  window.scrollTo(0, y);
  smooth.target = smooth.current = y;

  requestAnimationFrame(() => {
    measureTheatre();
    paintTheatre(theatreP);
    seq.jumpTo(frameAt(theatreP));
    $$('[data-reveal], [data-split]').forEach((el) => {
      el.style.transitionDelay = '0s';
      el.classList.add('in');
    });
    // Per-word delays too, or the capture races the stagger.
    $$('[data-split] .sw > i').forEach((el) => { el.style.transitionDelay = '0s'; });

    if (new URLSearchParams(location.search).has('__probe')) {
      const box = document.createElement('pre');
      box.style.cssText =
        'position:fixed;left:8px;top:8px;z-index:99999;margin:0;padding:10px 14px;' +
        'background:#0C0D0F;color:#CFAF78;font:12px/1.5 monospace;white-space:pre;';
      box.textContent = [
        `scrollY   ${Math.round(window.scrollY)}`,
        `innerH    ${window.innerHeight}`,
        `docH      ${document.documentElement.scrollHeight}`,
        `theatreH  ${theatre.offsetHeight}`,
        `theatreP  ${theatreP.toFixed(4)}`,
        `frame     ${Math.round(frameAt(theatreP))}`,
        `canvas    ${seq.canvas.width}x${seq.canvas.height}`,
        `loaded    ${seq.readyCount}/${seq.total}`,
      ].join('\n');
      document.body.appendChild(box);
    }

    // Two clean frames, then flag the capture harness.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.__AXIOM_PINNED__ = true;
    }));
  });
}

boot();
