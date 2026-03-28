"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUp, Loader2, ListTree, Plus, Trash2, X } from "lucide-react";
import type { ChatApiResponse, ChatMessagePayload, ChatStructured } from "@/types/chat";
import { useAsystentChatDrawer } from "@/store/asystentChatDrawer";
import {
  createNewSession,
  loadChatSessions,
  pickSessionTitle,
  saveChatSessions,
  type StoredChatMessage,
  type StoredChatSession,
  welcomeMessages,
} from "@/lib/mstartup-chat-storage";

type UiMessage = StoredChatMessage;

function AiChatAvatar() {
  return (
    <div
      className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-[var(--color-border)] bg-[var(--color-bg-secondary)]"
      aria-hidden
    >
      <Image
        src="/ai_logo.png"
        alt=""
        width={32}
        height={32}
        className="h-full w-full object-cover"
        priority={false}
      />
    </div>
  );
}

function isChatStructured(x: unknown): x is ChatStructured {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  if (typeof o.headline === "string" && o.headline.trim().length > 0) return true;
  if (Array.isArray(o.tracks) && o.tracks.length > 0) return true;
  return false;
}

function StructuredFinanceAnswer({ data }: { data: ChatStructured }) {
  const tracks =
    data.tracks?.filter(
      (t) => t.label || t.summary || (t.bullets && t.bullets.length > 0),
    ) ?? [];
  return (
    <div className="space-y-3 text-left">
      {data.headline ? (
        <p className="text-[14px] font-semibold leading-snug text-[var(--color-text)] sm:text-[15px]">
          {data.headline}
        </p>
      ) : null}
      {data.lead ? (
        <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)] sm:text-[14px]">
          {data.lead}
        </p>
      ) : null}

      {tracks.length > 0 ? (
        <div className="space-y-2.5">
          {tracks.map((t, i) => (
            <div
              key={`${t.id ?? "t"}-${i}`}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 px-3 py-2.5 dark:bg-black/15"
            >
              <div className="flex items-start gap-2">
                <ListTree
                  className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400"
                  strokeWidth={1.75}
                />
                <div className="min-w-0 flex-1">
                  {t.label ? (
                    <p className="text-[13px] font-semibold text-blue-700 dark:text-blue-300 sm:text-[14px]">
                      {t.label}
                    </p>
                  ) : null}
                  {t.summary ? (
                    <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-text-secondary)] sm:text-[13px]">
                      {t.summary}
                    </p>
                  ) : null}
                  {t.bullets && t.bullets.length > 0 ? (
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-[12px] leading-relaxed text-[var(--color-text)] sm:text-[13px]">
                      {t.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {data.sources_line ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)] sm:text-[12px]">
          <span className="font-medium text-[var(--color-text)]">Źródła / terminy: </span>
          {data.sources_line}
        </div>
      ) : null}

      {data.follow_up ? (
        <p className="text-[12px] italic leading-relaxed text-[var(--color-text-secondary)] sm:text-[13px]">
          {data.follow_up}
        </p>
      ) : null}
    </div>
  );
}

const QUICK_PROMPTS = [
  "Jakie są źródła finansowania na MVP?",
  "Co przygotować przed rozmową z inwestorem?",
  "Jak oszacować runway?",
];

/** Tło tylko dla modułu asystenta — szary gradient + siatka kropek (nie cała apka). */
function AsystentChatModuleBackdrop() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,var(--color-bg-secondary)_0%,var(--color-bg)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12] dark:opacity-[0.28]"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-text) 1px, transparent 0)`,
          backgroundSize: "20px 20px",
        }}
      />
    </>
  );
}

export default function MStartupAsystentChat() {
  const [sessions, setSessions] = useState<StoredChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  /** Ostatnia świeża odpowiedź asystenta — animacja wejścia */
  const [answerEnterId, setAnswerEnterId] = useState<string | null>(null);
  const answerAnimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeSessionId;

  const drawerOpen = useAsystentChatDrawer((s) => s.open);
  const setDrawerOpen = useAsystentChatDrawer((s) => s.setOpen);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession?.messages ?? welcomeMessages();

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    const loaded = loadChatSessions();
    if (loaded.length === 0) {
      const s = createNewSession();
      setSessions([s]);
      setActiveSessionId(s.id);
    } else {
      const sorted = [...loaded].sort((a, b) => b.updatedAt - a.updatedAt);
      setSessions(sorted);
      setActiveSessionId(sorted[0].id);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || sessions.length === 0) return;
    saveChatSessions(sessions);
  }, [sessions, hydrated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, pending, scrollToBottom, activeSessionId]);

  useEffect(() => {
    return () => {
      if (answerAnimTimerRef.current) clearTimeout(answerAnimTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, setDrawerOpen]);

  const triggerAnswerAnimation = useCallback((messageId: string) => {
    if (answerAnimTimerRef.current) clearTimeout(answerAnimTimerRef.current);
    setAnswerEnterId(messageId);
    answerAnimTimerRef.current = setTimeout(() => {
      setAnswerEnterId(null);
      answerAnimTimerRef.current = null;
    }, 900);
  }, []);

  const updateActiveSession = useCallback(
    (updater: (prev: StoredChatMessage[]) => StoredChatMessage[]) => {
      const id = activeIdRef.current;
      if (!id) return;
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s;
          const next = updater(s.messages);
          return {
            ...s,
            messages: next,
            updatedAt: Date.now(),
            title: pickSessionTitle(next),
          };
        }),
      );
    },
    [],
  );

  const startNewChat = useCallback(() => {
    if (pending) return;
    const s = createNewSession();
    setSessions((prev) => [s, ...prev]);
    setActiveSessionId(s.id);
    setDrawerOpen(false);
  }, [pending, setDrawerOpen]);

  const selectSession = useCallback(
    (id: string) => {
      if (pending || id === activeSessionId) return;
      setActiveSessionId(id);
      setDrawerOpen(false);
    },
    [pending, activeSessionId, setDrawerOpen],
  );

  const deleteSession = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (pending) return;
      setSessions((prev) => {
        const next = prev.filter((s) => s.id !== id);
        if (next.length === 0) {
          const fresh = createNewSession();
          setActiveSessionId(fresh.id);
          return [fresh];
        }
        if (id === activeSessionId) {
          const sorted = [...next].sort((a, b) => b.updatedAt - a.updatedAt);
          setActiveSessionId(sorted[0].id);
        }
        return next;
      });
    },
    [pending, activeSessionId],
  );

  const send = async (textOverride?: string) => {
    const text = (textOverride ?? draft).trim();
    if (!text || pending || !activeSessionId) return;

    const sessionIdWhenSend = activeSessionId;
    const snapshot = sessions.find((s) => s.id === sessionIdWhenSend)?.messages ?? [];

    const userMsg: UiMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };

    updateActiveSession((m) => [...m, userMsg]);
    setDraft("");
    setPending(true);

    const payload: ChatMessagePayload[] = [
      ...snapshot.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: text },
    ];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });
      const raw = await res.text();
      let data: ChatApiResponse;
      try {
        data = JSON.parse(raw) as ChatApiResponse;
      } catch {
        throw new Error("Niepoprawna odpowiedź serwera (nie JSON).");
      }
      if (!res.ok) {
        throw new Error(data.error ?? "Błąd serwera");
      }

      if (activeIdRef.current !== sessionIdWhenSend) return;

      const structured = isChatStructured(data.structured) ? data.structured : null;
      const plain =
        (typeof data.reply_plain === "string" && data.reply_plain.trim()
          ? data.reply_plain
          : typeof data.reply === "string"
            ? data.reply
            : "") ?? "";

      const assistantContent = structured
        ? JSON.stringify(structured)
        : plain || "Brak treści odpowiedzi.";

      const assistantMsg: UiMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: assistantContent,
        structured: structured ?? undefined,
      };

      updateActiveSession((m) => [...m, assistantMsg]);
      triggerAnswerAnimation(assistantMsg.id);
    } catch (e) {
      if (activeIdRef.current !== sessionIdWhenSend) return;
      const errId = `a-${Date.now()}`;
      updateActiveSession((m) => [
        ...m,
        {
          id: errId,
          role: "assistant",
          content:
            e instanceof Error
              ? `Błąd: ${e.message}`
              : "Nie udało się wysłać wiadomości. Sprawdź połączenie lub API.",
        },
      ]);
      triggerAnswerAnimation(errId);
    } finally {
      if (activeIdRef.current === sessionIdWhenSend) setPending(false);
    }
  };

  const bubbleAssistant =
    "rounded-tl-md border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] shadow-sm";

  if (!hydrated) {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <AsystentChatModuleBackdrop />
        <div className="relative z-0 flex min-h-0 flex-1 items-center justify-center px-4 text-[14px] text-[var(--color-text-secondary)]">
          Ładowanie rozmów…
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <AsystentChatModuleBackdrop />
      <div className="relative z-0 flex min-h-0 flex-1 flex-col px-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px)+0.5rem)] pt-1 sm:px-4">
      {drawerOpen ? (
        <>
          <button
            type="button"
            aria-label="Zamknij panel rozmów"
            className="animate-asystent-backdrop fixed inset-0 z-[225] bg-black/45 backdrop-blur-[2px] dark:bg-black/55"
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            className="animate-asystent-drawer fixed bottom-0 right-0 top-0 z-[230] flex w-[min(100vw-2.5rem,18.5rem)] flex-col border-l border-[var(--color-border)] bg-[var(--color-bg)] shadow-2xl sm:w-[20rem]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="asystent-drawer-title"
          >
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--color-border)] px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4">
              <h2
                id="asystent-drawer-title"
                className="text-[15px] font-bold tracking-tight text-[var(--color-text)]"
              >
                Rozmowy
              </h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Zamknij"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text)] transition-colors hover:bg-black/[0.06] dark:hover:bg-white/10"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>
            <div className="shrink-0 border-b border-[var(--color-border)] p-3 sm:p-4">
              <button
                type="button"
                disabled={pending}
                onClick={startNewChat}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-4 w-4" strokeWidth={2.25} />
                Nowa rozmowa
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                Historia
              </p>
              <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
                <table className="w-full border-collapse text-left text-[11px] sm:text-[12px]">
                  <thead className="sticky top-0 z-[1] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]">
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="px-2 py-1.5 font-medium sm:px-3 sm:py-2">Tytuł</th>
                      <th className="hidden w-[6.5rem] px-2 py-1.5 font-medium sm:table-cell sm:px-3 sm:py-2">
                        Kiedy
                      </th>
                      <th className="w-8 px-1 py-1.5 sm:w-9" aria-label="Akcje" />
                    </tr>
                  </thead>
                  <tbody>
                    {[...sessions]
                      .sort((a, b) => b.updatedAt - a.updatedAt)
                      .map((s) => {
                        const active = s.id === activeSessionId;
                        return (
                          <tr
                            key={s.id}
                            role="button"
                            tabIndex={pending ? -1 : 0}
                            onClick={() => selectSession(s.id)}
                            onKeyDown={(e) => {
                              if (pending) return;
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                selectSession(s.id);
                              }
                            }}
                            className={`cursor-pointer border-b border-[var(--color-border)]/80 last:border-b-0 transition-colors ${
                              active
                                ? "bg-blue-600/10 dark:bg-blue-500/15"
                                : "hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                            } ${pending ? "pointer-events-none opacity-60" : ""}`}
                          >
                            <td className="max-w-[1px] px-2 py-1.5 sm:px-3 sm:py-2">
                              <span className="block truncate font-medium text-[var(--color-text)]">
                                {s.title || "Nowa rozmowa"}
                              </span>
                            </td>
                            <td className="hidden whitespace-nowrap px-2 py-1.5 text-[var(--color-text-secondary)] sm:table-cell sm:px-3 sm:py-2">
                              {new Date(s.updatedAt).toLocaleString("pl-PL", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="px-0.5 py-1 text-center sm:py-2">
                              <button
                                type="button"
                                disabled={pending}
                                onClick={(e) => deleteSession(s.id, e)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-text-secondary)] transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                                aria-label="Usuń rozmowę"
                              >
                                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </aside>
        </>
      ) : null}

      <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] text-[var(--color-text)] shadow-sm ring-1 ring-[var(--color-border)] dark:shadow-none">
        <AsystentChatModuleBackdrop />
        <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden">
          <div
            ref={listRef}
            className="no-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto bg-transparent px-3 py-3 sm:min-h-0 sm:px-4 sm:py-4"
          >
            {messages.map((msg, i) => (
              <div key={msg.id} className="space-y-2">
                {msg.role === "user" ? (
                  <div className="flex justify-end">
                    <div className="max-w-[min(92%,100%)] rounded-2xl rounded-tr-md bg-[#4964fc] px-3 py-2.5 text-[13px] leading-relaxed text-white sm:max-w-[92%] sm:px-3.5 sm:text-[14px]">
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex w-full min-w-0 flex-col items-stretch gap-1.5">
                    <AiChatAvatar />
                    <div
                      className={`min-w-0 w-full max-w-full rounded-2xl px-3 py-2.5 text-[13px] leading-relaxed shadow-sm sm:px-3.5 sm:text-[14px] ${bubbleAssistant} ${
                        msg.id !== "welcome" && answerEnterId === msg.id
                          ? "animate-chat-answer-in"
                          : ""
                      }`}
                    >
                      {msg.structured ? (
                        <StructuredFinanceAnswer data={msg.structured} />
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </div>
                )}
                {msg.role === "assistant" && i === 0 ? (
                  <div className="flex flex-wrap gap-2 pl-0">
                    {QUICK_PROMPTS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        disabled={pending}
                        onClick={() => void send(q)}
                        className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-left text-[12px] font-medium text-[var(--color-text-secondary)] transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-[var(--color-text)] disabled:opacity-40 dark:hover:border-blue-800 dark:hover:bg-blue-950/40"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {pending ? (
              <div className="flex w-full min-w-0 flex-col items-stretch gap-1.5">
                <AiChatAvatar />
                <div
                  className={`flex w-full max-w-full items-center gap-3 rounded-2xl rounded-tl-md px-4 py-3 ${bubbleAssistant}`}
                >
                  <span className="flex gap-1">
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500 [animation-delay:0ms] dark:bg-blue-400" />
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500/70 [animation-delay:150ms] dark:bg-blue-400/70" />
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500/45 [animation-delay:300ms] dark:bg-blue-400/45" />
                  </span>
                  <span className="text-[12px] text-[var(--color-text-secondary)]">Piszę odpowiedź…</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]/80 p-2 pb-2.5 backdrop-blur-md sm:p-3 sm:pb-3 dark:bg-[var(--color-bg-secondary)]/70">
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder="Zapytaj o finansowanie…"
                rows={1}
                disabled={pending}
                className="min-h-[44px] flex-1 resize-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-[15px] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] outline-none ring-0 transition-[border-color,box-shadow] focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 disabled:opacity-60 sm:min-h-[46px] sm:px-3.5 sm:py-3 sm:text-[14px]"
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={pending || !draft.trim()}
                className="flex h-11 min-h-[44px] w-11 min-w-[44px] shrink-0 items-center justify-center rounded-full bg-[#4964fc] text-white transition-colors hover:bg-[#3d56eb] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-35 sm:h-12 sm:min-h-[48px] sm:w-12 sm:min-w-[48px] dark:bg-[#4964fc] dark:hover:bg-[#5a74fd]"
                aria-label="Wyślij"
              >
                {pending ? (
                  <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2} />
                ) : (
                  <ArrowUp className="h-5 w-5 sm:h-[22px] sm:w-[22px]" strokeWidth={2.25} />
                )}
              </button>
            </div>
            <p className="mt-1.5 hidden text-center text-[10px] text-[var(--color-text-secondary)] sm:mt-2 sm:block">
              Enter — wyślij · Shift+Enter — nowa linia
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
