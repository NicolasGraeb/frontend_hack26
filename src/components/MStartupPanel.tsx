"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Rocket,
  LayoutGrid,
  ListPlus,
  Bot,
  CircleDollarSign,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useServicesUi } from "@/store/servicesUi";
import { useAsystentChatDrawer } from "@/store/asystentChatDrawer";
import MStartupAsystentChat from "@/components/MStartupAsystentChat";
import MStartupDodajOgloszenie from "@/components/MStartupDodajOgloszenie";
import MStartupInwestujView from "@/components/MStartupInwestujView";
import MStartupMojeOgloszenia from "@/components/MStartupMojeOgloszenia";

type MStartupInnerView =
  | "home"
  | "moje-ogloszenia"
  | "dodaj-ogloszenie"
  | "asystent"
  | "inwestuj";

const MENU = [
  {
    id: "ogloszenia",
    title: "Moje ogłoszenia",
    subtitle: "Lista dodanych startupów",
    icon: LayoutGrid,
  },
  {
    id: "dodaj",
    title: "Dodaj ogłoszenie",
    subtitle: "Umieść swój Startup na liście",
    icon: ListPlus,
  },
  {
    id: "asystent",
    title: "Asystent Finansowań",
    subtitle: "Wsparcie dla twojego pomysłu",
    icon: Bot,
  },
  {
    id: "inwestuj",
    title: "Inwestuj",
    subtitle: "Lista startupów szukających finansowania",
    icon: CircleDollarSign,
  },
] as const;

export default function MStartupPanel() {
  const closeSubpanel = useServicesUi((s) => s.closeSubpanel);
  const toggleChatDrawer = useAsystentChatDrawer((s) => s.toggle);
  const [innerView, setInnerView] = useState<MStartupInnerView>("home");

  const goBack = () => {
    if (
      innerView === "moje-ogloszenia" ||
      innerView === "dodaj-ogloszenie" ||
      innerView === "asystent" ||
      innerView === "inwestuj"
    ) {
      setInnerView("home");
    } else closeSubpanel();
  };

  return (
    <div className="fixed left-0 right-0 top-0 z-[200] flex min-h-0 flex-col overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)] bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] lg:bottom-0 lg:left-64">
      <header className="flex shrink-0 items-center gap-2 border-b border-[var(--color-border)] px-3 py-3 pt-[max(1rem,env(safe-area-inset-top))] sm:gap-3 sm:px-4 sm:py-4">
        <button
          type="button"
          onClick={goBack}
          aria-label={innerView === "home" ? "Zamknij" : "Wróć"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--color-text)] transition-colors hover:bg-black/[0.06] dark:hover:bg-white/10"
        >
          <ArrowLeft className="h-6 w-6" strokeWidth={1.75} />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-[15px] font-bold tracking-tight text-[var(--color-text)] sm:text-lg">
          {innerView === "moje-ogloszenia"
            ? "Moje ogłoszenia"
            : innerView === "dodaj-ogloszenie"
              ? "Dodaj ogłoszenie"
              : innerView === "asystent"
                ? "Asystent dla twojego startupu"
                : innerView === "inwestuj"
                  ? "Inwestuj"
                  : "mStartup"}
        </h1>
        {innerView === "asystent" ? (
          <button
            type="button"
            onClick={toggleChatDrawer}
            aria-label="Rozmowy i historia"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--color-text)] transition-colors hover:bg-black/[0.06] dark:hover:bg-white/10"
          >
            <Menu className="h-6 w-6" strokeWidth={1.75} />
          </button>
        ) : (
          <span className="h-10 w-10 shrink-0" aria-hidden />
        )}
      </header>

      {innerView === "moje-ogloszenia" ? (
        <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
          <MStartupMojeOgloszenia />
        </div>
      ) : innerView === "dodaj-ogloszenie" ? (
        <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
          <MStartupDodajOgloszenie />
        </div>
      ) : innerView === "asystent" ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <MStartupAsystentChat />
        </div>
      ) : innerView === "inwestuj" ? (
        <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
          <MStartupInwestujView />
        </div>
      ) : (
        <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto px-4 pb-10">
          <div className="mb-7 flex flex-col items-center pt-1">
            <div className="animate-rocket-ring mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 ring-2 ring-amber-300/80 dark:bg-[#3d2a1a] dark:ring-amber-900/60">
              <div className="animate-rocket-float flex items-center justify-center">
                <Rocket
                  className="h-10 w-10 text-amber-600 dark:text-amber-400"
                  strokeWidth={1.5}
                  style={{ filter: "drop-shadow(0 2px 8px rgba(251,191,36,0.35))" }}
                />
              </div>
            </div>

            <h2 className="mb-2.5 text-center text-[20px] font-bold leading-tight tracking-tight text-[var(--color-text)]">
              Finansuj swój projekt lub inwestuj kapitał
            </h2>
            <p className="max-w-md text-center text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
              W mStartup łączymy innowacyjne pomysły ze skutecznymi metodami
              finansowania.
            </p>
          </div>

          <div className="mx-auto flex w-full max-w-lg flex-col gap-2.5">
            {MENU.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === "ogloszenia") setInnerView("moje-ogloszenia");
                  if (item.id === "dodaj") setInnerView("dodaj-ogloszenie");
                  if (item.id === "asystent") setInnerView("asystent");
                  if (item.id === "inwestuj") setInnerView("inwestuj");
                }}
                className="flex w-full items-center gap-3 rounded-2xl bg-[var(--color-bg-secondary)] px-3.5 py-3 text-left shadow-sm ring-1 ring-[var(--color-border)] transition-colors hover:bg-black/[0.04] active:bg-black/[0.06] dark:shadow-none dark:hover:bg-white/[0.06] dark:active:bg-white/[0.09]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-mstartup-accent)]/12 text-[var(--color-mstartup-accent)] dark:bg-white/[0.08] dark:text-zinc-200">
                  <item.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold leading-snug text-[var(--color-text)]">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-[var(--color-text-secondary)]">
                    {item.subtitle}
                  </span>
                </span>
                <ChevronRight
                  className="h-[18px] w-[18px] shrink-0 text-[var(--color-nav-inactive)]"
                  strokeWidth={1.75}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
