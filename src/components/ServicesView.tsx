"use client";

import { useServicesUi } from "@/store/servicesUi";
import MStartupPanel from "@/components/MStartupPanel";
import { ChevronRight, Rocket } from "lucide-react";

function IconBox({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${className}`}
    >
      {children}
    </span>
  );
}

export default function ServicesView() {
  const subpanel = useServicesUi((s) => s.subpanel);
  const openMStartup = useServicesUi((s) => s.openMStartup);

  return (
    <div className="relative flex flex-1 flex-col px-4 pt-7 pb-8 lg:px-10 lg:pt-8 lg:pb-10 xl:px-14">
      {subpanel === "mstartup" && <MStartupPanel />}

      <h1 className="mb-6 text-[32px] font-bold leading-tight text-[var(--color-text)] lg:text-2xl">
        Usługi
      </h1>

      <div className="overflow-hidden rounded-2xl bg-[var(--color-bg)] shadow-sm ring-1 ring-[var(--color-border)] dark:bg-[var(--color-bg-secondary)]">
        <button
          type="button"
          onClick={() => openMStartup()}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
        >
          <IconBox className="bg-[var(--color-mstartup-accent)]/12 dark:bg-[var(--color-mstartup-accent)]/15">
            <Rocket className="h-5 w-5 text-[var(--color-mstartup-accent)]" strokeWidth={1.75} />
          </IconBox>
          <span className="flex-1 text-[15px] font-medium text-[var(--color-text)]">mStartUp</span>
          <ChevronRight className="h-5 w-5 shrink-0 text-[var(--color-nav-inactive)]" />
        </button>
      </div>
    </div>
  );
}
