---
title: "Co opowiedziałam w Testing Station: human-in-the-loop, golden set i numer telefonu zaufania"
date: 2026-05-28
excerpt: "Rozszerzona notatka z mojego występu w podcaście Testing Station. O tym, dlaczego LLM bez człowieka się nie obejdzie, czym naprawdę są guardrails i co zmienia się w roli QA."
tags: ["LLM", "QA", "Guardrails", "Evals", "Podcast"]
lang: pl
draft: false
---

Byłam premierowym gościem trzeciego sezonu podcastu **Testing Station** prowadzonego przez Arkadiusza Jelonka. Rozmawialiśmy o testowaniu asystenta AI w aplikacji InPost i o tym, jak realnie wygląda jakość w produktach opartych o LLM-y.

Ten wpis to rozszerzona notatka dla osób, które wolą czytać niż słuchać, i kilka linków do tematów, w które wchodzę głębiej na blogu.

## Trójkąt LLM → LLM → Human

Najpopularniejszy obrazek z prezentacji o LLM-as-a-judge: model ocenia odpowiedź modelu. Wygląda jak pełna automatyzacja. Nie jest.

W praktyce robi nam się trójkąt: **LLM produkuje, drugi LLM ocenia (fidelity, accuracy, rubryki), a człowiek bierze na warsztat to, co wyszło najgorzej**. Z dwóch tysięcy ocen wpada do mnie Excel z dwustoma wpisami o najniższych wskaźnikach. Siadam i sprawdzam.

Konkretny przykład z odcinka: użytkownik prosi asystenta o "iPhone 18 Pro w sklepie". Asystent odpowiada uprzejmie i szczegółowo. Problem: w dniu testu taki iPhone nie istnieje. To halucynacja, ale żeby ją wyłapać, musiałam wejść do internetu i sprawdzić. _Poco a poco_ uczymy się, że "human in the loop" to nie hasło ze slajdu, tylko realna praca QA, której LLM nam nie odbierze.

Więcej o tym, co znaczy ocenianie odpowiedzi modelu, piszę w [Evals: co właściwie oceniamy?](/blog/evals-co-wlasciwie-oceniamy/).

## Guardrails to nie tylko bomba

Guardrails (po polsku: barierki ochronne) najłatwiej pokazać na klasycznym przykładzie: "jak zrobić bombę z rzeczy z marketu budowlanego". Asystent bez barierek pomoże. To wiemy.

W odcinku poszliśmy krok dalej. Co jeżeli ktoś napisze do asystenta zakupowego: _"źle się czuję, to wszystko nie ma sensu"_? LLM nie ma kręgosłupa moralnego. Bez świadomej decyzji projektowej będzie próbował być pomocny w najgorszy możliwy sposób.

Konkretna decyzja, którą podjęliśmy: w takich sytuacjach asystent ma podać **numer telefonu zaufania**. To nie jest fajny feature do demo. To jest minimum, które ktoś musi przemyśleć, zanim wpuści LLM do produktu, z którego korzystają miliony ludzi.

W odcinku padło też hasło, w którym kierunek wydaje się przesądzony: agenci, którzy w razie wykrycia poważnego zagrożenia eskalują sprawę do służb. Dla QA oznacza to nowy obszar testów: nie tylko _czy_ model odpowiada poprawnie, ale _czy_ uruchamia właściwą ścieżkę alarmową.

Pełny rozbiór tematu: [Guardrails i Safety: kto wyznacza granice moralne Twojemu LLM-owi?](/blog/guardrails-safety-granice-llm/).

## Golden Set i zmiana paradygmatu

Klasyczny test automatyczny ocenia: czy odpowiedź jest taka, jakiej oczekujemy? Dla LLM to nie wystarcza. Model za każdym razem może odpowiedzieć inaczej i wciąż mieć rację.

Stąd **Golden Set**: zbiór złotych zasad, których model trzyma się niezależnie od formy odpowiedzi. Ton, zakres tematyczny, fakty, których nie wolno przekroczyć.

To, co warto zabrać z odcinka, w jednym zdaniu: **już nie oceniamy _co_ LLM odpowie, tylko _jak_ odpowie**. To inny mindset niż klasyczne assert-y i wymaga innego warsztatu.

O konstrukcji Golden Setu i o tym, jak go utrzymać, piszę w [Golden Set: fundament wiarygodnych testów LLM](/blog/golden-set/).

## Czy AI zastąpi QA?

Najczęstsze pytanie i moja najkrótsza odpowiedź: nie, jeszcze nie.

Eksploracyjny qwayowy mindset, który szuka tego, czego nikt nie napisał w wymaganiach, wciąż wygrywa z modelem. Model robi to, co już widział. Tester robi to, czego jeszcze nikt nie zrobił.

Ale za rok dwa? Like Will Smith eating spaghetti, zobaczymy. Pewne jest jedno: **osoby, które używają tych narzędzi i się ich nie boją, nie muszą bać się o swoją pracę**. Osoby, które omijają temat, mają realny problem.

## Posłuchaj całości

- [YouTube](https://www.youtube.com/watch?v=H9tyKlE9Hzc)
- [Spotify](https://open.spotify.com/episode/5ycBXVusQImSyjXmkne3mu)
- [Apple Podcasts](https://podcasts.apple.com/us/podcast/21-o-testowaniu-asystenta-ai-pracy-w-inpost-i-nowych/id1801809925?i=1000766797678)

## Mini podsumowanie

1. **LLM-as-a-judge nie zwalnia z człowieka.** Najsłabsze wskaźniki zawsze trafiają na ręczną weryfikację.
2. **Guardrails to decyzje produktowe, nie konfiguracja.** Numer telefonu zaufania to pierwszy krok, nie ostatni.
3. **Golden Set zmienia pytanie z "co odpowiedział" na "jak odpowiedział".**
4. **Eksploracja wciąż wygrywa z automatyzacją.** Tester szuka tego, czego model nie widział.
5. **Kto używa AI, nie musi się bać AI.** Kto omija temat, ma problem.
