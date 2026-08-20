import React, { useState } from 'react';
import type { WordToken } from '../../types';
import { Sparkles, Check } from 'lucide-react';

interface TranscriptEditorProps {
  words: WordToken[];
  currentTime: number;
  onSeek: (time: number) => void;
  onUpdateWord: (index: number, updatedWord: Partial<WordToken>) => void;
}

export const TranscriptEditor: React.FC<TranscriptEditorProps> = ({
  words,
  currentTime,
  onSeek,
  onUpdateWord
}) => {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState('');

  const handleStartEdit = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingIdx(idx);
    setEditVal(words[idx].word);
  };

  const handleSaveEdit = (idx: number) => {
    if (editVal.trim()) {
      onUpdateWord(idx, { word: editVal.trim() });
    }
    setEditingIdx(null);
  };

  const toggleHighlight = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateWord(idx, { highlight: !words[idx].highlight });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface-raised)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800 }}>
            Interactive AI Transcript
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Click words to seek. Double-click to edit.
          </div>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: 700 }}>
          {words.length} Words Synced
        </div>
      </div>

      {/* Word Flow Container */}
      <div style={{
        padding: '20px',
        overflowY: 'auto',
        flex: 1,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px 8px',
        alignContent: 'flex-start',
        lineHeight: 1.8
      }}>
        {words.map((w, idx) => {
          const isActive = currentTime >= w.start && currentTime <= w.end;
          const isHighlighted = w.highlight;
          const isEditing = editingIdx === idx;

          return (
            <div
              key={idx}
              onClick={() => onSeek(w.start)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '6px',
                background: isActive 
                  ? 'rgba(0, 245, 155, 0.25)' 
                  : isHighlighted 
                    ? 'rgba(255, 230, 0, 0.15)' 
                    : 'var(--bg-surface-raised)',
                border: isActive 
                  ? '1px solid var(--accent-emerald)' 
                  : isHighlighted 
                    ? '1px solid rgba(255, 230, 0, 0.4)' 
                    : '1px solid transparent',
                color: isActive 
                  ? 'var(--accent-emerald)' 
                  : isHighlighted 
                    ? 'var(--accent-gold)' 
                    : 'var(--text-primary)',
                fontWeight: isHighlighted || isActive ? 800 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
              className="transcript-word-chip"
            >
              {isEditing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="text"
                    value={editVal}
                    onChange={(e) => setEditVal(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(idx);
                      if (e.key === 'Escape') setEditingIdx(null);
                    }}
                    style={{
                      background: '#000',
                      border: '1px solid var(--accent-emerald)',
                      borderRadius: '4px',
                      color: '#fff',
                      padding: '1px 4px',
                      fontSize: '12px',
                      width: '60px'
                    }}
                  />
                  <Check size={12} color="var(--accent-emerald)" onClick={() => handleSaveEdit(idx)} />
                </div>
              ) : (
                <span onDoubleClick={(e) => handleStartEdit(idx, e)}>
                  {w.word}
                </span>
              )}

              {w.emoji && (
                <span style={{ fontSize: '13px' }}>{w.emoji}</span>
              )}

              <span
                onClick={(e) => toggleHighlight(idx, e)}
                style={{ cursor: 'pointer', opacity: 0.6, display: 'inline-flex' }}
              >
                <Sparkles 
                  size={10} 
                  color={isHighlighted ? "var(--accent-gold)" : "var(--text-muted)"} 
                />
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer Toolbar */}
      <div style={{
        padding: '12px 18px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface-raised)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: 'var(--text-muted)'
      }}>
        <span>💡 Tip: Click sparkle icon on any word to highlight with accent color</span>
      </div>
    </div>
  );
};
