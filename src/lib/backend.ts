/** Bazowy URL FastAPI (CORS po stronie backendu). */
export function getBackendBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
  return raw.replace(/\/$/, "");
}

/**
 * Publiczny endpoint zwracający logo (302 → presigned URL albo zewnętrzny https).
 * Nie używaj surowego `image_url` z bazy — to często klucz S3, nie adres do `<img>`.
 */
export function getCompanyLogoUrl(companyId: number): string {
  return `${getBackendBaseUrl()}/companies/${companyId}/logo`;
}
