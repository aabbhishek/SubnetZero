import React, { useState, useEffect } from 'react';
import { Header, Sidebar, Background, IntroTour, LoadingScreen } from './components/layout';
import SubnetCalculator from './components/modules/SubnetCalculator';
import VPCPlanner from './components/modules/VPCPlanner';
import DHCPBuilder from './components/modules/DHCPBuilder';

// Import styles
import './styles/variables.css';
import './styles/glassmorphism.css';
import './styles/animations.css';
import './App.css';

function App() {
  const [activeModule, setActiveModule] = useState('subnet-calculator');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(false);

  // Check if user has seen the intro before
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('subnetZero_introCompleted');
    if (!hasSeenIntro) {
      setShowIntro(true);
    }
  }, []);

  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const handleIntroSkip = () => {
    setShowIntro(false);
  };
  
  const renderModule = () => {
    switch (activeModule) {
      case 'subnet-calculator':
        return <SubnetCalculator />;
      case 'vpc-planner':
        return <VPCPlanner />;
      case 'dhcp-builder':
        return <DHCPBuilder />;
      default:
        return <SubnetCalculator />;
    }
  };

  // Show loading screen first
  if (isLoading) {
    return <LoadingScreen onLoadComplete={handleLoadComplete} minDisplayTime={2500} />;
  }
  
  return (
    <div className="app">
      {/* Intro Tour - shows for first-time users */}
      {showIntro && (
        <IntroTour 
          onComplete={handleIntroComplete}
          onSkip={handleIntroSkip}
        />
      )}

      {/* Animated Background */}
      <Background />
      
      {/* Header */}
      <Header 
        onMenuClick={() => setSidebarOpen(true)}
        showMenuButton={true}
      />
      
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeModule={activeModule}
        onModuleChange={(module) => {
          setActiveModule(module);
          setSidebarOpen(false);
        }}
      />
      
      {/* Main Content */}
      <main className="main-content">
        <div className="content-container">
          {renderModule()}
        </div>
      </main>
    </div>
  );
}

export default App;

