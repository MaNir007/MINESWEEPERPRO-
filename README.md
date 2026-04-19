# 💣 MINESWEEPER PRO+

![Status](https://img.shields.io/badge/Status-In%20Development-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

**Minesweeper Pro+** je moderna, futuristička interpretacija klasične igre Minesweeper. Projekt kombinira napredne vizualne efekte, sustav karijere i PHP/MySQL bazu podataka za praćenje progresa korisnika.

---

## 🚀 Značajke (Features)

- **Career Mode:** Napreduj kroz nivoe koji postaju sve teži (veća mapa, više mina).
- **Training Mode:** Vježbaj na različitim težinama (Easy, Medium, Hard, Impossible).
- **Custom Game:** Samostalno postavi veličinu mreže i broj mina.
- **Sustav Prijave:** Automatska prijava i spremanje progresa u bazu podataka.
- **Futuristički UI:** Glitch efekti, neonske boje, animirani overlay prozori i konfeti proslava.
- **Timer & Stats:** Prati svoje vrijeme i broj očišćenih mina u stvarnom vremenu.

---

## 🛠️ Tehnologije (Tech Stack)

- **Frontend:** HTML5, CSS3 (Flexbox/Grid), JavaScript (ES6+)
- **Backend:** PHP (API arhitektura)
- **Baza podataka:** MySQL
- **Dizajn:** Futuristički/Cyberpunk vizualni stil

---

## 📥 Instalacija i Pokretanje

Kako biste pokrenuli projekt lokalno, slijedite ove korake:

1.  **Instalirajte XAMPP** (ili sličan alat poput Laragona/Wamp-a).
2.  Klonirajte repozitorij u `htdocs` mapu:
    ```bash
    git clone [https://github.com/MaNir007/MINESWEEPERPRO-.git](https://github.com/MaNir007/MINESWEEPERPRO-.git)
    ```
3.  **Baza podataka:**
    - Otvorite `phpMyAdmin`.
    - Kreirajte novu bazu pod nazivom `minesweeper_db`.
    - Importajte datoteku `baza.sql` koja se nalazi u korijenu projekta.
4.  **Pokretanje:**
    - Uključite **Apache** i **MySQL** u XAMPP kontrolnoj ploči.
    - U pregledniku otvorite: `http://localhost/MineSweeper/`

---

## 🕹️ Kako igrati?

- **Lijevi klik:** Otkrivanje polja.
- **Desni klik:** Postavljanje zastavice (🚩) na sumnjivo polje.
- **Cilj:** Otkriti sva polja koja ne sadrže mine u što kraćem vremenu.
- **Karijera:** Svaka pobjeda u Career modu automatski te prebacuje na sljedeći nivo i sprema tvoj napredak.

---

---

## 📖 Detaljne Upute i Vodič (iz upute.txt)

```text
=========================================
      MINESWEEPER PRO - UPUTE I VODIČ
=========================================

Dobrodošli u Minesweeper Pro, naprednu verziju legendarne igre s RPG elementima, progresijom i posebnim modovima. Ispod su detaljni opisi svih mehanika.

1. MEHANIKA COINSA (VALUTA IGRE)
-----------------------------------------
Coins (novčići) u ovoj igri predstavljaju tvoje iskustvo i resurse.
- Kako zaraditi: Svaki put kada uspješno očistiš minu ili pobijediš u partiji, dobivaš coinese. Sustav broji "Mines Cleared" (očišćene mine). Što je veća težina i što više polja otvoriš, to više zarađuješ.
- Svrha: Coinsi se troše na "Crnom tržištu" (Shop) za kupnju perka koji ti pomažu u teškim situacijama.
- Napomena: Gosti (Guest mode) ne mogu sakupljati coinese niti kupovati na marketplaceu.

2. CRNO TRŽIŠTE (SHOP / PERKOVI)
-----------------------------------------
U meniju igre možeš pristupiti trgovini gdje kupuješ:
- RADAR (Skeniranje): Nakon kupnje, tvoj sljedeći klik na bilo koje zatvoreno polje neće ga otvoriti, već će skeniranje 3x3 područje oko njega. Radar će otkriti gdje su mine i brojeve, ali će se polja nakon 2.5 sekunde ponovno sakriti. To ti omogućuje da planiraš unaprijed bez rizika.
- DEFUSE KIT (Oklop): Ovo je pasivna zaštita. Ako slučajno klikneš na minu, oklop će je deaktivirati, pretvoriti to polje u sigurno polje (broj) i spasiti te od smrti. Oklop se troši nakon prve pogođene mine.

3. TRAINING MODE (TRENING)
-----------------------------------------
Ovo je klasično iskustvo Minesweepera, ali sa modernim dodacima.
- Težine:
  * Easy (Lagano): 6x6 mapa, 4 mine.
  * Medium (Srednje): 10x10 mapa, 15 mina.
  * Hard (Teško): 15x15 mapa, 45 mina.
  * Impossible (Nemoguće): 20x20 mapa, 85 mina.
  * Custom: Sam biraš veličinu (do 30x30) i broj mina.
- Cilj: Otvoriti sva polja koja nisu mine.

4. CAREER MODE (KARIJERA)
-----------------------------------------
Ovo je osnovni mod za progresiju.
- Progresija: Počinješ od Nivoa 1. Svaka pobjeda te prebacuje na sljedeći nivo koji je progresivno teži (veća mapa, više mina).
- Leaderboard: Tvoj napredak (Nivo i sakupljeni Coinsi) sprema se u bazu podataka i rangira te na globalnoj ljestvici.
- Cilj: Dosegnuti što veći nivo i postati "Master Minesweeper".

5. DNEVNI IZAZOV (DAILY CHALLENGE)
-----------------------------------------
- Svaki dan se generira ista mapa za sve igrače na svijetu (koristi se fiksni seed baziran na datumu).
- Testiraj svoje vještine protiv ostatka zajednice na mapi koja je optimizirana za srednju težinu (15x15, 40 mina).
- Cilj: Riješiti mapu što brže i bez greške.

6. MINI GAMES (MINI IGRE)
-----------------------------------------

A) MINE DASH (Trka kroz mine)
- Mehanika: Igra je fokusirana na brzinu (Time Attack). Imaš horizontalnu stazu od 10 polja. U svakom stupcu postoji samo jedno sigurno polje, ostalo su mine.
- Cilj: Što brže kliknuti na siguran put s lijeva na desno. Svaki točan klik dodaje +2 sekunde na tajmer. Ako stigneš do kraja prije isteka vremena, pobjeđuješ.

B) TREASURE HUNTER (Memorijski izazov)
- Mehanika: Na samom početku igre, na 2 sekunde će se prikazati sve mine na mapi, a nakon toga će nestati i polja će postati prazna.
- Cilj: Moraš zapamtiti gdje su bile mine i kliknuti na sva OSTALA polja. Ako pogodiš mjesto gdje je bila mina (koju si vidio na početku), gubiš. Ovo testira tvoju vizualnu memoriju.

C) CHAIN REACTION (Puzzle / Logika)
- Mehanika: Dobivaš mapu koja je već djelomično riješena, ali imaš ograničen broj "Energije" (zastavica).
- Cilj: Umjesto otvaranja polja, ovdje je fokus na označavanju mina zastavicama (desni klik ili long press). Svaka pogrešno postavljena zastavica na sigurno polje troši tvoju energiju. Moraš označiti točno onoliko mina koliko piše na HUD-u da bi pobijedio.

7. KAKO IGRATI I CILJEVI (SAŽETAK)
-----------------------------------------

| Mod | Kontrole | Cilj |
| :--- | :--- | :--- |
| **Training / Career** | Lijevi klik (Otvori), Desni klik (Zastavica) | Otvoriti sva "čista" polja. |
| **Mine Dash** | Brzi lijevi klikovi | Pronaći put do desne strane prije isteka vremena. |
| **Treasure Hunter** | Lijevi klik (po pamćenju) | Otvoriti sva polja koja NISU bila prikazana kao mine. |
| **Chain Reaction** | Desni klik (Zastavica) | Pravilno označiti sve mine s ograničenom energijom. |

OSNOVNO PRAVILO: Brojevi ti govore koliko se mina nalazi u 8 susjednih polja. Koristi logiku, planiraj poteze i postani najbolji agent na terenu!

---

## 📸 Vizualni identitet

Igra koristi:

- **Orbitron** i **Rajdhani** Google fontove za high-tech osjećaj.
- Dinamički `backdrop-filter` za zamućenje pozadine tijekom završetka igre.
- Animacije eksplozije i shake efekt pri porazu.

---

## 👤 Autor

- **MaNir007** - [GitHub profil](https://github.com/MaNir007)

---

_Izrađeno s ljubavlju prema retro igrama i modernom web dizajnu._

```
