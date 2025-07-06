import { create } from 'zustand';
import { Service } from '@/hooks/useService';

type Mode = 'add' | 'edit';

interface ServiceModalState {
  isOpen: boolean;
  mode: Mode;
  initialData?: Service;
  open: (mode: Mode, data?: Service) => void;
  close: () => void;
}

export const useServiceModalStore = create<ServiceModalState>((set) => ({
  isOpen: false,
  mode: 'add',
  initialData: undefined,
  open: (mode, data) =>
    set({ isOpen: true, mode, initialData: data }),
  close: () =>
    set({ isOpen: false, mode: 'add', initialData: undefined }),
}));
