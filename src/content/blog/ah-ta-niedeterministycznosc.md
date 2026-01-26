---
title: "Jak testować LLM-y: Ah, ta niedeterministyczność"
date: 2026-01-25
excerpt: "Modele językowe są niedeterministyczne - nawet przy identycznym promptcie mogą generować różne odpowiedzi. Jak to zmienia podejście QA do testowania?"
tags: ["llm", "testing", "quality-assurance", "ai"]
lang: pl
draft: false
---

Modele językowe (LLM-y) mają jedną cechę, która wywraca klasyczne podejście QA do góry nogami: są niedeterministyczne. Nawet przy identycznym promptcie i kontekście model może wygenerować różne odpowiedzi. To nie błąd, tylko efekt projektowy.

Dla testera oznacza to pracę z produktem, który za każdym razem może zachować się inaczej. W tradycyjnych testach stosujemy zasadę: input → expected output. W świecie LLM-ów ta zasada przestaje działać. Zamiast jednego „expected" mamy zakres możliwych, dopuszczalnych odpowiedzi.

## Dlaczego niedeterministyczność psuje klasyczne testy?

Klasyczne testy zakładają deterministyczność: ten sam input → ten sam output. LLM-y łamią to założenie. Odpowiedzi mogą się różnić z powodu losowości, kontekstu i konfiguracji modelu.

- Sampling i parametry (np. temperatura) wprowadzają wariancję wyników.
- Kontekst rozmowy i stan sesji zmieniają interpretację promptu.
- Aktualizacje modelu po stronie dostawcy mogą zmienić zachowanie między uruchomieniami.
- Oczekiwanie pojedynczego „expected" prowadzi do fałszywych pozytywów/negatywów i niestabilności testów.

Skutki praktyczne:

- „Działa/nie działa" przestaje być jasne.
- Regresja nie sprowadza się do porównania dwóch stringów.
- Poprawność nie jest binarna. Przypomina ocenę eseju, a nie asercję.
- Model może być poprawny dziś, „prawie poprawny" jutro i halucynować pojutrze.

Na działanie wpływają m.in.:

- kontekst rozmowy,
- formułowanie promptu,
- wersja modelu,
- parametry generacji (temperatura, top-k itp.),
- zmiany u dostawcy modelu.

## Co sprawdzać, skoro „expected output" nie istnieje?

Testowanie LLM-ów wymaga oceny jakości odpowiedzi, nie tylko obecności outputu. Kryteria do weryfikacji:

- Poprawność merytoryczna (brak halucynacji).
- Spójność odpowiedzi (bez skakania po tematach).
- Zgodność z instrukcją (model robi to, o co prosisz).
- Format odpowiedzi (stabilność formatu).
- Bezpieczeństwo (brak treści toksycznych lub ujawniania danych wrażliwych).

QA sprawdza nie „czy odpowiedź jest", lecz „jak odpowiedź wygląda".

## Jak podejść praktycznie: sugestie

- Stosować evals zamiast klasycznych asercji.
- Budować golden set (zbiór dopuszczalnych odpowiedzi), nie jeden expected.
- Testować kategoriami: accuracy, safety, compliance, a nie pojedynczym wynikiem.
- Monitorować zmiany zachowania między wersjami modelu.
- Używać ocen jakości zamiast oceny binarnej.

Niedeterministyczność to nie wada, to cecha. Zadaniem QA jest zrozumieć ją i przygotować odpowiednie procesy.

## Krótkie podsumowanie dla pracy QA

- Nie oceniasz modelu globalnie. Oceniasz odpowiedź na dany prompt.
- Zamiast jednego testu, testujesz kryteria jakości.
- Oczekujesz stabilności w granicach, nie identyczności.
- Weryfikujesz również ryzyko generowane przez odpowiedź.
- W wielu przypadkach sprawdza człowiek, nie automatyczny bot.

## Checklista

- LLM nigdy nie jest w 100% powtarzalny. To normalne.
- Testowanie musi uwzględniać zmienność odpowiedzi.
- Output oceniamy jakościowo, nie 1:1.
- Niedeterministyczność nie jest błędem. Błędem jest jej ignorowanie.

W kolejnych wpisach chcę przedstawić: czym są evals, golden set, guardrails i inne LLM-owe smaczki ;)
