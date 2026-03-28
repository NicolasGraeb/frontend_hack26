"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Building2, Mail, User } from "lucide-react";
import { apiUrl, getBackendBaseUrl } from "@/lib/backend";
import type { MeResponse } from "@/types/api";
import { useServicesUi } from "@/store/servicesUi";

export default function MojaFirmaPanel() {
  const closeSubpanel = useServicesUi((s) => s.closeSubpanel);
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl("/me"));
        const text = await res.text();
        if (cancelled) return;
        if (!res.ok) {
          setErr(
            res.status === 404
              ? "Brak użytkownika id=1 w bazie (endpoint /me)."
              : text || `HTTP ${res.status}`,
          );
          setData(null);
          return;
        }
        setData(JSON.parse(text) as MeResponse);
        setErr(null);
      } catch (e) {
        if (!cancelled) {
          setErr(
            e instanceof Error
              ? e.message
              : "Nie udało się połączyć z API — uruchom FastAPI.",
          );
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="fixed left-0 right-0 top-0 z-[200] flex flex-col bg-[var(--color-bg)] text-[var(--color-text)] bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] lg:bottom-0 lg:left-64">
      <header className="flex shrink-0 items-center gap-3 border-b border-[var(--color-border)] px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={closeSubpanel}
          aria-label="Zamknij"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text)] transition-colors hover:bg-black/[0.06] dark:hover:bg-white/10"
        >
          <ArrowLeft className="h-6 w-6" strokeWidth={1.75} />
        </button>
        <h1 className="text-lg font-bold tracking-tight">Moja firma</h1>
      </header>

      <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-10 pt-4">
        {loading ? (
          <p className="text-[15px] text-[var(--color-text-secondary)]">Ładowanie…</p>
        ) : err ? (
          <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-[14px] text-[var(--color-text)]">
            <p className="font-semibold">Błąd API</p>
            <p className="mt-1 text-[var(--color-text-secondary)]">{err}</p>
            <p className="mt-2 text-[13px] text-[var(--color-text-secondary)]">
              Backend: <span className="font-mono">{getBackendBaseUrl()}</span>
            </p>
          </div>
        ) : data ? (
          <div className="flex flex-col gap-4">
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/40 p-4">
              <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                <User className="h-4 w-4" strokeWidth={1.75} />
                Dane konta
              </h2>
              <p className="text-[16px] font-semibold text-[var(--color-text)]">
                {data.user.name} {data.user.surname}
              </p>
              <p className="mt-1 flex items-center gap-2 text-[14px] text-[var(--color-text-secondary)]">
                <Mail className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                {data.user.email}
              </p>
            </section>

            {data.company ? (
              <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/40 p-4">
                <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                  <Building2 className="h-4 w-4" strokeWidth={1.75} />
                  Firma
                </h2>
                <p className="text-[16px] font-semibold text-[var(--color-text)]">{data.company.name}</p>
                <p className="mt-1 text-[14px] text-[var(--color-text-secondary)]">
                  NIP / KRS: {data.company.nip_krs}
                </p>
                {data.company.address ? (
                  <p className="mt-2 text-[14px] text-[var(--color-text)]">{data.company.address}</p>
                ) : null}
                {data.company.categories.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {data.company.categories.map((c) => (
                      <span
                        key={c.id}
                        className="rounded-md bg-[var(--color-mstartup-accent)]/12 px-2 py-0.5 text-[12px] font-medium text-[var(--color-mstartup-accent)]"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                ) : null}
              </section>
            ) : (
              <p className="text-[14px] text-[var(--color-text-secondary)]">
                Brak powiązanej firmy w bazie dla tego użytkownika.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
