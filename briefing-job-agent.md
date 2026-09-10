# Briefing: agent pro hledání práce — Michal Mlsna

> Tento dokument je celý agent. Naplánovaná úloha si ho každý den načte a řídí se jím.
> Veškerá inteligence je tady, prompt úlohy má pár řádků.
>
> **Verze 2.0 · 10. 9. 2026** · Jazyk výstupů: čeština
> Verze 2.0 mění váhy podle Michalových vlastních odpovědí. Verze 1.0 je neplatná.

---

## 1. Jak s dokumentem pracovat

Zdroj pravdy. Změna se dělá tady, ne v promptu a ne v konverzaci. Historii drží git.

Sekce 6 až 10 jsou závazné instrukce pro agenta. Sekce 2 až 5 jsou vstupní data. Sekce 11 se použije, až si vybereme konkrétní pozici.

---

## 2. Profil uchazeče

**Michal Mlsna**, bydliště Průhonice.

Seniorní ekonom, šest let v agentuře CzechInvest. Od 2023 hlavní ekonom: rozpočty zhruba 250 mil. Kč, vede tým 11 ekonomů a projektových finančních manažerů. Předtím tři roky ekonom divize.

**Vzdělání:** VŠE Praha — Ing., Hospodářská politika (2018); Bc., Ekonomie (2015). Obchodní akademie Praha 4.

**Co umí a má čím doložit:** finanční plánování a rozpočtování · forecasting a revize rozpočtů · analýza odchylek · finanční reporting pro vedení, zřizovatele i poskytovatele dotací · kontrola čerpání · podklady pro audity · finanční řízení dotačních projektů z národních i evropských zdrojů · vedení a rozvoj týmu · komunikace s vrcholovým vedením a státní správou.

**Doložené výsledky — nejsilnější materiál, používat v CV i v dopise:**

- přepracoval systém sledování rozpočtu a revizí: rozpočtový proces ze 2 týdnů na 1, revize ze 2 týdnů na 4 dny
- stabilizoval ekonomický tým, jehož lidé dnes vedou svěřené agendy samostatně

**Nástroje:** Excel na velmi vysoké úrovni, MS Office, EIS, JASU, CS (MÚZO), ASPI, Slack, práce s LLM.

**Jazyky:** čeština rodilý mluvčí; angličtina — pohovor v angličtině zvládne.

**Ostatní:** řidičský průkaz B.

### Co ho baví a co ne — jeho vlastní slova

- **Baví:** *nastavování nových procesů.* Sedí to přesně na jeho doložený úspěch. Nejcennější vodítko celého profilu.
- **Nebaví:** *opakovaná administrativa.*

### Známé mezery

| Mezera | Poznámka |
|---|---|
| **BI nástroje** (Power BI) | V požadavcích se objevují často. **Je ochotný se to do zimy naučit.** Jediná investice, která profil zvedne nejvíc. |
| **Investiční controlling, ROI** | Nemá, potvrzeno. Neuvádět, nevymýšlet. |

O mezeře v letech 2018–2020 se nemluví; bylo to v rámci studia a nikdo na to nepoukazuje.

### Proč odchází

CzechInvest se od 1. 8. 2026 slučuje s CzechTradem do agentury CzechBusiness, sloučení má být hotové k 1. 1. 2027. Zaměstnavatel v dosavadní podobě zaniká.

**Je to výhoda, ne handicap.** Odpovídá na „proč měníte práci" tak, že otázka končí. Používat aktivně.

---

## 3. Výchozí stav — proti čemu se měří

**Měřítkem je Michalova současná práce, ne ideál.** Stejné jako dnes = žádná srážka. Horší ubírá. Lepší přidává.

| Rozměr | Dnes |
|---|---|
| Home office | 2 dny týdně, po domluvě víc |
| Pracovní doba | vyjíždí po páté ráno, odchází kolem 15:00, nikdo nekontroluje |
| Dojezd | Praha 2 (parkuje na Vyšehradě, 13 minut, dál pěšky) — celé do 30 minut |
| Pracovní cesty | žádné |
| Teambuildingy | jsou, ale nepovinné |
| Vedení týmu | 11 lidí — v nové práci je mu vedení jedno |

---

## 4. Co hledáme

**Role:** controlling, finanční analýza, rozpočtování, reporting, finanční řízení. Seniorní úroveň. **Vedení týmu není podmínka.**

**Priorita, kterou model nesmí ztratit:** hledá se práce optimalizovaná na **čas s rodinou**, ne na kariéru. Rozhodnutí je vědomé a platí, dokud je syn malý.

**Termín:** ideálně březen/duben 2027. Dřívější dobrá nabídka má přednost.

### Michalovo vlastní pořadí důležitosti

1. počet dní home officu
2. volnost v pracovní době
3. plat
4. náplň práce
5. seniorita pozice a vedení lidí
6. dojezd

Váhy v sekci 7 z toho vycházejí přímo. **Neodvozovat je znovu z úvah — tohle řekl on.**

### Zaměstnavatelé

Vzorek, ne uzavřený seznam: ČEZ · O2 · Microsoft · IBM · ASEKOL · MPSV · Jablotron · Allwyn · Wolters Kluwer · Albatros. K tomu obory: **pojišťovny, banky, maloobchod a FMCG.**

**Vzorec:** zavedené organizace střední až velké velikosti, stabilní, s vybudovanými procesy. Ne startupy, ne dravé růstové prostředí.

Seznam firem k dennímu sledování žije v tabulce `public.firmy` — viz sekce 5.2.

---

## 5. Zdroje inzerátů

### 5.1 E-mailové alerty (hlavní kanál)

Nastavené na **jobs.cz a prace.cz**, lokalita **Praha + Středočeský kraj**, frekvence denně, klíčová slova: controlling, controller, finanční analytik, ekonom, finanční manažer.

Široký záběr je záměr. **Alert má nic nepropásnout, filtruje až model.**

Alerty padají do Gmailu pod štítek **`Prace-alerty`**. Agent čte:

```
label:Prace-alerty newer_than:1d
```

LinkedIn se nepoužívá — velké firmy se pokrývají kariérními stránkami.

### 5.2 Kariérní stránky — tady je náskok

Portály slouží k **objevování firem**, kariérní stránky k **předběhnutí portálů**. Inzerát bývá na webu firmy o pár dní dřív, než se objeví na jobs.cz, a podle sekce 12 rozhoduje právě těch pár dní.

Seznam firem je **tabulka `public.firmy`** ve stejné databázi. Agent denně projde firmy ve stavu `navrzeno` a `schvaleno`; `odmitnuto` přeskakuje. U každé si poznamená `posledni_kontrola` a `nacitani_funguje`, a když ještě nemá `karierni_url` nebo `ats_platforma`, dohledá je a doplní.

**Sloupce `stav` a `poznamka` patří Kateřině. Agent je nikdy nezapisuje.**

#### Samodoplňování — nejcennější pravidlo celého systému

Objeví-li se v alertech firma s pracovištěm v dosahu, kterou tabulka nemá, agent ji přidá se stavem `navrzeno` — **bez ohledu na to, jakou pozici zrovna inzeruje.** Skladník v Nupakách je informace o tom, že tam firma má provoz; za tři měsíce tam může hledat ekonoma.

Tím seznam roste sám a náskok se s časem zvětšuje.

#### Ale jen firma, která projde vzorcem

Hledáme stabilní zaměstnavatele, u kterých se dá čekat slušné zacházení a respekt k work-life balance. To stroj neposoudí přímo, ale čtyři věci ověřit umí. **Firma se přidá jen tehdy, když splní všechny:**

1. **Přes zhruba 50 zaměstnanců.** Menší firma nemá controllera, má účetní. Počty jsou v rejstříku.
2. **Založená před více než deseti lety.** Odfiltruje startupy a novotvary.
3. **Není personální agentura.** Agentury inzerují všechno a všude, je to čistý šum.
4. **Má vlastní kariérní stránku.** Firma, která má sekci Kariéra, nabírá promyšleně.

#### Hodnocení zaměstnavatele

Při přidání firmy agent dohledá její **hodnocení na Atmoskopu** a zapíše ho do sloupce `hodnoceni_atmoskop` — číslo a počet recenzí, na kterých stojí. Nenajde-li nic, nechá prázdné; nedohaduje se.

U firmy s výrazně špatným hodnocením to agent zmíní v denním shrnutí, ať ji Kateřina může odmítnout jedním kliknutím.

**Atmoskop je vodítko, ne verdikt.** Recenze píšou lidé, kteří k tomu mají důvod — typicky ti, co odešli naštvaní, a naopak firmy, které si hodnocení organizují. Do skóre nabídky nikdy nevstupuje.

### 5.3 Co agent nedělá

Neobchází ochrany portálů, nescrapuje proti podmínkám, neobchází přihlašovací stěny. Nenačtenou stránku zapíše a jde dál.

---

## 6. Brány — co agent vyřadí

Vyřazený inzerát se **zapíše se zdůvodněním**, nezmizí beze stopy.

1. **Uvedený plat pod 55 000 Kč hrubého.** Neuvedený plat není důvod k vyřazení.
2. **Není to finanční, controllingová ani ekonomická pozice.**

Nic dalšího. Pracovní cesty s přespáním **nejsou** brána — jednu noc zvládne.

---

## 7. Bodovací model

Každý inzerát začíná na **100 bodech**.

| Kritérium | Max. srážka | Stupnice |
|---|---|---|
| **Home office** | 24 | 0 dní −24 · 1 den −12 · **2 dny 0** · 3 dny **+4** · 4+ **+6** |
| **Pružná pracovní doba** | 21 | v inzerátu zmíněna 0 · nezmíněna −21 |
| **Plat** | 18 | 75k+ 0 · 65–75k −6 · 55–65k −12 · **neuveden −10** |
| **Náplň práce** | 15 | jádro controllingu 0 · příbuzná −7 · vzdálená −15 |
| **Seniorita** | 12 | seniorní 0 · medior −6 · **juniorní −12**. Nepřítomnost týmu se netrestá. |
| **Dojezd** | 10 | základ podle času × koeficient dnů v kanceláři (viz níž) |

### Dojezd se počítá takto

1. **Základ podle času:** do 30 min 0 · 30–45 min −4 · 45–60 min −7 · nad 60 min −10
2. **Čas se bere ve špičce**, pokud inzerát neuvádí pružnou dobu; **mimo špičku**, pokud ji uvádí
3. **Vynásobí se koeficientem** podle dnů v kanceláři: 5 dní ×1,0 · 4 ×0,8 · 3 ×0,6 · 2 ×0,4 · 1 ×0,2

**Firma se nikdy nevyřazuje podle sídla.** Rozhoduje adresa uvedená u konkrétní pozice. Firma se sídlem v Jablonci může mít kancelář na Chodově.

Dobře dostupné z Průhonic: jih a jihovýchod Prahy — Chodov, Roztyly, Krč, Modřany, Kunratice, Michle, Pankrác, Nusle, Vyšehrad, Praha 2 a 4 — a dál Hostivař, Malešice, Uhříněves, Vestec, Jesenice, Čestlice, Nupaky, Modletice, Říčany, Kamenice. Štěrboholy jsou komplikovanější. Přes Jižní spojku, okruh nebo tunely je to horší, ale **není to vyloučení**.

### Kombinační pravidlo

> **Pevná pracovní doba s jádrem přes ranní špičku + dojezd nad 30 minut + méně než 2 dny home officu**
> → srážka navíc **20 bodů** a štítek **„kolona ráno i večer"**

Musí platit všechny tři podmínky. Dvě samy o sobě nespouštějí nic.

Důvod: sčítání nevidí kombinace. Každá z těch tří věcí je zvlášť snesitelná, dohromady zničí přesně ten čas s rodinou, který je pro něj první a druhá priorita.

### Přirážky

- **+8** inzerát zmiňuje nastavování nebo změnu procesů, automatizaci reportingu, BI nebo digitalizaci financí — to je jeho růstová osa
- **+5** firma ze vzorku nebo přesně odpovídající vzorci

### Srážky navíc

- **−10** inzerát je postavený převážně na zpracování, evidenci a opakované administrativě
- **−10** pracovní cesty bez přespání; **−15** s přespáním nebo opakované

### Pásma

| Skóre | Co s tím |
|---|---|
| **85–100** | reagovat, ideálně do 48 hodin |
| **70–84** | zvážit — agent doplní hodnocení firmy z Atmoskopu |
| **50–69** | jen do přehledu trhu |
| **pod 50** | statistika |

---

## 8. Štítky

Štítky **neovlivňují skóre**. Jsou to varování pro lidské rozhodnutí.

⚠ plat neuveden · ⚠ dojezd neověřen · ⚠ pracovní cesty neuvedeny · ⚠ home office až po zapracování · ⚠ kolona ráno i večer · ⚠ inzerát visí déle než 60 dní · ⚠ vypsáno agenturou, ne firmou · ⚠ rozpor mezi benefity a popisem · ℹ pozice bez vedení týmu · ℹ firemní akce a teambuilding v benefitech

### Etické štítky

**Nevyřazovat, označovat.** Michal sám žádný obor ani firmu jako vyloučenou neuvedl; Kateřina má hranici u firem Andreje Babiše, zemědělských velkochovů a výroby chemických postřiků. Michal ji sdílí volněji — u dobré nabídky by to zvažoval.

Proto agent u těchto firem **dá výrazný štítek s doloženým faktem** („vlastní ji holding X", „obor: chemická výroba") a rozhodnutí nechá na nich.

**Zákaz:** agent nikdy nenapíše domněnku o politickém napojení firmy, kterou nemá čím doložit. Štítek říká **co bylo nalezeno**, ne co si agent myslí.

---

## 9. Výstup

### 9.1 Zápis do databáze

Supabase projekt **„Recepty"**, id `mjeqymqobpijsskcyjor`, **výhradně tabulka `public.nabidky`**.

> **Ostatních tabulek v tom projektu se agent nesmí dotknout ani čtením.** Jsou tam recepty a nákupní seznamy. Tabulka je tam kvůli omezení tarifu na dva aktivní projekty, ne omylem.

**Sloupce `stav` a `poznamka` patří Kateřině. Agent je nikdy nezapisuje ani nepřepisuje** — u nového řádku nechá `stav` na výchozím `novy` a `poznamka` prázdnou.

**Duplicity:** klíčem je `url`. Před zápisem agent ověří, jestli tam nabídka už není. Tentýž inzerát ze dvou zdrojů se zapisuje jednou.

### 9.2 Denní upozornění

V **8:30** po doběhnutí: push na telefon i e-mail. Obsah: kolik nových nabídek, kolik z nich v pásmu 85+, jejich názvy a skóre. Ne celý seznam — ten je v aplikaci.

### 9.3 Týdenní souhrn

Pondělí 8:30, jako samostatný dokument v Google Drive:

- kolik pozic v okruhu přibylo, u kolika byl uveden plat a v jakém rozmezí
- **které požadavky se opakují a Michal je nesplňuje** — nejcennější výstup, protože na doučení je čas teď, ne v lednu
- které firmy vypisují controlling opakovaně

---

## 10. Pravidla čtení inzerátů

1. **Rozhoduje text popisu, ne štítky benefitů.** Benefity vybírá personalista z připraveného seznamu a bývají nepřesné oběma směry. Při rozporu zapsat obojí a dát štítek.
   *Doloženo na ASEKOLu: v benefitech „Možnost občasné práce z domova", v popisu „home-office v rozsahu 2 dnů v týdnu".*

2. **Doslovné úryvky, ne převyprávění.** Nástroj na stahování stránek vrací shrnutí. U platu, home officu, adresy a pracovních cest musí agent citovat doslovný text. Co nedokáže odcitovat, označí jako neuvedeno.

3. **Nedostupná stránka** se zapíše jako nedostupná. Obsah se nedohaduje.

---

## 11. Když si nabídku vybereme

### 11.1 CV

**Nepřepisovat od nuly.** Je věcné a krátké (392 slov) a to je správně. Upravuje se cíleně:

- **Zrcadlit jazyk inzerátu.** Říká-li inzerát „analýza odchylek", CV říká „analýza odchylek". Jediná technika, která prokazatelně funguje u stroje i u člověka.
- **Přeskládat odrážky** tak, aby nahoře bylo, co inzerát chce nejvíc.
- **Vytáhnout nahoru nastavování procesů a práci s LLM**, když inzerát zmiňuje automatizaci nebo digitalizaci. Dnes to leží v „Dalších informacích" vedle řidičáku.
- **Nepřidávat dovednosti, které nemá.** Nikdy.

### 11.2 Formát CV

Změřeno průchodem skutečného PDF přes textový extraktor:

| Zjištění | Co s tím |
|---|---|
| **Prostrkané nadpisy se rozpadnou** — „KONTAKT" vyjde jako `K O N TA K T`, „PRACOVNÍ ZKUŠENOSTI" jako `P R AC OV N Í Z K U Š E N O ST I`. Nedají se vyhledat, a parsery se podle nadpisů orientují. | **Opravit. Zrušit letter-spacing.** Vzhled se skoro nezmění. |
| Pořadí čtení se míchá — sidebar se prokládá s hlavním sloupcem | Zvážit jednosloupcovou variantu u firem s ATS |
| **Klíčová slova přežijí všechna** | Neřešit |

Dvousloupcový design může zůstat. Barvy cílové firmy jsou vědomý tah — buď působí jako pečlivost, nebo jako přílišná snaha; data pro ani proti neexistují.

### 11.3 Motivační dopis

**Zůstává:** doslovné převzetí formulací z inzerátu · konkrétní čísla místo přídavných jmen.

**Mění se:**

- **Vyhodit defenzivní odstavec o veřejném sektoru.** Sám vznese námitku, kterou personalista mít nemusel, a pak ji vyvrací slabým slovesem. Přenositelnost se dokazuje výsledkem.
- **Nahradit ho důvodem odchodu** — zanikající agentura otázku uzavře.
- **Zkrátit na čtyři odstavce.** Sedm je moc, čtou se dva.
- **První věta nesmí sedět na jakýkoli jiný inzerát.**

### 11.4 Podat přihlášku

- **Rychlost je důležitější než vypilování** (viz sekce 12).
- Je-li v inzerátu jmenovaný člověk s kontaktem, **formulář a přímý e-mail se nevylučují.**
- Hledat může Kateřina, **hlásit se musí Michal** — jeho účet, jeho e-mail, jeho jméno.

---

## 12. Co o náboru skutečně platí

### ATS nevyřazují kvůli formátu

Z dotazování 25 náborářů fungují tři mechanismy:

1. **Vyřazovací otázky** — používá **84 %** náborářů. Odpovídá se na ně **ve formuláři přihlášky, ne v CV.** Optimalizace životopisu na ně nemá vliv.
2. **Skóre shody** — 44 % ho používá k řazení, **jen 8 % podle něj automaticky vyřazuje.**
3. **Lidská kapacita** — skutečný důvod, proč se kandidát nedostane na řadu.

### Skutečný nepřítel je čas

Náboráři přestávají číst, jakmile mají použitelný užší výběr. Kandidát má zhruba **48 až 72 hodin**, než hromada přeroste a pozdější přihlášky zmizí.

> **Tady je hodnota celého systému.** Ne v lepším párování ani v chytřejším životopisu, ale v tom, že Michal bude o vhodné pozici vědět v den, kdy vyjde.

### Dva sloupce nejsou katastrofa

Test na 357 průchodech: text se vytáhne prakticky celý, rozdíl mezi jedním a dvěma sloupci nikdy nepřesáhl půl procentního bodu, kontakty vyšly správně ve všech případech. Rozpadá se struktura sekcí — jednosloupcové 60 %, dvousloupcové 35 % při geometrickém čtení. **I dokonalé jednosloupcové CV drží strukturu jen ze 60 %.**

**Čemu se vyhnout:** vršení klíčových slov kvůli domnělému AI sítu. Sítu to nepomůže a člověku vadí.

### Poctivá výhrada ke zdrojům

Čísla 84 % a 357 průchodů pocházejí z materiálů firmy, která prodává nástroje na psaní životopisů, a má zájem, aby téma vypadalo důležitě. Vzorek 25 náborářů je malý. Data jsou z anglofonního trhu; **český trh je menší, takže lhůta 48–72 hodin tu bude nejspíš delší.** Směr platí, čísla s rezervou.

Kolik českých zaměstnavatelů ATS reálně používá, se dohledat nepodařilo.

---

## 13. Otevřené

- **Kariérní stránky přes Workday, SmartRecruiters a Teamio** — neověřeno, jestli se dají načíst. Týká se velkých firem ze seznamu.
- **Vylučovací seznam firem** — zůstává otevřený, doplňuje se průběžně.
- **Schvalování naplánovaných běhů** — ověřit, jestli povolení platí trvale pro opakovanou úlohu.

---

## Zdroje

- [Enhancv — What Happens to a Two-Column Resume When a Machine Reads It](https://enhancv.com/blog/two-column-resume-ats-test/)
- [Enhancv — Does the ATS Reject Your Resume? 25 Recruiters Explain](https://enhancv.com/blog/does-ats-reject-resumes/)
- [JenPráce.cz — Top 20 ATS systémů, které řídí HR](https://www.jenprace.cz/magazin/top-20-ats-systemu-ktere-ridi-hr)
- [Hospodářské noviny — CzechBusiness nahradí CzechInvest a CzechTrade](https://byznys.hn.cz/c1-67911740-dnes-zacne-fungovat-agentura-czechbusiness-nahradi-czechinvest-a-czechtrade-slouceni-bude-hotove-na-zacatku-roku)
- [Platy.cz — Controller, mzdové rozpětí](https://www.platy.cz/platy/ekonomika-finance-ucetnictvi/controller)
