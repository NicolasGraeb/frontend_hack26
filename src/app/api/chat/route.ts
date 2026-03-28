import { NextResponse } from "next/server";
import type { ChatMessagePayload } from "@/types/chat";

function serverBackendUrl(): string {
  const raw =
    process.env.BACKEND_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:8000";
  return raw.replace(/\/$/, "");
}

function formatFastApiDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((x) => {
        if (typeof x === "object" && x !== null && "msg" in x) {
          return String((x as { msg: string }).msg);
        }
        return JSON.stringify(x);
      })
      .join("; ");
  }
  if (detail && typeof detail === "object" && "message" in detail) {
    return String((detail as { message: string }).message);
  }
  return "Błąd backendu";
}

/**
 * POST /api/chat — proxy do FastAPI POST /chat (Gemini).
 * Bez backendu: krótka odpowiedź demo, żeby UI nie wyglądało na „martwe”.
 */
export async function POST(request: Request) {
  let body: { messages?: ChatMessagePayload[] };
  try {
    body = (await request.json()) as { messages?: ChatMessagePayload[] };
  } catch {
    return NextResponse.json(
      { error: "Nie udało się przetworzyć żądania." },
      { status: 400 },
    );
  }

  const messages = body.messages ?? [];
  const lastUser = [...messages].reverse().find((m) => m.role === "user");

  const demoReply = (hint: string) =>
    lastUser?.content?.trim()
      ? `[Offline — ${hint}]\n\nTwoje pytanie: „${lastUser.content.slice(0, 280)}${lastUser.content.length > 280 ? "…" : ""}”\n\nUruchom backend (uvicorn) i ustaw GEMINI_API_KEY, wtedy odpowiedzi pójdą z modelu.`
      : "Napisz pytanie o finansowanie startupu. Gdy backend FastAPI działa, odpowie model Gemini.";

  try {
    const r = await fetch(`${serverBackendUrl()}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    const data = (await r.json().catch(() => ({}))) as {
      structured?: unknown;
      reply_plain?: string | null;
      reply?: string;
      detail?: unknown;
    };

    if (!r.ok) {
      const msg = data.detail != null ? formatFastApiDetail(data.detail) : `HTTP ${r.status}`;
      return NextResponse.json(
        { reply_plain: demoReply(`backend: ${msg}`) },
        { status: 200 },
      );
    }

    if (data.structured && typeof data.structured === "object") {
      return NextResponse.json({
        structured: data.structured,
        reply_plain: data.reply_plain ?? null,
      });
    }

    if (typeof data.reply_plain === "string" && data.reply_plain.trim()) {
      return NextResponse.json({ reply_plain: data.reply_plain.trim() });
    }

    if (typeof data.reply === "string" && data.reply.trim()) {
      return NextResponse.json({ reply_plain: data.reply.trim() });
    }

    return NextResponse.json({ reply_plain: demoReply("pusta odpowiedź z /chat") });
  } catch {
    return NextResponse.json({
      reply_plain: demoReply("brak połączenia z API"),
    });
  }
}
