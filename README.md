# job-agent — sběrná a bodovací část

Všechno, co jde spočítat, se počítá tady. Model dostane jen to, co spočítat nejde.

## Proč to existuje

Denní běh agenta spotřebovával příliš mnoho tokenů. Důvod nebyl v délce briefingu,
ale v tom, že **v agentní smyčce se s každým voláním nástroje posílá znovu celý
dosavadní kontext**. Třicet volání znamená třicet kopií rostoucího kontextu.

Tenhle balík ta volání odstraňuje:

| | dřív | teď |
|---|---|---|
| kdo stahuje kariérní stránky | agent, jedno volání na firmu | GitHub Action, zdarma |
| kdo bodo­vá­vá | model | `src/scoring.mjs`, zdarma |
| co agent čte | briefing + všechny stránky + všechny inzeráty | jen `data/nove.json` |
| volání nástrojů denně | ~30 | ~3 |
| prázdný den | plný běh | agent skončí po prvním volání |

## Rozdělení území

Tři zapisovatelé, žádný překryv:

- **Action** píše jen do `job-agent/data/` v repozitáři. Nemá přístup k databázi, takže
  na sloupce `stav` a `poznamka` nemůže ani omylem.
- **Agent** píše jen do Supabase, do tabulek `nabidky` a `firmy`.
- **Kateřina** vlastní `stav` a `poznamka`. Nikdo jiný je nezapisuje.

## Co je hotové

- `config.json` — sekce 6, 7 a 8 briefingu ve strojové podobě
- `src/scoring.mjs` — brány a bodovací model, čistá funkce bez závislostí
- `test/scoring.test.mjs` — 28 testů odvozených přímo z briefingu, včetně kombinačního pravidla
- `src/extract.mjs` — obecné vytažení odkazů na inzeráty z HTML
- `src/collect.mjs` — denní sběr, snapshoty, diff → `data/nove.json`
- `src/probe.mjs` — diagnostika: co která kariérní stránka skutečně vrací

## Co hotové není

**Adaptéry na konkrétní ATS.** `src/extract.mjs` je záměrně hloupý — sbírá odkazy,
které vypadají jako detail pozice. U stránek vykreslených JavaScriptem nenajde nic.
Sekce 13 briefingu tohle vede jako otevřenou položku a bez reálných dat se to
poctivě napsat nedá.

Proto se nejdřív spustí `npm run probe`. Ten pro každou firmu řekne, jestli se
stránka načte, kolik odkazů z ní vypadne a jestli je podezření na JavaScript.
Teprve podle toho má smysl psát adaptéry — a jen pro platformy, kterých je v seznamu
dost na to, aby se to vyplatilo.

## Spuštění

```bash
cd job-agent
npm test          # 28 testů bodovacího modelu, nepotřebuje síť
npm run probe     # diagnostika kariérních stránek
npm run sber      # denní sběr
```

Workflow: soubor `.github-workflows-sber.yml` přesunout do `.github/workflows/sber.yml`.

## Seznam firem

`data/firmy.json` je zatím ruční export z tabulky `public.firmy`. Až bude potřeba,
nahradí ho čtení přes Supabase REST s **anon** klíčem a read-only politikou na
tabulce `firmy` — anon klíč nesmí umět zapisovat, jinak padá rozdělení území výš.

## Kde briefing nedává jednoznačnou odpověď

V `config.json` jsou tři klíče `_OTEVRENA_OTAZKA`. Nejsou to chyby, jsou to místa,
kde se muselo něco zvolit:

1. **Neuvedený home office.** Stupnice v sekci 7 jde od 0 dnů, ale nemluví o tom, když
   inzerát home office nezmíní vůbec. Zvoleno −20 analogií s platem (neuvedeno je
   o něco lepší než nejhorší uvedená varianta).
2. **Platové rozpětí.** Když inzerát uvádí 60–80k, briefing neříká, která hranice
   rozhoduje. Zvolena spodní.
3. **Skóre nad 100.** Přirážky mohou vynést inzerát až na 119, ale pásma končí na 100.
   Skóre se ořezává na 100, hrubá hodnota zůstává v `hodnoceni.raw`.
