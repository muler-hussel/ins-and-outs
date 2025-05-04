import './App.css'
import AppSidebar from './components/AppSidebar'
import ResultDisplay from './components/ResultDisplay'
import ControlPanel from './components/ControlPanel';
import { ControlPanelProvider, useControlPanel } from './provider/ControlPanelProvider';
import { StarNewsModal } from './components/modal/StarNewsModal';
import { useModal } from './hooks/use-modal';
import { useLoadNewsIfSignedIn } from './hooks/use-loadNewsIfSignedIn';
import { useLoadTitlesIfSignedIn } from './hooks/use-loadTitlesIfSignedIn';
import { Routes, Route } from "react-router"

export default function App() {
  useLoadNewsIfSignedIn();
  useLoadTitlesIfSignedIn();
  
  return (
    <ControlPanelProvider>
      <Routes>
        <Route path="/" element={<MainAppLayout />} />
        <Route path="/:titleId" element={<MainAppLayout />} />
      </Routes>
    </ControlPanelProvider>
  );
}

function MainAppLayout() {
  const modal = useModal();
  const { show, closePanel, openPanel } = useControlPanel();

  return (
    <>
      <main className='flex flex-row w-screen h-screen relative bg-indigo-50'>
        <AppSidebar onControlPanelToggle={openPanel} />
        {show && (
          <ControlPanel onControlPanelToggle={closePanel} />
        )}
        <div className="flex-1 overflow-auto">
          <ResultDisplay onControlPanelToggle={openPanel} />
        </div>
      </main>
      <StarNewsModal
        open={modal.isOpen}
        onClose={modal.closeModal}
        onConfirm={(data) => {
          modal.onConfirm?.(data);
          modal.closeModal();
        } }
        onDelete={() => {
          modal.onDelete?.();
          modal.closeModal();
        } }
        initialData={modal.initialData}
        mode={modal.mode}
      />
    </>
  )
}
