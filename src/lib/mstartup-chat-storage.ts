import type { ChatStructured } from "@/types/chat";

const STORAGE_KEY = "mstartup-asystent-chaty-v1";

export type StoredChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  structured?: ChatStructured;
};

export type StoredChatSession = {
  id: string;
  title: string;
  updatedAt: number;
  messages: StoredChatMessage[];
};

export function welcomeMessages(): StoredChatMessage[] {
  return [
    {
      id: "welcome",
      role: "assistant",
      content:
        "Cześć - jestem Asystentem Finansowań w mStartup. Pomogę z grantami, budżetem i kolejnymi krokami. Wpisz pytanie lub skorzystaj z podpowiedzi poniżej.",
    },
  ];
}

export function pickSessionTitle(messages: StoredChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "Nowa rozmowa";
  const t = firstUser.content.trim().replace(/\s+/g, " ");
  if (!t) return "Nowa rozmowa";
  return t.length > 48 ? `${t.slice(0, 45)}…` : t;
}

export function createNewSession(): StoredChatSession {
  const msgs = welcomeMessages();
  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `s-${Date.now()}`,
    title: "Nowa rozmowa",
    updatedAt: Date.now(),
    messages: msgs,
  };
}

export function loadChatSessions(): StoredChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is StoredChatSession =>
        x != null &&
        typeof x === "object" &&
        typeof (x as StoredChatSession).id === "string" &&
        Array.isArray((x as StoredChatSession).messages),
    ) as StoredChatSession[];
  } catch {
    return [];
  }
}

export function saveChatSessions(sessions: StoredChatSession[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    /* quota / private mode */
  }
}
