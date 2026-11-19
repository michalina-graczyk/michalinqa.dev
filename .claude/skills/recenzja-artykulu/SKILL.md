---
name: recenzja-artykulu
description: Recenzja artykułu blogowego Michaliny (src/content/blog) - weryfikacja merytoryczna, językowa i zgodności z jej autorskim stylem. Użyj, gdy użytkowniczka prosi o recenzję, review, sprawdzenie, korektę lub "przejrzenie" artykułu albo draftu, po polsku lub angielsku.
---

# Recenzja artykułu

Recenzujesz tekst jak doświadczony redaktor techniczny, który zna styl autorki. Cel: tekst ma być poprawny merytorycznie, czysty językowo i brzmieć jak Michalina. **Ulepszasz, nie przepisujesz.** Nie zmieniasz znaczenia wypowiedzi i nie dopisujesz fikcyjnych danych.

Źródło prawdy o stylu: `docs/CONTEXT.md`. Przeczytaj go przed recenzją. Kontekst serii: `docs/LLM_SERIES.md`.

## 0. Wybór tekstu

- Jeśli użytkowniczka podała plik, recenzuj go.
- Jeśli nie, weź pliki nieśledzone lub zmienione w `src/content/blog/` (`git status`). Przy kilku kandydatach zapytaj, który.
- Nie edytuj pliku w trakcie recenzji. Zmiany nanosisz dopiero, gdy autorka o to poprosi.

## 1. Kontrola mechaniczna (skrypt)

Uruchom:

```bash
bash .claude/skills/recenzja-artykulu/check.sh <ścieżka-do-artykułu>
```

Skrypt zgłasza: pauzy/półpauzy (— –), cudzysłowy niezgodne z językiem tekstu, formy Ty/Twój pisane małą literą, długie akapity, martwe linki wewnętrzne `/blog/...` oraz braki we frontmatterze. Każde trafienie zweryfikuj w kontekście (np. „twój” w cytacie lub w kodzie jest OK) i przenieś do raportu tylko prawdziwe problemy.

## 2. Weryfikacja merytoryczna

Najważniejsza część. Sprawdź:

- **Fakty i twierdzenia techniczne** - definicje, działanie narzędzi, nazwy metryk, API, wersje, daty, liczby, cytowane badania. Twierdzenia, które mogły się zdezaktualizować lub są specyficzne (nowe modele, funkcje narzędzi, statystyki), sprawdź w sieci (WebSearch/WebFetch). Podaj źródło weryfikacji w raporcie.
- **Logika argumentacji** - czy wnioski wynikają z przesłanek, czy nie ma sprzeczności między sekcjami, czy przykład faktycznie ilustruje tezę.
- **Luki** - zbyt skrócone wyjaśnienia, pojęcia użyte bez definicji, przeskoki myślowe, brak "po co" (wartość biznesowa, ryzyko, koszt).
- **Zbyt ogólne fragmenty** - miejsca, gdzie przydałby się konkretny przykład, narzędzie, liczba lub scenariusz z QA/SDLC.
- **Spójność z serią i innymi wpisami** - terminologia zgodna z wcześniejszymi artykułami (np. nazwy kategorii evals), brak sprzeczności z tym, co już opublikowano. Zaproponuj linki wewnętrzne do powiązanych wpisów.
- **Transportowalna wiedza** - czy czytelnik po lekturze wie, co wdrożyć, poprawić lub zmierzyć.

Rozróżniaj pewność: "błąd" (sprawdzone, jest źle) vs "do weryfikacji" (nie udało się potwierdzić). Nie zgaduj.

## 3. Weryfikacja językowa

- Ortografia, interpunkcja (szczególnie przecinki przed "który", "że", "bo", imiesłowami), literówki, odmiana anglicyzmów (np. "edge case'ów", "LLM-ów").
- Spójność terminów: ten sam termin zapisany zawsze tak samo (np. "golden set" vs "Golden Set", "LLM-as-a-Judge" vs "LLM Judge").
- Powtórzenia, wodolejstwo, zdania do skrócenia, strona bierna tam, gdzie lepsza czynna.
- Kalki z angielskiego, które brzmią sztucznie po polsku.

## 4. Zgodność ze stylem autorki

### Reguły twarde (zawsze zgłaszaj naruszenie)

- **Brak pauz i półpauz** (— –). Zawsze dywiz `-`.
- **Zwroty do czytelnika wielką literą**: Ty, Ciebie, Tobie, Ci, Cię, Twój, Twoja, Twoje, Twojego, Twoim, Twojej, Twoich, Twoimi oraz Wy, Was, Wam, Wami, Wasz, Wasza, Wasze, Waszego, Waszym, Waszej. Dotyczy też checklist i pytań retorycznych. Wyjątek: cytaty i kod.
- **Spójny cudzysłów**: w tekstach `lang: pl` cudzysłów polski „…” (otwierający dolny, zamykający górny). W tekstach `lang: en` "…". Wyjątek: kod, frontmatter, atrybuty HTML/MDX.
- **Artykuł edukacyjny kończy się sekcją** "Checklista do tego wpisu" lub "Mini podsumowanie" oraz CTA (co wdrożyć, poprawić, zmierzyć).

### Cechy głosu (oceniaj, czy są obecne i naturalne)

Wzorce zaobserwowane w opublikowanych tekstach (`human-in-the-loop.md`, `gdy-halucynacja-staje-sie-prawda.md`):

- **Otwarcie od konkretu**: osobista historia, scena albo problem czytelnika, a nie definicja.
- **Narracja problem → rozwiązanie → efekty**, logiczne nagłówki `##`/`###`.
- **Krótkie akapity**: celuj w 1-3 zdania. Skrypt flaguje dłuższe, ale zgłaszaj tylko te, które naprawdę utrudniają skanowanie (zwykle 5+ zdań lub ściana tekstu).
- **Rytm**: jednozdaniowe akapity-puenty ("Człowiek.", "Pytam o źródło."), pogrubione otwarcia akapitów przy wyliczeniach, pytania retoryczne prowadzące do tezy.
- **Perspektywa techniczna i biznesowa**: nie tylko "jak", ale "po co" i jaki wpływ na jakość, koszt, ryzyko.
- **Praktyka**: realne przykłady z QA/SDLC, konkretne narzędzia, liczby z doświadczenia (bez zmyślania).
- **Ton**: partnerski, dojrzały, bez buzzwordów i marketingowego żargonu, bez akademickości i infantylizacji. Subtelny humor.
- **Hiszpańskie wstawki**: okazjonalne i naturalne (np. _poco a poco_, kursywą zamknięcie typu _Hasta la próxima._). Zgłaszaj zarówno przesyt, jak i sztuczne wciśnięcie.
- **Emoji**: oszczędnie, najwyżej kilka w całym tekście.
- **Zakończenie**: CTA (np. LinkedIn), linki wewnętrzne do serii, ciepłe domknięcie.

Wskaż też fragmenty, które brzmią "jak AI": generyczne otwarcia, triady przymiotników, "warto zauważyć, że", "w dzisiejszym dynamicznym świecie", sztuczne podsumowania każdego akapitu.

## 5. Raport

Odpowiedz po polsku, w tym formacie:

```markdown
## Recenzja: <tytuł>

**Werdykt:** gotowy do publikacji / drobne poprawki / wymaga pracy - jedno zdanie dlaczego.

### Co działa
2-4 punkty, konkretnie (które fragmenty są mocne i dlaczego).

### 🔴 Blokujące
Błędy merytoryczne, sprzeczności, naruszenia reguł twardych.

### 🟡 Warto poprawić
Luki, ogólniki, styl, struktura.

### ⚪ Kosmetyka
Literówki, interpunkcja, drobne sformułowania.
```

Każda uwaga w sekcjach 🔴🟡⚪:

- lokalizacja (`plik:linia` lub nagłówek sekcji),
- cytat problematycznego fragmentu,
- co jest nie tak (jedno zdanie),
- propozycja poprawki w głosie autorki (gotowa do wklejenia).

Uwagi mechaniczne tego samego typu grupuj (np. "pauzy: linie 12, 40, 77") zamiast listować osobno.

Na końcu zaproponuj: "Nanieść poprawki z sekcji 🔴 i ⚪?" Sekcję 🟡 nanoś tylko na wyraźną prośbę, bo dotyczy decyzji autorskich.
