import React, { useState } from 'react';
import { Video, Clock, Sparkles, X, Wand2, PlayCircle } from 'lucide-react';
import { CAPTION_PRESETS } from '../services/sampleData';

interface IngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string, duration: string, preset: string) => void;
  onLoadSample: (sampleId: string) => void;
}

export const IngestionModal: React.FC<IngestionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onLoadSample
}) => {
  const [url, setUrl] = useState('');
  const [duration, setDuration] = useState('30-60s');
  const [preset, setPreset] = useState('hormozi');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onSubmit(url, duration, preset);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 7, 10, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 90,
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '620px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'var(--bg-surface-raised)',
            color: 'var(--text-muted)',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '999px',
            background: 'rgba(0, 245, 155, 0.1)',
            color: 'var(--accent-emerald)',
            fontSize: '11px',
            fontWeight: 800,
            marginBottom: '10px'
          }}>
            <Sparkles size={12} />
            ONE-CLICK REPURPOSING
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Turn Long Video into 10x Viral Shorts
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Paste any YouTube / Podcast / Webinar link or choose a sample to test the AI pipeline.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* URL Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              VIDEO URL (YOUTUBE / PODCAST / VIMEO)
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '4px 14px',
              gap: '10px'
            }}>
              <Video size={20} color="#00F59B" />
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '14px',
                  padding: '10px 0'
                }}
              />
            </div>
          </div>

          {/* Target Duration Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              TARGET CLIP DURATION
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {['<30s', '30-60s', '60-90s', 'Auto'].map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDuration(d)}
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    background: duration === d ? 'var(--accent-emerald)' : 'var(--bg-surface-raised)',
                    color: duration === d ? '#06150E' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '12px',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Clock size={13} />
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Caption Style Preset */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              CAPTION PRESET STYLE
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {Object.values(CAPTION_PRESETS).map((p) => (
                <div
                  key={p.id}
                  onClick={() => setPreset(p.id)}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    background: preset === p.id ? 'rgba(0, 245, 155, 0.08)' : 'var(--bg-surface-raised)',
                    border: preset === p.id ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 800, color: preset === p.id ? 'var(--accent-emerald)' : '#fff' }}>
                    {p.name}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: p.highlightColor,
                    textTransform: p.uppercase ? 'uppercase' : 'none'
                  }}>
                    VIRAL CAPTION PREVIEW 🔥
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
          >
            <Wand2 size={18} />
            Generate Viral Clips with AI
          </button>
        </form>

        {/* Quick Demo Previews */}
        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
            Or try instant sample masterclasses:
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                onLoadSample('proj_hormozi_scale');
                onClose();
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <PlayCircle size={14} color="var(--accent-emerald)" />
              Alex Hormozi ($0 to $10M)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
