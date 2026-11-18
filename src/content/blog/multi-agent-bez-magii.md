---
title: "Multi-agent bez magii: po co Ci więcej niż jeden agent AI?"
date: 2026-11-18
excerpt: "Zespoły agentów AI to jeden z najgorętszych tematów konferencyjnych. Czym właściwie jest agent, kiedy jeden przestaje wystarczać i dlaczego więcej agentów nie zawsze oznacza lepszy wynik?"
tags: ["ai", "agents", "multi-agent", "llm", "quality-assurance"]
lang: pl
draft: false
---

Znasz ten slajd. Sześć kolorowych ikonek z podpisami: Architekt, Reviewer, Generator Testów, Analityk Bugów, Dokumentalista, Orkiestrator. Strzałki między nimi, a prelegent mówi: „nasz zespół agentów AI sam projektuje, pisze i recenzuje testy”.

Sala robi zdjęcia. Wszystko dzieje się samo, wszyscy kiwają głowami, że rozumieją. Do czasu, aż zostajesz sam na sam ze swoim projektem.

Wygląda świetnie. Tylko co tak naprawdę dzieje się pod spodem? I czy Tobie to w ogóle potrzebne?

Zanim odpowiem, trzeba ustalić, czym jest sam agent.

## Czym jest agent?

Zwykły czat z modelem działa tak: Ty piszesz, model odpowiada, koniec. Każdy kolejny krok inicjujesz Ty.

Agent to model, który dostał **narzędzia** i działa w **pętli**. Może sam przeczytać plik, uruchomić testy, przejrzeć logi, poprawić kod i jeszcze raz uruchomić testy. Sam decyduje, jaki krok wykonać jako następny i kiedy zadanie jest skończone. Ty dajesz cel, a nie listę kroków.

W praktyce QA to na przykład Claude Code, który dostaje zadanie „ten test jest flaky, napraw go”, a potem sam odpala test dziesięć razy, czyta trace, zamienia sztywne waity na asercje, które same czekają na stan strony, i sprawdza wynik.

## Kiedy jeden agent przestaje wystarczać?

Jeden agent z dobrymi instrukcjami wystarczy do wielu zadań. Problemy zaczynają się w trzech sytuacjach.

**1. Kontekst puchnie.** Każdy przeczytany plik, każdy log i każda odpowiedź zostają w rozmowie. Przy dużym zadaniu (np. audyt testów w trzech repozytoriach) model zaczyna gubić to, co było na początku. Im więcej śmieci w kontekście, tym słabsze odpowiedzi.

**2. Model ocenia własną pracę.** Agent, który napisał Page Object, ma w kontekście wszystkie swoje uzasadnienia: dlaczego tak, a nie inaczej. Poproszony o review tego samego kodu w tej samej rozmowie, będzie go bronił. To ta sama sytuacja co dev recenzujący własny PR.

**3. Zadania mogłyby iść równolegle, a idą po kolei.** Trzy niezależne moduły do przejrzenia nie muszą czekać na siebie nawzajem.

## Czym jest multi-agent?

Multi-agent to układ, w którym zadanie wykonuje kilku agentów, a każdy z nich ma **własny kontekst**. Najczęściej wygląda to tak, że główny agent (albo Ty) dzieli pracę, rozsyła kawałki do agentów pomocniczych, a na końcu scala ich wyniki.

Każdy agent pomocniczy:

- zaczyna z czystą kartą i widzi tylko to, co mu przekazano,
- może mieć ograniczone narzędzia (np. recenzent może tylko czytać pliki, bez prawa do edycji),
- może pracować równolegle z innymi,
- oddaje wynik, a nie całą swoją roboczą rozmowę.

To rozwiązuje wszystkie trzy problemy z poprzedniej sekcji. Kontekst głównej rozmowy zostaje czysty. Recenzent nie zna uzasadnień autora, więc patrzy świeżym okiem. Niezależne kawałki idą jednocześnie.

## Kilka wzorców, które warto znać

Anthropic w artykule [„Building effective agents”](https://www.anthropic.com/engineering/building-effective-agents) opisuje kilka sprawdzonych układów. Te są najbliżej codziennej pracy QA:

| Wzorzec                                             | Na czym polega                                                                 | Przykład w QA                                                                                       |
| --------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| **Podział na części** (sectioning)                  | Niezależne kawałki zadania robione równolegle, potem scalane                   | Review testów w trzech modułach naraz                                                               |
| **Głosowanie** (voting)                             | To samo zadanie robione kilka razy niezależnie; ufasz temu, co się powtarza    | Ten sam PR do trzech niezależnych recenzji, zgłaszasz tylko problemy wskazane przez co najmniej dwa |
| **Orkiestrator i wykonawcy** (orchestrator-workers) | Główny agent sam decyduje, na ile części podzielić zadanie i co zlecić każdemu | „Sprawdź, dlaczego regresja trwa dwa razy dłużej niż miesiąc temu”                                  |
| **Autor i oceniający** (evaluator-optimizer)        | Jeden agent tworzy, drugi ocenia według kryteriów, pierwszy poprawia           | Agent pisze Page Object, drugi wystawia uwagi, pierwszy poprawia, dopóki są krytyczne błędy         |

Podział na części i głosowanie to u Anthropic dwa warianty jednego wzorca: równoległości (parallelization). A „Autor i oceniający” to ta sama idea, którą znasz z [LLM-as-a-Judge](/blog/llm-as-a-judge-w-praktyce/), tylko z pętlą poprawek.

Głosowanie jest szczególnie ciekawe dla testerów, bo to po prostu oswojona [niedeterministyczność](/blog/ach-ta-niedeterministycznosc/): ufasz temu, co się powtarza. Pojedynczy agent może coś zmyślić, a kilku niezależnych rzadziej zmyśli to samo.

Haczyk tkwi w słowie „niezależnych”. Trzy kopie tego samego modelu z tym samym promptem mylą się podobnie.

Pamiętasz [telebim z Calpe](/blog/gdy-halucynacja-staje-sie-prawda/)? Model wymyślił najbardziej prawdopodobny scenariusz, więc trzech agentów pewnie wskazałoby tę samą plażę.

Dlatego warto różnicować prompty, a czasem i modele.

## Ciemna strona: koszt i złożoność

Więcej agentów nie oznacza automatycznie lepszego wyniku.

- **Tokeny.** Każdy agent czyta swój kontekst od nowa. Anthropic w [opisie swojego systemu badawczego](https://www.anthropic.com/engineering/multi-agent-research-system) podaje, że układy wieloagentowe zużywają kilkanaście razy więcej tokenów niż zwykły czat.
- **Brak wspólnej pamięci.** Agenci nie wiedzą, co ustalili inni. Jeśli Architekt podjął decyzję, Reviewer się o niej nie dowie, dopóki ktoś mu jej nie przekaże.
- **Trudniejszy debugging.** Gdy wynik jest zły, musisz ustalić, który agent i na którym etapie się pomylił.
- **Zadania mocno powiązane źle się dzielą.** Jeśli każda część zależy od każdej innej (np. refaktor jednej klasy używanej wszędzie), równoległa praca kończy się konfliktami.

Główna rada z artykułu Anthropic jest nam dobrze znana: zacznij od najprostszego rozwiązania, które działa, i dokładaj złożoność dopiero wtedy, gdy prostsze faktycznie przestaje wystarczać.

## Checklista do tego wpisu

- Czy Twój agent zaczyna gubić to, co ustalił na początku zadania?
- Czy ten sam agent pisze i recenzuje swój kod?
- Czy masz zadania, które naprawdę mogą iść równolegle, czy tylko tak wyglądają?
- Jeśli używasz głosowania, czy agenci różnią się promptem lub modelem, czy to trzy kopie tego samego?
- Czy wiesz, ile tokenów kosztuje Cię jedno uruchomienie i czy wynik jest tego wart?
- Czy zaczynasz od jednego agenta, zanim dołożysz kolejnych?

Jeśli masz za sobą pierwsze próby z zespołami agentów, [złapmy się na LinkedInie](https://www.linkedin.com/in/michalina-graczyk/). Chętnie posłucham, co u Was zadziałało, a co skończyło się tylko ładnym slajdem.

_Poco a poco._ Najpierw jeden agent. 🤖
