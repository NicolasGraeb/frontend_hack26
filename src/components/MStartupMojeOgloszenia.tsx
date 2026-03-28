"use client";

import { useEffect, useMemo, useState } from "react";
import { getBackendBaseUrl, getCompanyLogoUrl } from "@/lib/backend";
import type { AnnouncementPublic, MeResponse } from "@/types/api";

export type MStartupListingStatus = "active" | "ended";

export type MStartupListing = {
  id: string;
  title: string;
  description: string;
  imageSrc?: string;
  status: MStartupListingStatus;
};

type TabId = "aktualne" | "zakonczone";

const TABS: { id: TabId; label: string }[] = [
  { id: "aktualne", label: "Aktualne" },
  { id: "zakonczone", label: "Zakończone" },
];

function ListingCard({ listing }: { listing: MStartupListing }) {
  const [thumbFailed, setThumbFailed] = useState(false);
  const showImg = Boolean(listing.imageSrc) && !thumbFailed;

  return (
    <article className="flex gap-3 rounded-2xl bg-[var(--color-bg)] p-3 shadow-sm ring-1 ring-[var(--color-border)] dark:shadow-none">
      <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-[var(--color-bg-secondary)]">
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element -- redirect z API do presigned URL
          <img
            src={listing.imageSrc}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => setThumbFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-[var(--color-text-secondary)]">
            logo
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <h3 className="text-[15px] font-semibold leading-snug text-[var(--color-text)]">
          {listing.title}
        </h3>
        <p className="mt-1 line-clamp-3 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
          {listing.description}
        </p>
      </div>
    </article>
  );
}

function mapAnnouncements(
  rows: AnnouncementPublic[],
  companyId: number,
  hasCompanyLogo: boolean,
): MStartupListing[] {
  const imageSrc = hasCompanyLogo ? getCompanyLogoUrl(companyId) : undefined;
  return rows.map((a) => ({
    id: String(a.id),
    title: a.company?.name ?? `Firma #${a.company_id}`,
    description: [
      a.description?.trim() || "—",
      a.salary_min || a.salary_max
        ? `Widełki: ${a.salary_min ?? "?"} – ${a.salary_max ?? "?"} PLN`
        : null,
    ]
      .filter(Boolean)
      .join("\n"),
    imageSrc,
    status: "active" as const,
  }));
}

export default function MStartupMojeOgloszenia() {
  const [tab, setTab] = useState<TabId>("aktualne");
  const [listings, setListings] = useState<MStartupListing[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const base = getBackendBaseUrl();
    (async () => {
      try {
        const meRes = await fetch(`${base}/me`);
        const meText = await meRes.text();
        if (cancelled) return;
        if (!meRes.ok) {
          setLoadErr(meRes.status === 404 ? "Brak użytkownika w /me (id=1)." : meText);
          setListings([]);
          return;
        }
        const me = JSON.parse(meText) as MeResponse;
        const cid = me.company?.id;
        if (cid == null) {
          setListings([]);
          setLoadErr(null);
          return;
        }
        const annRes = await fetch(`${base}/announcements?company_id=${cid}`);
        const annText = await annRes.text();
        if (cancelled) return;
        if (!annRes.ok) {
          setLoadErr(annText || `Ogłoszenia: HTTP ${annRes.status}`);
          setListings([]);
          return;
        }
        const rows = JSON.parse(annText) as AnnouncementPublic[];
        setListings(
          mapAnnouncements(
            Array.isArray(rows) ? rows : [],
            cid,
            Boolean(me.company?.image_url?.trim()),
          ),
        );
        setLoadErr(null);
      } catch (e) {
        if (!cancelled) {
          setLoadErr(
            e instanceof Error ? e.message : "Błąd połączenia z backendem.",
          );
          setListings([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return listings.filter((l) =>
      tab === "aktualne" ? l.status === "active" : l.status === "ended",
    );
  }, [listings, tab]);

  return (
    <div className="flex flex-1 flex-col px-4 pb-10 pt-1">
      {loadErr ? (
        <p className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[13px] text-[var(--color-text)]">
          {loadErr}
        </p>
      ) : null}
      {loading ? (
        <p className="text-[14px] text-[var(--color-text-secondary)]">Ładowanie ogłoszeń…</p>
      ) : null}

      <div className="mb-5 flex rounded-full bg-[var(--color-bg-secondary)] p-1 ring-1 ring-[var(--color-border)]">
        {TABS.map((t) => {
          const isOn = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`relative flex-1 rounded-full py-2.5 text-[14px] font-semibold transition-colors ${
                isOn
                  ? "bg-[var(--color-bg)] text-[var(--color-mstartup-accent)] shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {!loading && filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <p className="text-[17px] font-semibold text-[var(--color-text)]">Nic tu nie ma</p>
          <p className="mt-2 max-w-[280px] text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
            Brak ogłoszeń z API dla Twojej firmy albo konto nie ma przypisanej firmy w bazie.
          </p>
        </div>
      ) : null}

      {filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
