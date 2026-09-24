# DO_NOT_CHANGE.md

Seznam věcí, které jsou odsouhlasené a nemají se měnit bez výslovného souhlasu uživatelky
(Kateřiny). Pokud si nejsi jistý/á, jestli něco spadá sem, dej to do sekce „Vyžaduje potvrzení"
na konci — neriskuj tichou změnu.

## Databázové schéma (`public.nabidky`)

- Sloupce, typy a názvy přesně podle zadání — **je to závazné, uživatelka to řekla výslovně**
  („toto je závazné, nevymýšlej vlastní schéma"). Kompletní schéma je v `context.md` a
  `CURRENT_STATE.md`.
- Jediné dovolené odchylky od doslovného zadání (obě už provedené a odsouhlasené):
  - `pracovni_cesty` je `NOT NULL DEFAULT 'neuvedeno'` místo nullable `text` (zúžení, ne změna
    typu/názvu).
  - Sloupce `datum_reakce` (date, nullable) a `zpusob_reakce` (text, nullable) byly přidány NA
    ŽÁDOST uživatelky — nejsou v původním zadání, ale jsou schválené a nasazené.
- Šest kritérií v `hodnoceni` (jsonb) je **vždy přesně těchto šest, v tomhle pořadí**: Home
  office, Pružná doba, Plat, Náplň práce, Seniorita a tým, Dojezd. Neměň pořadí, nepřidávej/
  neubírej položky.

## Bezpečnostní model

- Appka `prace` smí zapisovat **jen** do `stav`, `poznamka`, `datum_reakce`, `zpusob_reakce`.
  Vynuceno na úrovni databáze (`REVOKE` + column-level `GRANT`), ne jen v kódu appky.
- Appka **nikdy** nepoužívá `service_role` klíč — jen `anon`/`publishable`. Tohle je záměrné a
  zásadní: appka nesmí umět obejít RLS ani column granty.
- Appka **nikdy** nezapisuje nové nabídky ani je nemaže (žádný `INSERT`/`DELETE` grant pro
  `anon`). Automat (`job-agent`) je vlastníkem těchto operací, ne appka.
- Appka v1 **nemá autentizaci** — vědomé rozhodnutí, appka běží na neveřejné URL. `robots.ts`
  blokuje indexaci vyhledávači (to NENÍ skutečná ochrana přístupu, jen skrytí — bylo to takhle
  komunikováno uživatelce, nepředstírej víc).

## Funkce appky

- **Žádné mazání nabídek** — uživatelka se ptala, výslovně souhlasila s alternativou (rychlé
  „Zamítnout"/„Archivovat" místo mazání). Nezaváděj mazání bez nové výslovné žádosti.
- **Žádné grafy/statistiky nad rámec `/prehled`** — `/prehled` obsahuje jen čísla (celkem, nové
  za 7 dní, rozpis podle stavu, počet bez reakce > 7 dní). Byl to kompromis k původnímu „žádný
  dashboard" zadání — nerozšiřuj ho o grafy bez nové žádosti.
- Filtry v seznamu musí jít **kombinovat** a musí ukazovat, kolik nabídek po filtraci zůstává
  (`ResultCount`).
- Výchozí filtr **skrývá** `stav = zamitnuto` a `archiv` i bez parametru v URL — je to hlavní
  mechanismus proti „nepřehlednému seznamu".
- Ukládání v detailu je **při opuštění pole**, ne přes tlačítko „Uložit" (u poznámky navíc i
  zpožděné automatické ukládání za psaní).

## Vizuální styl

- **Žádné** fialové/gradientové hero sekce, kulaté karty se stíny, béžové/krémové pozadí (nikdy),
  emoji generovaná appkou (emoji jako DATA z automatu — např. tagy „⚠ plat neuveden" — jsou v
  pořádku, to není moje rozhodnutí, je to obsah).
- Barevné odlišení skóre pásem a horší/stejné/lepší je **funkční**, ne dekorativní: vždy barva +
  textový popisek zároveň.
- Appka je vědomě „sober baseline" — uživatelka chce vzhled ladit sama. Nepřidávej vlastní
  vizuální nápady/vylepšení navíc, pokud o ně nepožádá.

## Technická architektura

- **Next.js 16, bez Cache Components** (`cacheComponents` v `next.config.ts` zůstává vypnuté) —
  vědomé rozhodnutí kvůli jednoduchosti, ne opomenutí.
- **Žádný `@supabase/ssr`** — appka nemá session/cookies, obyčejný `supabase-js` klient stačí.
- Všechny zápisy appky jdou přes **Server Actions** v `src/lib/actions/nabidky.ts`, ne přes
  Route Handlers, ne přímo z klientských komponent.
- Filtrování a řazení je řízené přes **URL search parametry**, ne klientský stav — je to
  záměrné (sdílitelné odkazy, jednoduchá logika).

## Git a nasazení

- Autor commitů appky `prace`: `zlatenkak@gmail.com` (nastaveno globálně na tomhle počítači).
- **Vždy `git pull` (merge, ne rebase) před prací** — `job-agent` automat commituje sám každé
  ráno.
- **Nikdy `git rebase`, nikdy `git push --force`** na `main`.
- Push rovnou do `main`, bez ptaní, jakmile je práce hotová a otestovaná (standardní pracovní
  styl uživatelky napříč jejími projekty).

## `job-agent/` (cizí projekt ve stejném repozitáři)

- Needituj obsah souborů v `job-agent/` (kód, config, testy) bez výslovné žádosti — patří k
  jinému projektu/session, ne k appce `prace`.
- Známá chyba v `job-agent/package.json` (`npm test` uvozovky) je zdokumentovaná a **záměrně
  neopravená** — neoprav ji tiše, zeptej se nejdřív.

---

## Vyžaduje potvrzení před změnou

Věci, u kterých si nejsem jistá, jestli jsou pevně dané, nebo jen zatím takhle zůstaly:

- **Veřejnost GitHub repozitáře** (Public vs. uživatelčino původní přání Private) — viz
  `NEXT_STEPS.md` bod 1. Nepřepínej sám/sama, zeptej se.
- **Ikona appky** (programově generované bílé „N" na tmavém pozadí) — funkční, ale nikdy nebyla
  prezentována jako finální branding, jen jako rychlé řešení požadavku „přidat appku na plochu".
- **Přesun tabulky `nabidky` do vlastního Supabase projektu** — zmíněno jako budoucí možnost,
  není naplánované, nedělej to sám/sama iniciativně.
- **Cokoliv v `job-agent/config.json`** (váhy bodovacího modelu) — nevím, kdo přesně tyhle
  hodnoty naposledy schvaloval; neměň je bez ověření s uživatelkou.
