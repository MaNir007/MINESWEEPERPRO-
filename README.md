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
