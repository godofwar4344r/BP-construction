import React from 'react';
import { Sparkles, Edit3, Download, Flame, Clock } from 'lucide-react';
import type { Clip } from '../types';

interface ClipFeedProps {
  clips: Clip[];
  selectedClip: Clip;
  onSelectClip: (clip: Clip) => void;
  onOpenEditor: (clip: Clip) => void;
  onExportClip: (clip: Clip) => void;
}

export const ClipFeed: React.FC<ClipFeedProps> = ({
  clips,
  selectedClip,
  onSelectClip,
  onOpenEditor,
  onExportClip
}) => {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Top Banner Stats */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 28px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            AI Viral Clips Curation
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Found <strong style={{ color: 'var(--accent-emerald)' }}>{clips.length} viral segments</strong> optimized for TikTok, Instagram Reels, and YouTube Shorts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{
            background: 'var(--bg-surface-raised)',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>AVG VIRALITY</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-emerald)' }}>94%</div>
          </div>

          <div style={{
            background: 'var(--bg-surface-raised)',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>HOOK RETENTION</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-gold)' }}>96%</div>
          </div>
        </div>
      </div>

      {/* Grid of Viral Clips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
        {clips.map((clip, idx) => {
          const isSelected = selectedClip.id === clip.id;
          const isTopVirality = clip.virality_score >= 95;

          return (
            <div
              key={clip.id}
              className="card-glass"
              style={{
                border: isSelected ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: isSelected ? '0 0 24px var(--accent-emerald-glow)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Header with Virality Score Meter */}
              <div style={{
                padding: '18px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-surface-raised)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className={`score-badge ${isTopVirality ? 'score-high' : 'score-mid'}`}>
                    <Flame size={14} />
                    <span>VIRALITY {clip.virality_score}/100</span>
                  </div>
                  {idx === 0 && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      background: 'rgba(139, 92, 246, 0.2)',
                      color: 'var(--accent-purple)',
                      padding: '3px 8px',
                      borderRadius: '4px'
                    }}>
                      TOP PICK #1
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} />
                  <span>{clip.duration.toFixed(1)}s</span>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px', lineHeight: 1.4 }}>
                  {clip.title}
                </h3>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                  {clip.summary}
                </p>

                {/* AI Virality Reason Box */}
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(0, 245, 155, 0.05)',
                  border: '1px solid rgba(0, 245, 155, 0.15)',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                    <Sparkles size={12} />
                    WHY IT WILL GO VIRAL
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {clip.virality_reason}
                  </div>
                </div>

                {/* Score Breakdown Bars */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <span>Hook Power</span>
                      <span style={{ color: '#fff', fontWeight: 700 }}>{clip.hook_score}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'var(--bg-surface-raised)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${clip.hook_score}%`, height: '100%', background: 'var(--accent-gold)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <span>Story Flow</span>
                      <span style={{ color: '#fff', fontWeight: 700 }}>{clip.flow_score}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'var(--bg-surface-raised)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${clip.flow_score}%`, height: '100%', background: 'var(--accent-purple)' }} />
                    </div>
                  </div>
                </div>

                {/* Emojis & Keywords */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto', marginBottom: '18px', flexWrap: 'wrap' }}>
                  {clip.suggested_emojis.map((em, i) => (
                    <span key={i} style={{ fontSize: '16px' }}>{em}</span>
                  ))}
                  {clip.broll_keywords.map((kw, i) => (
                    <span key={i} style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'var(--bg-surface-raised)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      #{kw}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    onClick={() => {
                      onSelectClip(clip);
                      onOpenEditor(clip);
                    }}
                    className="btn-primary"
                    style={{ justifyContent: 'center', fontSize: '13px', padding: '10px' }}
                  >
                    <Edit3 size={15} />
                    Open Studio
                  </button>

                  <button
                    onClick={() => onExportClip(clip)}
                    className="btn-secondary"
                    style={{ justifyContent: 'center', fontSize: '13px', padding: '10px' }}
                  >
                    <Download size={15} />
                    Export MP4
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
