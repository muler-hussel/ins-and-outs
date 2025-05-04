import { create } from 'zustand';

export interface StarNewsFormData {
  title: string;
  autoUpdate: boolean;
  updateFreqAmount?: number;
  updateFreqType?: string;
}

type ModalMode = 'new' | 'edit';

interface StarNewsModalState {
  isOpen: boolean;
  mode: ModalMode;
  initialData?: StarNewsFormData;
  onConfirm?: (data: StarNewsFormData) => void;
  onDelete?: () => void;
  openModal: (options: {
    mode: ModalMode;
    initialData?: StarNewsFormData;
    onConfirm: (data: StarNewsFormData) => void;
    onDelete?: () => void;
  }) => void;
  closeModal: () => void;
}

export const useModal = create<StarNewsModalState>((set) => ({
  isOpen: false,
  mode: 'new',
  openModal: ({ mode, initialData, onConfirm, onDelete }) =>
    set({
      isOpen: true,
      mode,
      initialData,
      onConfirm,
      onDelete,
    }),
  closeModal: () =>
    set({
      isOpen: false,
      initialData: undefined,
      onConfirm: undefined,
      onDelete: undefined,
    }),
}));
