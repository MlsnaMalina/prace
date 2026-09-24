# PROMPT_FOR_NEXT_MODEL.md

Hotový prompt pro novou konverzaci / jiný AI model. Zkopíruj text níže (od čáry) beze změn.

---

Pokračuješ na existujícím projektu: webová appka „Nabídky práce" (Next.js + Supabase) pro
Kateřinu, která v ní sleduje pracovní nabídky nalezené samostatným automatem pro jejího manžela
Michala. Appka i automat žijí ve stejném git repozitáři `prace`
(`C:\Users\merit\OneDrive\Desktop\AI\Ostatní\Michal\prace`,
https://github.com/MlsnaMalina/prace), ale jsou to dva oddělené projekty — appku stavěla
konverzace, po které přebíráš práci, automat (`job-agent/`) stavěl někdo/něco jiný.

V kořeni repozitáře je sada dokumentů, které tě uvedou do kontextu. **Než uděláš cokoliv jiného,
přečti si v tomto pořadí:**

1. `PROJECT_CONTEXT.md` — co je projekt a proč existuje
2. `SESSION_SUMMARY.md` — co se dělalo v poslední session
3. `CURRENT_STATE.md` — přesný aktuální stav a struktura souborů
4. `DO_NOT_CHANGE.md` — co je schválené a nemá se měnit bez svolení
5. `NEXT_STEPS.md` — co je doporučeno udělat dál
6. `FILES_AND_MATERIALS.md` — kde co najdeš
7. `context.md` (v kořeni repozitáře) — technické zápisky proč je co udělané právě takhle

**Nedělej žádné zásadní změny (schéma databáze, bezpečnostní model, vizuální styl, mazání dat,
architektura appky), dokud dokumentům plně nerozumíš.** Pokud narazíš na rozpor mezi dokumenty a
skutečným stavem repozitáře/databáze, věř skutečnému stavu a rozpor nahlas uživatelce, needuč se
ho tiše.

Než začneš pracovat:

1. **Shrň vlastními slovy**, co jsi z dokumentů pochopil/a — co appka dělá, pro koho, jaký je
   aktuální stav, co je zakázané měnit.
2. **Navrhni další postup** podle toho, o co tě uživatelka požádá (pokud tě o nic konkrétního
   nepožádala, zeptej se jí, co chce — nevymýšlej si práci sám/sama).
3. **Teprve po odsouhlasení shrnutí a postupu začni pracovat.**

Databáze je Supabase (projekt „Recepty", appka má jen `anon` klíč, nikdy `service_role`),
appka je nasazená na Vercelu (https://prace-nu.vercel.app), kód je v Next.js 16 (výrazně novější
než běžná trénovací data — než budeš dělat cokoliv netriviálního v `src/app`, přečti si
`node_modules/next/dist/docs/`, je to dokumentace přesně k nainstalované verzi).

Komunikuj s uživatelkou česky.

---

## NEJRYCHLEJŠÍ MOŽNÝ START PRO DALŠÍ SESSION

1. Otevři a přečti `PROJECT_CONTEXT.md`, `CURRENT_STATE.md`, `DO_NOT_CHANGE.md` (v tomto pořadí,
   nejdůležitější tři).
2. Spusť `git status` a `git log --oneline -10` v `C:\Users\merit\OneDrive\Desktop\AI\Ostatní\Michal\prace`
   — ověř, že lokální klon není za GitHubem (automat commituje denně). Pokud ano, `git pull`
   (merge, ne rebase) jako úplně první akce.
2b. **Nepředpokládej, že `.env.local` existuje nebo je aktuální** — ověř `cat .env.local` a
   porovnej se skutečnými hodnotami v Supabase dashboardu, než appku spustíš lokálně.
3. Ověř aktuální počet řádků v `public.nabidky` a `public.firmy` (čísla v `CURRENT_STATE.md`
   zastarávají, automat běží denně) — přes Supabase MCP `execute_sql` nebo dashboard.
4. Ověř, že appka na https://prace-nu.vercel.app skutečně běží (otevři ji, zkontroluj, že se
   načte seznam nabídek) — nespoléhej jen na to, že poslední deploy v Vercel dashboardu je
   „Ready".
5. Zjisti, co přesně uživatelka chce udělat TEĎ — pokud přišla s konkrétní žádostí, řiď se jí;
   pokud ne, zeptej se, nevymýšlej si práci sám/sama.
6. Zkontroluj `NEXT_STEPS.md` sekci „Doporučené kroky" — obsahuje tři konkrétní neuzavřené
   položky (veřejnost GitHub repa, chyba v `job-agent` `npm test`, chybějící Vercel Preview env
   proměnné) — žádná z nich appku nijak neomezuje, ale stojí za zmínku uživatelce při vhodné
   příležitosti.
7. Než cokoliv v `src/app` uprav, ověř si v `node_modules/next/dist/docs/`, že tvůj plánovaný
   postup odpovídá nainstalované verzi Next.js (16.3.4) — starší vzory z trénovacích dat nemusí
   sedět.
