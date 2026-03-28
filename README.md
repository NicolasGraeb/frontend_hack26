# Frontend — prototyp mObywatel (Dokumenty)

Aplikacja [Next.js](https://nextjs.org) (App Router, React 19, Tailwind CSS v4). Uruchamiasz ją z katalogu **`frontend`** w repozytorium `hackathon-2026`.

---

## Wymagania

- **Node.js** w wersji zgodnej z projektem (zalecane **20 LTS** lub **22**). Sprawdź: `node -v`
- **npm** (domyślnie z Node): `npm -v`

Inne menedżery pakietów (`pnpm`, `yarn`, `bun`) też działają, poniżej przykłady dla **npm**.

---

## Szybki start (identyczne środowisko jak w repo)

1. **Sklonuj repozytorium** (albo swojego forka):

```bash
git clone https://github.com/<ORG_LUB_USER>/hackathon-2026.git
cd hackathon-2026
```

2. **Wejdź do katalogu frontendu** (cała aplikacja jest tutaj):

```bash
cd frontend
```

3. **Zainstaluj zależności** — jedno polecenie instaluje **wszystko**, co jest w **`package.json`** (w tym m.in. Next.js, React, Tailwind, **Zustand**, **next-themes**, **lucide-react**, **react-qr-code**). Nie trzeba nic dokładać ręcznie ani osobno instalować bibliotek; wersje są spięte przez **`package-lock.json`**.

```bash
npm install
```

4. **Uruchom serwer deweloperski**:

```bash
npm run dev
```

5. Otwórz w przeglądarce: **[http://localhost:3000](http://localhost:3000)**

Nie trzeba konfigurować pliku `.env` — projekt działa lokalnie bez zmiennych środowiskowych.

---

## Pozostałe skrypty

| Polecenie       | Opis                                      |
|----------------|-------------------------------------------|
| `npm run dev`  | Serwer deweloperski (hot reload)          |
| `npm run build`| Produkcja — sprawdza typy i buduje aplikację |
| `npm run start`| Uruchamia zbudowaną wersję (`build` wcześniej) |
| `npm run lint` | ESLint                                    |

Typowy flow przed commitem: `npm run build` (powinno przejść bez błędów).

---

## Struktura (skrót)

- `src/app/` — layout, strona główna, style globalne
- `src/components/` — widoki (Dokumenty, Usługi, Kod QR, Więcej), nawigacja, itd.
- `public/` — zasoby statyczne (np. `herb_polski.svg`, `mdowod_pattern.svg`)

---

## Fork i synchronizacja z upstream (opcjonalnie)

Jeśli pracujesz na forku i chcesz pobierać zmiany z repozytorium źródłowego:

```bash
git remote add upstream https://github.com/j4chuu/hackathon-2026.git
git fetch upstream
git merge upstream/main
```

Przykładowy remote oryginału: `https://github.com/j4chuu/hackathon-2026.git` — podmień, jeśli używasz innego URL.

Workflow z branchem:

```bash
git checkout -b moja-funkcja
# ... zmiany ...
git push origin moja-funkcja
```

Następnie na GitHubie: **Compare & pull request**.

---

## Rozwiązywanie problemów

- **`npm install` kończy się błędem** — usuń `node_modules` i `package-lock.json`, potem ponownie `npm install` (ostrożnie: lockfile lepiej zachować, jeśli pracujesz w zespole).
- **Port 3000 zajęty** — Next.js można uruchomić na innym porcie: `npx next dev -p 3001`.
- **Różnice wersji Node** — użyj [nvm](https://github.com/nvm-sh/nvm) / [nvm-windows](https://github.com/coreybutler/nvm-windows), żeby przełączyć się na Node 20 lub 22.

---

## Deploy (opcjonalnie)

Produkcyjny build: `npm run build`, start: `npm run start`. Hosting typu [Vercel](https://vercel.com) wykrywa Next.js automatycznie — ustaw **Root Directory** na `frontend`, jeśli całe repo zawiera też inne katalogi.
