import React, { useState } from 'react';
import type { Project, Clip } from '../types';
import { 
  Home, 
  LayoutGrid, 
  FolderClosed, 
  Calendar, 
  BarChart3, 
  Link2, 
  CreditCard, 
  ChevronDown, 
  UserPlus, 
  ArrowLeftToLine, 
  Bell, 
  Zap, 
  Upload, 
  Sparkles, 
  Music, 
  Video, 
  Crop, 
  Gem, 
  Globe2, 
  FileVideo, 
  Clapperboard,
  HardDrive
} from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onNewProject: () => void;
  onOpenEditor: (clip: Clip) => void;
  onStartClipUrl: (url: string) => void;
  onGoToFeed: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  onSelectProject,
  onNewProject,
  onOpenEditor,
  onStartClipUrl,
  onGoToFeed
}) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedTool, setSelectedTool] = useState('long_to_shorts');

  const handleGetClips = () => {
    if (youtubeUrl.trim()) {
      onStartClipUrl(youtubeUrl.trim());
    } else {
      // Use preloaded masterclass demo
      if (projects.length > 0) {
        onSelectProject(projects[0]);
        onGoToFeed();
      }
    }
  };

  const handleToolClick = (toolId: string) => {
    setSelectedTool(toolId);
    if (projects.length > 0) {
      onSelectProject(projects[0]);
      if (toolId === 'ai_captions' || toolId === 'ai_reframe') {
        onOpenEditor(projects[0].clips[0]);
      } else {
        onGoToFeed();
      }
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#070709',
      color: '#FFFFFF',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 1. LEFT SIDEBAR */}
      <aside style={{
        width: '240px',
        background: '#070709',
        borderRight: '1px solid #16161C',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 14px',
        zIndex: 20,
        flexShrink: 0
      }}>
        {/* Workspace Selector Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          background: '#0E0E12',
          border: '1px solid #1A1A22',
          borderRadius: '10px',
          marginBottom: '12px',
          cursor: 'pointer'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              background: '#1A1812',
              color: '#FFB800',
              fontSize: '10px',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              letterSpacing: '-0.5px',
              flexShrink: 0
            }}>
              WA
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                teamwaah...
              </span>
              <span style={{ fontSize: '10px', color: '#6A6A78', display: 'flex', alignItems: 'center', gap: '3px' }}>
                👥 0
              </span>
            </div>
          </div>
          <ChevronDown size={14} color="#7E7E8C" />
        </div>

        {/* Invite Members Button */}
        <button style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '8px',
          borderRadius: '8px',
          background: '#0E0E12',
          border: '1px solid #1A1A22',
          color: '#8E8E9C',
          fontSize: '12px',
          fontWeight: 600,
          marginBottom: '24px'
        }}>
          <UserPlus size={14} />
          <span>Invite members</span>
        </button>

        {/* Navigation Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          {/* Create Group */}
          <div>
            <div style={{ fontSize: '11px', color: '#5A5A68', fontWeight: 700, padding: '0 8px 8px', letterSpacing: '0.3px' }}>
              Create
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: '#14141A',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700
                }}
              >
                <Home size={16} color="#FFFFFF" />
                <span>Home</span>
              </button>

              <button
                onClick={onGoToFeed}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'transparent',
                  color: '#9E9EA8',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <LayoutGrid size={16} />
                  <span>Brand template</span>
                </div>
                <span className="badge-pill badge-pro">Pro</span>
              </button>

              <button
                onClick={onGoToFeed}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'transparent',
                  color: '#9E9EA8',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                <FolderClosed size={16} />
                <span>Asset library</span>
              </button>
            </div>
          </div>

          {/* Post Group */}
          <div>
            <div style={{ fontSize: '11px', color: '#5A5A68', fontWeight: 700, padding: '0 8px 8px', letterSpacing: '0.3px' }}>
              Post
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'transparent',
                  color: '#9E9EA8',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={16} />
                  <span>Calendar</span>
                </div>
                <span className="badge-pill badge-new">New</span>
              </button>

              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'transparent',
                  color: '#9E9EA8',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BarChart3 size={16} />
                  <span>Analytics</span>
                </div>
                <span className="badge-pill badge-new">New</span>
              </button>

              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'transparent',
                  color: '#9E9EA8',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                <Link2 size={16} />
                <span>Social accounts</span>
              </button>
            </div>
          </div>
        </div>

        {/* Subscription at Bottom of Sidebar */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid #16161C' }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '9px 12px',
            borderRadius: '8px',
            background: 'transparent',
            color: '#9E9EA8',
            fontSize: '13px',
            fontWeight: 600,
            width: '100%'
          }}>
            <CreditCard size={16} />
            <span>Subscription</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN DASHBOARD STAGE */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        minHeight: '100vh',
        background: '#070709'
      }}>
        {/* Massive Background Watermark Text "OpusClip" */}
        <div className="watermark-opus">
          OpusClip
        </div>

        {/* TOP BAR */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 28px',
          zIndex: 10
        }}>
          {/* Top-Left Logo / Collapse Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#FFFFFF',
              color: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '16px'
            }}>
              P
            </div>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '6px',
              background: '#16161E',
              color: '#fff',
              border: '1px solid #22222C'
            }}>
              Free
            </span>
            <button style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#101016',
              border: '1px solid #1E1E28',
              color: '#8A8A98',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ArrowLeftToLine size={14} />
            </button>
          </div>

          {/* Top-Center Notice Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '6px 16px 6px 20px',
            borderRadius: '999px',
            background: '#101016',
            border: '1px solid #1E1E28',
            fontSize: '12px',
            color: '#B0B0BC'
          }}>
            <span>You are using the Free Plan of OpusClip with watermark and limited features.</span>
            <button style={{
              padding: '4px 12px',
              borderRadius: '999px',
              background: '#1E1E28',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 700,
              border: '1px solid #30303E'
            }}>
              Upgrade
            </button>
          </div>

          {/* Top-Right Credits & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{
              background: 'transparent',
              color: '#9E9EA8',
              padding: '6px'
            }}>
              <Bell size={18} />
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 800,
              color: '#FFB800'
            }}>
              <Zap size={15} fill="#FFB800" />
              <span>59</span>
            </div>

            <button style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#121218',
              border: '1px solid #242430',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 700
            }}>
              Add more credits
            </button>
          </div>
        </header>

        {/* 3. CENTER HERO & INPUT CARD (Exact Match to SS) */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px 60px',
          zIndex: 10,
          marginTop: '-20px'
        }}>
          {/* OpusClip Title */}
          <h1 style={{
            fontSize: '36px',
            fontWeight: 800,
            letterSpacing: '-0.8px',
            marginBottom: '24px',
            color: '#FFFFFF'
          }}>
            OpusClip
          </h1>

          {/* Main Card Container */}
          <div style={{
            width: '100%',
            maxWidth: '540px',
            background: '#0D0D11',
            border: '1px solid #1E1E26',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)'
          }}>
            {/* YouTube Link Input Field */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#15151C',
              border: '1px solid #22222E',
              borderRadius: '12px',
              padding: '12px 16px',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <Link2 size={18} color="#666676" />
              <input
                type="text"
                placeholder="Drop a YouTube link"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGetClips();
                }}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              />
            </div>

            {/* Quick Upload / Google Drive Action Links */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              padding: '0 4px 20px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#8A8A98'
            }}>
              <button
                onClick={onNewProject}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'transparent',
                  color: '#9E9EA8'
                }}
              >
                <Upload size={15} />
                <span>Upload</span>
              </button>

              <button
                onClick={handleGetClips}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'transparent',
                  color: '#9E9EA8'
                }}
              >
                <HardDrive size={15} />
                <span>Google Drive</span>
              </button>
            </div>

            {/* Big White Primary CTA Button */}
            <button
              onClick={handleGetClips}
              className="btn-white-cta"
            >
              Get clips in 1 click
            </button>
          </div>

          {/* 4. BOTTOM CIRCULAR TOOLS DOCK (Exact Match to SS) */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: '28px',
            marginTop: '60px',
            flexWrap: 'wrap'
          }}>
            {[
              { id: 'long_to_shorts', name: 'Long to shorts', icon: Sparkles, iconColor: '#FFB800', badge: null },
              { id: 'ai_captions', name: 'AI Captions', icon: 'CC', iconColor: '#00F59B', badge: null },
              { id: 'auto_sfx', name: 'Auto SFX', icon: Music, iconColor: '#2E82FF', badge: 'New' },
              { id: 'ai_producer', name: 'AI Producer', icon: Clapperboard, iconColor: '#2E82FF', badge: 'Beta' },
              { id: 'viral_presets', name: 'Viral Presets', icon: Video, iconColor: '#9333EA', badge: 'Beta' },
              { id: 'ai_reframe', name: 'AI Reframe', icon: Crop, iconColor: '#06B6D4', badge: null },
              { id: 'upscale', name: 'Upscale', icon: Gem, iconColor: '#2E82FF', badge: 'New' },
              { id: 'video_dubbing', name: 'Video dubbing', icon: Globe2, iconColor: '#06B6D4', badge: 'New' },
            ].map((tool) => {
              const isSelected = selectedTool === tool.id;
              const IconComp = tool.icon;

              return (
                <div
                  key={tool.id}
                  onClick={() => handleToolClick(tool.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  {/* Badge */}
                  {tool.badge && (
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '2px',
                      zIndex: 5
                    }}>
                      <span className={`badge-pill ${tool.badge === 'New' ? 'badge-new' : 'badge-beta'}`}>
                        {tool.badge}
                      </span>
                    </div>
                  )}

                  {/* Circular Button */}
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#121218',
                    border: isSelected ? '1px solid #3E3E4E' : '1px solid #1E1E26',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.18s ease',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
                  }}>
                    {typeof IconComp === 'string' ? (
                      <span style={{ fontWeight: 900, fontSize: '13px', color: tool.iconColor, letterSpacing: '-0.5px' }}>
                        {IconComp}
                      </span>
                    ) : (
                      <IconComp size={22} color={tool.iconColor} />
                    )}
                  </div>

                  {/* Label */}
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#9E9EA8' }}>
                    {tool.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Lower Center File Indicator */}
          <div style={{ marginTop: '24px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span className="badge-pill badge-new" style={{ position: 'absolute', top: '-10px', zIndex: 5 }}>
              New
            </span>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#121218',
              border: '1px solid #1E1E26',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileVideo size={18} color="#60A5FA" />
            </div>
          </div>
        </div>

        {/* Bottom-Right "Questions?" Button */}
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 30
        }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '999px',
            background: '#101016',
            border: '1px solid #22222E',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 700,
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
          }}>
            <span>Questions?</span>
          </button>
        </div>
      </main>
    </div>
  );
};
