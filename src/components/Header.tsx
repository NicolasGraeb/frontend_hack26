"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Bell, X } from "lucide-react";
import { useNavigation } from "@/store/navigation";
import { navTabs } from "./nav-data";

export default function Header() {
  const { activeTab } = useNavigation();
  const currentTab = navTabs.find((t) => t.id === activeTab);
  const title = currentTab?.label ?? "mObywatel";

  const [showNotifications, setShowNotifications] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  return (
    <header className="relative bg-[var(--color-bg)] lg:border-b lg:border-[var(--color-border)]">
      <div className="flex items-center justify-between px-4 pt-7 pb-1 lg:px-8 lg:py-4">
        <Image
          src="/herb_polski.svg"
          alt="Herb Rzeczypospolitej Polskiej"
          width={34}
          height={40}
          className="lg:hidden"
          priority
        />

        <h1 className="hidden text-xl font-bold text-[var(--color-text)] lg:block">
          {title}
        </h1>

        <button
          type="button"
          aria-label="Powiadomienia"
          onClick={() => setShowNotifications(!showNotifications)}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[var(--color-bg-secondary)]"
        >
          <Bell size={24} strokeWidth={1.6} className="text-[var(--color-text)]" />
        </button>
      </div>

      {showNotifications && (
        <div
          ref={panelRef}
          className="absolute top-full right-4 z-50 mt-1 w-72 overflow-hidden rounded-2xl bg-[var(--color-bg-secondary)] shadow-xl ring-1 ring-[var(--color-border)]"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[15px] font-semibold text-[var(--color-text)]">
              Powiadomienia
            </span>
            <button
              type="button"
              onClick={() => setShowNotifications(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-[var(--color-border)]"
            >
              <X size={16} className="text-[var(--color-text-secondary)]" />
            </button>
          </div>
          <div className="flex flex-col items-center gap-2 px-4 pb-6 pt-4">
            <Bell size={32} strokeWidth={1.2} className="text-[var(--color-nav-inactive)]" />
            <span className="text-sm text-[var(--color-text-secondary)]">
              Brak powiadomień
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
