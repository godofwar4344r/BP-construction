import React from 'react';
import { Sparkles, Video, Download, Plus, Zap, Layers, Home, LayoutDashboard } from 'lucide-react';
import type { Project } from '../types';

interface HeaderProps {
  currentProject: Project;
  onNewProject: () => void;
  onExport: () => void;
  activeView: 'landing' | 'dashboard' | 'feed' | 'editor';
  setActiveView: (view: 'landing' | 'dashboard' | 'feed' | 'editor') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  onNewProject,
  onExport,
  activeView,
  setActiveView
}) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer'
        }} onClick={() => setActiveView('landing')}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00F59B 0%, #8B5CF6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px var(--accent-emerald-glow)'
          }}>
            <Sparkles size={20} color="#000" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '18px', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              OPUS<span style={{ color: 'var(--accent-emerald)' }}>CLIP</span>
              <span style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(139, 92, 246, 0.2)',
                color: 'var(--accent-purple)',
                fontWeight: 800
              }}>PRO</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>1 Video ➔ 10 Viral Shorts</div>
          </div>
        </div>

        {/* Project Breadcrumb (if not on landing) */}
        {activeView !== 'landing' && (
          <div style={{
            padding: '5px 12px',
            background: 'var(--bg-surface-raised)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            maxWidth: '280px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            <Video size={13} color="var(--accent-emerald)" />
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{currentProject.title}</span>
          </div>
        )}
      </div>

      {/* Main Mode Navigation (Landing, Dashboard, Feed, Editor) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-surface-raised)',
        padding: '3px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        gap: '2px'
      }}>
        {[
          { id: 'landing' as const, label: 'opus.pro', icon: Home },
          { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
          { id: 'feed' as const, label: `Clips (${currentProject.clips.length})`, icon: Layers },
          { id: 'editor' as const, label: 'Studio Editor', icon: Sparkles },
        ].map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 700,
                background: isActive 
                  ? item.id === 'editor' ? 'var(--accent-emerald)' : 'var(--bg-surface-hover)' 
                  : 'transparent',
                color: isActive 
                  ? item.id === 'editor' ? '#04140D' : '#fff' 
                  : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={14} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Credits Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 12px',
          background: 'rgba(255, 230, 0, 0.1)',
          border: '1px solid rgba(255, 230, 0, 0.25)',
          borderRadius: '999px',
          color: 'var(--accent-gold)',
          fontSize: '12px',
          fontWeight: 700
        }}>
          <Zap size={13} fill="currentColor" />
          <span>180 AI Mins</span>
        </div>

        <button className="btn-secondary" onClick={onNewProject} style={{ padding: '8px 14px', fontSize: '12px' }}>
          <Plus size={15} />
          New Video
        </button>

        <button className="btn-primary" onClick={onExport} style={{ padding: '8px 16px', fontSize: '12px' }}>
          <Download size={15} />
          Export Short
        </button>
      </div>
    </header>
  );
};
