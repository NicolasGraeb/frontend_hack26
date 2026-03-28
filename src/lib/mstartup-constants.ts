/**
 * Akcent UI mStartup — musi być zsynchronizowany z `--color-mstartup-accent*`
 * w `src/app/globals.css` (:root oraz html.dark). W komponentach używaj
 * `var(--color-mstartup-accent)` / `var(--color-mstartup-accent-deep)` w klasach Tailwind.
 */
export const MSTARTUP_UI_ACCENT = {
  light: { accent: "#7c3aed", deep: "#5b21b6" },
  dark: { accent: "#8b5cf6", deep: "#6d28d9" },
} as const;

/** Wspólne z formularzem „Dodaj ogłoszenie” — używane też w filtrach „Inwestuj”. */
export const MSTARTUP_CATEGORIES = [
  "FinTech",
  "Zdrowie",
  "GovTech",
  "EduTech",
  "E-commerce",
  "GreenTech",
  "Inne",
] as const;

export const MSTARTUP_STAGES = [
  { value: "pomysl", label: "Pomysł" },
  { value: "mvp", label: "MVP" },
  { value: "skalowanie", label: "Skalowanie" },
] as const;

export type MStartupPublicListing = {
  id: string;
  title: string;
  lead: string;
  description: string;
  category: (typeof MSTARTUP_CATEGORIES)[number];
  stage: (typeof MSTARTUP_STAGES)[number]["value"];
  locationRemote: boolean;
  locationCity: string;
  wantInvestor: boolean;
  wantPartner: boolean;
  wantGrant: boolean;
  wantPilot: boolean;
};

/** Placeholder — podmień na dane z API / bazy. */
export const MSTARTUP_PUBLIC_LISTINGS_SEED: MStartupPublicListing[] = [
  {
    id: "demo-1",
    title: "EcoMeter",
    lead: "Czujniki jakości powietrza z analizą AI dla miast.",
    description:
      "Platforma łączy dane IoT z prognozami, aby urzędy mogły reagować na smog w czasie rzeczywistym.",
    category: "GreenTech",
    stage: "mvp",
    locationRemote: true,
    locationCity: "",
    wantInvestor: true,
    wantPartner: true,
    wantGrant: false,
    wantPilot: true,
  },
  {
    id: "demo-2",
    title: "MedSync",
    lead: "Bezpieczna wymiana dokumentacji między placówkami medycznymi.",
    description: "Rozwiązanie zgodne z RODO, integracja z systemami NFZ w planie na Q3.",
    category: "Zdrowie",
    stage: "skalowanie",
    locationRemote: false,
    locationCity: "Warszawa",
    wantInvestor: true,
    wantPartner: false,
    wantGrant: false,
    wantPilot: false,
  },
  {
    id: "demo-3",
    title: "GovForms",
    lead: "Formularze urzędowe bez papierologii.",
    description: "Skupiamy się na małych gminach — pilotaż w 12 jednostkach.",
    category: "GovTech",
    stage: "pomysl",
    locationRemote: false,
    locationCity: "Kraków",
    wantInvestor: false,
    wantPartner: true,
    wantGrant: true,
    wantPilot: true,
  },
  {
    id: "demo-4",
    title: "LearnLoop",
    lead: "Personalizowane ścieżki nauki dla szkół średnich.",
    description: "MVP przetestowany z 3 szkołami, szukamy rundy seed pod skalowanie.",
    category: "EduTech",
    stage: "mvp",
    locationRemote: true,
    locationCity: "",
    wantInvestor: true,
    wantPartner: false,
    wantGrant: true,
    wantPilot: false,
  },
];
