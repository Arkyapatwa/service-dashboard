import { create } from 'zustand';

interface DialogBoxState {
  addServiceDialog: boolean;
  toggleAddServiceDialog: () => void;
}

const useDialogBoxStore = create<DialogBoxState>()((set) => ({
  addServiceDialog: false,
  toggleAddServiceDialog: () => set((state) => ({ addServiceDialog: !state.addServiceDialog })),
}));

export default useDialogBoxStore;