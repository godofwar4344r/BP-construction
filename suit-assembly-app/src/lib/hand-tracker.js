/**
 * HandTracker class using MediaPipe Hands
 * Tracks user hands in real-time to trigger suit assembly when hands are close,
 * and suit disassembly when hands are spread apart.
 */

export class HandTracker {
  constructor(options = {}) {
    this.videoElement = options.videoElement;
    this.canvasElement = options.canvasElement;
    this.onUpdate = options.onUpdate || (() => {});
    this.onStatusChange = options.onStatusChange || (() => {});

    this.ctx = this.canvasElement ? this.canvasElement.getContext('2d') : null;
    this.hands = null;
    this.camera = null;
    this.isRunning = false;

    // Smooth assembly ratio (0.0 = Assembled, 1.0 = Dismantled)
    this.targetRatio = 0;
    this.currentRatio = 0;
    this.smoothFactor = 0.12;

    // Two-hand distance calibration (normalized coordinates 0..1)
    this.minDistance = 0.12; // Hands close -> Assembled (0.0)
    this.maxDistance = 0.52; // Hands wide apart -> Dismantled (1.0)

    // Single-hand calibration (span between thumb and pinky)
    this.singleHandMin = 0.06; // Closed fist -> Assembled (0.0)
    this.singleHandMax = 0.32; // Open wide -> Dismantled (1.0)

    this.lastHandCount = 0;
    this.animFrameId = null;
  }

  async init() {
    try {
      if (typeof window.Hands === 'undefined') {
        await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
      }

      this.hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      this.hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.hands.onResults((results) => this.handleResults(results));
      return true;
    } catch (err) {
      console.error('Failed to initialize MediaPipe Hands:', err);
      this.onStatusChange({ status: 'error', message: 'Tracking failed to load' });
      return false;
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async start() {
    if (this.isRunning) return;
    const initialized = await this.init();
    if (!initialized) return;

    try {
      this.onStatusChange({ status: 'starting', message: 'Accessing camera...' });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });

      this.videoElement.srcObject = stream;
      await this.videoElement.play();

      if (window.Camera) {
        this.camera = new window.Camera(this.videoElement, {
          onFrame: async () => {
            if (this.isRunning && this.videoElement.readyState >= 2) {
              await this.hands.send({ image: this.videoElement });
            }
          },
          width: 640,
          height: 480
        });
        await this.camera.start();
      } else {
        const processFrame = async () => {
          if (!this.isRunning) return;
          if (this.videoElement.readyState >= 2) {
            await this.hands.send({ image: this.videoElement });
          }
          this.animFrameId = requestAnimationFrame(processFrame);
        };
        processFrame();
      }

      this.isRunning = true;
      this.onStatusChange({ status: 'active', message: 'Camera online — Show hands' });
      this.startSmoothingLoop();
    } catch (err) {
      console.error('Webcam permission error:', err);
      this.onStatusChange({ status: 'error', message: 'Camera permission denied' });
      this.stop();
    }
  }

  stop() {
    this.isRunning = false;
    if (this.camera) {
      this.camera.stop();
      this.camera = null;
    }
    if (this.videoElement && this.videoElement.srcObject) {
      const tracks = this.videoElement.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      this.videoElement.srcObject = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.ctx && this.canvasElement) {
      this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    }
    this.onStatusChange({ status: 'off', message: 'Camera disabled' });
  }

  toggle() {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
  }

  startSmoothingLoop() {
    const loop = () => {
      if (!this.isRunning) return;
      
      this.currentRatio += (this.targetRatio - this.currentRatio) * this.smoothFactor;

      this.onUpdate({
        ratio: this.currentRatio,
        targetRatio: this.targetRatio,
        handCount: this.lastHandCount
      });

      requestAnimationFrame(loop);
    };
    loop();
  }

  handleResults(results) {
    if (!this.isRunning) return;

    const landmarksList = results.multiHandLandmarks;
    this.lastHandCount = landmarksList ? landmarksList.length : 0;

    this.drawLandmarksOverlay(landmarksList);

    if (!landmarksList || landmarksList.length === 0) {
      this.onStatusChange({ status: 'active', message: 'No hands detected' });
      return;
    }

    if (landmarksList.length >= 2) {
      // TWO HANDS CONTROL: Distance between palm centers
      const hand1 = landmarksList[0];
      const hand2 = landmarksList[1];

      const p1 = { x: (hand1[0].x + hand1[9].x) / 2, y: (hand1[0].y + hand1[9].y) / 2 };
      const p2 = { x: (hand2[0].x + hand2[9].x) / 2, y: (hand2[0].y + hand2[9].y) / 2 };

      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

      let ratio = (dist - this.minDistance) / (this.maxDistance - this.minDistance);
      ratio = Math.max(0, Math.min(1, ratio));

      this.targetRatio = ratio;

      const label = ratio < 0.25 ? 'Hands Closed → Assembling' : ratio > 0.75 ? 'Hands Wide → Dismantling' : 'Two Hands Active';
      this.onStatusChange({ status: 'tracking', message: label, handCount: 2 });
    } else if (landmarksList.length === 1) {
      // SINGLE HAND CONTROL: Span from Thumb (4) to Pinky (20)
      const hand = landmarksList[0];
      const thumb = hand[4];
      const pinky = hand[20];

      const span = Math.hypot(thumb.x - pinky.x, thumb.y - pinky.y);
      let ratio = (span - this.singleHandMin) / (this.singleHandMax - this.singleHandMin);
      ratio = Math.max(0, Math.min(1, ratio));

      this.targetRatio = ratio;

      const label = ratio < 0.25 ? 'Fist Closed → Assembling' : ratio > 0.75 ? 'Palm Open → Dismantling' : 'Single Hand Active';
      this.onStatusChange({ status: 'tracking', message: label, handCount: 1 });
    }
  }

  drawLandmarksOverlay(landmarksList) {
    if (!this.canvasElement || !this.ctx) return;
    const w = this.canvasElement.width;
    const h = this.canvasElement.height;

    this.ctx.clearRect(0, 0, w, h);

    if (!landmarksList || landmarksList.length === 0) return;

    const CONNECTIONS = [
      [0,1],[1,2],[2,3],[3,4],
      [0,5],[5,6],[6,7],[7,8],
      [5,9],[9,10],[10,11],[11,12],
      [9,13],[13,14],[14,15],[15,16],
      [13,17],[17,18],[18,19],[19,20],
      [0,17]
    ];

    landmarksList.forEach((landmarks, idx) => {
      const strokeColor = idx === 0 ? '#F59B1C' : '#00F0FF';

      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = 2;
      this.ctx.globalAlpha = 0.85;

      CONNECTIONS.forEach(([i, j]) => {
        const pt1 = landmarks[i];
        const pt2 = landmarks[j];
        const x1 = (1 - pt1.x) * w;
        const y1 = pt1.y * h;
        const x2 = (1 - pt2.x) * w;
        const y2 = pt2.y * h;

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
      });

      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.globalAlpha = 1.0;
      landmarks.forEach((pt, pIdx) => {
        const x = (1 - pt.x) * w;
        const y = pt.y * h;
        const r = [4, 8, 12, 16, 20].includes(pIdx) ? 3.5 : 2;

        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, 2 * Math.PI);
        this.ctx.fill();
      });
    });

    this.ctx.globalAlpha = 1.0;
  }
}
