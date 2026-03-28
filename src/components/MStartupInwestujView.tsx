"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, Phone, Search, SlidersHorizontal, X } from "lucide-react";
import { getBackendBaseUrl, getCompanyLogoUrl } from "@/lib/backend";
import type { AnnouncementPublic, CategoryPublic } from "@/types/api";

const inputClass =
  "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-[15px] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] outline-none ring-0 focus:border-[var(--color-mstartup-accent)]/80 focus:ring-1 focus:ring-[var(--color-mstartup-accent)]/30";

function parseDescriptionKeywordTokens(raw: string): string[] {
  return raw
    .toLowerCase()
    .split(/[\s,;]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function ApiCompanyThumb({ companyId }: { companyId: number }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--color-bg-secondary)] ring-1 ring-[var(--color-border)]/80">
      {failed ? (
        <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-[var(--color-text-secondary)]">
          logo
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- redirect do presigned URL
        <img
          src={getCompanyLogoUrl(companyId)}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export default function MStartupInwestujView() {
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [onlyWithSalary, setOnlyWithSalary] = useState(false);
  const [sortNewestFirst, setSortNewestFirst] = useState(true);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [descriptionKeywords, setDescriptionKeywords] = useState("");

  const [apiRows, setApiRows] = useState<AnnouncementPublic[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryPublic[]>([]);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [apiErr, setApiErr] = useState<string | null>(null);
  const [detail, setDetail] = useState<AnnouncementPublic | null>(null);

  const filtersActive =
    onlyWithSalary ||
    !sortNewestFirst ||
    selectedCategoryIds.length > 0 ||
    descriptionKeywords.trim().length > 0;

  const sortedCategoryOptions = useMemo(
    () => [...categoryOptions].sort((a, b) => a.name.localeCompare(b.name, "pl")),
    [categoryOptions],
  );

  useEffect(() => {
    let cancelled = false;
    const base = getBackendBaseUrl();
    (async () => {
      try {
        const [annRes, catRes] = await Promise.all([
          fetch(`${base}/announcements`),
          fetch(`${base}/categories`),
        ]);
        const annText = await annRes.text();
        const catText = catRes.ok ? await catRes.text() : "[]";
        if (cancelled) return;
        if (!annRes.ok) {
          setApiErr(annText || `Ogłoszenia: HTTP ${annRes.status}`);
          setApiRows([]);
          setCategoryOptions([]);
          return;
        }
        const rows = JSON.parse(annText) as AnnouncementPublic[];
        setApiRows(Array.isArray(rows) ? rows : []);
        let cats: CategoryPublic[] = [];
        try {
          cats = JSON.parse(catText) as CategoryPublic[];
        } catch {
          cats = [];
        }
        setCategoryOptions(Array.isArray(cats) ? cats : []);
        setApiErr(null);
      } catch {
        if (!cancelled) {
          setApiErr("Brak połączenia z backendem.");
          setApiRows([]);
          setCategoryOptions([]);
        }
      } finally {
        if (!cancelled) setApiLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!detail) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetail(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detail]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = apiRows;
    if (q) {
      rows = rows.filter((a) => {
        const blob = `${a.company?.name ?? ""} ${a.description ?? ""} ${a.salary_min ?? ""} ${a.salary_max ?? ""}`.toLowerCase();
        return blob.includes(q);
      });
    }
    if (selectedCategoryIds.length > 0) {
      const need = new Set(selectedCategoryIds);
      rows = rows.filter((a) => {
        const companyCatIds = (a.company?.categories ?? []).map((c) => c.id);
        return companyCatIds.some((id) => need.has(id));
      });
    }
    const kw = parseDescriptionKeywordTokens(descriptionKeywords);
    if (kw.length > 0) {
      rows = rows.filter((a) => {
        const d = (a.description ?? "").toLowerCase();
        return kw.every((t) => d.includes(t));
      });
    }
    if (onlyWithSalary) {
      rows = rows.filter((a) => a.salary_min != null || a.salary_max != null);
    }
    return [...rows].sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return sortNewestFirst ? tb - ta : ta - tb;
    });
  }, [
    apiRows,
    query,
    onlyWithSalary,
    sortNewestFirst,
    selectedCategoryIds,
    descriptionKeywords,
  ]);

  function toggleCategory(id: number) {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function clearFilters() {
    setOnlyWithSalary(false);
    setSortNewestFirst(true);
    setSelectedCategoryIds([]);
    setDescriptionKeywords("");
  }

  return (
    <div className="flex flex-1 flex-col px-4 pb-10 pt-1">
      <div className="mb-4 flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-nav-inactive)]"
            strokeWidth={1.75}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj po firmie lub opisie…"
            className={`${inputClass} w-full py-3 pl-10 pr-4`}
          />
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
          aria-label="Filtry"
          className={`relative flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] transition-colors hover:bg-black/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-mstartup-accent)] dark:hover:bg-white/[0.06] sm:h-[48px] sm:w-[48px] ${
            filtersOpen || filtersActive
              ? "border-[var(--color-mstartup-accent)]/50 bg-[var(--color-mstartup-accent)]/8 ring-1 ring-[var(--color-mstartup-accent)]/25"
              : ""
          }`}
        >
          <SlidersHorizontal className="h-5 w-5" strokeWidth={1.75} />
          {filtersActive ? (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--color-mstartup-accent)]" aria-hidden />
          ) : null}
        </button>
      </div>

      {filtersOpen ? (
        <div className="mb-4 space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 p-4 dark:bg-black/10">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-text-secondary)]">
              Sortowanie
            </label>
            <select
              value={sortNewestFirst ? "newest" : "oldest"}
              onChange={(e) => setSortNewestFirst(e.target.value === "newest")}
              className={`${inputClass} appearance-none`}
            >
              <option value="newest">Od najnowszych</option>
              <option value="oldest">Od najstarszych</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="inwestuj-desc-keywords"
              className="mb-1.5 block text-[13px] font-medium text-[var(--color-text-secondary)]"
            >
              Słowa kluczowe w opisie
            </label>
            <input
              id="inwestuj-desc-keywords"
              type="text"
              value={descriptionKeywords}
              onChange={(e) => setDescriptionKeywords(e.target.value)}
              placeholder="np. AI, dron — wszystkie słowa muszą wystąpić w opisie"
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
              Oddziel przecinkiem lub spacją. Filtrowane jest tylko pole opisu ogłoszenia.
            </p>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-medium text-[var(--color-text-secondary)]">
              Kategorie firmy (przynajmniej jedna)
            </p>
            {sortedCategoryOptions.length === 0 ? (
              <p className="text-[12px] text-[var(--color-text-secondary)]">
                Brak kategorii w bazie — uruchom skrypt{" "}
                <code className="rounded bg-black/[0.06] px-1 font-mono text-[11px] dark:bg-white/10">
                  python utils/seed_categories.py
                </code>
              </p>
            ) : (
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/60 p-2 dark:bg-black/20">
                {sortedCategoryOptions.map((c) => {
                  const on = selectedCategoryIds.includes(c.id);
                  return (
                    <label
                      key={c.id}
                      className="flex cursor-pointer items-start gap-2.5 rounded-lg px-1 py-0.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleCategory(c.id)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-mstartup-accent)] focus:ring-[var(--color-mstartup-accent)]/40"
                      />
                      <span className="text-[13px] leading-snug text-[var(--color-text)]">{c.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={onlyWithSalary}
              onChange={(e) => setOnlyWithSalary(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-mstartup-accent)] focus:ring-[var(--color-mstartup-accent)]/40"
            />
            <span className="text-[14px] text-[var(--color-text)]">Tylko z podanymi widełkami</span>
          </label>

          {filtersActive ? (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[13px] font-medium text-[var(--color-mstartup-accent)] underline-offset-2 hover:underline"
            >
              Wyczyść filtry
            </button>
          ) : null}
        </div>
      ) : null}

      {apiErr ? (
        <p className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[13px] text-[var(--color-text)]">
          {apiErr}
        </p>
      ) : null}

      {!apiLoaded ? (
        <p className="text-[14px] text-[var(--color-text-secondary)]">Ładowanie…</p>
      ) : null}

      {apiLoaded && !apiErr && apiRows.length === 0 ? (
        <p className="py-10 text-center text-[15px] text-[var(--color-text-secondary)]">Brak ogłoszeń.</p>
      ) : null}

      {apiLoaded && !apiErr && apiRows.length > 0 && filtered.length === 0 ? (
        <p className="py-10 text-center text-[15px] text-[var(--color-text-secondary)]">
          Brak wyników — zmień wyszukiwanie lub filtry.
        </p>
      ) : null}

      {apiLoaded && filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setDetail(a)}
              className="flex w-full gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 text-left shadow-sm transition-colors hover:bg-black/[0.02] dark:bg-[var(--color-bg-secondary)]/40 dark:hover:bg-white/[0.04]"
            >
              <ApiCompanyThumb companyId={a.company_id} />
              <div className="min-w-0 flex-1">
                <h3 className="text-[16px] font-semibold leading-snug text-[var(--color-text)]">
                  {a.company?.name ?? `Firma #${a.company_id}`}
                </h3>
                {(a.company?.categories?.length ?? 0) > 0 ? (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {(a.company?.categories ?? []).map((c) => (
                      <span
                        key={c.id}
                        className="rounded-md bg-[var(--color-mstartup-accent)]/12 px-2 py-0.5 text-[10px] font-medium text-[var(--color-mstartup-accent)] dark:bg-[var(--color-mstartup-accent)]/20"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                ) : null}
                <p className="mt-2 line-clamp-4 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                  {a.description?.trim() || "—"}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-[var(--color-text-secondary)]">
                  {a.salary_min || a.salary_max ? (
                    <span className="rounded-md bg-black/[0.04] px-2 py-0.5 dark:bg-white/[0.06]">
                      Widełki: {a.salary_min ?? "?"} – {a.salary_max ?? "?"} PLN
                    </span>
                  ) : null}
                  <span className="rounded-md bg-black/[0.04] px-2 py-0.5 dark:bg-white/[0.06]">
                    {new Date(a.created_at).toLocaleString("pl-PL")}
                  </span>
                  <span className="ml-auto text-[11px] font-medium text-[var(--color-mstartup-accent)]">
                    Szczegóły →
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : null}

      {detail ? (
        <>
          <button
            type="button"
            aria-label="Zamknij szczegóły"
            className="animate-asystent-backdrop fixed inset-0 z-[240] bg-black/45 backdrop-blur-[2px] dark:bg-black/55"
            onClick={() => setDetail(null)}
          />
          <div
            className="animate-asystent-drawer fixed bottom-0 left-0 right-0 z-[245] max-h-[min(92vh,640px)] overflow-hidden rounded-t-2xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-2xl sm:left-auto sm:right-4 sm:top-[8vh] sm:max-h-[84vh] sm:w-[min(100vw-2rem,26rem)] sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inwest-detail-title"
          >
            <div className="flex max-h-[min(92vh,640px)] flex-col sm:max-h-[84vh]">
              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--color-border)] px-4 py-3">
                <h2
                  id="inwest-detail-title"
                  className="min-w-0 text-[16px] font-bold leading-tight text-[var(--color-text)]"
                >
                  {detail.company?.name ?? `Firma #${detail.company_id}`}
                </h2>
                <button
                  type="button"
                  onClick={() => setDetail(null)}
                  aria-label="Zamknij"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--color-text)] transition-colors hover:bg-black/[0.06] dark:hover:bg-white/10"
                >
                  <X className="h-5 w-5" strokeWidth={1.75} />
                </button>
              </div>
              <div className="no-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                <div className="flex gap-3">
                  <ApiCompanyThumb companyId={detail.company_id} />
                  <div className="min-w-0 text-[13px] text-[var(--color-text-secondary)]">
                    {detail.company?.nip_krs ? (
                      <p>
                        <span className="font-medium text-[var(--color-text)]">NIP / KRS: </span>
                        {detail.company.nip_krs}
                      </p>
                    ) : null}
                    {detail.company?.address ? (
                      <p className="mt-1 leading-relaxed">{detail.company.address}</p>
                    ) : null}
                  </div>
                </div>

                {(detail.company?.categories?.length ?? 0) > 0 ? (
                  <div>
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Kategorie
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(detail.company?.categories ?? []).map((c) => (
                        <span
                          key={c.id}
                          className="rounded-md bg-[var(--color-mstartup-accent)]/12 px-2 py-0.5 text-[11px] font-medium text-[var(--color-mstartup-accent)]"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                    Kontakt (demo)
                  </p>
                  <div className="space-y-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/40 p-3 dark:bg-black/15">
                    {detail.company?.contact_phone ? (
                      <a
                        href={`tel:${detail.company.contact_phone.replace(/\s/g, "")}`}
                        className="flex items-center gap-2 text-[14px] font-medium text-[var(--color-text)] hover:text-[var(--color-mstartup-accent)]"
                      >
                        <Phone className="h-4 w-4 shrink-0 text-[var(--color-mstartup-accent)]" strokeWidth={1.75} />
                        {detail.company.contact_phone}
                      </a>
                    ) : (
                      <p className="text-[13px] text-[var(--color-text-secondary)]">Brak numeru</p>
                    )}
                    {detail.company?.contact_email ? (
                      <a
                        href={`mailto:${detail.company.contact_email}`}
                        className="flex items-center gap-2 break-all text-[14px] font-medium text-[var(--color-text)] hover:text-[var(--color-mstartup-accent)]"
                      >
                        <Mail className="h-4 w-4 shrink-0 text-[var(--color-mstartup-accent)]" strokeWidth={1.75} />
                        {detail.company.contact_email}
                      </a>
                    ) : (
                      <p className="text-[13px] text-[var(--color-text-secondary)]">Brak e-mail</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                    Opis
                  </p>
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--color-text)]">
                    {detail.description?.trim() || "—"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-[12px] text-[var(--color-text-secondary)]">
                  {detail.salary_min || detail.salary_max ? (
                    <span className="rounded-md bg-black/[0.04] px-2 py-0.5 dark:bg-white/[0.06]">
                      Widełki: {detail.salary_min ?? "?"} – {detail.salary_max ?? "?"} PLN
                    </span>
                  ) : null}
                  <span className="rounded-md bg-black/[0.04] px-2 py-0.5 dark:bg-white/[0.06]">
                    {new Date(detail.created_at).toLocaleString("pl-PL")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
