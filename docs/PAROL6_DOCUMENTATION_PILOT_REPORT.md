# PAROL6 — stvarni dokumentacioni pilot

**Status:** lokalno obrađen PDF; tehnički podaci izdvojeni kao kandidati; ljudsko odobrenje tvrdnji i unos u katalog nisu izvršeni.

## Identitet dokumenta

- Proizvođač: Source Robotics d.o.o.
- Naslov: PAROL6 Robot Manual
- Broj dokumenta: SR-1002
- Revizija: 2026.A; objavljen 2026-11-03
- Primena: PAROL6 release 1, control board v2.0, Python API v0.9.1, commander software main
- Izvorni PDF: https://docs.source-robotics.com/PAROL-docs/1/assets/PAROL6-manual.pdf
- Bibliotečka datoteka: `483727036.pdf`
- Veličina: 13.776.175 bajtova
- Stranice: 402
- SHA-256: `e51c29ef0bf06ba1fdaefcc10ffc4f1cfe68c58c0b9f3a9fb8fd3fdb8421e77f`
- PDF metadata: title `PAROL6, the whole documentation - PAROL6`; creator HeadlessChrome 156; producer Skia/PDF m156; creation/modification 2026-11-03 15:54:43 UTC.
- Dokument je dodat u korisničku biblioteku 2026-11-22 08:00 UTC. Izvorni trenutak preuzimanja sa sajta nije poznat i nije izmišljen.

## Prava korišćenja

PDF na početnoj strani i na strani sa identitetom dokumenta izričito navodi: tekst i slike CC BY-SA 4.0; primeri koda MIT; modeli robota i slike napravljene od njih iz projekta `robot_descriptions`, CC BY 4.0. Obrada u ovom pilotu ograničena je na tekstualne tehničke podatke i kontekstualni tekst. Ne tvrdimo da su svi sadržaji PDF-a pod jednom licencom. Za CC BY-SA sadržaj potrebni su atribucija i ShareAlike; kod i robot_descriptions sadržaji zadržavaju svoje odvojene licence. Originalni PDF nije dodat u javni GitHub repozitorijum.

## Rezultat ekstrakcije

Korišćene su dve lokalne tekstualne ekstrakcije: PyMuPDF i `pdftotext -layout -enc UTF-8`. PDF ima selektabilan tekst; OCR nije bio potreban. Brojevi stranica u lokatorima su odštampani brojevi stranica u PDF-u.

### Tehnički podaci — PDF strana 53, odeljak 3 „Technical data“ → „Specifications“

| Polje | Vrednost iz dokumenta |
|---|---|
| Stepeni slobode | 6 rotacionih zglobova |
| Dohvat | 408 mm do prirubnice; 434 mm do TCP standardnog pneumatskog hvatača, mereno od ose zgloba 1 |
| Nosivost | 1 kg blizu baze; 0,5 kg kroz ceo radni prostor |
| Ponovljivost | 0,1 mm |
| Masa | 5,5 kg |
| Materijal | 3D-štampani PETG, čelične osovine i ležajevi |
| Motori | NEMA 17 koračni motori, po jedan po zglobu |
| Prenos | Planetarni reduktori na zglobovima 2, 3 i 6; HTD3 kaiševi na zglobovima 1, 3, 4 i 5 |
| Referenca položaja | Krajnji prekidači na zglobovima 2, 3 i 5; induktivni senzori na 1, 4 i 6; nema enkodera zglobova |
| Kočnice | Nema ih; ruka pada kada motori izgube napajanje |
| Napajanje | 24 V DC, 5 A preporučeno; 18 V minimum |
| Potrošnja | Oko 40 W tipično |
| Kontroler | PAROL6 kontrolna ploča, STM32F446 i šest TMC5160 drajvera |
| Veza sa računarom | USB; serijska veza 3 Mbaud; ciklus komandi 100 Hz |
| I/O | 2 izolovana ulaza, 2 izolovana izlaza, E-stop ulaz |
| Magistrale | Jedna CAN magistrala za električne hvatače; druga je na ploči, ali nije popunjena |
| Priključci alata | M8 4-pinski priključak (24 V, CAN) na podlaktici; dve pneumatske linije, cev 4 mm od baze do podlaktice |

### Dodatni tehnički podaci

- **PDF strana 54 — montaža:** šest rupa u bazi, razmak za aluminijumske profile 30 × 30 mm; stege.
- **PDF strana 54 — radna temperatura:** sobna temperatura; ograničenje temperature motora povezano je sa štampanim delovima.
- **PDF strana 54 — opsezi zglobova:** J1 194,8° (±97,4°); J2 113,4°; J3 189,1°; J4 229,2° (±114,6°); J5 240,6° (±120,3°); J6 360° softverski, mehanički neograničen, uz dodatna ograničenja navedena u priručniku.
- **PDF strane 54–55 — brzine:** zasebne maksimalne vrednosti za Python API i Commander; ograničenja su softverska i razlikuju se po zglobovima. Linearni alat: 200 mm/s API naspram 60 mm/s Commander; ugaoni alat: 100°/s API naspram 25°/s Commander.
- **PDF strana 72 — rezolucija:** veličina mikrokoraka nije garantovana poziciona rezolucija; stvarna rezolucija pod opterećenjem je grublja. Zato se ponovljivost navodi zasebno kao 0,1 mm.
- **PDF strana 215 — nosivost:** dodatni tekst precizira da je alat uključen u navedenu nosivost: 1 kg blizu baze i 0,5 kg pri punom dohvatu.
- **PDF strana 39 — namena:** obrazovanje, istraživanje, hobi robotika i laka automatizacija na radnom stolu; priručnik navodi da ovo nije sertifikovan industrijski robot.

## Tumačenje i ograničenja

1. Sve vrednosti su **deklaracije proizvođača iz konkretne revizije dokumenta**, ne rezultati nezavisnog laboratorijskog ispitivanja.
2. Nosivost nije jedna bezuslovna vrednost: 1 kg važi blizu baze, a 0,5 kg kroz ceo radni prostor; alat je uključen.
3. Brzine zavise od softvera (Python API naspram Commander); ne spajati ih u jednu generičku maksimalnu brzinu.
4. Ponovljivost 0,1 mm ne sme se poistovetiti sa veličinom mikrokoraka ili apsolutnom tačnošću.
5. Podatak „nema kočnica; ruka pada kada motori izgube napajanje“ je važna bezbednosna napomena i mora ostati vidljiva u svakom budućem profilu.
6. Ovaj pilot nije nezavisna provera tehničke ispravnosti, bezbednosna sertifikacija, niti odobrenje za javno preuzimanje originalnog PDF-a.

## Status u Roboscopiji

- Izvor dodat kao `src-0020`; dokument dodat u evidencioni registar kao pilot-only zapis.
- Evidencioni paket: `data/evidence-packages/source-robotics-parol6-release1-2026-a.json`.
- PAROL6 nije dodat u katalog modela.
- `catalogClaims` ostaje prazan; nijedna postojeća tvrdnja iz kataloga nije promenjena.
- Izdvojene vrednosti ostaju `extracted_unverified`; ljudsko odobrenje tvrdnji je na čekanju.
- Originalni PDF nije kopiran u repozitorijum.
- Faza 1 ostaje otvorena; jedan uspešan dokumentacioni pilot ne zatvara ostale izvore, 39 početnih tvrdnji ili ostale izlazne kriterijume.

## Atribucija

Source Robotics d.o.o., *PAROL6 Robot Manual*, SR-1002, Revision 2026.A, published 2026-11-03. Text and images licensed CC BY-SA 4.0. https://docs.source-robotics.com/PAROL-docs/1/assets/PAROL6-manual.pdf
