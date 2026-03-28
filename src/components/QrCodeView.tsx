"use client";

import QRCode from "react-qr-code";

/** Stały ładunek QR do demo — zawsze ten sam po odświeżeniu. */
const DEMO_QR_PAYLOAD =
  "PL.MOBYWATEL|1|EOS|SER:ABC1234567|EXP:2030-12-31|SID:8f2a1b9c-4e3d-7f6a-8b9c-0d1e2f3a4b5c|SIG:demo";

const DEMO_ROWS: { label: string; value: string }[] = [
  { label: "Dokument", value: "mDowód (elektroniczny)" },
  { label: "Seria i numer", value: "ABC 1234567" },
  { label: "Ważny do", value: "31.12.2030" },
  { label: "Identyfikator sesji", value: "8f2a1b9c-4e3d-7f6a-8b9c-0d1e2f3a4b5c" },
  { label: "Skrót weryfikacyjny", value: "a7f3…9e2b (demo)" },
];

export default function QrCodeView() {
  return (
    <div className="flex flex-1 flex-col px-4 pt-7 pb-8 lg:px-10 lg:pt-8 lg:pb-10 xl:px-14">
      <h1 className="mb-2 text-[28px] font-bold leading-tight text-[var(--color-text)] lg:text-2xl">
        Kod QR
      </h1>
      <p className="mb-6 text-sm text-[var(--color-text-secondary)]">
        Pokaż ten kod do weryfikacji dokumentu (wersja demonstracyjna).
      </p>

      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6">
        <div className="rounded-2xl bg-white p-4 shadow-md ring-1 ring-[var(--color-border)] dark:bg-[var(--color-bg-secondary)]">
          <QRCode
            value={DEMO_QR_PAYLOAD}
            size={220}
            level="M"
            className="h-auto max-w-full"
            fgColor="#0f172a"
            bgColor="#ffffff"
          />
        </div>

        <div className="w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          {DEMO_ROWS.map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-0.5 border-b border-[var(--color-border)] px-4 py-3 last:border-b-0"
            >
              <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                {row.label}
              </span>
              <span className="break-all text-[15px] text-[var(--color-text)]">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
