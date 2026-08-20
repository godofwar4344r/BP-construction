import React, { useState } from 'react';
import type { BRollClip } from '../../types';
import { Plus, Trash2, Search, Film } from 'lucide-react';

interface BRollManagerProps {
  brolls: BRollClip[];
  currentTime: number;
  onAddBRoll: (broll: BRollClip) => void;
  onRemoveBRoll: (id: string) => void;
  onSeek: (time: number) => void;
}

export const BRollManager: React.FC<BRollManagerProps> = ({
  brolls,
  currentTime,
  onAddBRoll,
  onRemoveBRoll,
  onSeek
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateBRoll = (tag: string, mediaUrl: string) => {
    const newBRoll: BRollClip = {
      id: `broll_${Date.now()}`,
      start_time: Math.max(0, currentTime),
      end_time: Math.max(0, currentTime) + 3.5,
      duration: 3.5,
      query: tag,
      tag: tag,
      ken_burns_effect: 'zoom_in',
      media_url: mediaUrl,
      opacity: 0.95
    };
    onAddBRoll(newBRoll);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Search and Add Quick B-Roll */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px' }}>
          ADD B-ROLL AT CURRENT TIME ({currentTime.toFixed(1)}s)
        </label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '4px 12px',
            gap: '8px'
          }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search stock footage (e.g. money, rocket, city)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '12px',
                padding: '6px 0'
              }}
            />
          </div>
          <button
            onClick={() => handleCreateBRoll(searchQuery || 'business', 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-laptop-42999-large.mp4')}
            className="btn-primary"
            style={{ padding: '8px 14px', fontSize: '12px' }}
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { name: '💰 Money Flow', query: 'money', url: 'https://assets.mixkit.co/videos/preview/mixkit-counting-money-bills-41517-large.mp4' },
            { name: '🚀 Rocket Launch', query: 'rocket', url: 'https://assets.mixkit.co/videos/preview/mixkit-rocket-taking-off-towards-space-40626-large.mp4' },
            { name: '💻 Office Focus', query: 'office', url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-laptop-42999-large.mp4' },
          ].map((item) => (
            <button
              key={item.query}
              onClick={() => handleCreateBRoll(item.query, item.url)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 600
              }}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* List of Placed B-Roll Layers */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '10px' }}>
          ACTIVE B-ROLL TRACKS ({brolls.length})
        </label>
        
        {brolls.length === 0 ? (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-raised)',
            border: '1px dashed var(--border-subtle)',
            color: 'var(--text-muted)',
            fontSize: '12px'
          }}>
            No B-roll clips on this timeline. Click + Add to overlay visual stock clips.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {brolls.map((b) => {
              const isPlayingNow = currentTime >= b.start_time && currentTime <= b.end_time;
              return (
                <div
                  key={b.id}
                  onClick={() => onSeek(b.start_time)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: isPlayingNow ? 'rgba(0, 245, 155, 0.12)' : 'var(--bg-surface-raised)',
                    border: isPlayingNow ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Film size={16} color={isPlayingNow ? "var(--accent-emerald)" : "var(--text-muted)"} />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                        {b.tag.toUpperCase()}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {b.start_time.toFixed(1)}s - {b.end_time.toFixed(1)}s ({b.duration}s) • {b.ken_burns_effect}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveBRoll(b.id);
                    }}
                    style={{
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      padding: '4px'
                    }}
                    title="Remove B-Roll"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
