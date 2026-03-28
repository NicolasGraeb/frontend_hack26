"use client";

import Image from "next/image";

const DOCUMENT_CARDS = [
  {
    id: "mdowod",
    label: "mDowód",
    gradient:
      "linear-gradient(135deg, #1a3a7a 0%, #2563eb 40%, #3b8bf6 100%)",
  },
  {
    id: "prawo-jazdy",
    label: "Prawo jazdy",
    gradient:
      "linear-gradient(135deg, #831843 0%, #db2777 45%, #f472b6 85%, #fbcfe8 100%)",
  },
  {
    id: "legitymacja",
    label: "Legitymacja studencka",
    gradient:
      "linear-gradient(135deg, #14532d 0%, #16a34a 38%, #4ade80 70%, #bbf7d0 100%)",
  },
] as const;

function DocumentGradientCard({
  label,
  gradient,
  stackIndex,
}: {
  label: string;
  gradient: string;
  stackIndex: number;
}) {
  const zFront = (stackIndex + 1) * 10;

  return (
    <button
      type="button"
      className={`group relative aspect-[1.7/1] w-full overflow-hidden rounded-2xl text-left shadow-md ring-1 ring-black/10 transition-all hover:z-[100] hover:shadow-xl active:scale-[0.98] lg:rounded-3xl ${
        stackIndex > 0 ? "-mt-[6.25rem] md:mt-0" : ""
      }`}
      style={{
        background: gradient,
        zIndex: zFront,
      }}
    >
      <Image
        src="/mdowod_pattern.svg"
        alt=""
        fill
        className="pointer-events-none select-none rounded-2xl object-cover object-[85%_center] opacity-[0.45] lg:rounded-3xl"
        style={{ filter: "brightness(0) invert(1)" }}
        sizes="(max-width: 768px) 100vw, 480px"
        aria-hidden
      />

      <span className="absolute left-5 top-5 z-10 max-w-[85%] text-left text-[17px] font-medium leading-snug tracking-tight text-white drop-shadow-sm lg:left-6 lg:top-6 lg:max-w-[80%] lg:text-xl">
        {label}
      </span>

      <div className="pointer-events-none absolute inset-0 z-[1] rounded-2xl bg-gradient-to-br from-white/[0.06] via-transparent to-black/15 lg:rounded-3xl" />
    </button>
  );
}

export default function DocumentsView() {
  return (
    <div className="flex flex-1 flex-col px-4 pt-2 pb-6 lg:px-10 lg:pt-8 lg:pb-10 xl:px-14">
      <div className="mb-4 flex items-end justify-between lg:mb-8">
        <h1 className="text-[32px] font-bold leading-tight text-[var(--color-text)] lg:hidden">
          Dokumenty
        </h1>
        <div className="hidden lg:block" />
        <div className="flex items-center gap-5">
          <button
            type="button"
            className="text-[15px] font-medium text-[#2563EB] transition-opacity hover:opacity-70"
          >
            Dostosuj
          </button>
          <button
            type="button"
            className="text-[15px] font-medium text-[#2563EB] transition-opacity hover:opacity-70"
          >
            Dodaj
          </button>
        </div>
      </div>

      <div className="relative flex flex-col pb-4 md:grid md:grid-cols-2 md:gap-4 md:pb-0 xl:grid-cols-3 xl:gap-6">
        {DOCUMENT_CARDS.map((doc, index) => (
          <DocumentGradientCard
            key={doc.id}
            label={doc.label}
            gradient={doc.gradient}
            stackIndex={index}
          />
        ))}
      </div>
    </div>
  );
}
