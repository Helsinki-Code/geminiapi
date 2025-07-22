import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import { NAV_ITEMS } from './constants';
import { ViewType } from './types';
import HomeView from './views/HomeView';
import TextGenerationView from './views/TextGenerationView';
import ImageGenerationView from './views/ImageGenerationView';
import GroundedSearchView from './views/GroundedSearchView';
import JsonOutputView from './views/JsonOutputView';
import ChatView from './views/ChatView';
import VideoGenerationView from './views/VideoGenerationView';
import SpeechGenerationView from './views/SpeechGenerationView';
import MusicGenerationView from './views/MusicGenerationView';
import UrlRetrieverView from './views/UrlRetrieverView';
import YoutubeAnalysisView from './views/YoutubeAnalysisView';
import ApiKeysView from './views/ApiKeysView';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('home');

  const renderView = () => {
    switch (activeView) {
      case 'text':
        return <TextGenerationView />;
      case 'image':
        return <ImageGenerationView />;
      case 'video':
        return <VideoGenerationView />;
      case 'speech':
        return <SpeechGenerationView />;
      case 'music':
        return <MusicGenerationView />;
      case 'chat':
        return <ChatView />;
      case 'search':
        return <GroundedSearchView />;
      case 'json':
        return <JsonOutputView />;
      case 'url':
        return <UrlRetrieverView />;
      case 'youtube':
        return <YoutubeAnalysisView />;
      case 'api_keys':
        return <ApiKeysView />;
      case 'home':
      default:
        return <HomeView setActiveView={setActiveView} />;
    }
  };

  const currentViewInfo = NAV_ITEMS.find(item => item.id === activeView);

  return (
    <div className="flex h-screen bg-base-100 font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-base-200/50 backdrop-blur-sm border-b border-base-300 p-4 shadow-sm">
          <h1 className="text-xl font-bold text-white flex items-center gap-3">
             {currentViewInfo?.icon} {currentViewInfo?.title}
          </h1>
          <p className="text-sm text-content-200 mt-1">{currentViewInfo?.description}</p>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
