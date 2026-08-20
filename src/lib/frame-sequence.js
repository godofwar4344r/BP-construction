/**
 * FrameSequence
 * Highly optimized, low-latency scroll-scrubbed image sequence renderer.
 *
 *  · Mobile-optimized DPR scaling to prevent GPU fill-rate thermal throttling.
 *  · Off-main-thread async image decoding (img.decode).
 *  · Smart dirty-checking — halts RAF when settled to eliminate CPU/GPU drain.
 *  · Width-priority viewport fit with seamless edge extension.
 */

export class FrameSequence {
  constructor(canvas, { total, path, backdrop = ['#C8C7CC', '#A6A5AA'], zoomCap = 1.28 }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    this.total = total;
    this.path = path;
    this.backdrop = backdrop;
    this.zoomCap = zoomCap;

    this.images = new Array(total).fill(null);
    this.ready = new Array(total).fill(false);
    this.readyCount = 0;

    this.target = 0;   // desired frame (float)
    this.current = 0;  // eased frame (float)

    this.shiftX = 0;
    this.shiftY = 0;
    this.zoomBoost = 1;

    this.drawn = '';
    this.lerp = 0.18; // snappy tracking for low-latency feel
    this.raf = null;
    this.isTicking = false;

    this._onResize = this._onResize.bind(this);
    this._tick = this._tick.bind(this);
    window.addEventListener('resize', this._onResize, { passive: true });

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
      img.onload = async () => {
        try {
          if ('decode' in img) await img.decode();
        } catch {
          // ignore decode errors on older engines
        }
        this.images[i] = img;
        this.ready[i] = true;
        this.readyCount++;
        resolve();
      };
      img.onerror = () => resolve();
      img.src = this.path(i + 1);
    });
  }

  /** Strided skeleton pass for instant interactivity. */
  async loadSkeleton(stride, onProgress) {
    const idx = [];
    for (let i = 0; i < this.total; i += stride) idx.push(i);
    if (idx[idx.length - 1] !== this.total - 1) idx.push(this.total - 1);

    let done = 0;
    await this._loadOne(0);
    this.draw(0);
    onProgress?.(++done / idx.length);

    const concurrency = window.innerWidth < 820 ? 4 : 8;
    await this._pool(idx.slice(1), concurrency, async (i) => {
      await this._loadOne(i);
      onProgress?.(++done / idx.length);
    });
  }

  /** Background progressive loader. */
  loadRest(concurrency = 4) {
    const rest = [];
    for (let i = 0; i < this.total; i++) if (!this.ready[i]) rest.push(i);
    const limit = window.innerWidth < 820 ? Math.min(concurrency, 3) : concurrency;
    return this._pool(rest, limit, (i) => this._loadOne(i));
  }

  async _pool(items, limit, worker) {
    let cursor = 0;
    const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) await worker(items[cursor++]);
    });
    await Promise.all(runners);
  }

  /* ── playback & rendering ────────────────────────────────── */

  setFrame(f) {
    this.target = Math.max(0, Math.min(this.total - 1, f));
    this.wake();
  }

  jumpTo(f) {
    this.setFrame(f);
    this.current = this.target;
    this.draw(Math.round(this.current));
  }

  wake() {
    if (!this.isTicking) {
      this.isTicking = true;
      this.raf = requestAnimationFrame(this._tick);
    }
  }

  start() {
    this.wake();
  }

  _tick() {
    const d = this.target - this.current;
    if (Math.abs(d) > 0.005) {
      this.current += d * this.lerp;
      this.draw(Math.round(this.current));
      this.raf = requestAnimationFrame(this._tick);
    } else {
      if (this.current !== this.target) {
        this.current = this.target;
        this.draw(Math.round(this.current));
      }
      this.isTicking = false;
      this.raf = null;
    }
  }

  _nearest(i) {
    if (this.ready[i]) return i;
    for (let r = 1; r < this.total; r++) {
      if (i - r >= 0 && this.ready[i - r]) return i - r;
      if (i + r < this.total && this.ready[i + r]) return i + r;
    }
    return -1;
  }

  setFraming({ shiftX = 0, shiftY = 0, zoomBoost = 1 } = {}) {
    if (this.shiftX !== shiftX || this.shiftY !== shiftY || this.zoomBoost !== zoomBoost) {
      this.shiftX = shiftX;
      this.shiftY = shiftY;
      this.zoomBoost = zoomBoost;
      this.wake();
    }
  }

  _onResize() {
    this.resize();
    this.drawn = '';
    this.draw(Math.round(this.current));
  }

  resize() {
    const isMobile = window.innerWidth < 820;
    // Cap DPR on mobile to 1.25 to prevent memory exhaustion and stutter
    const maxDpr = isMobile ? 1.25 : 1.75;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = isMobile ? 'medium' : 'high';
  }

  draw(i) {
    const idx = this._nearest(i);
    if (idx < 0) return;

    const key = `${idx}|${this.shiftX.toFixed(3)}|${this.shiftY.toFixed(3)}|${this.zoomBoost.toFixed(3)}`;
    if (key === this.drawn) return;

    const img = this.images[idx];
    if (!img || !img.naturalWidth) return;

    let cw = this.canvas.width;
    let ch = this.canvas.height;
    if (!cw || !ch) {
      if (!this.canvas.clientWidth) return;
      this.resize();
      cw = this.canvas.width;
      ch = this.canvas.height;
      if (!cw || !ch) return;
    }

    const ctx = this.ctx;

    // Gradient background
    const g = ctx.createRadialGradient(cw * 0.5, ch * 0.44, 0, cw * 0.5, ch * 0.44, Math.max(cw, ch) * 0.78);
    g.addColorStop(0, this.backdrop[0]);
    g.addColorStop(1, this.backdrop[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, cw, ch);

    const ratio = img.naturalWidth / img.naturalHeight;
    const fitH = cw / ratio;
    const zoom = Math.min(Math.max(ch / fitH, 1), this.zoomCap) * this.zoomBoost;

    const dw = cw * zoom;
    const dh = dw / ratio;
    const dx = (cw - dw) / 2 + this.shiftX * cw;
    const dy = (ch - dh) / 2 + this.shiftY * ch;

    // Edge extension for tall screens
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
