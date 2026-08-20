/**
 * SmoothScroll — inertial scroll driver.
 *
 * Wheel and keyboard input feed a target; the current position eases toward
 * it every frame. This is what gives the page its glide, and in particular
 * what makes the pinned frame sequence feel like film rather than a series
 * of steps — a raw wheel notch jumps ~25 frames at once, and easing is what
 * turns that jump into a sweep.
 *
 * It drives the real window scroll position rather than transforming a
 * wrapper, so `position: sticky`, anchors and the URL hash keep working.
 *
 * It does NOT snap, page, or otherwise decide where the reader should end
 * up — an earlier version hijacked the wheel to jump section to section and
 * made the page unusable. Easing only.
 *
 * Opts out on touch input and under reduced motion, where native behaviour
 * is better than anything we'd synthesise.
 */

export class SmoothScroll {
  constructor({ lerp = 0.09, multiplier = 1 } = {}) {
    this.lerp = lerp;
    this.multiplier = multiplier;
    this.enabled = false;
    this.target = window.scrollY;
    this.current = window.scrollY;
    this.paused = false;
    this.raf = null;

    this._wheel = this._wheel.bind(this);
    this._key = this._key.bind(this);
    this._sync = this._sync.bind(this);
    this._tick = this._tick.bind(this);
  }

  static supported() {
    return !window.matchMedia('(hover: none)').matches
        && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  get max() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  enable() {
    if (this.enabled || !SmoothScroll.supported()) return;
    this.enabled = true;
    this.target = this.current = window.scrollY;
    window.addEventListener('wheel', this._wheel, { passive: false });
    window.addEventListener('keydown', this._key);
    window.addEventListener('scroll', this._sync, { passive: true });
    this.raf = requestAnimationFrame(this._tick);
  }

  pause() { this.paused = true; }

  resume() {
    this.paused = false;
    this.target = this.current = window.scrollY;
  }

  /** Programmatic scroll that respects the easing (used by anchors). */
  scrollTo(y) {
    this.target = Math.max(0, Math.min(this.max, y));
    if (!this.enabled) window.scrollTo({ top: this.target, behavior: 'smooth' });
  }

  _wheel(e) {
    if (this.paused || e.ctrlKey || e.defaultPrevented) return;
    // Never hijack scroll inside chat window or elements with data-no-smooth-scroll
    if (e.target && e.target.closest && e.target.closest('.bp-chat-window, [data-no-smooth-scroll]')) return;
    e.preventDefault();
    // Normalise line/page delta modes to pixels.
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
    this.target = Math.max(0, Math.min(this.max, this.target + e.deltaY * unit * this.multiplier));
  }

  _key(e) {
    if (this.paused) return;
    const t = e.target;
    if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || (t.closest && t.closest('.bp-chat-window')))) return;

    const page = window.innerHeight * 0.86;
    const map = {
      ArrowDown: 110, ArrowUp: -110,
      PageDown: page, PageUp: -page,
      Home: -this.max, End: this.max,
      ' ': e.shiftKey ? -page : page,
    };
    const d = map[e.key];
    if (d === undefined) return;
    e.preventDefault();
    this.target = Math.max(0, Math.min(this.max, this.target + d));
  }

  /**
   * Scrollbar drags, anchor jumps, devtools — anything that isn't us.
   * Identified by position rather than a "was that me?" flag: a flag leaks
   * whenever a scrollTo lands where it already was and fires no event, which
   * then swallows the reader's next real scroll.
   */
  _sync() {
    if (Math.abs(window.scrollY - this.current) < 2) return;
    this.target = this.current = window.scrollY;
  }

  _tick() {
    if (this.enabled && !this.paused) {
      const d = this.target - this.current;
      if (Math.abs(d) > 0.12) {
        this.current += d * this.lerp;
        window.scrollTo(0, this.current);
      } else if (this.current !== this.target) {
        this.current = this.target;
        window.scrollTo(0, this.current);
      }
    }
    this.raf = requestAnimationFrame(this._tick);
  }

  destroy() {
    window.removeEventListener('wheel', this._wheel);
    window.removeEventListener('keydown', this._key);
    window.removeEventListener('scroll', this._sync);
    if (this.raf) cancelAnimationFrame(this.raf);
    this.enabled = false;
  }
}
