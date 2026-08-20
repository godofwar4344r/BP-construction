import React from 'react';
import type { CaptionStyle } from '../../types';
import { CAPTION_PRESETS } from '../../services/sampleData';

interface CaptionCustomizerProps {
  style: CaptionStyle;
  onChange: (updatedStyle: CaptionStyle) => void;
}

export const CaptionCustomizer: React.FC<CaptionCustomizerProps> = ({
  style,
  onChange
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Preset Selector */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '10px' }}>
          CAPTION STYLE PRESETS
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {Object.values(CAPTION_PRESETS).map((p) => {
            const isSelected = style.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onChange({ ...p })}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'rgba(0, 245, 155, 0.12)' : 'var(--bg-surface-raised)',
                  border: isSelected ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                  color: isSelected ? 'var(--accent-emerald)' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '12px',
                  textAlign: 'left'
                }}
              >
                <div>{p.name}</div>
                <div style={{ fontSize: '10px', color: p.highlightColor, marginTop: '2px', fontWeight: 800 }}>
                  VIRAL TEXT 🔥
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors & Typography */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '10px' }}>
          HIGHLIGHT & TEXT COLORS
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Highlight Color</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface-raised)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <input
                type="color"
                value={style.highlightColor}
                onChange={(e) => onChange({ ...style, highlightColor: e.target.value })}
                style={{ width: '24px', height: '24px', border: 'none', background: 'transparent', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>{style.highlightColor}</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Primary Text</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface-raised)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <input
                type="color"
                value={style.primaryColor}
                onChange={(e) => onChange({ ...style, primaryColor: e.target.value })}
                style={{ width: '24px', height: '24px', border: 'none', background: 'transparent', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>{style.primaryColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sliders: Size and Words per line */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
            <span>Font Size</span>
            <span style={{ color: 'var(--accent-emerald)' }}>{style.fontSize}px</span>
          </div>
          <input
            type="range"
            min="22"
            max="52"
            value={style.fontSize}
            onChange={(e) => onChange({ ...style, fontSize: Number(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
            <span>Words Per Chunk</span>
            <span style={{ color: 'var(--accent-emerald)' }}>{style.wordsPerChunk} words</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={style.wordsPerChunk}
            onChange={(e) => onChange({ ...style, wordsPerChunk: Number(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Toggles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', cursor: 'pointer' }}>
          <span>Auto-Pop Emojis</span>
          <input
            type="checkbox"
            checked={style.showEmojis}
            onChange={(e) => onChange({ ...style, showEmojis: e.target.checked })}
            style={{ width: '16px', height: '16px', accentColor: 'var(--accent-emerald)' }}
          />
        </label>

        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', cursor: 'pointer' }}>
          <span>ALL CAPS Uppercase</span>
          <input
            type="checkbox"
            checked={style.uppercase}
            onChange={(e) => onChange({ ...style, uppercase: e.target.checked })}
            style={{ width: '16px', height: '16px', accentColor: 'var(--accent-emerald)' }}
          />
        </label>
      </div>
    </div>
  );
};
