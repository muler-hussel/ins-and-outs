import { createContext, useContext, useState } from "react";
import { Dayjs } from 'dayjs';

interface ControlPanelContextType {
  show: boolean;
  defaultValues: ControlPanelValues | null;
  openPanel: (defaults?: ControlPanelValues) => void;
  closePanel: () => void;
}

interface ControlPanelValues {
  keyword: string;
  relativeAmount?: number;
  relativeUnit?: string;
  absoluteStart: Dayjs | null;
  absoluteEnd: Dayjs | null;
  detailLevel: number;
  focus?: string;
  style: string;
  timeMode: 'relative' | 'absolute';
  startPicker: 'date' | 'month' | 'year';
  endPicker: 'date' | 'month' | 'year';
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
