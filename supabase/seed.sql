-- Ukázková data pro vyzkoušení rozhraní. Nejde o skutečné nalezené nabídky —
-- pozná se to podle url (example.com/seed/...), takže je lze kdykoli smazat:
--   delete from public.nabidky where url like 'https://example.com/seed/%';
-- Spustit přes Supabase SQL editor / execute_sql proti projektu, který appka používá.

insert into public.nabidky
  (url, nalezeno_dne, zdroj, pozice, firma, lokalita, adresa, skore, hodnoceni, stitky,
   plat_od, plat_do, plat_uveden, home_office_dny, pruzna_doba, pracovni_cesty, inzerat_uryvek, stav, poznamka)
values
(
  'https://example.com/seed/asekol-senior-finance-controller',
  '2026-09-08', 'alert', 'Senior Finance Controller/ka', 'ASEKOL a.s.', 'Praha – Modřany',
  'Zenklova 2245/29, Praha 8', 88,
  '[
    {"kriterium":"Home office","stav":"stejne","srazka":0,"poznamka":"2 dny, po zapracování"},
    {"kriterium":"Pružná doba","stav":"stejne","srazka":0,"poznamka":"v inzerátu zmíněna"},
    {"kriterium":"Plat","stav":"lepsi","srazka":0,"poznamka":"80–95 tis."},
    {"kriterium":"Náplň práce","stav":"stejne","srazka":0,"poznamka":"controlling, rozpočty, forecast"},
    {"kriterium":"Seniorita a tým","stav":"stejne","srazka":0,"poznamka":""},
    {"kriterium":"Dojezd","stav":"stejne","srazka":0,"poznamka":"Modřany, do 30 min"}
  ]'::jsonb,
  null, 80000, 95000, true, 2, true, 'zadne',
  'Hledáme zkušeného finančního controllera/ku, který povede rozpočtový proces a přinese do týmu efektivitu.',
  'k_zvazeni', 'Zavolat referentce z inzerátu, zmínit zkušenost s revizemi rozpočtu.'
),
(
  'https://example.com/seed/nestle-specialista-financniho-kontrolingu',
  '2026-09-07', 'alert', 'Specialista finančního kontrolingu', 'Nestlé Česko s.r.o.', 'Praha – Modřany',
  null, 76,
  '[
    {"kriterium":"Home office","stav":"horsi","srazka":8,"poznamka":"1 den týdně"},
    {"kriterium":"Pružná doba","stav":"horsi","srazka":14,"poznamka":"v inzerátu nezmíněna"},
    {"kriterium":"Plat","stav":"stejne","srazka":1,"poznamka":"70–82 tis."},
    {"kriterium":"Náplň práce","stav":"stejne","srazka":0,"poznamka":"reporting, analýza odchylek"},
    {"kriterium":"Seniorita a tým","stav":"stejne","srazka":0,"poznamka":""},
    {"kriterium":"Dojezd","stav":"stejne","srazka":0,"poznamka":"Modřany"}
  ]'::jsonb,
  array['⚠ pracovní cesty neuvedeny'], 70000, 82000, true, 1, null, 'neuvedeno',
  'Nestlé hledá specialistu/ku finančního kontrolingu se zaměřením na reporting a analýzu odchylek.',
  'novy', null
),
(
  'https://example.com/seed/electrolux-commercial-business-controller',
  '2026-09-06', 'karierni_stranka', 'Commercial Business Controller', 'ELECTROLUX, s.r.o.', 'Praha – Michle',
  null, 65,
  '[
    {"kriterium":"Home office","stav":"stejne","srazka":0,"poznamka":"2 dny"},
    {"kriterium":"Pružná doba","stav":"stejne","srazka":0,"poznamka":"v inzerátu zmíněna"},
    {"kriterium":"Plat","stav":"stejne","srazka":3,"poznamka":"neuvedeno"},
    {"kriterium":"Náplň práce","stav":"horsi","srazka":10,"poznamka":"příbuzná role, komerční controlling"},
    {"kriterium":"Seniorita a tým","stav":"stejne","srazka":0,"poznamka":""},
    {"kriterium":"Dojezd","stav":"stejne","srazka":0,"poznamka":"Michle"}
  ]'::jsonb,
  array['⚠ plat neuveden'], null, null, false, 2, true, 'neuvedeno',
  'Do našeho týmu hledáme Commercial Business Controllera se zkušeností v oblasti FMCG.',
  'novy', null
),
(
  'https://example.com/seed/moneta-financni-analytik',
  '2026-09-05', 'alert', 'Finanční analytik/čka', 'MONETA Money Bank, a.s.', 'Praha – Michle',
  null, 58,
  '[
    {"kriterium":"Home office","stav":"horsi","srazka":8,"poznamka":"1 den týdně"},
    {"kriterium":"Pružná doba","stav":"horsi","srazka":14,"poznamka":"pevná pracovní doba 8:30–17:00"},
    {"kriterium":"Plat","stav":"horsi","srazka":2,"poznamka":"60–68 tis."},
    {"kriterium":"Náplň práce","stav":"horsi","srazka":10,"poznamka":"analytická role bez vedení rozpočtu"},
    {"kriterium":"Seniorita a tým","stav":"stejne","srazka":0,"poznamka":"bez vedení týmu"},
    {"kriterium":"Dojezd","stav":"stejne","srazka":0,"poznamka":"Michle"}
  ]'::jsonb,
  array['ℹ pozice bez vedení týmu'], 60000, 68000, true, 1, false, 'zadne',
  'Banka hledá finančního analytika/čku do týmu retailového controllingu.',
  'novy', null
),
(
  'https://example.com/seed/tempus-next-financni-analytik-kontroler',
  '2026-09-04', 'alert', 'Finanční analytik / kontroler', 'TEMPUS NEXT a.s.', 'Praha – Chodov',
  null, 39,
  '[
    {"kriterium":"Home office","stav":"horsi","srazka":16,"poznamka":"neuvedeno v inzerátu"},
    {"kriterium":"Pružná doba","stav":"horsi","srazka":14,"poznamka":"nezmíněna"},
    {"kriterium":"Plat","stav":"stejne","srazka":3,"poznamka":"neuvedeno"},
    {"kriterium":"Náplň práce","stav":"horsi","srazka":20,"poznamka":"vzdálená role, převážně účetní agenda"},
    {"kriterium":"Seniorita a tým","stav":"stejne","srazka":0,"poznamka":""},
    {"kriterium":"Dojezd","stav":"horsi","srazka":8,"poznamka":"Chodov, 30–45 min"}
  ]'::jsonb,
  array['⚠ plat neuveden','⚠ vypsáno agenturou, ne firmou'], null, null, false, null, null, 's_prespanim',
  'Pro klienta z oblasti výroby hledáme finančního analytika s možností příležitostných pracovních cest se zahraničním přespáním.',
  'zamitnuto', 'Pracovní cesty s přespáním nepřipadají v úvahu.'
),
(
  'https://example.com/seed/ceska-sporitelna-specialista-financni-management',
  '2026-09-03', 'karierni_stranka', 'Specialista finanční management', 'Česká spořitelna, a.s.', 'Praha – Krč',
  'Budějovická 1518/13a, Praha 4', 82,
  '[
    {"kriterium":"Home office","stav":"lepsi","srazka":0,"poznamka":"3 dny týdně"},
    {"kriterium":"Pružná doba","stav":"stejne","srazka":0,"poznamka":"v inzerátu zmíněna"},
    {"kriterium":"Plat","stav":"lepsi","srazka":0,"poznamka":"85–100 tis."},
    {"kriterium":"Náplň práce","stav":"stejne","srazka":0,"poznamka":"finanční plánování a reporting pro vedení"},
    {"kriterium":"Seniorita a tým","stav":"stejne","srazka":0,"poznamka":""},
    {"kriterium":"Dojezd","stav":"stejne","srazka":0,"poznamka":"Krč, do 30 min"}
  ]'::jsonb,
  null, 85000, 100000, true, 3, true, 'bez_prespani',
  'Hledáme kolegu/kolegyni do týmu finančního managementu, občasné tuzemské pracovní cesty bez přespání.',
  'prihlaseno', 'Podáno 3. 9., čekáme na odpověď.'
),
(
  'https://example.com/seed/t-mobile-controlling',
  '2026-09-02', 'alert', 'Business Controller', 'T-Mobile Czech Republic a.s.', 'Praha – Chodov',
  null, 70,
  '[
    {"kriterium":"Home office","stav":"lepsi","srazka":0,"poznamka":"3 dny týdně"},
    {"kriterium":"Pružná doba","stav":"horsi","srazka":14,"poznamka":"nezmíněna"},
    {"kriterium":"Plat","stav":"stejne","srazka":1,"poznamka":"68–78 tis."},
    {"kriterium":"Náplň práce","stav":"stejne","srazka":0,"poznamka":"controlling telco divize"},
    {"kriterium":"Seniorita a tým","stav":"stejne","srazka":0,"poznamka":""},
    {"kriterium":"Dojezd","stav":"stejne","srazka":0,"poznamka":"Chodov"}
  ]'::jsonb,
  null, 68000, 78000, true, 3, false, 'zadne',
  'Do controllingového týmu hledáme kolegu se zaměřením na telekomunikační segment.',
  'k_zvazeni', null
),
(
  'https://example.com/seed/strojmetal-finance-controller',
  '2026-09-09', 'karierni_stranka', 'Finance Controller', 'Strojmetal Aluminium Forging a.s.', 'Kamenice',
  'Průmyslová 1000, Kamenice u Prahy', 91,
  '[
    {"kriterium":"Home office","stav":"stejne","srazka":0,"poznamka":"2 dny týdně, po zapracování cca 3 měsíce"},
    {"kriterium":"Pružná doba","stav":"stejne","srazka":0,"poznamka":"pružná pracovní doba s jádrem 9:00–14:00, v inzerátu výslovně uvedeno"},
    {"kriterium":"Plat","stav":"lepsi","srazka":0,"poznamka":"90–110 tis., dle zkušeností, čtvrtletní bonus navíc"},
    {"kriterium":"Náplň práce","stav":"stejne","srazka":0,"poznamka":"kompletní odpovědnost za rozpočtový proces výrobního závodu, měsíční a kvartální reporting pro mateřskou společnost, analýza odchylek a příprava podkladů pro investiční rozhodnutí vedení"},
    {"kriterium":"Seniorita a tým","stav":"lepsi","srazka":0,"poznamka":"vedení týmu 4 lidí, přímá odpovědnost finančnímu řediteli"},
    {"kriterium":"Dojezd","stav":"horsi","srazka":8,"poznamka":"Kamenice, cca 35–40 minut autem z Průhonic ve špičce"}
  ]'::jsonb,
  array['+5 firma odpovídá vzorci'], 90000, 110000, true, 2, true, 'zadne',
  'Strojmetal Aluminium Forging je přední evropský výrobce hliníkových výkovků pro automobilový a letecký průmysl. Do našeho závodu v Kamenici hledáme zkušeného Finance Controllera, který převezme kompletní odpovědnost za rozpočtový proces, měsíční a kvartální reporting směrem k mateřské společnosti ve Švédsku a bude úzce spolupracovat s vedením závodu na přípravě podkladů pro investiční rozhodnutí. Očekáváme zkušenost s finančním řízením výrobního podniku, velmi dobrou znalost Excelu a angličtiny na komunikativní úrovni. Nabízíme zázemí stabilní nadnárodní společnosti, pružnou pracovní dobu, možnost home office 2 dny v týdnu po zapracování a čtvrtletní bonusy.',
  'novy', null
);
