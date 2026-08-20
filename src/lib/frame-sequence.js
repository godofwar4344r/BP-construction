/**
 * FrameSequence
 * Scroll-scrubbed image sequence renderer.
 *
 *  · Progressive two-wave loading — a strided "skeleton" pass gets the
 *    experience on screen fast, the in-between frames fill in silently.
 *  · Nearest-loaded fallback, so a frame that hasn't arrived yet never
 *    blanks the stage.
 *  · DPR-aware, width-priority fit that keeps the model intact instead of
 *    cropping its edges on narrow viewports.
 */

export class FrameSequence {
  constructor(canvas, { total, path, backdrop = ['#C8C7CC', '#A6A5AA'], zoomCap = 1.28 }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.total = total;
    this.path = path;
    this.backdrop = backdrop;
    this.zoomCap = zoomCap;

    this.images = new Array(total).fill(null);
    this.ready = new Array(total).fill(false);
    this.readyCount = 0;

    this.target = 0;   // desired frame (float)
    this.current = 0;  // eased frame (float)

    // Framing — a slow push/settle driven by the page, so the model can
    // yield the left third to the headline and then take centre stage.
    this.shiftX = 0;     // fraction of canvas width
    this.shiftY = 0;     // fraction of canvas height
    this.zoomBoost = 1;

    this.drawn = '';
    // How hard the drawn frame chases the scroll target. The scroll itself is
    // already eased by SmoothScroll, so this stays fairly snappy — easing both
    // stages hard makes the model visibly trail the page.
    this.lerp = 0.14;
    this.raf = null;

    this._onResize = this._onResize.bind(this);
    this._tick = this._tick.bind(this);
    window.addEventListener('resize', this._onResize, { passive: true });

    // The window `resize` event alone isn't enough: a stage that is laid out
    // at zero (hidden tab, pane not yet composited, font/layout settling)
    // would otherwise stay blank forever. Observing the element itself means
    // the first real measurement always repaints.
    if ('ResizeObserver' in window) {
      this._ro = new ResizeObserver(() => this._onResize());
      this._ro.observe(canvas);
    }
  }

  /* ── loading ─────────────────────────────────────────────── */

  _loadOne(i) {
    return new Promise((resolve) => {
      if (this.ready[i]) return resolve();
      const img = new Image();
      img.decoding = 'async';
      const done = () => {
        this.images[i] = img;
        this.ready[i] = true;
        this.readyCount++;
        resolve();
      };
      img.onload = done;
      img.onerror = () => resolve(); // stays unready → nearest-loaded covers it
      img.src = this.path(i + 1);
    });
  }

  /** Strided skeleton pass. Resolves once the sequence is watchable. */
  async loadSkeleton(stride, onProgress) {
    const idx = [];
    for (let i = 0; i < this.total; i += stride) idx.push(i);
    if (idx[idx.length - 1] !== this.total - 1) idx.push(this.total - 1);

    let done = 0;
    // First frame first, so the stage is never empty behind the loader.
    await this._loadOne(0);
    this.draw(0);
    onProgress?.(++done / idx.length);

    await this._pool(idx.slice(1), 8, async (i) => {
      await this._loadOne(i);
      onProgress?.(++done / idx.length);
    });
  }

  /** Everything that's left, in the background, gently. */
  loadRest(concurrency = 5) {
    const rest = [];
    for (let i = 0; i < this.total; i++) if (!this.ready[i]) rest.push(i);
    return this._pool(rest, concurrency, (i) => this._loadOne(i));
  }

  async _pool(items, limit, worker) {
    let cursor = 0;
    const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) await worker(items[cursor++]);
    });
    await Promise.all(runners);
  }

  /* ── playback ────────────────────────────────────────────── */

  setFrame(f) {
    this.target = Math.max(0, Math.min(this.total - 1, f));
  }

  /** Snap without easing — used on first paint. */
  jumpTo(f) {
    this.setFrame(f);
    this.current = this.target;
    this.draw(Math.round(this.current));
  }

  start() {
    if (!this.raf) this.raf = requestAnimationFrame(this._tick);
  }

  _tick() {
    const d = this.target - this.current;
    if (Math.abs(d) > 0.004) {
      this.current += d * this.lerp;
      this.draw(Math.round(this.current));
    }
    this.raf = requestAnimationFrame(this._tick);
  }

  /** Closest frame we actually have pixels for. */
  _nearest(i) {
    if (this.ready[i]) return i;
    for (let r = 1; r < this.total; r++) {
      if (i - r >= 0 && this.ready[i - r]) return i - r;
      if (i + r < this.total && this.ready[i + r]) return i + r;
    }
    return -1;
  }

  /* ── rendering ───────────────────────────────────────────── */

  /** Reframe without changing which frame is showing. */
  setFraming({ shiftX = 0, shiftY = 0, zoomBoost = 1 } = {}) {
    this.shiftX = shiftX;
    this.shiftY = shiftY;
    this.zoomBoost = zoomBoost;
  }

  _onResize() {
    this.resize();
    this.drawn = '';
    this.draw(Math.round(this.current));
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  draw(i) {
    const idx = this._nearest(i);
    if (idx < 0) return;

    // Framing is animated, so the cache key has to include it.
    const key = `${idx}|${this.shiftX.toFixed(4)}|${this.shiftY.toFixed(4)}|${this.zoomBoost.toFixed(4)}`;
    if (key === this.drawn) return;

    const img = this.images[idx];
    if (!img || !img.naturalWidth) return;

    let cw = this.canvas.width;
    let ch = this.canvas.height;
    if (!cw || !ch) {
      if (!this.canvas.clientWidth) return;   // genuinely no layout yet
      this.resize();                          // measured late — recover now
      cw = this.canvas.width;
      ch = this.canvas.height;
      if (!cw || !ch) return;
    }

    const ctx = this.ctx;

    // Studio backdrop, so letterboxed bands blend into the plate.
    const g = ctx.createRadialGradient(cw * 0.5, ch * 0.44, 0, cw * 0.5, ch * 0.44, Math.max(cw, ch) * 0.78);
    g.addColorStop(0, this.backdrop[0]);
    g.addColorStop(1, this.backdrop[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, cw, ch);

    // Width-priority fit: the model keeps its silhouette on every viewport.
    // Taller-than-source viewports get a capped zoom so it never floats
    // small in a sea of grey.
    const ratio = img.naturalWidth / img.naturalHeight;
    const fitH = cw / ratio;
    const zoom = Math.min(Math.max(ch / fitH, 1), this.zoomCap) * this.zoomBoost;

    const dw = cw * zoom;
    const dh = dw / ratio;
    const dx = (cw - dw) / 2 + this.shiftX * cw;
    const dy = (ch - dh) / 2 + this.shiftY * ch;

    // A 16:9 plate can't cover a tall phone screen without destroying the
    // composition, so it letterboxes. Rather than leave grey bands with a
    // visible seam, stretch the plate's own top and bottom edge rows to fill
    // them — the studio backdrop is a smooth gradient there, so it reads as
    // one continuous surface.
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const EDGE = 2;

    if (dy > 0) {
      ctx.drawImage(img, 0, 0, iw, EDGE, dx, 0, dw, dy + 1);
    }
    const below = ch - (dy + dh);
    if (below > 0) {
      ctx.drawImage(img, 0, ih - EDGE, iw, EDGE, dx, dy + dh - 1, dw, below + 1);
    }

    ctx.drawImage(img, dx, dy, dw, dh);

    this.drawn = key;
  }

  destroy() {
    window.removeEventListener('resize', this._onResize);
    this._ro?.disconnect();
    if (this.raf) cancelAnimationFrame(this.raf);
  }
}
