import { create } from "zustand";

interface NavigationState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useNavigation = create<NavigationState>((set) => ({
  activeTab: "uslugi",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
