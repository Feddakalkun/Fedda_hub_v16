import { useEffect, useState } from 'react';
import { Sparkles, Video } from 'lucide-react';
import { RichHome } from './components/layout/RichHome';
import { ImageSectionCards } from './components/layout/ImageSectionCards';
import { VideoSectionCards } from './components/layout/VideoSectionCards';
import { TopSystemStrip } from './components/ui/TopSystemStrip';
import { ToastProvider } from './components/ui/Toast';
import { ComfyExecutionProvider } from './contexts/ComfyExecutionContext';
import { ImageStudioPage } from './pages/ImageStudioPage';
import { VideoStudioPage } from './pages/VideoStudioPage';
import { GalleryPage } from './pages/GalleryPage';
import { LibraryPage } from './pages/LibraryPage';
import { OllamaModelsPage } from './pages/OllamaModelsPage';
import { ACTIVE_TAB_STORAGE_KEY, APP_VERSION_LABEL, DEFAULT_TAB, PAGE_META, VALID_TABS } from './modules/registry';

type ViewMode = 'home' | 'image-section' | 'video-section' | 'workspace';

function readActiveTab(): string {
  try {
    const raw = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    if (raw && VALID_TABS.has(raw)) return raw;
  } catch {}
  return DEFAULT_TAB;
}

function FeddaApp() {
  const [view, setView] = useState<ViewMode>('home');
  const [activeTab, setActiveTab] = useState(readActiveTab);

  useEffect(() => {
    try { localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTab); } catch {}
  }, [activeTab]);

  const openTab = (tab: string) => {
    if (!VALID_TABS.has(tab)) return;
    setActiveTab(tab);
    setView('workspace');
  };

  const openHomeCard = (id: string) => {
    if (id === 'image') return setView('image-section');
    if (id === 'video') return setView('video-section');
    openTab(id);
  };

  const goHome = () => setView('home');
  const meta = PAGE_META[activeTab] ?? PAGE_META[DEFAULT_TAB];
  const Icon = view === 'image-section' ? Sparkles : view === 'video-section' ? Video : meta.Icon;
  const title = view === 'home' ? APP_VERSION_LABEL : view === 'image-section' ? 'Image Studio' : view === 'video-section' ? 'Video Studio' : meta.label;

  const renderWorkspace = () => {
    if (activeTab === 'gallery') return <GalleryPage />;
    if (activeTab === 'library') return <LibraryPage />;
    if (activeTab === 'ollama') return <OllamaModelsPage />;
    if (activeTab === 'image' || activeTab.startsWith('z-image') || activeTab.startsWith('flux') || activeTab.startsWith('qwen')) {
      return <ImageStudioPage activeTab={activeTab} />;
    }
    return <VideoStudioPage activeTab={activeTab} />;
  };

  return (
    <div className="flex h-screen theme-bg-app text-white overflow-hidden font-sans selection:bg-white/20">
      <main className="flex-1 flex flex-col overflow-hidden theme-bg-main">
        <header className="h-14 border-b border-white/5 flex items-center px-6 shrink-0 z-10 justify-between backdrop-blur-sm bg-black/20">
          <div className="flex items-center gap-3">
            {view !== 'home' && (
              <button onClick={goHome} className="v15-home-btn" title="Back to Home">Home</button>
            )}
            <Icon className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-white tracking-tight">{title}</h2>
          </div>
          <TopSystemStrip />
        </header>

        <div className="flex-1 min-h-0 overflow-hidden">
          {view === 'home' ? (
            <RichHome onSelect={openHomeCard} />
          ) : view === 'image-section' ? (
            <ImageSectionCards onSelect={openTab} onBack={goHome} />
          ) : view === 'video-section' ? (
            <VideoSectionCards onSelect={openTab} onBack={goHome} />
          ) : (
            renderWorkspace()
          )}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ComfyExecutionProvider>
      <ToastProvider>
        <FeddaApp />
      </ToastProvider>
    </ComfyExecutionProvider>
  );
}
