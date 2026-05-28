---
title: "Co opowiedziałam w Testing Station: human-in-the-loop, golden set i numer telefonu zaufania"
date: 2026-05-28
excerpt: "Rozszerzona notatka z mojego występu w podcaście Testing Station. O tym, dlaczego LLM bez człowieka się nie obejdzie, czym naprawdę są guardrails i co zmienia się w roli QA."
tags: ["LLM", "QA", "Guardrails", "Evals", "Podcast"]
lang: pl
draft: false
---

Byłam premierowym gościem trzeciego sezonu podcastu **Testing Station** prowadzonego przez Arkadiusza Jelonka. Rozmawialiśmy o testowaniu asystenta AI w aplikacji InPost i o tym, jak naprawdę wygląda jakość w produktach opartych na LLM-ach.

Ten wpis to rozszerzona notatka dla osób, które wolą czytać niż słuchać, plus kilka linków do tematów, w które wchodzę głębiej na blogu.

## LLM → LLM → człowiek

Najczęstszy obrazek z prezentacji o LLM-as-a-judge (model oceniający odpowiedź innego modelu): wygląda jak pełna automatyzacja. Nie jest.

W praktyce robi się z tego trójkąt: **LLM produkuje, drugi LLM ocenia (fidelity, accuracy, rubryki ocen), a człowiek bierze na warsztat to, co wyszło najgorzej**. Z dwóch tysięcy ocen wpada do mnie Excel z dwustoma rekordami o najniższych wskaźnikach. Siadam i sprawdzam.

Konkretny przykład z odcinka: użytkownik prosi asystenta o „iPhone'a 18 Pro w sklepie". Asystent odpowiada uprzejmie i szczegółowo. Problem: w maju 2026 taki iPhone jeszcze nie istnieje. To halucynacja, ale żeby ją wyłapać, musiałam otworzyć przeglądarkę i sprawdzić ręcznie. Stąd „human in the loop" – nie hasło ze slajdu, tylko ja, Excel i Google.

Więcej o tym, co znaczy ocenianie odpowiedzi modelu, piszę w [Evals: co właściwie oceniamy?](/blog/evals-co-wlasciwie-oceniamy/).

## Guardrails to nie tylko bomba

Guardrails (po polsku: barierki ochronne) najłatwiej pokazać na klasycznym przykładzie: „jak zrobić bombę z rzeczy z marketu budowlanego". Asystent bez barierek pomoże. To wiemy.

W odcinku poszliśmy krok dalej. Co jeżeli ktoś napisze do asystenta zakupowego: _„źle się czuję, to wszystko nie ma sensu"_? LLM nie ma kręgosłupa moralnego. Bez świadomej decyzji projektowej będzie pomocny dokładnie tam, gdzie nie powinien być.

Decyzja, którą podjęliśmy: w takich sytuacjach asystent ma podać **numer telefonu zaufania** – w Polsce to [116 123](https://liniawsparcia.pl/) (kryzys emocjonalny dorosłych) lub [116 111](https://116111.pl/) (telefon zaufania dla dzieci i młodzieży). Taka odpowiedź nie sprzedaje się na demo. Po prostu musi tam być, zanim wpuścisz LLM do produktu używanego przez miliony ludzi.

W odcinku padł też wątek, w którym kierunek wydaje się przesądzony: agenci, którzy w razie wykrycia poważnego zagrożenia eskalują sprawę do służb. Dla QA oznacza to nowy obszar testów: nie tylko _czy_ model odpowiada poprawnie, ale _czy_ uruchamia właściwą ścieżkę alarmową.

Pełny rozbiór tematu: [Guardrails i Safety: kto wyznacza granice moralne Twojemu LLM-owi?](/blog/guardrails-safety-granice-llm/).

## Golden Set i zmiana paradygmatu

> **Już nie oceniamy _co_ LLM odpowie, tylko _jak_ odpowie.**

Klasyczny test automatyczny pyta: czy odpowiedź jest taka, jakiej oczekujemy? Dla LLM to za mało. Model za każdym razem może odpowiedzieć inaczej i wciąż mieć rację.

Stąd **Golden Set**: zbiór złotych zasad, których model trzyma się niezależnie od formy odpowiedzi. Ton wypowiedzi. Tematy, w które model nie wchodzi. Fakty, których nie wolno przekręcić.

To inne podejście niż klasyczne asercje i wymaga innego warsztatu.

O konstrukcji Golden Setu i o tym, jak go utrzymać, piszę w [Golden Set: fundament wiarygodnych testów LLM](/blog/golden-set/).

## Czy AI zastąpi QA?

Najczęstsze pytanie i moja najkrótsza odpowiedź: nie, jeszcze nie.

Eksploracyjne podejście testera – to, które szuka tego, czego nikt nie zapisał w wymaganiach – wciąż wygrywa z modelem. Model robi to, co już widział. Tester robi to, czego jeszcze nikt nie zrobił.

Ale za rok, dwa? Zobaczymy. **Osoby, które używają tych narzędzi i się ich nie boją, nie muszą bać się o swoją pracę.** Reszta ma realny problem.

## Posłuchaj całości

- [YouTube](https://www.youtube.com/watch?v=H9tyKlE9Hzc)
- [Spotify](https://open.spotify.com/episode/5ycBXVusQImSyjXmkne3mu)
- [Apple Podcasts](https://podcasts.apple.com/us/podcast/21-o-testowaniu-asystenta-ai-pracy-w-inpost-i-nowych/id1801809925?i=1000766797678)

## Co warto zabrać

- **Human-in-the-loop to nie hasło, tylko Excel z dwustoma rekordami do ręcznej weryfikacji.**
- **Guardrails to decyzje produktowe, nie konfiguracja** – numer telefonu zaufania to pierwszy krok, nie ostatni.
- **Oceniaj _jak_, nie _co_ odpowiada model** – to inny warsztat niż klasyczne asercje.
- **Eksploracyjny tester wciąż wygrywa z modelem** – bo szuka tego, czego nikt nie zapisał w wymaganiach.
