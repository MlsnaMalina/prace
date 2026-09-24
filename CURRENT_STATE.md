# CURRENT_STATE.md

Přesný stav projektu k okamžiku předání. Datum poslední kontroly: **22. 9. 2026**.

## Co funguje (živě ověřeno)

- Appka běží na https://prace-nu.vercel.app, build na Vercelu je zelený.
- Seznam (`/`) načítá reálná data ze Supabase, zobrazuje 50 nabídek, filtry i řazení fungují
  (testováno v prohlížeči).
- Detail (`/nabidky/[id]`) zobrazuje rozpad 6 kritérií (horší/stejné/lepší), úryvek inzerátu,
  odkaz na originál, ostatní údaje, a čtyři editovatelná pole (stav, poznámka, datum reakce,
  způsob reakce) — uložení ověřeno přímo v databázi po editaci.
- `/prehled` počítá a zobrazuje správná čísla (ověřeno ručním přepočtem proti datům v DB).
- Rychlé akce „Zamítnout"/„Archivovat" v seznamu — ověřeno na reálném řádku (počet zobrazených
  klesl z 50 na 49, po testu vráceno zpět na `novy`).
- PWA manifest (`/manifest.webmanifest`) a ikony (`/icon`, `/icon-512`) se servírují správně na
  produkci, `<head>` je správně propojen (`<link rel="manifest">`, `<link rel="icon">`).
- GitHub Action `sber.yml` běží denně, sama commituje a pushuje do `main` (viz commity
  `sber: YYYY-MM-DD`).
- Bezpečnostní model ověřen dotazem do `information_schema.column_privileges`: role
  `anon`/`authenticated` mají `SELECT` na všechny sloupce `nabidky`, `UPDATE` jen na
  `(stav, poznamka, datum_reakce, zpusob_reakce)`, žádný `INSERT`/`DELETE`.

## Aktuální data (k 22. 9. 2026 — ZKONTROLUJ ZNOVU, mohlo se změnit)

- `public.nabidky`: **50 řádků**, všech 50 má `stav = 'novy'` (uživatelka zatím netřídila).
- `public.firmy`: **80 řádků**, 79 má vyplněné `karierni_url` (dřív jich bylo jen 8 z 64 —
  job-agent mezitím na tomhle výrazně pokročil).
- Tabulka `nabidky` je fyzicky v Supabase projektu **„Recepty"** (`mjeqymqobpijsskcyjor`), ne ve
  vlastním projektu — viz `PROJECT_CONTEXT.md`.

## Co je hotové (kompletní, odpovídá zadání + schváleným rozšířením)

Vše ze `SESSION_SUMMARY.md` fází 1–6. Appka aktuálně nemá žádnou rozdělanou/nedokončenou práci —
poslední funkce (rychlé akce + PWA manifest) je hotová a nasazená.

## Co je jen navrženo, ale záměrně NEuděláno

- **Mazání nabídek** — zvažováno, uživatelka souhlasila s alternativou (rychlé „Zamítnout"/
  „Archivovat"), mazání se nestaví. Pokud o něj v budoucnu znovu požádá, je to legitimní — appka
  na to teď ale nemá ani DB práva (žádný `DELETE` grant), vyžadovalo by to novou migraci.
- **Oprava `npm test` v `job-agent/package.json`** — bug identifikován, neopraven (mimo scope
  poslední zadané práce, needitovat bez výslovné žádosti).

## Co je potřeba zkontrolovat (nejistota, ne chyba)

1. **Je GitHub repozitář veřejný záměrně?** Uživatelka původně chtěla privátní. `sber.yml` má
   komentář počítající s veřejným repem (zdarma Actions minuty). Nebylo to nikdy sladěno.
2. Aktuální počet/stav řádků v `nabidky` a `firmy` (čísla výš rychle zastarávají — automat běží
   denně, uživatelka může mezitím třídit).
3. Vercel Preview environment proměnné nejsou nastavené (jen Production/Development).

## Co nesmí být změněno bez výslovného souhlasu uživatelky

Viz `DO_NOT_CHANGE.md` — kompletní seznam. Nejdůležitější: DB schéma, bezpečnostní model
(RLS + column granty, žádný `service_role` v appce), zákaz mazání/zápisu nových nabídek appkou,
vizuální styl (žádné fialové/gradienty/beige/stíny/emoji), Next.js 16 bez Cache Components.

## Struktura repozitáře (kořen = `C:\Users\merit\OneDrive\Desktop\AI\Ostatní\Michal\prace`)

```
prace/
├── .env.example              # šablona proměnných prostředí (bez hodnot)
├── .env.local                # SKUTEČNÉ hodnoty, NENÍ v gitu (viz FILES_AND_MATERIALS.md)
├── .github/workflows/sber.yml # denní GitHub Action (job-agent), 5:40 UTC
├── .gitignore
├── AGENTS.md                 # auto-generovaný Next.js soubor (varování o verzi 16), commituje se
├── CLAUDE.md                 # stub: "@AGENTS.md" — Next.js konvence, ne uživatelčin CLAUDE.md
├── README.md                 # README appky `prace` (env setup, deploy postup)
├── briefing-job-agent.md     # v2.1 — kompletní specifikace bodovacího/scrapovacího automatu
├── context.md                # MŮJ průběžný zápisník rozhodnutí k appce `prace` — ČTI HO
├── PROJECT_CONTEXT.md        # tento handoff balíček (tento soubor a dalších 6)
├── SESSION_SUMMARY.md
├── CURRENT_STATE.md
├── NEXT_STEPS.md
├── FILES_AND_MATERIALS.md
├── PROMPT_FOR_NEXT_MODEL.md
├── DO_NOT_CHANGE.md
├── eslint.config.mjs
├── next.config.ts             # cacheComponents VYPNUTO (vědomě)
├── package.json                # name "prace", Next.js/React/Supabase/zod závislosti
├── package-lock.json
├── postcss.config.mjs
├── tsconfig.json
├── job-agent/                 # SAMOSTATNÝ Node.js projekt uvnitř repozitáře, viz níž
└── src/                        # zdrojový kód appky `prace`, viz níž
```

### `src/` (appka `prace`)

```
src/
├── app/
│   ├── layout.tsx              # lang="cs", robots noindex v metadata
│   ├── globals.css             # Tailwind v4 @theme: --color-horsi/stejne/lepsi,
│   │                            #   --color-pasmo-vysoke/dobre/stredni/nizke
│   ├── robots.ts                # disallow all
│   ├── manifest.ts              # PWA manifest (NOVÉ)
│   ├── icon.tsx                  # favicon 32×32 přes ImageResponse (NOVÉ)
│   ├── icon-512/route.tsx        # manifest ikona 512×512 (NOVÉ, vlastní Route Handler,
│   │                              #   ne "icon" konvence — potřebovala jsem stabilní URL)
│   ├── page.tsx                  # SEZNAM — hlavní stránka
│   ├── prehled/page.tsx          # PŘEHLED — souhrnná čísla, žádné grafy
│   └── nabidky/[id]/
│       ├── page.tsx              # DETAIL
│       └── not-found.tsx
├── components/
│   ├── detail/  (HodnoceniBreakdown, HodnoceniItem, InzeratUryvek, OstatniUdaje,
│   │             StavSelect, PoznamkaTextarea, DatumReakceInput, ZpusobReakceInput)
│   ├── filters/ (FilterPanel, FilterChipLink, LokalitaInput, StitkyFilter)
│   ├── list/    (NabidkaListItem, SortToggle, ResultCount, QuickStavActions [NOVÉ])
│   └── ui/      (Badge.tsx — obsahuje i SkoreBadge/HodnoceniBadge, SaveStatus.tsx)
└── lib/
    ├── types.ts                  # enumy (Kriterium, StavNabidky, Zdroj, PracovniCesty) + labely
    ├── validation.ts              # zod schémata — VALIDACE hodnoceni (jsonb) při čtení
    ├── filters.ts                 # parseFilters, nabidkyQuery, buildHref, pásma skóre
    ├── format.ts                  # české formátování data/platu, dnesVPraze(), dnyMezi()
    ├── summary.ts                 # výpočty pro /prehled
    ├── actions/nabidky.ts          # VŠECHNY zápisy appky (Server Actions), anon klíč, zod
    └── supabase/
        ├── client.ts               # createSupabaseClient(), server-only, anon klíč
        └── database.types.ts       # vygenerované typy — REGENEROVAT po každé DB migraci
```

**Klíčová vazba:** `page.tsx`/`nabidky/[id]/page.tsx` čtou přímo přes `createSupabaseClient()`.
Zápisy jdou VŽDY přes `lib/actions/nabidky.ts` (Server Actions), nikdy ne přímo z komponent.
`database.types.ts` musí sedět se skutečným schématem DB — pokud přidáš/změníš sloupec, spusť
Supabase MCP `generate_typescript_types` a ručně ho promítni (přesný postup viz `context.md`).

### `job-agent/` (samostatný projekt, ne appka `prace`)

```
job-agent/
├── .gitignore                    # ignoruje data/probe/ a node_modules/
├── README.md                     # popisuje architekturu automatu, rozdělení zapisovatelů
├── config.json                   # brány, váhy bodovacího modelu (strojová podoba briefingu)
├── package.json                  # name "job-agent", scripts: sber/probe/test
│                                  #   POZOR: "test" skript má chybu v uvozovkách glob patternu,
│                                  #   viz DO_NOT_CHANGE.md / CURRENT_STATE.md "Známé chyby"
├── data/
│   ├── firmy.json                # export tabulky public.firmy
│   ├── nove.json                 # výstup posledního sběru
│   ├── posledni-beh.json
│   ├── probe-vysledek.json       # výstup posledního probe běhu
│   └── snapshots/*.json          # per-firma snapshoty pro diff mezi běhy
├── src/
│   ├── collect.mjs                # denní sběr, snapshoty, diff
│   ├── extract.mjs                 # obecné vytažení odkazů z HTML
│   ├── probe.mjs                    # diagnostika kariérních stránek
│   ├── scoring.mjs                  # čistá funkce, bodovací model + brány
│   └── parse-alert.mjs              # NOVÉ (tato session) — parser e-mailových alertů
└── test/
    ├── collect.test.mjs
    ├── scoring.test.mjs
    └── parse-alert.test.mjs         # NOVÉ — 11 testů
```

**Nezasahuj do `job-agent/` obsahu appkou `prace`** — appka `prace` s ním vůbec nepracuje (jiný
Node.js projekt, jiné závislosti, jiný účel). Pokud budeš pokračovat na `job-agent/`, čti napřed
`job-agent/README.md` a `briefing-job-agent.md`, ne jen tenhle handoff balíček (ten je psaný z
pohledu appky `prace`).

## Známé chyby / slabá místa

1. `job-agent/package.json` `"test": "node --test 'test/*.test.mjs'"` — uvozovky kolem glob
   patternu způsobí, že se na tomhle Windows/Node prostředí spustí 0 testů. Obchvat:
   `node --test test/*.test.mjs` (bez uvozovek, shell rozbalí glob sám). Neopraveno záměrně.
2. Veřejnost GitHub repozitáře neodpovídá tomu, co si uživatelka na začátku vyžádala (privátní) —
   viz „Co je potřeba zkontrolovat" výš.
3. Appka nemá žádné automatické testy (jen `tsc --noEmit` a `eslint`, oboje bez chyb k datu
   předání). `job-agent/` má 48 testů (`scoring`, `collect`, `parse-alert`).
