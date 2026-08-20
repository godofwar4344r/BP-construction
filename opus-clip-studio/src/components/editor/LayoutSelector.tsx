import React from 'react';
import { ScanFace, Columns, Layers } from 'lucide-react';
import type { Clip } from '../../types';

interface LayoutSelectorProps {
  layout: Clip['layout'];
  onChange: (layout: Clip['layout']) => void;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  layout,
  onChange
}) => {
  const LAYOUT_OPTIONS = [
    {
      id: 'auto_track' as const,
      name: 'AI Auto Speaker Reframe',
      desc: 'Tracks active speaker with smooth 9:16 vertical camera pans',
      icon: ScanFace
    },
    {
      id: 'split_screen' as const,
      name: 'Dual Split-Screen (Podcast)',
      desc: 'Top: Host, Bottom: Guest with high-retention simultaneous focus',
      icon: Columns
    },
    {
      id: 'blur_bg' as const,
      name: 'Atmospheric Blurred Fill',
      desc: 'Centers 16:9 widescreen with rich ambient blurred background',
      icon: Layers
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)' }}>
        AI REFRAMING & MULTI-LAYOUT MODES
      </label>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {LAYOUT_OPTIONS.map((opt) => {
          const isSelected = layout === opt.id;
          const Icon = opt.icon;

          return (
            <div
              key={opt.id}
              onClick={() => onChange(opt.id)}
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? 'rgba(0, 245, 155, 0.1)' : 'var(--bg-surface-raised)',
                border: isSelected ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                transition: 'all 0.18s ease'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: isSelected ? 'var(--accent-emerald)' : 'var(--bg-surface-hover)',
                color: isSelected ? '#06150E' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon size={18} />
              </div>

              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: isSelected ? 'var(--accent-emerald)' : '#fff' }}>
                  {opt.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                  {opt.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
