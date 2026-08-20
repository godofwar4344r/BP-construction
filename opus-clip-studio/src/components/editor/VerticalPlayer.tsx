import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import type { Clip, CaptionStyle, WordToken, BRollClip } from '../../types';

interface VerticalPlayerProps {
  clip: Clip;
  captionStyle: CaptionStyle;
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onPlayPause: () => void;
  videoUrl: string;
}

export const VerticalPlayer: React.FC<VerticalPlayerProps> = ({
  clip,
  captionStyle,
  currentTime,
  isPlaying,
  onTimeUpdate,
  onPlayPause,
  videoUrl
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const brollVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Synchronize external currentTime changes to video element
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.3) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  // Synchronize play/pause
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Find active B-roll if within current timestamp
  const activeBRoll: BRollClip | undefined = clip.brolls.find(
    (b) => currentTime >= b.start_time && currentTime <= b.end_time
  );

  // Group words into short chunks according to style
  const wordsPerChunk = captionStyle.wordsPerChunk || 3;
  const wordChunks: WordToken[][] = [];
  for (let i = 0; i < clip.words.length; i += wordsPerChunk) {
    wordChunks.push(clip.words.slice(i, i + wordsPerChunk));
  }

  // Find active chunk
  const activeChunk = wordChunks.find((chunk) => {
    if (!chunk.length) return false;
    const start = chunk[0].start;
    const end = chunk[chunk.length - 1].end + 0.15;
    return currentTime >= start && currentTime <= end;
  });

  const progressPercent = Math.min(
    100,
    Math.max(0, ((currentTime - clip.start_time) / clip.duration) * 100)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      {/* 9:16 Phone/Shorts Frame */}
      <div style={{
        width: '320px',
        height: '568px',
        background: '#000',
        borderRadius: '24px',
        border: '3px solid #22293A',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 245, 155, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}>
        {/* Background Blurred Fill for Wide aspect handling */}
        <video
          src={videoUrl}
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(20px) brightness(0.3)',
            transform: 'scale(1.2)'
          }}
        />

        {/* Main Video Stream (Simulating 9:16 Dynamic Speaker Crop or Split Layout) */}
        {clip.layout === 'split_screen' ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflow: 'hidden', borderBottom: '2px solid #00F59B' }}>
              <video
                ref={videoRef}
                src={videoUrl}
                playsInline
                muted={isMuted}
                onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left center' }}
              />
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <video
                src={videoUrl}
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right center' }}
              />
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={videoUrl}
            playsInline
            muted={isMuted}
            onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center center'
            }}
          />
        )}

        {/* B-Roll Video Overlay Layer with Ken Burns Motion Effect */}
        {activeBRoll && (
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            overflow: 'hidden',
            transition: 'opacity 0.3s ease'
          }}>
            <video
              ref={brollVideoRef}
              src={activeBRoll.media_url}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: activeBRoll.ken_burns_effect === 'zoom_in' ? 'scale(1.15)' : 'scale(1.0)',
                transition: 'transform 3.5s ease-out',
                opacity: activeBRoll.opacity || 0.95
              }}
            />
            {/* B-Roll indicator badge */}
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              padding: '3px 8px',
              borderRadius: '4px',
              background: 'rgba(0, 0, 0, 0.7)',
              color: '#00F59B',
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.5px'
            }}>
              B-ROLL: {activeBRoll.tag.toUpperCase()}
            </div>
          </div>
        )}

        {/* Kinetic Subtitle Layer (Hormozi / MrBeast Style) */}
        <div style={{
          position: 'absolute',
          bottom: '120px',
          left: '16px',
          right: '16px',
          zIndex: 20,
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          {activeChunk && (
            <div style={{
              display: 'inline-flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '8px 10px',
              padding: '8px 14px',
              borderRadius: '12px',
              background: 'rgba(0, 0, 0, 0.35)',
              backdropFilter: 'blur(6px)'
            }}>
              {activeChunk.map((w, idx) => {
                const isWordActive = currentTime >= w.start && currentTime <= w.end;
                const isHighlightWord = w.highlight || isWordActive;

                let textColor = isWordActive 
                  ? captionStyle.highlightColor 
                  : isHighlightWord 
                    ? captionStyle.highlightColor 
                    : captionStyle.primaryColor;

                const textTransform = captionStyle.uppercase ? 'uppercase' : 'none';

                return (
                  <span
                    key={idx}
                    className={isWordActive ? 'kinetic-word-active' : ''}
                    style={{
                      fontFamily: captionStyle.fontFamily,
                      fontSize: `${captionStyle.fontSize}px`,
                      fontWeight: 900,
                      color: textColor,
                      textTransform: textTransform as any,
                      textShadow: `
                        -${captionStyle.outlineWidth}px -${captionStyle.outlineWidth}px 0 ${captionStyle.outlineColor},
                        ${captionStyle.outlineWidth}px -${captionStyle.outlineWidth}px 0 ${captionStyle.outlineColor},
                        -${captionStyle.outlineWidth}px ${captionStyle.outlineWidth}px 0 ${captionStyle.outlineColor},
                        ${captionStyle.outlineWidth}px ${captionStyle.outlineWidth}px 0 ${captionStyle.outlineColor},
                        0 4px 12px rgba(0, 0, 0, 0.9)
                      `,
                      letterSpacing: '-0.5px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {w.word}
                    {captionStyle.showEmojis && w.emoji && (
                      <span style={{ fontSize: `${captionStyle.fontSize * 1.1}px` }}>
                        {w.emoji}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Floating Shorts Overlay UI */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 25,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <button
            onClick={() => setIsMuted(!isMuted)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {/* Progress Line on Video */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'rgba(255, 255, 255, 0.2)',
          zIndex: 30
        }}>
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: 'var(--accent-emerald)',
            boxShadow: '0 0 8px var(--accent-emerald)'
          }} />
        </div>
      </div>

      {/* Media Playback Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'var(--bg-surface)',
        padding: '8px 16px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)'
      }}>
        <button
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.currentTime = clip.start_time;
              onTimeUpdate(clip.start_time);
            }
          }}
          className="btn-icon"
          title="Restart Clip"
        >
          <RotateCcw size={16} />
        </button>

        <button
          onClick={onPlayPause}
          className="btn-primary"
          style={{ width: '42px', height: '42px', borderRadius: '50%', padding: 0, justifyContent: 'center' }}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
        </button>

        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', minWidth: '85px', textAlign: 'center' }}>
          {(currentTime - clip.start_time).toFixed(1)}s / {clip.duration.toFixed(1)}s
        </div>
      </div>
    </div>
  );
};
