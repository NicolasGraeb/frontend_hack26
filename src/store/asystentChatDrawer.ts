import { create } from "zustand";

interface AsystentChatDrawerState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const useAsystentChatDrawer = create<AsystentChatDrawerState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
}));
