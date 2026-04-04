---
title: "Testowanie odporności AI: Jak uchronić LLM przed nieprzewidywalnym użytkownikiem albo testerem?"
date: 2026-03-23
excerpt: "W idealnym środowisku testowym model odpowiada perfekcyjnie. Na produkcji użytkownicy robią literówki, wklejają dziwne formaty i piszą bez ładu i skadu. Dowiedz się, czym jest robustness i jak testować AI w takich wypadkach."
draft: true
lang: pl
tags: ["LLM", "QA", "Robustness", "Evals", "Testing"]
---

W poprzedniej części rozmawialiśmy o [Guardrails i Safety](/blog/guardrails-safety-granice-llm/), czyli o tym, jak powstrzymać model przed robieniem rzeczy nielegalnych lub niebezpiecznych. 

Teraz schodzimy na ziemię. W prawdziwym życiu problemem zespołu QA rzadko są hakerzy. Głównym problemem są... zwykli użytkownicy.

Tacy, którzy piszą w pośpiechu z telefonu. Tacy, którzy zamiast zwięzłego pytania wklejają trzystronicowego maila. Albo tacy, którzy gubią spacje i polskie znaki. Twój model musi sobie z tym poradzić. Nazywamy to **Robustness** (w polskim tłumaczeniu: odpornością).

## Safety kontra Robustness

Wiele osób myli te dwa pojęcia. Uporządkujmy to od razu.

**Safety** pilnuje, by model nie robił rzeczy złych (np. nie pomagał w budowie bomby). Nazywamy to działaniem w warunkach wrogich (adversarial).

**Robustness** dba o to, by model nadal dobrze realizował swoje poprawne zadania, nawet jeśli warunki wejściowe są zabrudzone (noisy). To testowanie odporności na chaos, nieuwagę i dziwne zachowania użytkowników.

Twój LLM nie może się zepsuć tylko dlatego, że ktoś napisał "gdzjie" zamiast "gdzie".

## Przykład z życia: asystent śledzenia paczek

Wyobraźmy sobie, że testujesz asystenta AI dla dużej firmy kurierskiej (hue hue.) Bot ma za zadanie podawać status paczki na podstawie numeru przesyłki.

W naszych idealnych testach, w sterylnym środowisku deweloperskim, prompt testowy wygląda tak:
"Proszę o podanie statusu przesyłki o numerze 123456789."

Model bez problemu zwraca odpowiedź:
"Paczka 123456789 jest w oddziale doręczeń. Przewidywany czas dostawy: 14:00."
Wszystko świeci na zielono. Jednak na produkcji taki asystent zderza się ze ścianą. "Brudne" dane od użytkowników to szybka droga do spadku jakości i **halucynacji** modelu. Jakie sytuacje musimy przetestować?

### 1. Zniekształcenia tekstu (Perturbations i Typos)

Użytkownik idzie ulicą w deszczu, ma w jednej ręce parasol i pisze kciukiem.
Wpisuje: "gdzjie moja pczka 123456789 szybko".

Czy twój model zrozumie intencję, zignoruje literówki i wyciągnie poprawny numer? Zaburzenia obejmują błędy ortograficzne, brak polskich znaków, losowe wielkie litery czy zbitki słów. Robustness oznacza, że dokładność (Accuracy) modelu nie spada drastycznie przy takich zniekształceniach.

### 2. Szum informacyjny (Noise injection)

Klient nie ma czasu przepisywać numeru. Kopiuje całego maila od sklepu zaczynającego się od "Dzień dobry, dziękujemy za zakupy w naszym sklepie...", dalej mamy listę produktów, stopkę, zgodę RODO, i gdzieś na dole dopisek: "twój kod nadania to: 123456789". Poniżej klient dopisuje: "kiedy to wreszcie odbiore??".

Zalane niepotrzebnym tekstem modele potrafią zgubić fokus. Skupiają się na RODO, zamiast na zadaniu. Dodawanie szumu do testów to podstawowa taktyka weryfikacji odporności.

### 3. Zmiana formatu wejścia (Formatting)

Użytkownik zamiast numeru, wkleja całą nieustrukturyzowaną wklejkę z tabelki z Excela bez kolumn. Rozjechany tekst ze spacjami zamiast tabulacji. Albo zapomina użyć ustrukturyzowanych tagów. Często modele oczekują określonego wejścia (np. JSON), a awaria parsera backendu powoduje ucięty znak końca struktury. Czy model załamie ręce i wyrzuci błąd techniczny systemu, czy postara się zinterpretować intencję?

## Jak testować Robustness i odporność?

Oto klucz. Nie szukasz tych przypadków ręcznie przed każdym pushem na produkcję. Korzystasz z koncepcji znanej jako **Data Augmentation** (augmentacja danych).

Bierzesz swój ułożony wcześniej [Golden Set](/blog/golden-set/). Masz tam swoje piękne wzorcowe prompty. Następnie przepuszczasz je przez prosty skrypt przed wykonaniem testu.

Ten skrypt (często inny mniejszy lokalny model AI, albo po prostu funkcja w Pythonie) celowo:
- "psuje" literówki (np. zamienia 5% znaków),
- dokleja na początku lub na końcu bloki losowego tekstu,
- usuwa znaki interpunkcyjne.

Potem wysyłasz te "zabrudzone" prompty do testowanego modelu. Następnie używasz swoich [kategorii Evals](/blog/evals-co-wlasciwie-oceniamy/), aby sprawdzić, czy pomimo słabego promptu model wciąż dostarcza poprawne odpowiedzi. Oceniasz różnicę jakości pomiędzy czystym zapytaniem a zapytaniem "brudnym".

I tu pojawia się kluczowa kwestia: testując w ten sposób dziesiątki lub setki wariantów ortograficznych i formatowań, nie dasz rady (i nie powinnaś/powinieneś zadawać sobie trudu), by oceniać to wszystko ręcznie. To idealny moment, by zatrudnić do tego automatyzację w postaci **LLM-as-a-Judge**. Inny model językowy bez problemu oceni różnice w Fidelity, Accuracy czy Tone obu wariantów w ułamku sekundy, skalując Twoje testy odpornościowe.

## Checklista dla QA do tego wpisu

- Czy zdefiniowaliście, jak "brudne" dane wejściowe potrafi obsłużyć aplikacja (jaki jest próg błędów ortograficznych i składniowych)?
- Czy Twój pipeline testowy automatycznie dorzuca szum informacyjny do czystych promptów (Noise Injection)?
- Czy badasz zachowanie na nieoczekiwane zmiany wielkości liter, formatu układu strony, brak interpunkcji?
- Czy weryfikujesz odporność pamięci kontekstu w długiej dyskusji (gdy w piątej wiadomości ktoś wspomni o paczce z wiadomości numer jeden)?
- Czy udaje Ci się weryfikować zmianę skuteczności (Accuracy) dla idealnego promptu vs tego "wziętego z ulicy"?

## Podsumowanie

Odporność (Robustness) nie jest luksusowym dodatkiem. Użytkownicy rzadko dbają o poprawną interpunkcję na czacie z AI. Testując Robustness, udowadniasz, że system będzie działał na produkcji równie dobrze, jak działa na idealnie wyreżyserowanych spotkaniach demonstracyjnych.

To jedna z tych rzeczy, która odróżnia fajne technologiczne demo od solidnego produktu dla klientów. Zadbaj o to! 

W kolejnym artykule serii omówimy temat **LLM-as-a-Judge**, czyli jak w praktyce zatrudnić jeden model do testowania drugiego (i co może pójść nie tak). Do usłyszenia!
