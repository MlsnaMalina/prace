# NEXT_STEPS.md

Appka `prace` je k datu předání funkčně hotová — všechny zadané a schválené požadavky jsou
implementované, otestované a nasazené. Tenhle seznam je proto krátký a záměrně neobsahuje vymyšlené
„vylepšení" — jen skutečně známé, konkrétní věci.

## Nutné kroky

Žádné. Appka funguje, nic neblokuje běžné používání. Pokud tenhle dokument čte model, který
navazuje bez konkrétního nového zadání od uživatelky, **nejlepší první krok je zeptat se jí, co
chce dál** — ne vymýšlet práci sám od sebe.

## Doporučené kroky

### 1. Ověřit, jestli má být GitHub repozitář veřejný

- **Co přesně udělat:** Otevřít https://github.com/MlsnaMalina/prace/settings (nebo se zeptat
  uživatelky) a zjistit skutečný stav (Public/Private). Pokud je Public a mělo být Private,
  přepnout a probrat s uživatelkou dopad na `sber.yml` (komentář v souboru počítá s tím, že
  veřejný repozitář = zdarma GitHub Actions minuty — u privátního repa může být potřeba platit
  nebo sledovat limit).
- **Proč je to důležité:** Uživatelka na začátku výslovně chtěla privátní repozitář. Rozpor mezi
  tím a aktuálním stavem nebyl nikdy vysvětlen ani odsouhlasen.
- **Kde pracovat:** GitHub nastavení repozitáře (ne appka, ne kód).
- **Jak poznáme hotovo:** Uživatelka potvrdí, že aktuální nastavení (public/private) je to, co
  chce, případně je přepnuto a `sber.yml` odpovídá zvolenému stavu.

### 2. Opravit (nebo vědomě ponechat) chybu v `job-agent` `npm test`

- **Co přesně udělat:** V `job-agent/package.json` změnit
  `"test": "node --test 'test/*.test.mjs'"` na `"test": "node --test test/*.test.mjs"`
  (odstranit uvozovky) — NEBO se zeptat uživatelky/správce `job-agent`, jestli to chtějí opravit
  sami, protože je to mimo appku `prace`.
- **Proč je to důležité:** `npm test` teď tiše ukáže „0 testů, 0 chyb", což vypadá jako úspěch,
  ale ve skutečnosti nic neotestuje. Kdokoliv spustí `npm test` bez vědomí o téhle chybě dostane
  falešný pocit jistoty.
- **Kde pracovat:** `job-agent/package.json`, řádek `"test"` ve `"scripts"`.
- **Jak poznáme hotovo:** `cd job-agent && npm test` (bez ručního obcházení uvozovek) ukáže
  správný počet testů (aktuálně 48) a `pass: 48`.

### 3. Nastavit Vercel Preview environment proměnné

- **Co přesně udělat:** `vercel env add SUPABASE_URL preview --value "https://mjeqymqobpijsskcyjor.supabase.co" --yes`
  a totéž pro `SUPABASE_ANON_KEY` (hodnotu najdi v `.env.local` nebo Supabase dashboardu, NIKDY
  ji nezapisuj do žádného commitovaného souboru). Minule (v této session) selhávalo
  `vercel env add ... preview --value ... --yes` s chybou vyžadující git branch — zkus to znovu,
  možná to byl dočasný CLI bug, případně nastav ručně přes Vercel dashboard
  (Project Settings → Environment Variables).
- **Proč je to důležité:** Bez toho by Vercel Preview nasazení (např. z pull requestu nebo jiné
  větve) nefungovalo — appka by na Preview URL nemohla číst databázi.
- **Kde pracovat:** Vercel CLI nebo dashboard, ne kód.
- **Jak poznáme hotovo:** `vercel env ls` ukazuje `SUPABASE_URL` a `SUPABASE_ANON_KEY` i pro
  Preview prostředí.

## Volitelné kroky

### 4. Zeptat se uživatelky, jestli chce appku dál rozvíjet

Appka odpovídá všemu, o co byla dosud požádána. Typické další směry (NEDĚLAT bez výslovné
žádosti, jen pro orientaci, co by mohlo přijít):

- Mazání skutečně nechtěných/duplicitních nabídek (výslovně odloženo, viz `DO_NOT_CHANGE.md`).
- Autentizace (appka v1 ji vědomě nemá).
- Vlastní grafické ladění appky (uživatelka řekla, že si vzhled chce upravit sama).
- Přesun tabulky `nabidky` do vlastního Supabase projektu, pokud se uvolní/koupí místo (dnes
  sdílí projekt „Recepty").

### 5. Zvážit vlastní ikonu/branding místo generované

- **Co přesně udělat:** Pokud uživatelka bude chtít propracovanější ikonu než programově
  generované bílé „N" na tmavém pozadí (`src/app/icon.tsx`, `src/app/icon-512/route.tsx`),
  nahradit obsah těchto souborů (nebo přidat statický obrázek dle konvence Next.js — viz
  `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/app-icons.md`).
- **Proč je to důležité:** Současná ikona je funkční, ale je to nejjednodušší možné řešení, ne
  navržený branding.
- **Kde pracovat:** `src/app/icon.tsx`, `src/app/icon-512/route.tsx`, `src/app/manifest.ts`.
- **Jak poznáme hotovo:** Uživatelka potvrdí, že nová ikona/branding je to, co chtěla.
