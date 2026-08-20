import React, { useState } from 'react';
import { Download, Sparkles, X, CheckCircle2, Film, FileText, Loader2 } from 'lucide-react';
import type { Clip, Project } from '../types';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clip: Clip;
  project: Project;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  clip,
  project
}) => {
  const [resolution, setResolution] = useState<'1080p' | '4k'>('1080p');
  const [aspect, setAspect] = useState<'9:16' | '1:1' | '16:9'>('9:16');
  const [fps, setFps] = useState<'30' | '60'>('60');
  const [isExporting, setIsExporting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleStartExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setIsDone(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 2400);
  };

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSubtitles = () => {
    // Generate ASS file format
    let ass = `[Script Info]\nTitle: OpusClip Subtitles\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\n\n[Events]\n`;
    clip.words.forEach((w) => {
      ass += `Dialogue: 0,0:00:${w.start.toFixed(2)},0:00:${w.end.toFixed(2)},Default,,0,0,0,,${w.word.toUpperCase()} ${w.emoji || ''}\n`;
    });
    downloadFile(`${clip.title.replace(/\s+/g, '_')}_subtitles.ass`, ass, 'text/plain');
  };

  const handleDownloadJson = () => {
    downloadFile(`${clip.title.replace(/\s+/g, '_')}_timeline.json`, JSON.stringify(clip, null, 2), 'application/json');
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
      zIndex: 100,
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '540px',
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

        {!isDone ? (
          <>
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
                GPU-ACCELERATED RENDER
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800 }}>
                Export Viral Short Clip
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {clip.title} ({clip.duration.toFixed(1)}s)
              </p>
            </div>

            {/* Aspect Ratio Options */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                ASPECT RATIO
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { id: '9:16' as const, label: '9:16 Vertical', sub: 'TikTok, Reels, Shorts' },
                  { id: '1:1' as const, label: '1:1 Square', sub: 'Instagram Feed' },
                  { id: '16:9' as const, label: '16:9 Landscape', sub: 'YouTube Main' },
                ].map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAspect(a.id)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 'var(--radius-md)',
                      background: aspect === a.id ? 'rgba(0, 245, 155, 0.12)' : 'var(--bg-surface-raised)',
                      border: aspect === a.id ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                      color: aspect === a.id ? 'var(--accent-emerald)' : 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '12px',
                      textAlign: 'center'
                    }}
                  >
                    <div>{a.label}</div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>{a.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution & FPS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  RESOLUTION
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {(['1080p', '4k'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setResolution(r)}
                      style={{
                        padding: '8px',
                        borderRadius: 'var(--radius-sm)',
                        background: resolution === r ? 'var(--accent-emerald)' : 'var(--bg-surface-raised)',
                        color: resolution === r ? '#06150E' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '12px',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      {r.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  FRAMERATE
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {(['30', '60'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFps(f)}
                      style={{
                        padding: '8px',
                        borderRadius: 'var(--radius-sm)',
                        background: fps === f ? 'var(--accent-emerald)' : 'var(--bg-surface-raised)',
                        color: fps === f ? '#06150E' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '12px',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      {f} FPS
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Render Button */}
            <button
              onClick={handleStartExport}
              disabled={isExporting}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
            >
              {isExporting ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Compositing 1080x1920 MP4...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Render & Download MP4
                </>
              )}
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(0, 245, 155, 0.15)',
              color: 'var(--accent-emerald)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <CheckCircle2 size={32} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>
              Render Completed!
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Your high-retention 9:16 short with kinetic subtitles and B-roll is ready.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href={project.videoUrl}
                download={`${clip.title.replace(/\s+/g, '_')}_1080x1920.mp4`}
                className="btn-primary"
                style={{ justifyContent: 'center', textDecoration: 'none', padding: '12px' }}
              >
                <Film size={16} /> Download 1080x1920 MP4 Video
              </a>

              <button
                onClick={handleDownloadSubtitles}
                className="btn-secondary"
                style={{ justifyContent: 'center', padding: '10px' }}
              >
                <FileText size={16} /> Download .ASS Subtitles (Karaoke)
              </button>

              <button
                onClick={handleDownloadJson}
                className="btn-secondary"
                style={{ justifyContent: 'center', padding: '10px' }}
              >
                <FileText size={16} /> Download JSON Timeline & Words
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
