# FILES_AND_MATERIALS.md

Kde co najdeš — v repozitáři, na tomhle počítači i mimo něj.

## 1. Git repozitář `prace` (hlavní zdroj pravdy pro kód)

- Lokálně: `C:\Users\merit\OneDrive\Desktop\AI\Ostatní\Michal\prace`
- Vzdáleně: https://github.com/MlsnaMalina/prace, větev `main`
- Kompletní strukturu viz `CURRENT_STATE.md` — neopakuji ji tady celou, jen shrnutí důležitosti.

### Hlavní soubory (čti jako první, v tomhle pořadí)

| Soubor | K čemu slouží |
|---|---|
| `PROJECT_CONTEXT.md` | Orientace v projektu — čti první |
| `context.md` | Můj průběžný zápisník technických rozhodnutí k appce `prace` (proč je věc udělaná právě takhle) |
| `SESSION_SUMMARY.md` | Co se dělo v této session |
| `CURRENT_STATE.md` | Přesný technický stav, struktura souborů |
| `briefing-job-agent.md` | Specifikace automatu `job-agent` (v2.1) — čti, pokud budeš pracovat na `job-agent/`, ne na appce `prace` |
| `README.md` | Návod na nastavení env proměnných a nasazení appky `prace` |
| `job-agent/README.md` | Totéž pro `job-agent/` |

### Zdrojové soubory appky `prace` (edituj podle potřeby, viz `DO_NOT_CHANGE.md`)

Vše pod `src/` — viz strom v `CURRENT_STATE.md`. Toto je appka, kterou jsem stavěla.

### Zdrojové soubory `job-agent/` (edituj JEN pokud tě o to výslovně požádají)

Vše pod `job-agent/src/`, `job-agent/test/`, `job-agent/config.json`. Tohle je cizí projekt v
rámci stejného repozitáře — nemám nad jeho logikou plnou kontrolu ani historii rozhodnutí (tu
najdeš případně v `briefing-job-agent.md` nebo u té session, co ho stavěla).

### Výstupní/generované soubory (NEEDITOVAT ručně, přepisují se automaticky)

| Soubor/složka | Kdo/co ho generuje |
|---|---|
| `src/lib/supabase/database.types.ts` | Supabase MCP `generate_typescript_types` — regenerovat po změně DB schématu, needitovat ručně |
| `job-agent/data/nove.json`, `posledni-beh.json`, `probe-vysledek.json`, `snapshots/*.json`, `firmy.json` | `job-agent` skripty (`collect.mjs`, `probe.mjs`) přes GitHub Action `sber.yml` — přepisují se každý den automaticky |
| `.next/`, `node_modules/`, `tsconfig.tsbuildinfo` | Build artefakty, negitované, mažou se bezpečně |

### Konfigurace prostředí (citlivé — NIKDY do gitu)

- `.env.local` — **existuje lokálně, NENÍ v gitu** (viz `.gitignore`). Obsahuje skutečné
  `SUPABASE_URL` a `SUPABASE_ANON_KEY`. Pokud ho nemáš (nová session, nový počítač), hodnoty
  najdeš:
  - v Supabase dashboardu, projekt „Recepty" (`mjeqymqobpijsskcyjor`) → Project Settings →
    Data API (URL) a API Keys (klíč označený anon/public/publishable),
  - nebo se zeptej uživatelky, poslala je už jednou přímo v konverzaci.
- `.env.example` — šablona jen s názvy proměnných, bezpečná pro commit.
- Vercel Environment Variables — nastaveno pro Production a Development, chybí Preview
  (viz `NEXT_STEPS.md` bod 3).

## 2. Supabase (databáze, mimo git)

- Organizace: „Katerina" (`nbipmfabdzylwvbtxpkw`), jediná dostupná.
- Projekt používaný appkou `prace`: **„Recepty"** (`mjeqymqobpijsskcyjor`), region `eu-central-1`.
  - Tabulka `nabidky` (data appky `prace`) — schéma viz `context.md` a `CURRENT_STATE.md`.
  - Tabulka `firmy` (data `job-agent`) — appka `prace` ji nečte ani nezapisuje.
  - Ostatní tabulky (`recipes`, `recipe_notes`, `cook_events`, `shopping_items`, `_healthcheck`)
    patří JINÉ appce uživatelky (Recepty) — nedotýkat se jich.
- Přístup: přes Supabase MCP nástroje (pokud je máš k dispozici) nebo přes
  https://supabase.com/dashboard (uživatelčin účet).

## 3. Nasazení (mimo git)

- GitHub: https://github.com/MlsnaMalina/prace — účet `MlsnaMalina` (uživatelčin).
- Vercel: projekt `prace`, scope `mlsnamalinas-projects`, uživatelčin účet (`mlsnamalina`),
  CLI byl v této session přihlášený a funkční (`vercel whoami` → `mlsnamalina`).
- Produkční URL: https://prace-nu.vercel.app

## 4. Materiály MIMO tento git repozitář (v nadřazené složce)

Cesta: `C:\Users\merit\OneDrive\Desktop\AI\Ostatní\Michal\` (o úroveň výš než `prace/`). Tohle
jsou Michalovy osobní podklady pro hledání práce, NEJSOU součástí appky ani gitu:

- `CV-Michal-Mlsna.pdf`, `text-CV.txt` — Michalův životopis.
- `motivacni-dopis-ASEKOL.docx` — vzorový motivační dopis.
- `ASEKOL Brandova prirucka.html`, `SENIOR FINANCE CONTROLLER_KA - Detail pozice...html`,
  `Zivotopis Michal Mlsna - ASEKOL.html`, `job_text.txt` — reference k jednomu konkrétnímu
  inzerátu (ASEKOL), použité jako vzor při psaní briefingu.
- `Claude outputs/` — dřívější verze plánovacích dokumentů:
  - `briefing-job-agent.md` (starší verze — **aktuální je ta v repozitáři**,
    `prace/briefing-job-agent.md`, verze 2.1),
  - `dotaznik-michal.md` — dotazník ověřující Michalovy preference,
  - `firmy-seznam.md` — ruční seznam firem k sledování (základ pro tabulku `firmy`),
  - `prompt-claude-code.md` — pravděpodobně původní zadávací prompt pro appku.

**Nejisté:** nekontrolovala jsem, jestli je obsah `Claude outputs/briefing-job-agent.md` totožný
s `prace/briefing-job-agent.md` v2.1, nebo starší. Při rozporu **věř verzi v repozitáři**
(`prace/briefing-job-agent.md`) — ta je aktivně udržovaná a commitovaná.

## 5. Materiály zmíněné, ale jejich přesné umístění NEZNÁM (chybějící informace)

- **`job-agent.zip` / `job-agent_1.zip`** — uživatelka je měla ve složce Stažené soubory
  (`C:\Users\merit\Downloads\`) k 20. 9. 2026. Použila jsem je jednorázově k rekonstrukci a
  doplnění `job-agent/`. Nevím, jestli tam ještě jsou, ani jestli existuje novější verze.
- **Zdroj/autor `job-agent/` kódu** — nevím jistě, jestli ho psala uživatelka sama, jiná AI
  session, nebo kombinace. Historie commitů (`Add files via upload`, pak moje reorganizace)
  jasně neukazuje autora, jen že vznikl mimo tuto konverzaci.
- **Přesný obsah `job-agent/config.json`** (váhy bodovacího modelu) jsem nekontrolovala do
  detailu v této fázi — při práci na bodování ho nejdřív načti a porovnej s
  `briefing-job-agent.md` sekcí 7.

## Doporučení, kam zasahovat a kam ne

- **Volně edituj:** `src/` (appka `prace`), `supabase/seed.sql`, `context.md`, `README.md`
  appky `prace`.
- **Edituj opatrně, s vědomím dopadu:** `next.config.ts`, `package.json` (kořenový — appka
  `prace`), DB migrace (vždy přes Supabase MCP `apply_migration`, ne ruční SQL bez rozmyslu).
- **Needituj bez výslovné žádosti:** cokoliv v `job-agent/` (je to cizí projekt ve stejném
  repozitáři), `job-agent/data/*` (přepisuje se automaticky), `database.types.ts` (generovaný).
- **Nikdy needituj/negeneruj ručně:** `.env.local` obsah nekopíruj nikam jinam, needituj `.git/`
  interní soubory přímo (kromě nouzového smazání prokazatelně zaseklého lock souboru).
