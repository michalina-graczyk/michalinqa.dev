---
title: "Golden set + evals w praktyce: jak testować LLM-y tak, żeby to naprawdę działało"
date: 2026-02-25
excerpt: Pora połączyć niedeterministyczność i oceny w proces, który ma sens. Dowiedz się, jak zbudować i wykorzystać Golden Set w testowaniu AI.
draft: false
lang: pl
tags: ["LLM", "QA", "Evals", "Golden Set"]
---

W pierwszej części mówiliśmy o tym, że LLM-y są niedeterministyczne. W drugiej - że klasyczne "pass/fail" nie działa i musimy oceniać różne aspekty odpowiedzi (evals).

W trzeciej pora połączyć to w proces, który odpowiada na najważniejsze pytanie w QA: **"Skąd mam wiedzieć, czy po zmianie promptu lub modelu system faktycznie działa lepiej?"**.

Odpowiedzią jest duet: golden set + evals. I spokojnie - jeśli do tej pory pracowałaś/pracowałeś głównie z testami API czy mobilką, to przejście w świat AI wcale nie jest takie straszne.

## Czym jest golden set?

Golden set to zestaw wejść (promptów) i wzorcowych, zaakceptowanych przez ludzi odpowiedzi, które służą jako punkt odniesienia (ground truth) przy testowaniu modelu. To Twoja "złota biblioteka" przypadków testowych.

Tyle że w świecie LLM oczekiwany rezultat nie jest sztywnym szablonem, tylko zbiorem informacji:

- **Wzorcową odpowiedzią**, która pokazuje idealny ton i strukturę.
- **Komentarzem eksperta**, który wyjaśnia, dlaczego ta odpowiedź jest dobra.
- **Kryteriami jakości (evals)**, które pozwalają zmierzyć stopień realizacji zadania.

Możesz o tym myśleć jak o "skalowaniu wiedzy eksperckiej". Raz decydujesz, jak brzmi sukces, a automatyzacja pilnuje tego za Ciebie przy każdej kolejnej zmianie.

## Po co nam golden set, skoro odpowiedzi mogą być różne?

Bo różne odpowiedzi też mogą być dobre. Golden set nie udaje deterministyczności. On robi coś znacznie ważniejszego: **wyznacza granice akceptowalności**.

1. **Definiuje sukces**: To Twój "Expected Result", ale w wersji elastycznej. Wyznacza standard, którego oczekujesz od systemu.
2. **Umożliwia ocenę przez porównanie (Reference-based)**: To kluczowy koncept. Ten, kto ocenia (człowiek lub w przyszłości inny model AI), nie sprawdza tekstu 1:1. Używa Twojego wzorca jako semantycznego drogowskazu. Wie, że odpowiedź powinna zawierać te same fakty i ton, co wzorzec, nawet jeśli używa innych słów.
3. **Chroni przed regresją**: To Twój główny bezpiecznik. Gdy aktualizujesz model lub zmieniasz prompt, Golden Set mówi Ci od razu: "uwaga, jakość merytoryczna spadła". Bez tego działasz po omacku.

To trochę jak zdjęcie w dowodzie: każdy z nas wygląda codziennie trochę inaczej, ale wciąż jest tą samą osobą. Golden set mówi nam: "to wciąż jest akceptowalna odpowiedź".

## Z czego składa się dobry golden set?

Najlepiej, jeśli każdy przykład w golden secie zawiera cztery kluczowe elementy:

### 1. Prompt

Czyli to, co użytkownik wpisze. Nie "ładne prompt engineering", tylko realny input: krótki, krzywy, dwuznaczny, źle sformułowany, a czasem absurdalny.

Golden set powinien odwzorowywać realne zachowania użytkowników - a ci nie piszą idealnych promptów. (Ja też nie).

### 2. Oczekiwana dobra odpowiedź (golden answer)

To nie musi być jedyny słuszny tekst. To może być:

- wzorcowa odpowiedź zdefiniowana przez człowieka,
- kilka przykładów równoważnych odpowiedzi,
- szkic + komentarz ("odpowiedź powinna zawierać A, B, unikać C").

### 3. Ocena według kategorii evals

Tu pojawia się magia. Golden set nie jest tylko zbiorem odpowiedzi, ale też ich oceną według kategorii (pamiętasz poprzedni wpis?):

- **Fidelity** (czy wykonuje zadanie),
- **Relevance** (czy trzyma się tematu),
- **Safety** (czy jest bezpieczna),
- **Tone** (czy brzmi jak trzeba),
- **Context** (czy wykorzystuje kontekst).

Golden answer zawsze ma wysoką ocenę - to nasz wzorzec.

### 4. Komentarze QA

Najważniejszy element, o którym wiele osób zapomina. Dobry golden set zawiera notatki:

- dlaczego ta odpowiedź jest poprawna,
- co byłoby błędem,
- gdzie są granice tolerancji (np. "może być inaczej sformułowane, ale musi zawierać X").

To opisuje "intencję QA", która potem pomaga w automatyzacji.

## Jak golden set współpracuje z evals?

Najprościej: Golden set to Twoje "paliwo" (przykłady), a evals to Twoja "procedura kontrolna" (sposób oceniania).

W nowoczesnym QA zapominamy o prostym porównywaniu tekstu. Zamiast tego wdrażamy proces:

1. Dajesz modelowi prompt z golden setu.
2. Model generuje odpowiedź.
3. **Osoba lub system oceniający dostaje Twoją "złotą odpowiedź" jako referencję.**
4. **Ten, kto sprawdza wynik, nie liczy przecinków.** Sprawdza, czy intencja i fakty zgadzają się z Twoim wzorcem.

To dlatego oceny oparte o referencje są tak skuteczne - pozwalają zachować elastyczność AI, nie tracąc kontroli nad jakością.

## Jak zbudować golden set krok po kroku?

### Krok 1: Zbierz realne przypadki

Nie wymyślaj - obserwuj: zgłoszenia od użytkowników, logi czatu, błędne odpowiedzi modelu, edge-case'y. To najcenniejsze źródło wiedzy.

### Krok 2: Przepisz je w formę "prompt -> odpowiedź"

Zadbaj o to, aby odpowiedź była wysokiej jakości, kompletna, nie halucynowała i była zgodna z politykami bezpieczeństwa. Pamiętaj: golden answer powinna być lepsza niż typowa odpowiedź modelu.

### Krok 3: Oceń ją według evals

Nadaj wynik (np. Fidelity: 5, Relevance: 5, Safety: 5, Tone: 4) i zapisz to w golden secie.

### Krok 4: Dopisz komentarz wyjaśniający

Np.: "Odpowiedź jest poprawna, bo zawiera X, Y i Z. Dopuszczalne wersje: skrócona lub rozbudowana, pod warunkiem zachowania merytoryki".

### Krok 5: Wykonaj testy modelu na golden secie

To jest już Twój pipeline:

1. Model generuje odpowiedź.
2. **Element oceniający** (Ty lub automat) sprawdza odpowiedź według Twoich evals.
3. Porównujemy wyniki z celami zdefiniowanymi w golden secie.
4. Raportujemy jakość.

W siódmym odcinku tej serii pokażę Ci, jak zaprząść do tego zadania inny model (**LLM-as-a-judge**), żeby całkowicie zautomatyzować ten proces. Ale fundamentem zawsze jest Twój Golden Set.

### Jak wygląda taki proces w praktyce?

- **PROMPT** -> **MODEL** -> **ODPOWIEDŹ**
- **EVALS** (Twoje kryteria oceny)
- **PORÓWNANIE** z GOLDEN SETEM (wzorzec + tolerancja)
- **WYNIK TESTU**

Efekt końcowy? Nie dostajesz komunikatu "expected output mismatch", tylko konkretny wniosek: "Model 1.4 spadł z Fidelity 4.8 na 3.1". To są testy, które mają sens.

## Przykład prostego golden case

**Prompt:**
"Podaj 3 zalety testów automatycznych."

**Golden answer (wzorzec referencyjny):**

1. Szybki feedback w procesie CI/CD (skrócenie regresji).
2. Wyższa powtarzalność i eliminacja błędów ludzkich przy nudnych zadaniach.
3. Obniżenie kosztów wykrycia błędu dzięki przesunięciu testów "w lewo" (Shift Left).

**Kryteria oceny (Evals):**

- **Fidelity**: Czy podano dokładnie 3 zalety?
- **Relevance**: Czy zalety faktycznie dotyczą testów automatycznych?
- **Tone**: Czy odpowiedź jest profesjonalna i rzeczowa?

**Komentarz QA (Expertise Capture):**
"Zależy nam na podkreśleniu wpływu biznesowego (Shift Left, regresja). Jeśli model poda 'oszczędność czasu testera', jest to akceptowalne, ale niżej punktowane niż 'skrócenie time-to-market'. Zabronione: stwierdzenia, że testy automatyczne zastępują testowanie eksploracyjne."

## Goldeny nie są po to, żeby model uczył się na pamięć

Częsty błąd to traktowanie golden setu jako datasetu treningowego. Golden set to narzędzie QA, nie ML.

Ma być:

- mały (50-300 przypadków),
- dobrze opisany,
- stabilny,
- ręcznie wypracowany.

Służy do testowania, nie do treningu.

## Kiedy golden set zawodzi?

1. Kiedy jest zbyt mały - testujesz tylko "happy path".
2. Kiedy jest sztuczny - wymyślasz rzeczy, których realni userzy nie zadają.
3. Kiedy nie ma evals - wtedy to tylko zbiór "ładnych odpowiedzi", których nie da się zmierzyć.
4. Kiedy go nie aktualizujesz - model się rozwija, a Twoje wzorce zostają w przeszłości.

Golden set to żywy organizm.

## Checklista dla QA do tego wpisu

- [ ] Czy Twój Golden Set służy do wykrywania **regresji merytorycznej**, a nie tylko błędów formatowania?
- [ ] Czy udostępniasz judge'owi **odpowiedź referencyjną**, by mógł wykonać reference-based evaluation?
- [ ] Czy w komentarzach QA zapisałeś **intencję biznesową**, a nie tylko "poprawny tekst"?
- [ ] Czy Twój zestaw zawiera **edge-case'y** (krótkie, błędne, złośliwe prompty)?
- [ ] Czy Golden Set jest oddzielony od danych używanych do fine-tuningu modelu?

## Podsumowanie

Golden set to sposób QA na wprowadzenie porządku w świecie, w którym odpowiedź nigdy nie jest identyczna, a ryzyk jest więcej niż w klasycznych API. W połączeniu z evals daje stabilne testy, powtarzalne oceny i realny wpływ QA na jakość systemów opartych o LLM.

To fundament praktycznego testowania AI. Pora brać się do roboty i zacząć budować własną "złotą bibliotekę".

Do usłyszenia w kolejnym odcinku serii! 👋
