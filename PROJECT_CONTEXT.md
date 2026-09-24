# PROJECT_CONTEXT.md

Hlavní orientační dokument. Přečti tento soubor jako první.

## Název projektu a repozitář

- Repozitář: **`prace`** — https://github.com/MlsnaMalina/prace (větev `main`)
- Živá appka: **https://prace-nu.vercel.app**
- Lokální kopie na tomhle počítači: `C:\Users\merit\OneDrive\Desktop\AI\Ostatní\Michal\prace`
- Vercel projekt: `prace` ve scope `mlsnamalinas-projects`, propojený s GitHubem — každý push
  do `main` se automaticky nasadí.

**Repozitář obsahuje DVA oddělené, ale spolupracující celky:**

1. **`prace`** (kořen repozitáře, `src/`, `supabase/`) — webová appka v Next.js, kterou Kateřina
   používá k prohlížení a třídění nabídek. Tohle je to, co jsem (tato session) primárně stavěla.
2. **`job-agent/`** (podsložka) — samostatný Node.js automat, který jednou denně (GitHub Action
   `.github/workflows/sber.yml`, 5:40 UTC) prochází e-mailové alerty a kariérní stránky, boduje
   nabídky a zapisuje je do stejné Supabase databáze. **Tenhle automat stavěla/staví jiná
   session/proces** — já jsem do něj zasahovala jen okrajově (oprava rozházeného commitu,
   spuštění workflow na vyžádání). Podrobnosti k logice bodování jsou v
   `briefing-job-agent.md` (verze 2.1) a `job-agent/config.json`.

Obě části sdílejí jednu Supabase databázi (projekt „Recepty", viz níž) a jeden git repozitář,
ale mají striktně oddělené pravomoci nad daty — viz sekci „Rozdělení pravomocí nad daty" níž.

## Kdo je uživatel a proč appka vznikla

- Uživatelka: **Kateřina** (git author `zlatenkak@gmail.com`, GitHub účet `MlsnaMalina`).
- Appku staví pro svého manžela **Michala Mlsnu** — hledá mu novou práci (controlling/finanční
  řízení), protože jeho současný zaměstnavatel (CzechInvest) k 1. 1. 2027 zaniká sloučením do
  CzechBusiness.
- Michalův současný hrubý plat: **55 000 Kč/měsíc** — používej jako výchozí srovnávací hodnotu,
  pokud bys někdy potřeboval/a vymýšlet ukázková data nebo hodnotit, jestli je nabízený plat lepší
  nebo horší než současný.
- Kateřina komunikuje **česky** a chce, aby appka (i moje odpovědi v konverzaci) byly česky.

## Cíl appky `prace`

Zobrazit nabídky, které automat (`job-agent`) našel a nabodoval, a umožnit Kateřině u nich:
- třídit/filtrovat podle skóre, stavu, home office, pružné doby, pracovních cest, platu, lokality,
  štítků,
- na první pohled vidět, čím je nabídka horší/stejná/lepší než Michalova současná práce (6 pevně
  daných kritérií),
- měnit **jen** dva/čtyři sloupce: `stav`, `poznamka` (+ později přidané `datum_reakce`,
  `zpusob_reakce`) — nic víc appka do databáze nezapisuje.

**Appka NENÍ scraper, NENÍ import nástroj a nikdy nezapisuje nové nabídky ani je nemaže.** To je
úmyslné a vynucené na úrovni databáze (viz `DO_NOT_CHANGE.md`).

## Cílové prostředí uživatelky

- Windows 11, PowerShell (ne macOS/Linux příkazy).
- Telefon **Android** (Chrome) — appka musí být použitelná na šířce ~375–390 px, appka teď má i
  PWA manifest pro „Přidat na plochu".
- Uživatelka se označuje jako neprogramátorka v obecných pokynech, ale sama píše velmi přesné a
  technické zadání (schémata databází, JSON struktury) — neber to jako důvod cokoliv
  zjednodušovat bez zeptání, ale technické kroky (příkazy do terminálu) jí vysvětluj krok za
  krokem, ne najednou.

## Vizuální a textový styl (závazné)

- Čeština všude v UI appky, správná diakritika, typografické uvozovky „ " ve viditelném textu.
- **V JS/TS/JSON stringech nikdy typografické uvozovky uvnitř `"..."` literálů** — používej
  jednoduché uvozovky nebo template literals. Tohle už v minulosti (jiné projekty uživatelky)
  rozbilo build.
- Vizuálně **zdrženlivě a neutrálně**: žádné fialové/gradientové hero sekce, žádné kulaté karty se
  stíny, žádné béžové/krémové pozadí (nikdy), žádná emoji v UI, které appka sama generuje (emoji
  přicházející jako DATA z automatu — např. „⚠ plat neuveden" — jsou v pořádku, to je obsah, ne
  moje rozhodnutí).
- Barevné odlišení skóre pásem a horší/stejné/lepší je **funkční požadavek**: vždy barva **a**
  textový popisek zároveň, nikdy jen barva.
- Uživatelka řekla výslovně, že si vzhled chce doladit sama — appka je „sober baseline", ne
  hotový design návrh. Nepřidávej vlastní vizuální nápady navíc bez zeptání.

## Co appka výslovně NEDĚLÁ (a neměla by)

- Nescrapuje, needitovat/nezapisuje nové nabídky, nemaže je (viz `job-agent` sekce výš).
- Nemá grafy ani plnou statistiku — jen stránka `/prehled` s čistými čísly (kompromis, viz
  `SESSION_SUMMARY.md`).
- Nemá autentizaci (vědomě odloženo na později).
- Nemá funkci mazání nabídek — uživatelka se na to ptala, navrhla jsem rychlé „Zamítnout" /
  „Archivovat" místo mazání a ona to schválila. Nezaváděj mazání, dokud o to výslovně nepožádá.

## Rizika a omezení, o kterých je třeba vědět

- **Next.js 16.3.4** je nainstalované — výrazně novější než běžná trénovací data většiny modelů,
  včetně nového nepovinného cache modelu „Cache Components" (vědomě nezapnutého). Než cokoliv
  netriviálního měníš v `src/app`, přečti si `node_modules/next/dist/docs/` (nainstalováno
  lokálně, je to aktuální dokumentace přesně k této verzi).
- **`job-agent/` má vlastní commit historii přes automatické GitHub Action běhy** (`sber: YYYY-MM-DD`
  commity) — lokální klon rychle zastarává. Vždy `git pull` (merge, ne rebase) před jakoukoli prací
  a před pushem.
- Databázová tabulka `nabidky` **nemá vlastní Supabase projekt** — sdílí projekt „Recepty" s jinou
  appkou uživatelky kvůli limitu 2 aktivních free projektů. Netýkej se tabulek `recipes`,
  `recipe_notes`, `cook_events`, `shopping_items`, `_healthcheck` v tomtéž projektu.
