const DEFAULT_LOCAL = "http://127.0.0.1:8000";

/** Jedna ścieżka wyglądająca jak host Railway (częsty błąd: wklejenie pod URL Vercela). */
const RAILWAY_HOST_LIKE = /^[a-z0-9][a-z0-9.-]*\.up\.railway\.app$/i;

function stripBom(s: string): string {
  return s.replace(/^\uFEFF/, "").trim();
}

function collapseDoubleScheme(s: string): string {
  return s.replace(/^https?:\/\/https?:\/\//i, "https://");
}

/**
 * Gdy ktoś ustawi np. `https://frontend-xxx.vercel.app/hackback26-production.up.railway.app`
 * zamiast `https://hackback26-production.up.railway.app` — użyj prawdziwego hosta API.
 */
function fixMistakenVercelRailwayPaste(u: URL): URL {
  if (!/\.vercel\.app$/i.test(u.hostname)) return u;
  const seg = u.pathname.replace(/^\//, "").split("/")[0] ?? "";
  if (seg && RAILWAY_HOST_LIKE.test(seg)) {
    return new URL(`https://${seg}`);
  }
  return u;
}

/**
 * Ujednolica NEXT_PUBLIC_API_URL / BACKEND_API_URL.
 * Bez `https://` przeglądarka traktuje host jak ścieżkę na originie Vercela (404 na …/railway.host/me).
 */
export function resolveBackendUrl(raw: string): string {
  let t = stripBom(raw);
  t = collapseDoubleScheme(t);
  t = t.replace(/\/$/, "");
  if (!t) return DEFAULT_LOCAL;

  if (!/^https?:\/\//i.test(t)) {
    if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|\/|$)/i.test(t)) {
      t = `http://${t}`;
    } else {
      t = `https://${t}`;
    }
  }

  let u: URL;
  try {
    u = new URL(t);
  } catch {
    return DEFAULT_LOCAL;
  }

  u = fixMistakenVercelRailwayPaste(u);

  if (u.protocol !== "http:" && u.protocol !== "https:") {
    return DEFAULT_LOCAL;
  }

  const origin = u.origin;
  const path = u.pathname && u.pathname !== "/" ? u.pathname.replace(/\/$/, "") : "";
  return path ? `${origin}${path}` : origin;
}

/** Bazowy URL FastAPI (CORS po stronie backendu). */
export function getBackendBaseUrl(): string {
  return resolveBackendUrl(process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_LOCAL);
}

/** Ten sam resolver co na kliencie, ale preferuje BACKEND_API_URL (Route Handlers / SSR). */
export function getServerBackendUrl(): string {
  const raw =
    process.env.BACKEND_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    DEFAULT_LOCAL;
  return resolveBackendUrl(raw);
}

/**
 * Absolutny URL do endpointu API (zawsze http(s) — nie względny do Vercela).
 * `path` może zawierać query, np. `/announcements?company_id=1`.
 */
export function apiUrl(path: string): string {
  const base = getBackendBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  try {
    return new URL(p, base.endsWith("/") ? base : `${base}/`).href;
  } catch {
    return `${base.replace(/\/$/, "")}${p}`;
  }
}

/**
 * Publiczny endpoint zwracający logo (302 → presigned URL albo zewnętrzny https).
 * Nie używaj surowego `image_url` z bazy — to często klucz S3, nie adres do `<img>`.
 */
export function getCompanyLogoUrl(companyId: number): string {
  return apiUrl(`/companies/${companyId}/logo`);
}
