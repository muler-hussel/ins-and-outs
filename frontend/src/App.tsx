import './App.css'
import AppSidebar from './components/AppSidebar'
import ResultDisplay from './components/ResultDisplay'
import ControlPanel from './components/ControlPanel';
import { useState } from 'react';
import { ControlPanelProvider } from './provider/ControlPanelProvider';
export default function App() {
  const [showControlPanel, setShowControlPanel] = useState(false);

  const toggleControlPanel = () => {
    setShowControlPanel(true);
  };

  const exitControlPanel = () => {
    setShowControlPanel(false);
  };

  return (
    <ControlPanelProvider>
      <main className='flex flex-row w-screen h-screen relative bg-indigo-50'>
        <AppSidebar onControlPanelToggle={toggleControlPanel} />
        {showControlPanel && (
          <ControlPanel onControlPanelToggle={exitControlPanel} />
        )}
        <div className="flex-1 overflow-auto">
          <ResultDisplay onControlPanelToggle={toggleControlPanel} />
        </div>
      </main>
    </ControlPanelProvider>
    
  )
}
