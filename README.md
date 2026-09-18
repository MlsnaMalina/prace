# Nabídky práce

Webová appka, která zobrazuje pracovní nabídky nalezené automatem (běží mimo tuhle appku,
zapisuje nové nabídky do Supabase jednou denně) a nechá Kateřinu u nich měnit stav a poznámku.
Appka nabídky nezapisuje, nescrapuje, neimportuje — jen čte a edituje `stav`/`poznamka`.

## Databáze

**Důležité:** tabulka `nabidky` nemá vlastní Supabase projekt. Kvůli limitu 2 aktivních
projektů zdarma žije uvnitř projektu **„Recepty"** (`mjeqymqobpijsskcyjor`), vedle jeho
vlastních tabulek (`recipes`, `shopping_items`, …). Je to úplně izolovaná tabulka s vlastními
právy přístupu (viz `supabase/migrations/`) — appka Recepty ji nevidí a naopak. Když se místo
uvolní (zruší/upgraduje se jiný projekt), dá se `nabidky` kdykoli přesunout do vlastního
projektu migrací `pg_dump`/`pg_restore` na stejné schéma.

Přístupový model: Row Level Security zapnuté, appka čte přes veřejný (anon/publishable) klíč.
Zapisovat smí **jen** do sloupců `stav` a `poznamka` — vynuceno na úrovni databáze (column-level
grant + REVOKE širších práv), ne jen v kódu appky. Automat, který nabídky zapisuje, používá jiný
(service_role) klíč, který tahle omezení obchází.

## Nastavení proměnných prostředí

1. Zkopírujte `.env.example` jako `.env.local`.
2. V Supabase dashboardu otevřete projekt **Recepty** → Project Settings → Data API — zkopírujte
   URL do `SUPABASE_URL`.
3. Tamtéž → API Keys — zkopírujte klíč označený **anon / public / publishable** (nikdy ne
   `service_role`/`secret`) do `SUPABASE_ANON_KEY`.

Appka tyhle proměnné čte jen na serveru (Server Components, Server Actions) — žádný klíč se
nedostane do prohlížeče, proto nejsou s předponou `NEXT_PUBLIC_`.

## Spuštění lokálně

```bash
npm install
npm run dev
```

Aplikace poběží na `http://localhost:3000`.

## Nasazení na Vercel

1. Repozitář je propojený s [github.com/MlsnaMalina/prace](https://github.com/MlsnaMalina/prace).
2. Ve Vercelu naimportujte tenhle GitHub repozitář jako nový projekt.
3. V Project Settings → Environment Variables nastavte `SUPABASE_URL` a `SUPABASE_ANON_KEY`
   (stejné hodnoty jako v `.env.local`).
4. Každý push do `main` se nasadí automaticky.

## Testovací data

`supabase/seed.sql` obsahuje 8 ukázkových nabídek pro vyzkoušení rozhraní — nejde o skutečné
nabídky. Poznáte je podle `url` (`https://example.com/seed/...`). Smazat je jde kdykoli:

```sql
delete from public.nabidky where url like 'https://example.com/seed/%';
```

## Soukromí appky

Appka běží na neveřejné, nikde nesdílené URL a v první verzi nemá přihlašování — `robots.ts`
jen brání indexaci vyhledávači, **není to skutečná ochrana přístupu**. Kdokoli se znalostí URL
by se dostal dovnitř. Autentizace se přidá v další verzi.
