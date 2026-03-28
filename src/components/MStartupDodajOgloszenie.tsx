"use client";

import { useId, useState } from "react";
import { getBackendBaseUrl } from "@/lib/backend";

export default function MStartupDodajOgloszenie() {
  const formId = useId();
  const [description, setDescription] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-[15px] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] outline-none ring-0 focus:border-[var(--color-mstartup-accent)]/80 focus:ring-1 focus:ring-[var(--color-mstartup-accent)]/30";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(false);
    const text = description.trim();
    if (!text) {
      setErr("Wpisz treść ogłoszenia.");
      return;
    }

    let smin: number | null = null;
    let smax: number | null = null;
    const rawMin = salaryMin.trim();
    const rawMax = salaryMax.trim();
    if (rawMin !== "") {
      const n = Number(rawMin.replace(",", "."));
      if (!Number.isFinite(n) || n < 0) {
        setErr("Widełki od: podaj poprawną liczbę (PLN brutto miesięcznie).");
        return;
      }
      smin = n;
    }
    if (rawMax !== "") {
      const n = Number(rawMax.replace(",", "."));
      if (!Number.isFinite(n) || n < 0) {
        setErr("Widełki do: podaj poprawną liczbę (PLN brutto miesięcznie).");
        return;
      }
      smax = n;
    }
    if (smin !== null && smax !== null && smin > smax) {
      setErr("Kwota „od” nie może być większa niż „do”.");
      return;
    }

    setPending(true);
    try {
      const base = getBackendBaseUrl();
      const res = await fetch(`${base}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: text,
          salary_min: smin,
          salary_max: smax,
        }),
      });
      const raw = await res.text();
      if (!res.ok) {
        let msg = raw || `HTTP ${res.status}`;
        try {
          const j = JSON.parse(raw) as { detail?: unknown };
          if (typeof j.detail === "string") msg = j.detail;
          else if (Array.isArray(j.detail)) msg = j.detail.map(String).join(", ");
        } catch {
          /* ignore */
        }
        setErr(msg);
        return;
      }
      setOk(true);
      setDescription("");
      setSalaryMin("");
      setSalaryMax("");
    } catch {
      setErr("Brak połączenia z serwerem.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      id={formId}
      onSubmit={(e) => void handleSubmit(e)}
      className="flex flex-1 flex-col px-4 pb-10 pt-1"
    >
      <div className="mx-auto w-full max-w-lg space-y-6">
        <p className="text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
        </p>

        {err ? (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-[var(--color-text)]">
            {err}
          </p>
        ) : null}
        {ok ? (
          <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[13px] text-[var(--color-text)]">
            Ogłoszenie zostało dodane.
          </p>
        ) : null}

        <div>
          <label htmlFor={`${formId}-desc`} className="mb-1.5 block text-[13px] font-medium text-[var(--color-text-secondary)]">
            Treść ogłoszenia <span className="text-amber-500/90">*</span>
          </label>
          <textarea
            id={`${formId}-desc`}
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} resize-y min-h-[140px]`}
            placeholder="Opisz projekt, czego szukasz, co oferujesz…"
            disabled={pending}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`${formId}-smin`} className="mb-1.5 block text-[13px] font-medium text-[var(--color-text-secondary)]">
              Widełki od (PLN / mies., opcjonalnie)
            </label>
            <input
              id={`${formId}-smin`}
              type="text"
              inputMode="decimal"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              className={inputClass}
              placeholder="np. 12000"
              disabled={pending}
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor={`${formId}-smax`} className="mb-1.5 block text-[13px] font-medium text-[var(--color-text-secondary)]">
              Widełki do (PLN / mies., opcjonalnie)
            </label>
            <input
              id={`${formId}-smax`}
              type="text"
              inputMode="decimal"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              className={inputClass}
              placeholder="np. 18000"
              disabled={pending}
              autoComplete="off"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-2xl bg-[var(--color-mstartup-accent)] py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-[var(--color-mstartup-accent)]/25 transition-colors hover:bg-[var(--color-mstartup-accent-deep)] active:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Wysyłanie…" : "Dodaj ogłoszenie"}
        </button>
      </div>
    </form>
  );
}
