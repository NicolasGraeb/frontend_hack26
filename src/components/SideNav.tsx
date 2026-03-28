"use client";

import Image from "next/image";
import { navTabs } from "./nav-data";
import { useNavigation } from "@/store/navigation";

export default function SideNav() {
  const { activeTab, setActiveTab } = useNavigation();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-bg)] lg:flex">
      <div className="flex items-center gap-3 px-6 py-5">
        <Image
          src="/herb_polski.svg"
          alt="Herb Rzeczypospolitej Polskiej"
          width={30}
          height={36}
          priority
        />
        <span className="text-xl font-bold tracking-tight text-[var(--color-text)]">
          mObywatel
        </span>
      </div>

      <div className="mx-4 h-px bg-[var(--color-border)]" />

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] font-medium transition-colors ${
                isActive
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]"
              }`}
            >
              {isActive && tab.iconActive ? tab.iconActive : tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-[var(--color-border)] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563EB] text-sm font-bold text-white">
            JK
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[var(--color-text)]">
              Jan Kowalski
            </span>
            <span className="text-xs text-[var(--color-text-secondary)]">
              PESEL: •••••••1234
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
