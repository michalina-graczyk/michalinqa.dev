---
title: "Human-in-the-loop: AI nie zastąpi człowieka (człowiek z AI - owszem)"
date: 2026-07-19
excerpt: "Zbudowaliśmy cały pipeline: evals, golden set, guardrails, LLM-as-a-Judge. Wygląda jak pełna automatyzacja. Nie jest. Ostatni artykuł serii o tym, dlaczego za każdym skutecznym systemem AI i tak musi stanąć człowiek."
tags: ["LLM", "QA", "Human-in-the-loop", "Evals", "AI"]
lang: pl
draft: false
---

Jeśli czytasz tę serię od początku, masz już w głowie cały pipeline testowania LLM-ów. Wiesz, że modele są niedeterministyczne. Wiesz, jak definiować kategorie oceny i budować golden set. Umiesz projektować guardrails, testować odporność i skalować ocenę za pomocą LLM-as-a-Judge.

Wygląda to jak pełna automatyzacja. Model generuje, sędzia ocenia, guardrails blokują. Pipeline się kręci, dashboard świeci na zielono.

Ale jeśli myślisz, że możesz teraz usiąść wygodnie i oddać kontrolę maszynom, to mam złe wieści.

## "Pełna automatyzacja" to piękna iluzja

Każda warstwa automatyzacji, którą budowaliśmy w tej serii, ma swoje ślepe punkty. Każda. A te ślepe punkty się kumulują.

**LLM-as-a-Judge** skaluje ocenę, ale nie rozumie kontekstu biznesowego. Nie wie, że Twoja firma właśnie zmieniła politykę zwrotów i połowa golden setu jest nieaktualna.

**Guardrails** chronią przed oczywistym zagrożeniem ("jak zrobić bombę?"), ale nie przed subtelnym ("czuję, że to wszystko nie ma sensu"). Decyzja, żeby w takim momencie wyświetlić [numer telefonu zaufania](https://liniawsparcia.pl/) zamiast kolejnej porady zakupowej, to nie była decyzja algorytmu. To była decyzja ludzi w zespole produktowym.

**Golden set** łapie regresję, ale nie łapie tego, czego nikt nie przewidział. Bo nikt nie wpisał do golden setu promptu o iPhone 18 Pro, który w maju 2026 jeszcze nie istniał, a model pomimo to pewnym siebie tonem opowiadał o jego dostępności w sklepie.

Każda z tych warstw jest potrzebna. Żadna nie jest wystarczająca sama w sobie.

## Gdzie konkretnie człowiek jest niezastąpiony

Nie chodzi tu o filozoficzne dywagacje. Chodzi o konkretne miejsca w procesie, w których bez człowieka system zaczyna się rozjeżdżać.

### Kalibracja sędziego

Gdy wdrażasz LLM-as-a-Judge, dążysz do 85-90% korelacji między oceną maszyny a oceną ludzką. Ale kto na samym początku ustala, że "4/5" to faktycznie "4/5"?

Człowiek.

Pomyśl o tym tak: w marcu cieszysz się, że sędzia AI wreszcie ocenia dokładnie tak jak Ty. Ale przychodzi lipiec, twórcy modelu robią „drobną” aktualizację i nagle całe to porozumienie znika, bo maszyna zaczęła zwracać uwagę na inne detale. Dlatego ktoś musi regularnie siadać nad wynikami, brać próbkę ocen i ręcznie sprawdzać, czy model nadal nadaje z Wami na tych samych falach. To żmudna robota, do której zazwyczaj nikt się nie rwie. Ale bez niej cała ta automatyzacja bardzo szybko przestaje mieć sens.

### Aktualizacja golden setu

Dobry golden set to "żywy organizm". I to wcale nie jest metafora. Produkt się zmienia. Oferta się zmienia. Przepisy się zmieniają. Kontekst rynkowy się zmienia.

Kto decyduje, że wzorcowa odpowiedź z lutego jest nieaktualna w lipcu? Kto wie, że firma wycofała produkt X z oferty i każda odpowiedź modelu, która go poleca, jest teraz błędem? Żaden automat tego nie wie, dopóki człowiek nie zaktualizuje źródła prawdy.

Golden set bez regularnego ludzkiego przeglądu staje się fałszywym poczuciem bezpieczeństwa.

### Edge case'y poza wyobraźnią modelu

Model nie wie, czego nie wie. To brzmi banalnie, ale ma konkretne konsekwencje.

Świetnym przykładem jest moja ulubiona [halucynacja z Calpe](/blog/gdy-halucynacja-staje-sie-prawda/), gdzie model wymyślił telebim na plaży, który absolutnym przypadkiem tam stał. Automatyczny eval dałby temu PASS (treść zgodna z rzeczywistością) albo FAIL (brak grounding), w zależności od tego, czego szuka. Żaden z tych wyników nie oddaje prawdy: model trafił przypadkiem, a przypadek nie jest strategią testową.

Podobnie jest z przykładem z [Testing Station](/blog/testing-station-llm-qa-w-praktyce/), czyli halucynacją o iPhone 18 Pro. Asystent odpowiedział pewnie i szczegółowo o produkcie, który nie istnieje. Żeby to wyłapać, musiałam otworzyć przeglądarkę i sprawdzić to ręcznie. Nie potrzebowałam do tego wygenerowanych dashboardów czy pięknych slajdów, wystarczył Excel i sprawdzanie faktów w Google na piechotę.

Testowanie eksploracyjne wciąż wygrywa, bo szuka tego, czego nikt nie zapisał w wymaganiach. A model, z definicji, operuje na tym, co już widział.

### Decyzje etyczne i produktowe

Sprawa jest brutalnie prosta: model nie ma kręgosłupa moralnego. Nie wie, w jakim kraju działa, dla jakiej grupy docelowej i jakie ryzyka niesie jego odpowiedź.

To człowiek definiuje Safety Policy. To człowiek decyduje, że bot ubezpieczeniowy nie diagnozuje nowotworów. To człowiek wpisuje numer 116 123 jako odpowiedź na sygnały kryzysu emocjonalnego. To człowiek rozpoznaje bias i kontekst kulturowy, którego model nie rozumie.

Te decyzje nie skalują się przez API. Skalują się przez ludzi, którzy je podejmują, dokumentują i pilnują ich egzekwowania.

### Interpretacja wyników i priorytetyzacja

Z 2000 automatycznych ocen sędziego wpada do mnie arkusz z 200 rekordami o najniższych wskaźnikach. I co dalej?

Czy spadek Fidelity z 4.8 na 3.1 to krytyczny bug, czy akceptowalna zmiana tonu po aktualizacji promptu? Czy model, który zaczął odpowiadać krócej, jest gorszy, czy po prostu bardziej zwięzły? Czy trzy przypadki Safety na poziomie 2/5 to trend, czy szum?

Kontekst biznesowy zna człowiek. Priorytet nadaje człowiek. Decyzję "naprawiamy to przed releasem" podejmuje człowiek.

## Human-in-the-loop w praktyce

Human-in-the-loop to konkretny model pracy, który wygląda mniej więcej tak:

1. **LLM generuje odpowiedzi** na prompty z golden setu (i od realnych użytkowników).
2. **LLM-as-a-Judge ocenia** te odpowiedzi automatycznie, według zdefiniowanych rubryk.
3. **Człowiek bierze na warsztat najgorsze wyniki**, czyli te z najniższymi wskaźnikami, te z flagami safety oraz te, które "brzmią dziwnie".
4. **Człowiek kalibruje sędziego**, na przykład cyklicznie co sprint lub co release, porównując werdykty maszyny ze swoimi.
5. **Człowiek aktualizuje golden set** przy zmianach produktowych, nowych funkcjonalnościach i zmianach w ofercie.
6. **Człowiek prowadzi red teaming**, ponieważ skrypty testują znane ataki, a ludzie na bieżąco wymyślają nowe.

W tym układzie każda strona robi po prostu to, w czym jest najlepsza. Model daje nam ogromną skalę działania, a człowiek pilnuje priorytetów i nadaje im biznesowy sens.

## Czy AI zastąpi QA?

Model robi zawsze to, co już widział i czego się nauczył. Rola doświadczonego QA sprowadza się do robienia rzeczy, których nikt wcześniej nie zapisał w wymaganiach. Testowanie eksploracyjne, wychwytywanie delikatnych niuansów oraz głębokie zrozumienie kontekstu użytkownika to obszary, w których sztuczna inteligencja wciąż sobie nie radzi.

Nie bójmy się jednak powiedzieć tego głośno: tester z AI zastąpi testera bez AI.

Jeśli dzisiaj ktoś nie korzysta z tych narzędzi w swojej codziennej pracy, jego atrakcyjność na rynku po prostu spada. Znajomość LLM-ów przestaje być opcjonalną "innowacją", a staje się standardowym wymogiem. Nie po to, żeby oddać maszynie całą kontrolę, ale po to, żeby pracować szybciej i nie zostać w tyle.

I stąd tytuł tego artykułu. AI nie zastąpi człowieka. Ale człowiek z AI, owszem.

## Checklista do tego wpisu

- Czy regularnie (np. co sprint) kalibrujesz swojego LLM-Judge'a, porównując jego werdykty z oceną ludzką?
- Czy Twój golden set jest aktualizowany przy każdej zmianie produktowej, a nie tylko przy okazji?
- Czy w Twoim procesie istnieje etap ręcznego przeglądu najgorszych wyników automatycznej ewaluacji?
- Czy masz zdefiniowaną Safety Policy, która jest decyzją ludzi, a nie domyślnym ustawieniem dostawcy API?
- Czy prowadzisz red teaming siłami ludzkimi, a nie tylko skryptami?
- Czy Twój zespół QA aktywnie korzysta z narzędzi AI w codziennej pracy?

## Na koniec: co zabieram z tej serii

To ostatni artykuł z cyklu o testowaniu LLM-ów. Siedem części, od niedeterministyczności po human-in-the-loop. Pora zamknąć ten sezon.

Zaczęliśmy od stwierdzenia, że [LLM-y nie są deterministyczne](/blog/ach-ta-niedeterministycznosc/) i że klasyczne "expected output" przestaje istnieć. To był fundament, bo bez zaakceptowania tej właściwości nie da się zbudować niczego sensownego.

Potem definiowaliśmy [co oceniać](/blog/evals-co-wlasciwie-oceniamy/) (fidelity, relevance, accuracy, safety, tone, context) i [z czym porównywać](/blog/golden-set/) (golden set jako wzorzec referencyjny). Nauczyliśmy się [chronić model przed sobą samym](/blog/guardrails-safety-granice-llm/) i [testować go w warunkach chaosu](/blog/robustness-odpornosc-modelu/). Na końcu [zatrudniliśmy inny model do oceny](/blog/llm-as-a-judge-w-praktyce/), żeby cały proces się skalował.

I po tym wszystkim lądujemy tutaj: przy człowieku.

Bo to człowiek decyduje, co jest "dobre". Człowiek kalibruje, aktualizuje, interpretuje i podejmuje decyzje, których żaden model nie podejmie za niego. Automatyzacja daje nam skalę. Człowiek daje jej kierunek.

Dziękuję, że byliście ze mną przez tę serię. Jeśli macie pytania, chcecie podyskutować albo podzielić się swoimi doświadczeniami z testowania AI, [złapmy się na LinkedInie](https://www.linkedin.com/in/michalina-graczyk/). Chętnie posłucham, jak u Was w projektach sprawdza się Human-in-the-loop. Drzwi są zawsze otwarte. 🚪

_Hasta la próxima._
