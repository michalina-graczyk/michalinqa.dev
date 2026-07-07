---
title: "Gdy halucynacja staje się prawdą: O ślepych trafach algorytmów i koszmarze ewaluacji LLM-ów"
date: 2026-07-07
excerpt: "Gemini wymyślił wydarzenie, którego oficjalnie nie było. A jednak telebim stał na plaży i ludzie kibicowali. Historia o tym, jak losowy strzał algorytmu zamienił się w fascynujący edge case z pogranicza ewaluacji AI."
tags: ["LLM", "Hallucination", "Evals", "AI", "Edge Case"]
lang: pl
draft: false
---

Hiszpania to zdecydowanie moje miejsce na ziemi. Ostatnie wakacje wypadły akurat w terminie meczu Hiszpania-Austria, a znając trochę tutejszą kulturę, postanowiłam zapytać Gemini, czy może gdzieś organizowana jest jakaś strefa kibica. Coś w stylu tych, które pamiętamy z Euro 2012.

Zadaję więc pytanie, jako najzwyklejszy użytkownik, czy coś się dzisiaj dzieje. Model odpowiada pewnie: no jasne, pewka! Na plaży Platja de la Fossa stoi ogromny telebim, mecz startuje o 21:00, zbierają się tłumy.

Pytam o źródło.

Model robi zwrot o 180 stopni. Przyznaje, że wszystko zmyślił. Połączył fakt, że mecz faktycznie się odbywa, z typowymi letnimi atrakcjami w hiszpańskich kurortach i bezpodstawnie wymyślił detale o telebimie na Platja de la Fossa. Sprawdził w wyszukiwarce. Oficjalny kalendarz imprez miasta Calpe na lipiec nie wspominał o żadnej strefie kibica ani wydarzeniu na plaży. Halucynacja. Klasyczna, podręcznikowa. Model przyznał się bez bicia.

Poszłam więc oglądać mecz w pobliskiej knajpce, idę promenadą a tam:

**Telebim stał. Dokładnie tam, gdzie model powiedział.**

Co zrobiłby zwykły użytkownik? Byłby zachwycony. Co robi tester LLM-ów? Zaczyna się niepokoić, bo właśnie zderzył się z jednym z najbardziej podchwytliwych edge case'ów w świecie AI: trafieniem probabilistycznym, które w metrykach ewaluacji powinno być błędem, a w rzeczywistości okazało się prawdą 🤯.

---

## Anatomia "szczęśliwego trafu", czyli jak działa niedeterminizm

Z punktu widzenia architektury LLM, model nie "wiedział", że telebim tam stoi. Modele nie mają intuicji ani ukrytych oczu w świecie fizycznym. To, co się wydarzyło, to czysta matematyka i rozkład prawdopodobieństwa tokenów w przestrzeni wektorowej.

Kiedy sieć neuronowa budowała odpowiedź, algorytm musiał zmapować intencję zapytania na realia geograficzne. Calpe to miasto o ograniczonej liczbie masowych punktów orientacyjnych. W danych treningowych zbitka słów "Calpe + wydarzenie + plaża" najsilniej koreluje z Platja de la Fossa, która statystycznie dominuje w kontekście letnich atrakcji turystycznych. Z kolei ludzka logika organizatorów eventów działa podobnie do wag statystycznych modelu - jeśli robisz wielką strefę kibica w Calpe, robisz ją na największej, najbardziej dostępnej plaży.

Model niczego nie wyszukał. Wygenerował najbardziej prawdopodobny scenariusz, a rzeczywistość idealnie się pod ten scenariusz podłożyła.

---

## Koszmar ewaluacyjny: Pass czy Fail?

Dla osób zajmujących się automatyzacją testów i ewaluacją systemów opartych o LLM-y, taka sytuacja to czysty paradoks. Spójrzmy na to przez pryzmat metryk, które stosujemy w systemach ewaluacji AI.

**Faithfulness / Grounding** - jeśli nasz system ewaluacyjny porównałby odpowiedź modelu z dokumentem kontekstowym - czyli oficjalnym kalendarzem miejskim Calpe na lipiec - wynik byłby jednoznaczny: **0/1, FAIL**. Model wymyślił encję, której nie było w dostarczonym kontekście.

**Real-world Accuracy** - gdyby ktoś pojechał sprawdzić na miejscu: **1/1, PASS**. Telebim stał.

Ten sam output. Dwa różne wyniki oceny.

I tu pojawia się fundamentalne pytanie: jak oceniać systemy, które podają poprawne odpowiedzi z całkowicie błędnych powodów?

Tu leży sedno paradoksu. Hallucination Detection zadziałał poprawnie - to był TRUE POSITIVE. Mechanizm był błędny: model nie miał grounding, wymyślił encję bez pokrycia w źródłach. Eval pipeline oceniał pierwotną odpowiedź, zanim model przyznał się do halucynacji po pytaniu o źródło. Grounding eval wystawił FAIL słusznie. Ale treść odpowiedzi okazała się zgodna z rzeczywistością - i użytkownik, który stanął przed telebimem, dostałby PASS. W systemach asystenckich to zabawna anegdota. W systemach medycznych, prawnych czy finansowych - śmiertelne niebezpieczeństwo. "Szczęśliwy traf" w dawkowaniu leku wciąż pozostaje krytycznym błędem systemu, nawet jeśli pacjent poczuł się lepiej.


## Wnioski z plaży w Calpe

Niedeterminizm generatywnego AI potrafi oczarować i zaskoczyć. Jednak jako inżynierowie jakości nie możemy dać się upić tym sukcesem.

Projektując systemy produkcyjne, naszym zadaniem jest eliminacja ślepego trafu na rzecz powtarzalnej, dającej się udowodnić prawdy. Bo jutro model może z tą samą pewnością siebie wskazać telebim na plaży, której w ogóle nie ma - i wtedy użytkownik zamiast strefy kibica zastanie jedynie szum fal.

Kilka pytań, które warto zadać sobie przy projektowaniu ewaluacji:

- Czy twój eval mierzy tylko grounding, czy też real-world accuracy? Jeśli tylko jedno - znasz już swoje ślepe punkty.
- Czy masz mechanizm oznaczania odpowiedzi "nie do zweryfikowania w czasie oceny"? Brak tej kategorii to źródło fałszywych wniosków o jakości systemu.
- Czy rozróżniasz błąd mechanizmu od błędu wyniku? Przypadkowa poprawna odpowiedź to nie sukces - to luka w przewidywalności.

Halucynacja, która okazała się prawdą, to rzadki edge case. Ale to właśnie takie momenty weryfikują, czy twój system ewaluacji jest naprawdę przemyślany.

*Vamos España! I udanych testów dla wszystkich.* 🇪🇸
