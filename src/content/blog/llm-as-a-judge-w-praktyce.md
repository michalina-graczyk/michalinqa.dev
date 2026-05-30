---
title: "LLM-as-a-Judge: Kto ocenia sztuczną inteligencję?"
date: 2026-05-30
excerpt: "Mamy już Golden Set i wiemy, co chcemy mierzyć. Pozostaje tylko jedno pytanie: kto ma to wszystko oceniać? Dlaczego manualne testowanie LLM-ów nie ma szans na przetrwanie i jak wdrożyć zautomatyzowanego sędziego."
tags: ["llm", "evals", "testing", "quality-assurance", "ai", "llm-as-a-judge"]
lang: pl
draft: false
---

Jeśli czytałeś poprzednie wpisy z serii, wiesz już, z czym wiąże się [niedeterminizm LLM-ów](/blog/ach-ta-niedeterministycznosc/) i dlaczego tradycyjne asercje w QA tu nie zadziałają. Omówiliśmy już [kategorie oceny (evals)](/blog/evals-co-wlasciwie-oceniamy/) oraz zbudowaliśmy nasz wzorzec, czyli [Golden Set](/blog/golden-set/). Zdefiniowaliśmy zatem bardzo dokładnie, _co_ i _na czym_ testujemy.

Brakuje nam tylko jednego elementu: **kto ma to testować?**

Przy 2 000 przypadków testowych, ocena każdej interakcji z asystentem AI i sprawdzenie jej pod kątem 5 różnych kategorii (np. bezpieczeństwo, dokładność, ton) zajęłaby człowiekowi kilkadziesiąt, a nawet ponad 100 godzin mozolnej pracy. Koszt? Tysiące euro. Czas? Na tyle długi, że w międzyczasie zespół deweloperski zdążyłby wdrożyć kolejne poprawki i proces trzeba by zacząć od nowa.

Manualna ocena każdej wygenerowanej odpowiedzi to _gold standard_, ale kompletnie nie spina się biznesowo. I tutaj na scenę wkracza koncepcja **LLM-as-a-Judge**.

## Czym jest LLM-as-a-Judge?

Mówiąc najprościej: to sytuacja, w której używamy drugiego, silnego modelu językowego do tego, aby ocenił odpowiedź wygenerowaną przez testowanego asystenta. Twój agent AI jest sprawdzany przez innego agenta.

Zamiast sztywnych asercji w kodzie testów automatycznych, piszemy dedykowany **prompt ewaluacyjny**. Taki prompt musi zawierać podstawowe elementy:

1. **Input** - pytanie lub zadanie, które otrzymał nasz bot.
2. **Output** - odpowiedź, którą nasz bot wygenerował.
3. **Rubrykę** - bardzo jasną instrukcję, według jakich kryteriów sędzia ma ocenić tekst (np. od 1 do 5 w kategorii dokładności).
4. **Odpowiedź referencyjną (opcjonalnie)** - weryfikując np. poprawność faktograficzną, dorzucamy do promptu idealną odpowiedź wyciągniętą z naszego Golden Setu. Sędzia ma wtedy łatwiej: nie musi zgadywać, czy testowany model mówi prawdę, po prostu porównuje wygenerowany tekst ze wzorcem. To drastycznie zmniejsza ryzyko halucynacji samego sędziego.

To zmienia układ sił. Zamiast czekać tygodniami na wyniki testów manualnych, otrzymujesz skoring tych samych 2 000 scenariuszy w 30 minut, ponosząc wyłącznie ułamek kosztów (np. 50 euro za zapytania do API). Z taką automatyzacją faktycznie możesz wrzucić ewaluację AI do swojego pipeline'u CI/CD.

## Mechanizm "Chain of Thought" - dlaczego sędzia musi myśleć na głos?

Podstawowym błędem podczas wdrażania LLM Judge'a jest proszenie go wyłącznie o wystawienie punktacji (np. `score: 4`). Model, który wypluwa od razu suchą cyfrę, częściej się myli i dużo trudniej go zdebugować.

Zamiast tego stosujemy zasadę _Chain-of-Thought_ (CoT). Wymuszamy w prompcie sędziego, aby jego output miał określoną strukturę:

1. `reasoning` - najpierw uzasadnij swoją decyzję, wypunktuj co poszło dobrze, a co źle.
2. `score` - dopiero potem podaj finalną ocenę numeryczną.
3. `label` - oznacz test jako PASS/FAIL.

Dzięki temu sędzia myśli "krok po kroku", a Ty jako QA zyskujesz czytelny log i dowód na to, dlaczego odpowiedź została potraktowana jako niewystarczająca.

## Pułapki i ryzyka: Sędzia nie jest idealny

Oczywiście wpuszczanie modelu do oceny innego modelu nie jest magiczną różdżką. Wprowadzasz do procesu testowego kolejną warstwę niedeterminizmu. Na co musisz uważać?

- **Ryzyko "Echa"** - modele bardzo często preferują styl odpowiedzi, który same by wygenerowały. Jeśli agent opiera się na modelu GPT-4o, a do roli sędziego zatrudnisz również GPT-4o, sędzia będzie miał naturalną tendencję do faworyzowania tych odpowiedzi.
- **Missalignment (Rozjazd z oczekiwaniami ludzi)** - modele wciąż mają swoje ograniczenia poznawcze. Sędzia potrafi na przykład wyżej ocenić odpowiedź obiektywnie gorszą i rozwlekłą (lanie wody) niż trafną i zwięzłą, tylko dlatego, że "wygląda na bardziej wyczerpującą".
- **Ekonomia skali** - przy gigantycznej liczbie zapytań i bardzo złożonych kryteriach oceny, koszt wywołań sędziego API może urosnąć.

## Kalibracja, czyli uczymy sędziego oceniać

Jak udowodnić, że nasz automatyczny sędzia ma rację? Przez kalibrację.

Nie puszczasz Judge'a na produkcję, dopóki nie masz pewności, że myśli tak jak Ty. Wybierasz 20-30 losowych interakcji ze swojego Golden Setu. Oceniasz je osobiście (w skali 1-5), a potem przepuszczasz te same przypadki przez LLM-Judge'a. Następnie siadasz i porównujesz wyniki.

Gdziekolwiek pojawia się duży rozjazd w ocenie (Ty dałeś 2, model dał 5), tam musisz dopracować rubrykę oceny w prompcie sędziego. Prawdopodobnie Twoje kryteria były dla niego zbyt niejasne. Twoim celem biznesowym powinno być osiągnięcie przynajmniej 85-90% korelacji między sędzią a oceną ludzką. Dopiero wtedy masz prawo wpuścić takiego sędziego do potoku CI/CD. _Poco a poco._

## Checklista do tego wpisu

- Zacznij od zbudowania solidnego Golden Setu, do którego przyłożysz ocenę.
- W prompcie sędziego zawsze wymuszaj `reasoning` (uzasadnienie) przed podaniem oceny liczbowej.
- Gdzie to możliwe, dostarczaj sędziemu odpowiedź referencyjną z Golden Setu – ułatwi mu to pracę i ograniczy jego halucynacje.
- Pilnuj kalibracji: dąż do poziomu >85% korelacji między Twoją oceną a oceną LLM.
- Uważaj na zjawisko echa - rozważ wykorzystanie innego dostawcy jako sędziego (np. testujesz na modelu OpenAI, ale sędzią jest model od Anthropic).
- Nie wdrażaj Judge'a do CI/CD, dopóki nie zweryfikujesz ręcznie kilkudziesięciu jego werdyktów.

## Podsumowując

Zautomatyzowany sędzia pozwala na ewaluację modeli w skali, z którą żaden człowiek nie miałby szans konkurować pod kątem czasu i budżetu. Z drugiej strony, jeśli wydaje Ci się, że po wdrożeniu Judge'a możesz całkowicie zrezygnować z testerów i oddać kontrolę jakości wyłącznie w ręce maszyn... to masz rację, wydaje Ci się.

W kolejnej, siódmej części cyklu porozmawiamy o koncepcji **Human-in-the-loop** – czyli dlaczego za każdym skutecznym agentem AI i tak musi ostatecznie stanąć człowiek ze zdrowym rozsądkiem.
