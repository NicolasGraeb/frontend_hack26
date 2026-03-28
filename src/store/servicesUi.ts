import { create } from "zustand";

type ServicesSubpanel = null | "mstartup";

interface ServicesUiState {
  subpanel: ServicesSubpanel;
  openMStartup: () => void;
  closeSubpanel: () => void;
}

export const useServicesUi = create<ServicesUiState>((set) => ({
  subpanel: null,
  openMStartup: () => set({ subpanel: "mstartup" }),
  closeSubpanel: () => set({ subpanel: null }),
}));
