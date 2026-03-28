"use client";

import { navTabs } from "./nav-data";
import { useNavigation } from "@/store/navigation";

export default function BottomNav() {
  const { activeTab, setActiveTab } = useNavigation();

  return (
    <nav className="sticky bottom-0 z-50 border-t border-[var(--color-border)]/80 bg-[var(--color-bg)]/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-[var(--color-bg)]/65 lg:hidden dark:border-[var(--color-border)]/50">
      <div className="flex items-stretch justify-around px-1 pt-0.5">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-1 flex-col items-center gap-1 py-2 pt-2.5 transition-colors active:opacity-90 ${
                isActive ? "text-[#2563EB]" : "text-[var(--color-nav-inactive)]"
              }`}
            >
              {isActive && (
                <span
                  className="pointer-events-none absolute left-1/2 top-1.5 h-9 w-[4.25rem] -translate-x-1/2 rounded-[1.25rem] bg-[#2563EB]/[0.12] shadow-[0_0_18px_rgba(37,99,235,0.22)] ring-1 ring-[#2563EB]/10 dark:bg-[#2563EB]/20 dark:shadow-[0_0_20px_rgba(37,99,235,0.28)] dark:ring-[#2563EB]/20"
                  aria-hidden
                />
              )}
              <span className="relative z-10 flex flex-col items-center gap-1">
                {isActive && tab.iconActive ? tab.iconActive : tab.icon}
                <span className="text-[10px] font-medium">{tab.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
