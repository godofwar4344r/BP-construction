import React, { useState } from 'react';
import type { Clip, CaptionStyle, WordToken, BRollClip, Project } from '../../types';
import { VerticalPlayer } from './VerticalPlayer';
import { TranscriptEditor } from './TranscriptEditor';
import { CaptionCustomizer } from './CaptionCustomizer';
import { BRollManager } from './BRollManager';
import { LayoutSelector } from './LayoutSelector';
import { CAPTION_PRESETS } from '../../services/sampleData';
import { Captions, Film, Layout, Download, ChevronLeft, Flame } from 'lucide-react';

interface StudioEditorProps {
  project: Project;
  clip: Clip;
  onUpdateClip: (updatedClip: Clip) => void;
  onBackToFeed: () => void;
  onExport: () => void;
}

export const StudioEditor: React.FC<StudioEditorProps> = ({
  project,
  clip,
  onUpdateClip,
  onBackToFeed,
  onExport
}) => {
  const [activeTab, setActiveTab] = useState<'captions' | 'broll' | 'layout'>('captions');
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>(CAPTION_PRESETS.hormozi);
  const [currentTime, setCurrentTime] = useState(clip.start_time);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleUpdateWord = (index: number, updatedWord: Partial<WordToken>) => {
    const newWords = [...clip.words];
    newWords[index] = { ...newWords[index], ...updatedWord };
    onUpdateClip({ ...clip, words: newWords });
  };

  const handleAddBRoll = (broll: BRollClip) => {
    onUpdateClip({ ...clip, brolls: [...clip.brolls, broll] });
  };

  const handleRemoveBRoll = (id: string) => {
    onUpdateClip({ ...clip, brolls: clip.brolls.filter((b) => b.id !== id) });
  };

  const handleLayoutChange = (layout: Clip['layout']) => {
    onUpdateClip({ ...clip, layout });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px)', background: 'var(--bg-main)' }}>
      {/* Subheader Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onBackToFeed}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <ChevronLeft size={16} /> Back to Clips
          </button>

          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>
              {clip.title}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Clip Duration: {clip.duration.toFixed(1)}s • Timecode: {clip.start_time.toFixed(1)}s - {clip.end_time.toFixed(1)}s
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="score-badge score-high">
            <Flame size={14} />
            <span>VIRALITY {clip.virality_score}/100</span>
          </div>

          <button className="btn-primary" onClick={onExport} style={{ padding: '8px 16px', fontSize: '13px' }}>
            <Download size={15} />
            Export 1080x1920 MP4
          </button>
        </div>
      </div>

      {/* 3-Column Studio Workspace */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '360px 1fr 380px',
        flex: 1,
        overflow: 'hidden',
        gap: '1px',
        background: 'var(--border-subtle)'
      }}>
        {/* Left Column: Tools & Customizers */}
        <div style={{ background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-raised)'
          }}>
            {[
              { id: 'captions' as const, label: 'Captions', icon: Captions },
              { id: 'broll' as const, label: 'Auto B-Roll', icon: Film },
              { id: 'layout' as const, label: '9:16 Reframe', icon: Layout },
            ].map((t) => {
              const isActive = activeTab === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    flex: 1,
                    padding: '12px 6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: isActive ? 'var(--accent-emerald)' : 'var(--text-muted)',
                    background: isActive ? 'var(--bg-surface)' : 'transparent',
                    borderBottom: isActive ? '2px solid var(--accent-emerald)' : '2px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Icon size={15} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
            {activeTab === 'captions' && (
              <CaptionCustomizer style={captionStyle} onChange={setCaptionStyle} />
            )}
            {activeTab === 'broll' && (
              <BRollManager
                brolls={clip.brolls}
                currentTime={currentTime}
                onAddBRoll={handleAddBRoll}
                onRemoveBRoll={handleRemoveBRoll}
                onSeek={setCurrentTime}
              />
            )}
            {activeTab === 'layout' && (
              <LayoutSelector layout={clip.layout} onChange={handleLayoutChange} />
            )}
          </div>
        </div>

        {/* Center Column: 9:16 Vertical Video Studio Canvas */}
        <div style={{
          background: 'var(--bg-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          overflow: 'hidden'
        }}>
          <VerticalPlayer
            clip={clip}
            captionStyle={captionStyle}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onTimeUpdate={setCurrentTime}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            videoUrl={project.videoUrl}
          />
        </div>

        {/* Right Column: Synced Interactive Transcript */}
        <div style={{ background: 'var(--bg-surface)', padding: '16px', overflow: 'hidden' }}>
          <TranscriptEditor
            words={clip.words}
            currentTime={currentTime}
            onSeek={setCurrentTime}
            onUpdateWord={handleUpdateWord}
          />
        </div>
      </div>
    </div>
  );
};
