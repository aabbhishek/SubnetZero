import React, { useState } from 'react';
import { Header, Sidebar, Background } from './components/layout';
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
  
  return (
    <div className="app">
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

