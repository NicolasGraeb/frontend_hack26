import React from "react";
import { FolderClosed, Briefcase, ScanLine, LayoutGrid } from "lucide-react";

export interface NavTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  iconActive?: React.ReactNode;
}

export const navTabs: NavTab[] = [
  {
    id: "dokumenty",
    label: "Dokumenty",
    icon: <FolderClosed size={24} strokeWidth={1.6} />,
    iconActive: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M20 7h-8.586L9.707 5.293A1 1 0 0 0 9 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
      </svg>
    ),
  },
  {
    id: "uslugi",
    label: "Usługi",
    icon: <Briefcase size={24} strokeWidth={1.6} />,
  },
  {
    id: "kod-qr",
    label: "Kod QR",
    icon: <ScanLine size={24} strokeWidth={1.6} />,
  },
  {
    id: "wiecej",
    label: "Więcej",
    icon: <LayoutGrid size={24} strokeWidth={1.6} />,
  },
];
