import React, { useState } from 'react';
import { SAMPLE_PROJECTS } from './services/sampleData';
import type { Project, Clip } from './types';
import { Dashboard } from './components/Dashboard';
import { ClipFeed } from './components/ClipFeed';
import { StudioEditor } from './components/editor/StudioEditor';
import { IngestionModal } from './components/IngestionModal';
import { PipelineVisualizer } from './components/PipelineVisualizer';
import { ExportModal } from './components/ExportModal';

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(SAMPLE_PROJECTS);
  const [currentProject, setCurrentProject] = useState<Project>(SAMPLE_PROJECTS[0]);
  const [selectedClip, setSelectedClip] = useState<Clip>(SAMPLE_PROJECTS[0].clips[0]);
  const [activeView, setActiveView] = useState<'dashboard' | 'feed' | 'editor'>('dashboard');

  // Modals
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const handleStartClipFromUrl = (_url: string) => {
    setIsIngestOpen(false);
    setIsProcessing(true);
  };

  const handleProcessingComplete = () => {
    setIsProcessing(false);
    setActiveView('feed');
  };

  const handleLoadSample = (sampleId: string) => {
    const found = projects.find((p) => p.id === sampleId);
    if (found) {
      setCurrentProject(found);
      setSelectedClip(found.clips[0]);
    }
  };

  const handleUpdateClip = (updatedClip: Clip) => {
    setSelectedClip(updatedClip);
    const updatedClips = currentProject.clips.map((c) =>
      c.id === updatedClip.id ? updatedClip : c
    );
    const updatedProj = { ...currentProject, clips: updatedClips };
    setCurrentProject(updatedProj);
    setProjects(projects.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
  };

  const handleOpenEditor = (clip: Clip) => {
    setSelectedClip(clip);
    setActiveView('editor');
  };

  const handleExportClip = (clip: Clip) => {
    setSelectedClip(clip);
    setIsExportOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#000000' }}>
      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {activeView === 'dashboard' && (
          <Dashboard
            projects={projects}
            onSelectProject={(p) => {
              setCurrentProject(p);
              setSelectedClip(p.clips[0]);
            }}
            onNewProject={() => setIsIngestOpen(true)}
            onOpenEditor={(clip) => {
              setSelectedClip(clip);
              setActiveView('editor');
            }}
            onStartClipUrl={handleStartClipFromUrl}
            onGoToFeed={() => setActiveView('feed')}
          />
        )}

        {activeView === 'feed' && (
          <div style={{ minHeight: '100vh', background: '#090B10' }}>
            {/* Top Navigation Back to Dashboard */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 28px',
              background: '#0E121A',
              borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
              <button
                onClick={() => setActiveView('dashboard')}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: '#151B26',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.12)',
                  fontSize: '12px',
                  fontWeight: 700
                }}
              >
                ← Back to Dashboard
              </button>

              <div style={{ fontSize: '14px', fontWeight: 800 }}>
                {currentProject.title}
              </div>

              <button
                onClick={() => setActiveView('editor')}
                className="btn-primary"
                style={{ fontSize: '12px', padding: '8px 16px' }}
              >
                Open Studio Editor
              </button>
            </div>

            <ClipFeed
              clips={currentProject.clips}
              selectedClip={selectedClip}
              onSelectClip={setSelectedClip}
              onOpenEditor={handleOpenEditor}
              onExportClip={handleExportClip}
            />
          </div>
        )}

        {activeView === 'editor' && (
          <StudioEditor
            project={currentProject}
            clip={selectedClip}
            onUpdateClip={handleUpdateClip}
            onBackToFeed={() => setActiveView('feed')}
            onExport={() => setIsExportOpen(true)}
          />
        )}
      </main>

      {/* Modals & Visualizers */}
      <IngestionModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onSubmit={(url) => handleStartClipFromUrl(url)}
        onLoadSample={handleLoadSample}
      />

      {isProcessing && (
        <PipelineVisualizer onComplete={handleProcessingComplete} />
      )}

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        clip={selectedClip}
        project={currentProject}
      />
    </div>
  );
};

export default App;
