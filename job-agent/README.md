# job-agent — sběrná a bodovací část

Všechno, co jde spočítat, se počítá tady. Model dostane jen to, co spočítat nejde.

## Co se změnilo ve verzi 2 (24. 9. 2026)

Hledání se už nespouští samo každý den. Spouští ho **tlačítko HLEDEJ PRÁCI**
v appce, které přes GitHub API nastartuje workflow `.github/workflows/hledani.yml`.

Zároveň se přestal používat agentní běh v Claudovi. Ten byl drahý ne kvůli délce
briefingu, ale proto, že **v agentní smyčce se s každým voláním nástroje posílá
znovu celý dosavadní kontext** — třicet volání znamenalo třicet kopií rostoucího
kontextu. Tady žádná smyčka není: jeden dotaz na jeden inzerát, jedna odpověď.

| | verze 1 | verze 2 |
|---|---|---|
| kdo objevuje inzeráty | e-mailové alerty, čte je model | výpis jobs.cz, čte ho `jobscz.mjs` |
| kdo dohledává skutečnou URL | model (`WebSearch` + `WebFetch`) | nikdo — výpis ji rovnou má |
| kdo čte inzerát | model | `stahni.mjs` (fetch, u JS stránek headless Chrome) |
| kdo vytahuje plat, HO, cesty | model | `extrakce.mjs`, zadarmo |
| co dostane model | briefing + všechny stránky + všechny inzeráty | text jednoho inzerátu |
| co model vrací | všechno | tři úsudková pole a doplnění děr |
| tokeny z předplatného Clauda | všechny | **žádné** |

## Jak běh vypadá

```
1. výpis jobs.cz + kariérní stránky firem     zadarmo
2. odstranění duplicit proti databázi         zadarmo   (sekce 9.1)
3. platová brána ze štítku ve výpisu          zadarmo   (sekce 6, brána 1)
4. stažení textu inzerátu                     zadarmo
5. vytažení platu, HO, pružné doby, cest      zadarmo   (sekce 10.2, doslovné citace)
6. posudek modelu                             JEDINÝ PLACENÝ KROK
7. bodování a zápis do Supabase               zadarmo   (sekce 7)
```

Pořadí není náhodné — model se volá až na to, co přežilo všechny bezplatné filtry.

### Dva režimy

- `npm run hledej` — plný běh. Tohle spouští tlačítko v appce.
- `npm run sber` — jen posbírá, co je nového, a uloží do `data/fronta.json`.
  Nevolá model, nezapisuje nabídky. Běží každé ráno sám, aby neutekl inzerát,
  který vyjde a stáhnou ho dřív, než uživatelka tlačítko stiskne.

## Proč jobs.cz místo e-mailových alertů

Alert má v sobě jen sledovací odkaz `track.jobs.cz/...`, který na automatizované
stažení vrací HTTP 403. Skutečnou URL — nutnou pro odstranění duplicit i pro
přečtení plného znění — šlo dohledat jen modelem. To byl ten drahý krok.

Výpis `https://www.jobs.cz/prace/praha/?q[]=controlling` vrací tytéž nabídky
jako běžné HTML: název, firmu, lokalitu, datum vypsání, štítky benefitů, někdy
i plat, a hlavně **skutečnou a stabilní URL** `https://www.jobs.cz/rpd/<id>/`.

Sekce 5.3 briefingu se tím neporušuje. `robots.txt` jobs.cz zakazuje `/api/`,
`/iapi/`, `/muj/` a další — výpis nabídek mezi nimi není. Stahuje se jako běžná
stránka, s pravdivým User-Agentem a s pauzou 1,5 s mezi dotazy. Nic se neobchází.

E-mailové alerty ať klidně chodí dál. Nikdo je nečte, ale jsou levná lidská
pojistka: nabídka, která přijde e-mailem a v appce není, je signál, že v
`zdroje.json` chybí klíčové slovo.

## Proč headless Chrome

Zhruba polovina inzerátů na jobs.cz nesedí na `www.jobs.cz`, ale na firemní
mikrostránce (`siemens.jobs.cz`, `skoda-auto.jobs.cz`, …), která obsah vykresluje
JavaScriptem. Obyčejné stažení z nich vrátí 700–1 200 znaků patičky.

Doloženo na skutečném řádku v databázi: Siemens měl `inzerat_uryvek` = „NENAČTENO
(siemens.jobs.cz)" a skóre **40**, protože se home office bodoval jako neuvedený.
Po vykreslení je z inzerátu 7 900 znaků, stojí v něm „3 dny home office" a skóre
vychází na **87**. Přesně takhle utíkaly dobré nabídky.

`stahni.mjs` proto zkusí obyčejný fetch, a když je výsledek podezřele krátký,
nechá stránku vykreslit Chromem (`--headless --dump-dom`). GitHub runner
ubuntu-latest má Chrome předinstalovaný.

## Soubory

| soubor | co dělá | závisí na síti |
|---|---|---|
| `src/hledej.mjs` | celý běh, oba režimy | ano |
| `src/jobscz.mjs` | rozpad výpisu jobs.cz na jednotlivé nabídky | ne |
| `src/stahni.mjs` | stažení stránky, u JS stránek vykreslení Chromem | ano |
| `src/text.mjs` | HTML → text, hledání doslovných vět | ne |
| `src/extrakce.mjs` | plat, home office, pružná doba, cesty, příznaky | ne |
| `src/model.mjs` | jediný placený krok — posudek inzerátu | ano |
| `src/scoring.mjs` | brány a bodovací model (sekce 6 a 7) | ne |
| `src/hodnoceni-app.mjs` | převod bodování do tvaru, který čte appka | ne |
| `src/supabase.mjs` | zápis do `nabidky`, `firmy`, `behy` | ano |
| `src/extract.mjs` | odkazy na inzeráty z HTML kariérní stránky | ne |
| `config.json` | váhy bodovacího modelu (sekce 6–8 briefingu) | — |
| `zdroje.json` | kde se hledá: lokality, klíčová slova, limity | — |

**Nepoužívané, ponechané k rozhodnutí:** `src/collect.mjs` (starý denní sběr,
četl `data/firmy.json`, které se rozešlo s databází) a `src/parse-alert.mjs`
(parser e-mailových alertů, které se už nečtou). Ani jedno není zapojené v
žádném workflow. Smazat je je rozhodnutí uživatelky, ne moje.

## Rozdělení území

Beze změny oproti verzi 1:

- **Action** píše do `job-agent/data/` v repozitáři a přes service_role do
  `nabidky`, technických sloupců `firmy` a do `behy`.
- **Appka `prace`** má jen SELECT a UPDATE na čtyři sloupce `nabidky`. Service_role
  klíč nikdy nevidí.
- **Kateřina** vlastní `stav`, `poznamka`, `datum_reakce`, `zpusob_reakce`.
  Automat je nikdy nezapisuje.

## Co běh potřebuje

V GitHub Secrets repozitáře:

| tajemství | kde se bere |
|---|---|
| `SUPABASE_URL` | Supabase → Project Settings → Data API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API Keys → service_role |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |

Ve Vercelu (pro tlačítko v appce): `GITHUB_TOKEN` a `GITHUB_REPO`.

## Spuštění

```bash
cd job-agent
npm ci
npm test          # 105 testů, nepotřebují síť
npm run sber      # jen sběr do fronty
npm run hledej    # plný běh včetně posudků a zápisu
```

## Kde briefing nedává jednoznačnou odpověď

V `config.json` jsou tři klíče `_OTEVRENA_OTAZKA` — neuvedený home office (−20),
která hranice platového rozpětí rozhoduje (spodní) a co se skóre nad 100 (ořezává
se, hrubá hodnota zůstává). Beze změny oproti verzi 1.

Ve verzi 2 k nim přibyla čtvrtá věc, kterou je dobré vědět: **dojezd se nepočítá.**
Zůstává neznámý a inzerát dostane štítek „⚠ dojezd neověřen". Spočítat by ho šlo
jen přes placené mapové API a briefing o něm mluví jako o nejméně důležitém
kritériu ze šesti (sekce 4).
