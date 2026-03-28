export type ChatMessagePayload = {
  role: "user" | "assistant" | "system";
  content: string;
};

/** Odpowiedź asystenta z FastAPI /chat (JSON od modelu). */
export type ChatTrack = {
  id?: string;
  label?: string;
  summary?: string;
  bullets?: string[];
};

export type ChatStructured = {
  headline?: string;
  lead?: string;
  tracks?: ChatTrack[];
  sources_line?: string | null;
  follow_up?: string | null;
};

export type ChatApiResponse = {
  structured?: ChatStructured | null;
  reply_plain?: string | null;
  /** legacy z proxy offline */
  reply?: string;
  error?: string;
};
