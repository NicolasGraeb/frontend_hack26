import React from "react";

interface DocumentCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  verified?: boolean;
}

export default function DocumentCard({
  icon,
  title,
  subtitle,
  verified = false,
}: DocumentCardProps) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-all hover:shadow-md active:scale-[0.98] active:shadow-none lg:p-5"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-bg)] text-[var(--color-primary)] lg:h-14 lg:w-14 lg:rounded-2xl">
        {icon}
      </div>

      <div className="flex flex-1 flex-col items-start gap-0.5 text-left">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-[var(--color-text)] lg:text-base">
            {title}
          </span>
          {verified && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="var(--color-verified)"
              aria-label="Zweryfikowany"
            >
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          )}
        </div>
        <span className="text-[13px] text-[var(--color-text-secondary)] lg:text-sm">
          {subtitle}
        </span>
      </div>

      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-nav-inactive)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}
