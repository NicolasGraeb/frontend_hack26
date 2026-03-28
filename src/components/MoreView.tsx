"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, ChevronRight, Shield, Bell, HelpCircle, Info, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

export default function MoreView() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === "dark";

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 pt-4 pb-6 lg:px-10 lg:pt-8 lg:pb-10 xl:px-14">
      <h1 className="text-[28px] font-bold leading-tight text-[var(--color-text)] lg:text-2xl">
        Więcej
      </h1>

      <section className="flex flex-col gap-1">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Wygląd
        </h2>
        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="flex items-center justify-between rounded-2xl bg-[var(--color-bg-secondary)] px-4 py-3.5 transition-colors hover:opacity-80"
        >
          <div className="flex items-center gap-3">
            {isDark ? (
              <Moon size={20} className="text-[var(--color-accent)]" />
            ) : (
              <Sun size={20} className="text-[var(--color-accent)]" />
            )}
            <span className="text-[15px] font-medium text-[var(--color-text)]">
              Tryb ciemny
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-text-secondary)]">
              {mounted ? (isDark ? "Wł." : "Wył.") : ""}
            </span>
            <div
              className={`relative h-[30px] w-[50px] rounded-full transition-colors ${
                isDark ? "bg-[#2563EB]" : "bg-[#E5E5EA]"
              }`}
            >
              <div
                className={`absolute top-[2px] h-[26px] w-[26px] rounded-full bg-white shadow-md transition-transform ${
                  isDark ? "translate-x-[22px]" : "translate-x-[2px]"
                }`}
              />
            </div>
          </div>
        </button>
      </section>

      <section className="flex flex-col gap-1">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Ustawienia
        </h2>
        <div className="flex flex-col overflow-hidden rounded-2xl bg-[var(--color-bg-secondary)]">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex items-center justify-between px-4 py-3.5 transition-colors hover:opacity-80"
          >
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-[var(--color-text-secondary)]" />
              <span className="text-[15px] font-medium text-[var(--color-text)]">
                Powiadomienia
              </span>
            </div>
            <ChevronRight
              size={18}
              className={`text-[var(--color-nav-inactive)] transition-transform ${showNotifications ? "rotate-90" : ""}`}
            />
          </button>

          {showNotifications && (
            <div className="flex flex-col items-center gap-2 px-4 py-5">
              <Bell size={28} strokeWidth={1.2} className="text-[var(--color-nav-inactive)]" />
              <span className="text-sm text-[var(--color-text-secondary)]">
                Brak powiadomień
              </span>
            </div>
          )}

          <div className="mx-4 h-px bg-[var(--color-border)]" />

          {[
            { icon: Shield, label: "Bezpieczeństwo" },
            { icon: HelpCircle, label: "Pomoc" },
            { icon: Info, label: "O aplikacji" },
          ].map((item, i, arr) => (
            <button
              key={item.label}
              type="button"
              className="relative flex items-center justify-between px-4 py-3.5 transition-colors hover:opacity-80"
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className="text-[var(--color-text-secondary)]" />
                <span className="text-[15px] font-medium text-[var(--color-text)]">
                  {item.label}
                </span>
              </div>
              <ChevronRight size={18} className="text-[var(--color-nav-inactive)]" />
              {i < arr.length - 1 && (
                <div className="absolute right-0 bottom-0 left-14 h-px bg-[var(--color-border)]" />
              )}
            </button>
          ))}
        </div>
      </section>

      <section>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-bg-secondary)] px-4 py-3.5 text-[15px] font-medium text-[#D4213D] transition-colors hover:opacity-80"
        >
          <LogOut size={20} />
          Wyloguj się
        </button>
      </section>
    </div>
  );
}
