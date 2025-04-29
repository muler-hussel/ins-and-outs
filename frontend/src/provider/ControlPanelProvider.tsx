import { createContext, useContext, useState } from "react";

interface ControlPanelContextType {
  show: boolean;
  defaultValues: ControlPanelValues | null;
  openPanel: (defaults?: ControlPanelValues) => void;
  closePanel: () => void;
}

interface ControlPanelValues {
  keyword: string;
  timeRange: string;
  detailLevel: number;
  focus?: string;
  style: string;
}

const ControlPanelContext = createContext<ControlPanelContextType | undefined>(undefined);

export const useControlPanel = () => {
  const context = useContext(ControlPanelContext);
  if (!context) {
    throw new Error("useControlPanel must be used inside ControlPanelProvider");
  }
  return context;
};

export function ControlPanelProvider({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [defaultValues, setDefaultValues] = useState<ControlPanelValues | null>(null);

  const openPanel = (defaults?: ControlPanelValues) => {
    setDefaultValues(defaults || null);
    setShow(true);
  };

  const closePanel = () => {
    setDefaultValues(null);
    setShow(false);
  };

  return (
    <ControlPanelContext.Provider value={{ show, defaultValues, openPanel, closePanel }}>
      {children}
    </ControlPanelContext.Provider>
  );
}
