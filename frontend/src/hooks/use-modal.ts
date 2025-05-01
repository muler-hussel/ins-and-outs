// stores/useSaveNewsModal.ts
import { create } from 'zustand';

export interface SaveNewsFormData {
  title: string;
  autoUpdate: boolean;
  updateFreqAmount?: number;
  updateFreqType?: string;
}

type ModalMode = 'new' | 'edit';

interface SaveNewsModalState {
  isOpen: boolean;
  mode: ModalMode;
  initialData?: SaveNewsFormData;
  onConfirm?: (data: SaveNewsFormData) => void;
  onDelete?: () => void;
  openModal: (options: {
    mode: ModalMode;
    initialData?: SaveNewsFormData;
    onConfirm: (data: SaveNewsFormData) => void;
    onDelete?: () => void;
  }) => void;
  closeModal: () => void;
}

export const useModal = create<SaveNewsModalState>((set) => ({
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
