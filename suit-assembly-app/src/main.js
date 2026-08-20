/**
 * AEX-01 MK-VII Suit Assembly & Disassembly Main Controller
 * Orchestrates FrameRenderer, Smooth Scroll, AI Camera Tracking, and Telemetry HUD
 */

import { FrameRenderer } from './lib/frame-renderer.js';
import { HandTracker } from './lib/hand-tracker.js';

const TOTAL_FRAMES = 240;

const $ = (s) => document.querySelector(s);

// DOM Elements
const canvas = $('#stageCanvas');
const loader = $('#loader');
const loaderBar = $('#loaderBar');
const loaderPct = $('#loaderPct');

// Telemetry DOM Elements
const hudFrameIdx = $('#hudFrameIdx');
const hudFrameBar = $('#hudFrameBar');
const hudStateLabel = $('#hudStateLabel');
const hudSubState = $('#hudSubState');
const hudTrackFill = $('#hudTrackFill');
const systemModeLabel = $('#systemModeLabel');

// Camera Widget DOM Elements
const widget = $('#camWidget');
const cameraFeed = $('#cameraFeed');
const cameraOverlay = $('#cameraOverlay');
const cameraToggleBtn = $('#cameraToggleBtn');
const camMsg = $('#camMsg');
const camBtnLabel = $('#camBtnLabel');

// Animation State
let frameRenderer = null;
let handTracker = null;

let scrollRatio = 0;
let cameraRatio = 0;
let isHandActive = false;
let currentEffectiveRatio = 0;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Phase state descriptions based on frame progress
function getStateDescription(ratio) {
  const pct = Math.round((1 - ratio) * 100);
  let title = `${pct}% ASSEMBLED`;
  let sub = `FRAME ${String(Math.round(ratio * 239) + 1).padStart(3, '0')} — `;

  if (ratio < 0.15) {
    sub += 'SUIT LOCK / COMBAT READY';
  } else if (ratio < 0.40) {
    sub += 'CHEST & RAINSCREEN FAÇADE DISMANTLING';
  } else if (ratio < 0.65) {
    sub += 'EXPLODED COMPONENT SKELETON';
  } else if (ratio < 0.88) {
    sub += 'POST-TENSIONED STRUCTURAL DISASSEMBLY';
  } else {
    sub += 'SUBSTRUCTURE / BASE RIFT FOUNDATION';
  }

  return { title, sub, pct };
}

// Calculate scroll ratio from page scroll
function updateScrollRatio() {
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollHeight > 0) {
    scrollRatio = Math.max(0, Math.min(1, window.scrollY / scrollHeight));
  } else {
    scrollRatio = 0;
  }
}

// Main Render & Telemetry Loop
function renderLoop() {
  updateScrollRatio();

  // Determine target ratio: camera gesture overrides scroll when active with detected hands
  let targetRatio = scrollRatio;

  if (handTracker && handTracker.isRunning && isHandActive) {
    targetRatio = cameraRatio;
    systemModeLabel.textContent = 'MODE: CAMERA HAND GESTURE';
  } else if (handTracker && handTracker.isRunning) {
    systemModeLabel.textContent = 'MODE: CAMERA ACTIVE (SEARCHING HANDS)';
  } else {
    systemModeLabel.textContent = 'MODE: SCROLL CONTROL';
  }

  // Smooth lerp for effective ratio
  currentEffectiveRatio = lerp(currentEffectiveRatio, targetRatio, 0.14);

  // Set frame in Canvas renderer
  const frameIdx = Math.round(currentEffectiveRatio * (TOTAL_FRAMES - 1));
  if (frameRenderer) {
    frameRenderer.setFrame(frameIdx);
  }

  // Update HUD Telemetry
  const formattedFrame = String(frameIdx + 1).padStart(3, '0');
  hudFrameIdx.textContent = `${formattedFrame} / ${TOTAL_FRAMES}`;
  hudFrameBar.style.width = `${((frameIdx + 1) / TOTAL_FRAMES * 100).toFixed(1)}%`;
  hudTrackFill.style.width = `${(currentEffectiveRatio * 100).toFixed(1)}%`;

  const stateInfo = getStateDescription(currentEffectiveRatio);
  hudStateLabel.textContent = stateInfo.title;
  hudSubState.textContent = stateInfo.sub;

  requestAnimationFrame(renderLoop);
}

// Initialize Camera Hand Tracking
function initCameraTracking() {
  if (!widget || !cameraFeed || !cameraOverlay || !cameraToggleBtn) return;

  handTracker = new HandTracker({
    videoElement: cameraFeed,
    canvasElement: cameraOverlay,
    onUpdate: ({ ratio, handCount }) => {
      if (handCount > 0) {
        cameraRatio = ratio;
        isHandActive = true;
        widget.classList.add('is-tracking');
      } else {
        isHandActive = false;
        widget.classList.remove('is-tracking');
      }
    },
    onStatusChange: ({ status, message }) => {
      if (status === 'active' || status === 'tracking') {
        widget.classList.add('is-active');
        camBtnLabel.textContent = 'Stop';
      } else {
        widget.classList.remove('is-active', 'is-tracking');
        camBtnLabel.textContent = 'Track';
      }
      if (camMsg && message) {
        camMsg.textContent = message;
      }
    }
  });

  cameraToggleBtn.addEventListener('click', () => {
    handTracker.toggle();
  });

  // Spacebar keyboard shortcut listener
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target === document.body) {
      e.preventDefault();
      handTracker.toggle();
    }
  });
}

// Boot up Application
async function boot() {
  window.scrollTo(0, 0);

  frameRenderer = new FrameRenderer(canvas, {
    totalFrames: TOTAL_FRAMES,
    framePath: (n) => `/frames/frame_${String(n).padStart(3, '0')}.jpg`,
    onProgress: (p) => {
      const pct = Math.round(p * 100);
      loaderBar.style.width = `${pct}%`;
      loaderPct.textContent = `${pct}%`;
    }
  });

  // Load skeleton frames for instant preview
  await frameRenderer.loadInitialSkeleton(5);

  // Hide loader curtain
  loader.classList.add('done');
  setTimeout(() => loader.remove(), 800);

  initCameraTracking();
  renderLoop();
}

boot();
