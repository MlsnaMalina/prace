# Rozhodnutí k projektu

Průběžný zápisník rozhodnutí, ať budoucí session nezačínají od nuly. Detailní plán viz
`C:\Users\merit\.claude\plans\calm-wishing-barto.md` (schválený plán před začátkem psaní kódu).

## Databáze

- **Tabulka `nabidky` žije v Supabase projektu „Recepty" (`mjeqymqobpijsskcyjor`), ne ve
  vlastním projektu.** Důvod: účet má limit 2 aktivních projektů zdarma, oba sloty (matysek,
  Recepty) byly obsazené a uživatelka nechtěla žádný pozastavit. Je to plně izolovaná tabulka
  (vlastní RLS politiky, vlastní granty) — nijak nekoliduje s tabulkami appky Recepty. Pokud se
  v budoucnu uvolní/koupí místo, lze `nabidky` přesunout do vlastního projektu (dump/restore).
- **`pracovni_cesty`** je oproti doslovnému zadání `NOT NULL DEFAULT 'neuvedeno'` místo
  nullable `text`. Sloupec už měl ve výčtu hodnotu `'neuvedeno'` pro „nezjištěno" — nullable
  varianta by vytvořila dvě různé reprezentace „nevím" (`NULL` i `'neuvedeno'`), na které by
  musel pamatovat každý filtr zvlášť. Typ a ostatní sloupce beze změny oproti zadání.
- **Zápisová práva appky jsou vynucená na úrovni DB**, ne jen v kódu: `REVOKE` širších práv,
  která Supabase nově vytvořeným tabulkám standardně přidělí pro `anon`/`authenticated`, a pak
  `GRANT UPDATE (stav, poznamka)` — sloupcový grant. Bez toho REVOKE by byl sloupcový grant jen
  kosmetický (práva v Postgresu se sčítají). Ověřeno dotazem do `information_schema` po nasazení
  migrace. Appka i tak čte/zapisuje výhradně přes anon/publishable klíč — nikdy přes
  service_role (ten by RLS i granty obcházel úplně).
- Automat, který nabídky zapisuje (běží mimo tuhle appku), se předpokládá napojený přes
  service_role klíč — proto ho výše popsaná omezení neovlivní.

## Aplikace

- **Next.js 16** (nainstalováno jako "latest" v září 2026) — výrazně novější než trénovací data,
  včetně nového modelu cache "Cache Components". Vědomě **nezapnuto**
  (`cacheComponents` v `next.config.ts` zůstává výchozí/vypnuté) — pro appku s dynamickými daty
  na jednoho uživatele by jen přidalo komplexitu (nutnost `<Suspense>` kolem každého čtení
  `searchParams`/`params`) bez reálného přínosu. Používá se starší, jednodušší model:
  `fetch`/dotazy se necachují defaultně, `revalidatePath` po zápisu stačí.
- **Žádný `@supabase/ssr`** — appka nemá auth, takže není potřeba cookie-based session mezi
  klientem a serverem. Obyčejný `@supabase/supabase-js` `createClient()` na serveru stačí. Až
  přibude přihlašování, přechod na `@supabase/ssr` je samostatný, dobře zdokumentovaný krok.
- **`createClient<Database, { PostgrestVersion: "14.5" }>(...)`** — s nainstalovanou verzí
  `@supabase/supabase-js` (2.116.0) samotné `createClient<Database>(...)` bez druhého generického
  parametru způsobovalo rozsáhlé, nesrozumitelné TS chyby (generika `SchemaNameOrClientOptions`
  se nevyhodnotila, jak dokumentační komentář ve vygenerovaných typech sliboval). Explicitní
  druhý parametr `{ PostgrestVersion: "14.5" }` to opravuje.
- Filtry a řazení řešené čistě přes URL search parametry, žádný klientský stav — jde
  sdílet/uložit jako odkaz, počet „kolik nabídek projde" je prostě délka vyfiltrovaného pole.
- Poznámka se ukládá při opuštění pole **a** se zpožděným automatickým uložením (1,5 s po
  poslední klávese), ať se neztratí při odchodu ze stránky jinak než kliknutím mimo pole.
- Seed data (`supabase/seed.sql`) mají `url` vždy `https://example.com/seed/...` — snadno
  odlišitelné a smazatelné, až začnou chodit skutečná data z automatu.
- **Doplněné sloupce `datum_reakce`** (date, nullable) a **`zpusob_reakce`** (text, nullable) —
  přidáno na žádost uživatelky až za chodu (10. 9. 2026), mimo původní zadání schématu. Stejný
  režim jako `stav`/`poznamka`: edituje se jen z appky, appka na ně má column-level GRANT navíc.
  `datum_reakce` = kdy odešel životopis, `zpusob_reakce` = odkud/jak (e-mail, formulář…), aby šlo
  později dohledat, ke které nabídce patří došlá odpověď. Zobrazují se v detailu (společný blok
  „Reakce") a `datum_reakce` navíc jako poznámka v seznamu, když je vyplněné.
- **Stránka `/prehled`** — přidána na žádost uživatelky (chtěla „dashboard", původní zadání ho
  vylučovalo — domluveno jako kompromis: žádné grafy, jen čísla). Ukazuje celkový počet, nové za
  posledních 7 dní, rozpis podle stavu a počet nabídek bez reakce déle než 7 dní (aktivní stav —
  nový/k zvážení — bez `datum_reakce`). Práh 7 dní je natvrdo v `lib/summary.ts`
  (`DNI_BEZ_REAKCE_PRAH`). Stejný „bez reakce" výpočet se používá i pro malé upozornění přímo u
  položky v seznamu (`components/list/NabidkaListItem.tsx`). Datum „dnes" se počítá podle
  pražského kalendářního dne (`lib/format.ts` `dnesVPraze`), ne podle časové zóny serveru.

## Nasazení

- Git identita nastavena globálně (`zlatenkak@gmail.com`) na tomhle počítači — dřív nebyla
  nastavená vůbec (ani jméno, ani e-mail).
- GitHub repozitář [github.com/MlsnaMalina/prace](https://github.com/MlsnaMalina/prace) založila
  uživatelka ručně (nemá nainstalované `gh` CLI).
