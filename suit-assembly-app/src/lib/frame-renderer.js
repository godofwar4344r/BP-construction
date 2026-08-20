/**
 * High-performance HTML5 Canvas Frame Sequence Renderer
 * Preloads 240 frames and renders smoothly with high-DPI resolution scaling.
 */

export class FrameRenderer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.totalFrames = options.totalFrames || 240;
    this.framePath = options.framePath || ((n) => `/frames/frame_${String(n).padStart(3, '0')}.jpg`);
    
    this.images = new Array(this.totalFrames);
    this.loadedFlags = new Uint8Array(this.totalFrames);
    this.loadedCount = 0;
    this.currentFrameIndex = 0;

    this.viewportWidth = 0;
    this.viewportHeight = 0;

    this.onProgress = options.onProgress || (() => {});
    
    this.initResizeObserver();
  }

  initResizeObserver() {
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    
    this.viewportWidth = rect.width;
    this.viewportHeight = rect.height;

    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);

    this.renderCurrentFrame();
  }

  async loadInitialSkeleton(step = 5) {
    const promises = [];
    for (let i = 0; i < this.totalFrames; i += step) {
      promises.push(this.loadSingleFrame(i));
    }
    promises.push(this.loadSingleFrame(0));
    promises.push(this.loadSingleFrame(this.totalFrames - 1));

    await Promise.all(promises);
    this.renderCurrentFrame();
    
    setTimeout(() => this.loadAllRemainingFrames(), 100);
  }

  loadSingleFrame(index) {
    if (index < 0 || index >= this.totalFrames) return Promise.resolve();
    if (this.images[index]) return Promise.resolve(this.images[index]);

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = this.framePath(index + 1);

      img.onload = () => {
        this.images[index] = img;
        this.loadedFlags[index] = 1;
        this.loadedCount++;
        this.onProgress(this.loadedCount / this.totalFrames);
        resolve(img);
      };

      img.onerror = () => {
        console.warn(`Failed to load frame ${index + 1}`);
        resolve(null);
      };
    });
  }

  async loadAllRemainingFrames() {
    for (let i = 0; i < this.totalFrames; i++) {
      if (!this.loadedFlags[i]) {
        await this.loadSingleFrame(i);
      }
    }
  }

  setFrame(frameIndex) {
    const clamped = Math.max(0, Math.min(this.totalFrames - 1, Math.round(frameIndex)));
    if (clamped !== this.currentFrameIndex) {
      this.currentFrameIndex = clamped;
      this.renderCurrentFrame();
    }
  }

  getNearestLoadedImage(index) {
    if (this.images[index]) return this.images[index];

    for (let offset = 1; offset < 30; offset++) {
      if (index - offset >= 0 && this.images[index - offset]) {
        return this.images[index - offset];
      }
      if (index + offset < this.totalFrames && this.images[index + offset]) {
        return this.images[index + offset];
      }
    }
    return null;
  }

  renderCurrentFrame() {
    if (!this.ctx || !this.canvas.width) return;

    const img = this.getNearestLoadedImage(this.currentFrameIndex);
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Dark sleek background
    this.ctx.fillStyle = '#060910';
    this.ctx.fillRect(0, 0, w, h);

    if (!img) return;

    // Calculate aspect fill & contain logic with slight top offset so helmet is never cut off
    const imgRatio = img.width / img.height;
    const canvasRatio = w / h;

    let drawW, drawH, drawX, drawY;

    if (canvasRatio > imgRatio) {
      // Screen is wider than 16:9 - scale width, center height with top offset
      drawW = w * 0.95;
      drawH = drawW / imgRatio;
      drawX = (w - drawW) / 2;
      drawY = (h - drawH) / 2 + h * 0.035; // Shift down 3.5% so head is fully visible
    } else {
      // Screen is taller than 16:9 - scale height with top padding
      drawH = h * 0.92;
      drawW = drawH * imgRatio;
      drawX = (w - drawW) / 2;
      drawY = h * 0.05; // 5% top margin for helmet
    }

    this.ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }
}
