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

- **Rychlé akce „Zamítnout"/„Archivovat" přímo v seznamu** (22. 9. 2026) — appka nikdy nemazala
  a mazat nebude (nemá na to DB práva, viz výš); místo mazání jde nabídku v jednom kliku poslat
  do stavu, který výchozí filtr skrývá. `components/list/QuickStavActions.tsx`, volá stejnou
  `updateStav` akci jako detail, po uložení `router.refresh()`. Vědomě jen tyhle dva stavy (ne
  celé menu) — přesně ty dva, co dělají seznam nepřehledným.
- **PWA manifest + ikona** (22. 9. 2026) — `app/manifest.ts` + `app/icon.tsx` (favicon, 32×32) +
  `app/icon-512/route.tsx` (ikona pro manifest, 512×512, přes `ImageResponse` z `next/og`).
  Ikona: `#1f2937` pozadí, bílé „N". Umožňuje na Androidu „Přidat na plochu" s vlastním
  názvem/ikonou místo obecné záložky. Cesta `/icon-512` je vlastní Route Handler (ne speciální
  `icon.*` konvence) — potřebovala jsem stabilní URL, kterou můžu ručně odkázat z manifestu,
  zatímco `icon.tsx`/`icon` konvence generuje URL s hashem, který nejde dopředu znát.

## Nasazení

- Git identita nastavena globálně (`zlatenkak@gmail.com`) na tomhle počítači — dřív nebyla
  nastavená vůbec (ani jméno, ani e-mail).
- GitHub repozitář [github.com/MlsnaMalina/prace](https://github.com/MlsnaMalina/prace) založila
  uživatelka ručně (nemá nainstalované `gh` CLI).

## Hledání na tlačítko místo denního automatu (24. 9. 2026)

- **Denní automatický běh agenta zrušen, nahradilo ho tlačítko „HLEDEJ PRÁCI"** nahoře v seznamu
  (`components/list/HledejPraci.tsx`). Appka sama nic nestahuje ani nezapisuje — server action
  `lib/actions/hledani.ts` jen přes GitHub API nastartuje workflow `.github/workflows/hledani.yml`.
  Důvod je dvojí: funkce na Vercelu má limit řádově desítek sekund (slušné projití 80 firem trvá
  minuty) a appka zásadně nepracuje se `service_role` klíčem, který je k zápisu nabídek potřeba.
- **Tokeny z předplatného Clauda se nespotřebovávají vůbec.** Model se volá jedním dotazem na
  jeden inzerát přes Anthropic API (`claude-haiku-4-5`, klíč v GitHub Secrets), ne agentní
  smyčkou. Drahé na staré verzi nebyl briefing, ale to, že se ve smyčce s každým voláním nástroje
  posílal znovu celý rostoucí kontext.
- **E-mailové alerty se přestaly číst.** Alert obsahuje jen sledovací odkaz `track.jobs.cz`,
  který na stažení vrací 403, takže skutečnou URL bylo nutné dohledávat modelem — to byl ten
  drahý krok. Výpis `jobs.cz/prace/<lokalita>/?q[]=<slovo>` vrací tytéž nabídky jako obyčejné
  HTML včetně skutečné a stabilní URL `jobs.cz/rpd/<id>/`. `robots.txt` jobs.cz tuhle cestu
  nezakazuje (zakazuje `/api/`, `/iapi/`, `/muj/`), takže se nic neobchází. Alerty ať chodí dál
  jako lidská pojistka — nabídka, která přijde e-mailem a v appce není, znamená chybějící
  klíčové slovo v `job-agent/zdroje.json`.
- **Nová tabulka `public.behy`** — záznam o jednom běhu (kdy, odkud, kolik nalezeno / nových /
  zapsáno / k reakci / zbývá ve frontě). Stejný bezpečnostní model jako `nabidky`: `REVOKE` +
  `GRANT SELECT` pro `anon`/`authenticated`, zápis jen přes `service_role`. Appka z ní čte, aby
  uměla ukázat „Hledám…" a výsledek.
- **Nová hodnota `zdroj = 'portal'`** v `nabidky` (= výpis jobs.cz). Staré hodnoty zůstaly
  povolené kvůli už zapsaným řádkům. V appce přibyly i chybějící popisky `rucni_hledani` a
  `opakovane` (u `pracovni_cesty`) — DB je povolovala, appka pro ně neměla text.
- **Opraven tvar sloupce `hodnoceni`.** Appka přes zod validuje šest položek
  `{kriterium, stav, srazka, poznamka}`, ale dosavadní automat tam zapisoval vlastní tvar
  (`{polozky:[{nazev, body}]}`), takže detail nabídky rozpad hodnocení **nikdy nezobrazil** a u
  všech 50 řádků spadl na náhradní text. Nový zápis tvar dodržuje
  (`job-agent/src/hodnoceni-app.mjs`). Přirážky a srážky navíc se přičítají ke kritériu, kam
  věcně patří (procesy/BI, administrativa a „firma ze vzorku" k Náplni práce; kombinační
  pravidlo a pracovní cesty k Dojezdu), aby součet šesti řádků dával skóre. **Starých 50 řádků
  se to netýká — ty se rozpadu nedočkají, dokud se nepřepočítají.**
- **Fronta `job-agent/data/fronta.json`** — co se nestihlo vyhodnotit, zůstává ve frontě na
  příště. Jeden běh zpracuje nejvýš 100 inzerátů (`zdroje.json`), aby překlep v klíčovém slově
  neprotočil kredit. Denní `sber` frontu jen plní, nevyhodnocuje.
- **Rate limit tlačítka**: minimálně 10 min mezi běhy, max 12 běhů za 24 h, běh starší 45 min se
  přestane tvářit jako běžící. Appka běží na veřejné adrese bez přihlášení, takže tohle je
  jediná pojistka proti protočení kreditu klikáním.
- **Headless Chrome pro JS stránky.** Půlka inzerátů sedí na firemních mikrostránkách
  (`siemens.jobs.cz` a spol.), které obsah vykreslují JavaScriptem — obyčejný fetch z nich vrátí
  jen patičku. `stahni.mjs` proto při podezřele krátkém textu nechá stránku vykreslit Chromem
  (`--headless --dump-dom`); runner ho má předinstalovaný, takže to nepřidalo žádnou npm
  závislost. Doloženo: Siemens měl kvůli tomu v databázi skóre 40 s poznámkou „NENAČTENO",
  po vykreslení vychází 87 (inzerát nabízí 3 dny home officu).
- **Opravena chyba v `job-agent/package.json`**, kterou `DO_NOT_CHANGE.md` vedlo jako vědomě
  neopravenou: `"test": "node --test 'test/*.test.mjs'"` spouštěl 0 testů. Opraveno na
  `node --test`. Bez toho by krok „Testy" ve workflow byl jen naoko.
- **`data/firmy.json` se přestalo používat.** Rozešlo se s databází (64 firem a 8 kariérních URL
  proti 80 a 79), takže denní sběr reálně kontroloval osminu toho, co měl. Seznam firem se teď
  čte z tabulky `firmy`.
- **Dojezd se nepočítá** a zůstává u štítku „⚠ dojezd neověřen". Spočítat by ho šlo jen přes
  placené mapové API; briefing ho v sekci 4 uvádí jako nejméně důležité z šesti kritérií.
