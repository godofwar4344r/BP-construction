import React, { useState } from 'react';
import { 
  Sparkles, 
  Video, 
  Flame, 
  Film, 
  Captions, 
  Layout, 
  CheckCircle2, 
  Zap, 
  Wand2
} from 'lucide-react';
import { CAPTION_PRESETS } from '../services/sampleData';

interface LandingPageProps {
  onStartClip: (url: string) => void;
  onOpenStudio: () => void;
  onLoadSample: (sampleId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartClip,
  onOpenStudio,
  onLoadSample
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [activeDemoTab, setActiveDemoTab] = useState<'after' | 'before'>('after');
  const [selectedPresetKey, setSelectedPresetKey] = useState('hormozi');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onStartClip(inputUrl);
    } else {
      onLoadSample('proj_hormozi_scale');
    }
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background Radial Glow */}
      <div className="hero-glow-bg" />

      {/* HERO SECTION (Faithfully matching opus.pro) */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '70px 24px 60px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Top Biscuit Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '999px',
          background: 'rgba(0, 245, 155, 0.1)',
          border: '1px solid rgba(0, 245, 155, 0.25)',
          color: 'var(--accent-emerald)',
          fontSize: '12px',
          fontWeight: 800,
          marginBottom: '24px',
          boxShadow: '0 0 20px rgba(0, 245, 155, 0.15)'
        }}>
          <Sparkles size={14} />
          <span>#1 AI VIDEO REPURPOSING TOOL • POWERED BY AI VIRALITY SCORE™</span>
        </div>

        {/* Main Headline */}
        <h1 style={{
          fontSize: 'clamp(36px, 5.5vw, 68px)',
          fontWeight: 900,
          lineHeight: 1.08,
          letterSpacing: '-1.8px',
          maxWidth: '960px',
          margin: '0 auto 20px',
          color: '#FFFFFF'
        }}>
          1 long video, 10 viral clips. <br />
          <span className="gradient-text-emerald">Created 10x faster.</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(16px, 2vw, 20px)',
          color: 'var(--text-secondary)',
          maxWidth: '720px',
          margin: '0 auto 36px',
          lineHeight: 1.5,
          fontWeight: 400
        }}>
          OpusClip turns long YouTube videos, podcasts, and webinars into high-converting 9:16 vertical shorts with auto-captions, B-roll overlays, and speaker tracking in 1 click.
        </p>

        {/* Central Input Box (Signature OpusClip Hero Element) */}
        <div style={{
          maxWidth: '740px',
          margin: '0 auto 28px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          padding: '10px 12px 10px 20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 35px var(--accent-emerald-glow)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Video size={24} color="#00F59B" style={{ flexShrink: 0 }} />
          <input
            type="url"
            placeholder="Drop a video link (YouTube, Zoom, Google Drive, Vimeo)..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 500,
              padding: '10px 0'
            }}
          />
          <button
            onClick={handleSubmit}
            className="btn-primary"
            style={{ padding: '14px 28px', fontSize: '15px', whiteSpace: 'nowrap', borderRadius: '14px' }}
          >
            <Wand2 size={18} />
            Get clips in 1 click
          </button>
        </div>

        {/* Sample Quick-Picks */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '50px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Try instant samples:</span>
          {[
            { id: 'proj_hormozi_scale', label: '🔥 Alex Hormozi ($0 to $10M)' },
            { id: 'proj_sam_altman', label: '🚀 Sam Altman (Future of AI)' },
            { id: 'proj_steve_jobs', label: '💡 Steve Jobs (Stay Hungry)' }
          ].map((sample) => (
            <button
              key={sample.id}
              onClick={() => {
                onLoadSample(sample.id);
                onOpenStudio();
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              {sample.label}
            </button>
          ))}
        </div>

        {/* Trust Badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, marginBottom: '70px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="var(--accent-emerald)" /> Free 90 AI Credits
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="var(--accent-emerald)" /> No Watermark on Pro
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="var(--accent-emerald)" /> 1080p 60fps NVENC Export
          </div>
        </div>

        {/* INTERACTIVE DEMO SHOWCASE (Before vs After) */}
        <div className="card-glass" style={{
          maxWidth: '1080px',
          margin: '0 auto',
          padding: '36px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.8)'
        }}>
          {/* Demo Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-emerald)', letterSpacing: '0.5px' }}>
                LIVE INTERACTIVE SHOWCASE
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>
                See How 1 Long Podcast Becomes a 99-Score Viral Short
              </h2>
            </div>

            {/* Toggle Tab */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-surface-raised)',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <button
                onClick={() => setActiveDemoTab('after')}
                style={{
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: 700,
                  background: activeDemoTab === 'after' ? 'var(--accent-emerald)' : 'transparent',
                  color: activeDemoTab === 'after' ? '#04140D' : 'var(--text-muted)'
                }}
              >
                ✨ AI Viral Short (After)
              </button>
              <button
                onClick={() => setActiveDemoTab('before')}
                style={{
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: 700,
                  background: activeDemoTab === 'before' ? 'var(--bg-surface-hover)' : 'transparent',
                  color: activeDemoTab === 'before' ? '#fff' : 'var(--text-muted)'
                }}
              >
                📹 Raw 16:9 Video (Before)
              </button>
            </div>
          </div>

          {/* Interactive Demo Player Box */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: '32px',
            alignItems: 'center',
            background: 'var(--bg-main)',
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)'
          }}>
            {/* Left: AI Virality Breakdown Cards */}
            <div style={{ textAlign: 'left' }}>
              <div className="score-badge score-high" style={{ marginBottom: '16px' }}>
                <Flame size={16} />
                <span>VIRALITY SCORE 99/100 • PREDICTED VIRAL</span>
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px', lineHeight: 1.3 }}>
                "The #1 Reason 99% of Businesses Fail (Extreme Focus)"
              </h3>

              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
                The AI identified this segment from a 42-minute podcast because it opens with a high-friction contrarian belief challenge in the first 2 seconds, delivers 1 clear actionable insight, and resolves cleanly.
              </p>

              {/* Feature Tags */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>AI HOOK RATING</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-gold)' }}>99% (Top 1%)</div>
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>AI B-ROLL MATCH</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-emerald)' }}>2 Overlays Auto-Spliced</div>
                </div>
              </div>

              <button onClick={onOpenStudio} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                <Sparkles size={18} /> Open in OpusClip Studio Editor
              </button>
            </div>

            {/* Right: 9:16 Mockup Frame */}
            <div style={{
              width: '280px',
              height: '498px',
              background: '#000',
              borderRadius: '24px',
              border: '3px solid #22293A',
              margin: '0 auto',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 20px 50px rgba(0,0,0,0.9), 0 0 30px rgba(0, 245, 155, 0.2)'
            }}>
              <video
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: activeDemoTab === 'after' ? 'cover' : 'contain'
                }}
              />

              {activeDemoTab === 'after' && (
                <>
                  {/* Hormozi Captions Overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: '90px',
                    left: '12px',
                    right: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '8px 12px',
                      background: 'rgba(0,0,0,0.6)',
                      borderRadius: '10px',
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 900,
                      fontSize: '20px',
                      color: '#FFE600',
                      textShadow: '0 4px 10px rgba(0,0,0,0.9)'
                    }}>
                      EXTREME FOCUS 🎯
                    </div>
                  </div>

                  {/* Top Virality Badge on Video */}
                  <div style={{
                    position: 'absolute',
                    top: '14px',
                    left: '14px',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    background: 'rgba(0, 245, 155, 0.9)',
                    color: '#000',
                    fontSize: '10px',
                    fontWeight: 900
                  }}>
                    🔥 SCORE 99
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5 CORE AI CAPABILITIES SECTION */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '12px' }}>
            Powered by 5 Proprietary AI Engines
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Everything you need to automate video repurposing and dominate social algorithms.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {[
            {
              icon: Flame,
              title: 'AI Virality Score™',
              desc: 'Analyzes thousands of viral videos to predict retention, hook strength, and social shareability.',
              tag: 'PATENTED ALGORITHM'
            },
            {
              icon: Captions,
              title: 'Kinetic Bouncing Subtitles',
              desc: 'Auto-generates word-by-word animated captions with Hormozi & MrBeast styles, colors, and auto-emojis.',
              tag: '99.2% ACCURACY'
            },
            {
              icon: Film,
              title: 'Auto B-Roll Engine',
              desc: 'Extracts semantic visual keywords and inserts relevant stock video overlays with smooth Ken Burns motion.',
              tag: 'PEXELS & STOCK INTEGRATION'
            },
            {
              icon: Layout,
              title: 'AI Dynamic Reframing',
              desc: 'Tracks faces and active speakers to crop 16:9 into portrait 9:16 or create split-screens for podcasts.',
              tag: 'SMOOTH CAMERA PAN'
            },
            {
              icon: Sparkles,
              title: 'AI Co-Pilot & Transcript Editor',
              desc: 'Edit video just by editing text. Trim words, add emojis, swap B-rolls, and export in 1 click.',
              tag: 'FRAME-ACCURATE SYNC'
            },
            {
              icon: Zap,
              title: 'GPU Cloud Rendering',
              desc: 'Fast NVENC hardware encoding produces ready-to-publish 1080x1920 60fps MP4 video in seconds.',
              tag: 'ULTRA FAST'
            }
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="card-glass"
                style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(0, 245, 155, 0.12)',
                  color: 'var(--accent-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px'
                }}>
                  <Icon size={22} />
                </div>

                <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent-purple)', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  {feat.tag}
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
                  {feat.title}
                </h3>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CAPTION STYLES SHOWCASE */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '12px' }}>
          Trending Viral Caption Presets
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '36px' }}>
          Choose from the caption styles used by the world's highest-earning creators.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {Object.entries(CAPTION_PRESETS).map(([key, style]) => (
            <div
              key={key}
              onClick={() => setSelectedPresetKey(key)}
              className="card-glass"
              style={{
                padding: '24px',
                cursor: 'pointer',
                border: selectedPresetKey === key ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                boxShadow: selectedPresetKey === key ? '0 0 20px var(--accent-emerald-glow)' : 'none'
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>
                {style.name}
              </div>
              <div style={{
                fontFamily: style.fontFamily,
                fontSize: '20px',
                fontWeight: 900,
                color: style.highlightColor,
                textTransform: style.uppercase ? 'uppercase' : 'none',
                padding: '16px',
                background: '#000',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)'
              }}>
                VIRAL POP 🔥
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{ maxWidth: '960px', margin: '60px auto 100px', padding: '48px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(0, 245, 155, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-medium)' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '14px' }}>
          Ready to scale your content 10x?
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '28px', maxWidth: '600px', margin: '0 auto 28px' }}>
          Join thousands of top creators and marketers repurposing video in seconds with OpusClip.
        </p>
        <button onClick={onOpenStudio} className="btn-primary" style={{ padding: '16px 36px', fontSize: '16px' }}>
          <Sparkles size={20} /> Open OpusClip Studio Now
        </button>
      </section>
    </div>
  );
};
