---
title: "Shift Left Done Right: QA w Nowoczesnym SDLC"
date: 2025-04-11
excerpt: "Shift Left to budowanie jakości od podstaw - podczas faz planowania, projektowania i programowania. Dowiedz się, jak wprowadzić to w swojej organizacji."
tags: ["shift-left", "quality-assurance", "testing", "software-engineering"]
lang: pl
draft: false
devtoUrl: "https://dev.to/michalina_graczyk/shift-left-done-right-qa-in-the-modern-sdlc-5c24"
canonicalUrl: "https://dev.to/michalina_graczyk/shift-left-done-right-qa-in-the-modern-sdlc-5c24"
---

Shift Left to proaktywna strategia zapewniania jakości, która integruje testowanie w całym procesie rozwoju oprogramowania, zamiast zostawiać je na sam koniec. Podejście to ma na celu budowanie jakości od postaw – już podczas faz planowania, projektowania i programowania.

## Dlaczego Shift Left?

Tradycyjne modele traktują testy QA jako ostateczny punkt kontrolny, co skutkuje wykrywaniem błędów na późnym etapie i bardzo drogimi poprawkami. Shift Left rozwiązuje ten problem poprzez osadzenie odpowiedzialności za jakość od wczesnych faz cyklu życia oprogramowania (SDLC), co tworzy środowiska oparte w pełni na współpracy i naturalnie rozdziela tę odpowiedzialność na całe zespoły.

**Kluczowe korzyści to m.in.:**

- Wczesne wykrywanie problemów u źródła, co z miejsca redukuje błędy powracające na produkcję
- Zwiększona pewność programistów względem własnego kodu podczas wdrażania na wyższych środowiskach
- Przyspieszone wdrażanie CI/CD dzięki wyeliminowaniu wielkich, późnych „wąskich gardeł" na końcu sprintów
- Jasne określenie faktu, że jakość jest stałą odpowiedzialnością dla każdego członka zespołu

## Jak wprowadzić Shift Left poprzez organizację

### 1. Zmapuj swój obecny SDLC i znajdź odnogi ze stratami (luki)

Zorganizuj spotkania na przeprowadzenie oceny od etapu kształtowania się idei aż po wdrożenie oprogramowania. Zidentyfikuj fazy procesu, w których często pojawiają się błędy i punkty, co do zjawienia się pierwszych procesów QA. Szukaj powracających wzorców takich jak:

- Testowanie, które bywa skumulowane wyłącznie na końcu procesu i blokuje releasowanie
- Zbyt mocno rozszerzona weryfikacja stricte manualna dla przepływów biznesowych
- Ubytki i brak pełnego pokrycia testami dla rozwiązań i architektury API
- Luki metrykalne (nie ma liczb określających błędy, spójności raportów „flaky tests” lub ogólnie dla weryfikacji po regresjach)
- Spotkania i dyskusje na etapach projektowych, które odrzucają konieczność przemyślenia trudnych przypadków brzegowych – co ostatecznie bije deweloperów po kieszeni od razu podczas developmentu

### 2. Zdefiniuj na nowo całą wizję dla SDLC w oparciu o Shift Left

Zaprojektuj owoce ponownie na etapie map, przesuwając ciężar ważnych punktów kontrolnych dla testów w dół, na wcześniejsze osie czasu:

**Faza planowania oraz Refinementy projektów**

- QA dołącza od startu do przeglądów wymagań biznesu i wylicza wątpliwości na równi z devteamem
- Następuje definiowanie kluczowych dróg w formie krytycznych, asertywnych pytań dla biznesu
- Identyfikowanie pożarów (ryzyk ze stopniem High) jak np. słabych czy awaryjnych mechanizmów w wybranym UI
- Odczuwalne spersonalizowanie warunków dotyczących weryfikacji u Acceptance Criteria
- Stawianie jasnych pytań, aby z góry uzgodnić zakresy wymaganych pokryć czy też przypadki Test Cases zanim kod w ogóle się stworzy

**Faza wdrożeniowa i development zespołowy**

- Cały programiści sztab pracuje na bazie zatwierdzonego zarysu funkcjonalności i wymagań, a nie samowolnych domysłów
- Analiza kodu wpada w mocny wir krytyki (również tych fragmentów skupionych na sprawdzeniu jakości przy code review i asercji z samą testowalnością w projekcie)
- Podział sił, aby testy unitowe narastały równomiernie spójnie pisane z klasami, metodami i wdrażanym refactorem
- Silniki CI są wymuszane do bezwarunkowego egzekwowania testów odświeżających bazę wiedzy np. we wszystkich wypchniętych pull request'ach!

**Faza procesowania samych testów**

- Zgrane pakiety obejmujące niezawodną pulę w pełni bezobsługowych powtarzających skryptów: regresji czy solidnych pakietów testów złącznych
- Prawdziwe, mozolne testy dla UX zostawiane w rezerwie wyłącznie pod skomplikowane i trudne algorytmy ludzkich działań w najcięższych Corner i Edge cases

**Faza wdrożeniowa Release oraz szerokie wsparcie Maintenence**

- Stabilny status i oznaczalność z Release testingu dające z góry certyfikat pod bezkolizyjną zrzutkę dla wejść z rozwiązaniami pod produkcję
- Niejako "żywy obraz" i wertykalne śledzenie (tzw. monitoring) i analizy, jak obiektywnie wyznaczają się u użytkowników nowe metryki dla procesowania rozwiązań na poziomie performensowym
- Problematyczne wydania (post-release issues) tworzą krwioobieg pętli opinii (tzw. Feedback loops), wracającej natychmiast uświadamiająco i prewencyjnie przed powtórzeniem pomyłki do serca i rdzeni deweloperskich.

### 3. Zmodyfikuj swoją strategię testów (Overhauls dla projektów)

Efektywne wykorzystywanie Shift Left wymusza ogromne załamania dotychczasowego spojrzenia, budując zręby ewolucji opartej na odrzucaniu błędów od samych korzeni.

- Zaplanuj i wciel odejście na mniejszą asercję w stronę testowania API od mocnych testów na samej powłoce Frontend-endowych End2Ends na bazie gotowych mechanik np. w zastępstwie wdrażając mocne zmockowane scenariusze.
- Wypatruj co w trawie piszczy (dosłownie monitorując odchylenia flakiness'ów za wczasu).
- Odśwież i przerysuj potężną i obarczoną wieloma potknięciami integracją CI drogę do releasowania dla stabilizacji bazy.
- Wypełniaj misje ze stanowczością co do własności poszczególnych procesów pośród zespołu z wyraźnie widocznym przyrostowym raportem powygrywanych batalii (ownership u metryk wydań lub zgranych ze smakiem pokryć TDD).

Głęboka taktyka pozwala tu uniknąć i zlikwidować tak potężny hamulec jakim były przedziwne, niedostępne lub po prostu niewydolne stanowiska blokujące ruch zespołom. Utrzymuje od tego uwarstwienie pętli, spoiwo ze zwrotów na linii kod-wykonawca dla stabilniejszego reagowania, bez wąskich gardeł o podłożach testowania końcowego, zwanego niejednokrotnie od tyłu SDLC "korkiem" projektu.

## Jak w świetle praktyki może zabrnąć wymarzony sukces we Shift Left?

Rozwijanie wdrażania za darmo oferowanych zmian z zasobów ideowych nie wymaga budżetu ze świata astronomii, rodzi też nad wyraz mierzalne na gruncie realnego projektu skutki:

- Skupienie w planowaniu. Odkręcone pytania budujące od góry zasoby jako bazę pewności dla rzutu projektami jako siłą oprogramowania.
- Mocniejsze fundamenty oświetlające sens wykonawczy jeszcze przed spędzeniem bezsennych nocy w IDE dla kodowania w pustych i nieraz złudnych obietnicach (tzw. docs before code).
- Prewencyjne rozpoznawanie pułapek!
- Wyzwolona ścieżka uwolnień produkcyjnych! (Brak paniki dla end-stage zapóźnień owocuje bezbolesnym wypuszczeniem upragnionych funkcjonalności o prognozownym czasie dla planującego product managementu).
- Wolny wiatr QA: to oddanie we władaniu u samych testów do skrzydeł nad ogółem rzucania na siebie jakości (wyzwolona ze sztywnych procedur uwalnia tak zwany quality enablement) - a stając się strażnikami procesów deweloperskich!

Esencja zmiany zakotwicza od teraz w 100% u twardej myśli, dowodząc od wczoraj i dzisiejszego wdrożenia postawy Shift left - że proces testowania dla rzemiosła jest procesem odpowiedzialnym od pierwszej litery programistycznego warsztatu – rzeczą, do której ręce przysłowiowo przekładają wszyscy w rzetelnym oddaniu na korzyść gotowego programu; rezygnując z testowania ex-post i po wykonanej sztuce u Inżynierach wyłącznie dla roli QA!

## Kilka słów podsumowania ze strony samej rzetelności

Decyzje z wykorzystaniem z lewostronnych modyfikacji nie budują na zewnątrz pustego oprogramowania jako tylko nowego procesu, a rozbudzają transformatywne uwarunkowania po każdej stronie programowania; do kultury tworzących go ludzi u każdej strony postaw, które ewoluują w uderzaniu przy budowie już od rdzenia przy projektowaniu. To osadzenie we wnętrzu SDLC od startowego pociągnięcia ręką z rozproszonym udziałem na całokształt w powstawaniu. Piekielnie skraca całe czasowe dystanse z ogromem obfitej do wzięcia stabilności w potknięciach i buduje pewność opartą od razu bezbłędnie przetestowaną ścieżką w niejedno - tak też eliminowaną i strącaną we mrzonki na margines oczekiwań z pozoru nieszkodliwą pomyłką! Uznaje i wycenia się, że jakość za tę wypracowaną rzetelność cechuje się od samego fundamentu – nigdy za wtórnym przyłożeniem dłoni w post-realizacji kodu!
Ostateczny odzew – te zespoły programistów, które projektując rzetelnie biorą we wspieraniu taktyczne podejścia we wczesne zaplanowanie w tym i testowe uwikłanie z budującym się produktem - owocują osiągnięciami przerastającymi bezlitosnych gigantów o potknięciach dopiero podczas mozolnie łatanej i drogiej drogi poszatkowanej z końca!
