import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  Film, 
  Mic, 
  BrainCircuit, 
  ScanFace, 
  Captions, 
  Image as ImageIcon 
} from 'lucide-react';
import type { PipelineStage } from '../types';

interface PipelineVisualizerProps {
  onComplete: () => void;
}

interface StepInfo {
  id: PipelineStage;
  label: string;
  sublabel: string;
  icon: React.ElementType;
}

const STEPS: StepInfo[] = [
  { id: 'ingest', label: 'Video Stream Ingestion', sublabel: 'Downloading & checking frame codecs', icon: Film },
  { id: 'audio_extract', label: 'Audio Preprocessing', sublabel: 'Extracting 16kHz mono audio track', icon: Mic },
  { id: 'transcribe', label: 'WhisperX Speech-to-Text', sublabel: 'Word-level millisecond alignment & diarization', icon: Captions },
  { id: 'hook_curate', label: 'AI Virality Scoring Engine', sublabel: 'GPT-4o hook detection & narrative arcs', icon: BrainCircuit },
  { id: 'face_track', label: 'Active Speaker Tracking', sublabel: 'YOLOv8 face detection & 9:16 reframe smoothing', icon: ScanFace },
  { id: 'broll_match', label: 'Auto B-Roll & Visual Assets', sublabel: 'Pexels API keyword semantic matching', icon: ImageIcon },
  { id: 'caption_render', label: 'Kinetic Subtitles Synthesis', sublabel: 'Generating bouncy karaoke typography & emojis', icon: Sparkles }
];

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({ onComplete }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 800);
          return 100;
        }
        return prev + 2;
      });
    }, 90);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    const stepIdx = Math.min(STEPS.length - 1, Math.floor((progress / 100) * STEPS.length));
    setCurrentStepIdx(stepIdx);
  }, [progress]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 7, 10, 0.88)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #00F59B 0%, #8B5CF6 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px var(--accent-emerald-glow)',
            marginBottom: '16px'
          }}>
            <Sparkles size={28} color="#000" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>
            Generating Viral Clips...
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Our multi-modal AI engine is analyzing speech, visual hooks, and speakers.
          </p>
        </div>

        {/* Global Progress Bar */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
            <span style={{ color: 'var(--accent-emerald)' }}>Step {currentStepIdx + 1} of {STEPS.length}</span>
            <span style={{ color: 'var(--text-primary)' }}>{progress}%</span>
          </div>
          <div style={{
            height: '8px',
            background: 'var(--bg-surface-raised)',
            borderRadius: '999px',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #00F59B, #8B5CF6)',
              borderRadius: '999px',
              transition: 'width 0.15s ease-out'
            }} />
          </div>
        </div>

        {/* Step Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            const StepIcon = step.icon;

            return (
              <div 
                key={step.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isCurrent ? 'var(--bg-surface-raised)' : 'transparent',
                  border: isCurrent ? '1px solid var(--border-medium)' : '1px solid transparent',
                  opacity: isCompleted || isCurrent ? 1 : 0.45,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: isCompleted ? 'rgba(0, 245, 155, 0.15)' : isCurrent ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-surface-raised)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isCompleted ? 'var(--accent-emerald)' : isCurrent ? 'var(--accent-purple)' : 'var(--text-muted)'
                }}>
                  {isCompleted ? (
                    <CheckCircle2 size={18} />
                  ) : isCurrent ? (
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <StepIcon size={16} />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: isCurrent ? 'var(--text-primary)' : isCompleted ? 'var(--text-primary)' : 'var(--text-muted)'
                  }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {step.sublabel}
                  </div>
                </div>

                {isCompleted && (
                  <span style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                    Done
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
