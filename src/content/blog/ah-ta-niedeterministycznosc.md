## Jak testować LLM-y
### Wpis #1 — Ach, ta niedeterministyczność

Modele językowe (LLM-y) mają jedną cechę, która wywraca klasyczne podejście QA do góry nogami: są niedeterministyczne. Oznacza to, że nawet jeśli kilka razy zadamy ten sam prompt, w tym samym kontekście, model może wygenerować różne odpowiedzi. I to nie dlatego, że działa źle tylko dlatego, że tak jest zaprojektowany.

Brzmi niewinnie, jednak dla testera to jak sprawdzanie produktu, który za każdym razem może zachować się inaczej, nieprzewidywalnie. W tradycyjnych testach opieramy się na zasadzie: input → expected output. Prosto, przewidywalnie, z określonym rezultatem.
W świecie LLMów ta zasada przestaje istnieć. Zamiast jednego „expected”, mamy zakres możliwych odpowiedzi, które mogą być poprawne… albo nie.
I tu zaczynają się schody.

### Dlaczego niedeterministyczność psuje klasyczne testy?

Klasyczne testy zakładają deterministyczność,wiemy jakiej odpowiedzi moemy się spodziewać. LLM-y juz nie, bo nagle:

•	„działa/nie działa” przestaje mieć sens,
•	regresja nie polega na porównaniu dwóch stringów,
•	„poprawność” nie jest binarna,
•	testy zaczynają przypominać ocenę eseju, a nie asercję.

Model może odpowiedzieć poprawnie dziś, a jutro „prawie poprawnie”, a pojutrze kompletnie odjechać w halucynację. Wszystko zależy od:
•	kontekstu rozmowy,
•	sformułowania promptu,
•	wersji modelu,
•	temperatury i parametrów generacji,
•	a nawet zmian w samym modelu po stronie dostawcy.

Dlatego testowanie LLM ów nie polega już na szukaniu jednego idealnego outputu, ale na ocenie jakości odpowiedzi w ramach ustalonych kryteriów.


### Co sprawdzać, skoro „expected output” nie istnieje?

Przy testowaniu modeli językowych nie wystarczy kliknąć i sprawdzić, czy „coś wyskoczyło”. To wciąż AI jego odpowiedzi muszą być:
•	poprawne (bez halucynacji),
•	spójne (bez skakania po tematach),
•	zgodne z instrukcją (model ma robić to, o co prosisz),
•	w odpowiednim formacie (nie chcemy każdej odpowiedzi w innym formacie)
•	bezpieczne (bez generowania treści toksycznych lub danych wrażliwych).

Praca QA nie polega na sprawdzaniu, czy model odpowiedział, tylko jak odpowiedział.

### Niedeterministyczność nie jest problemem - jest wyzwaniem

W praktyce LLM y można testować skutecznie, ale trzeba podejść do tego inaczej niż dotychczas:
•	Stosować evals zamiast klasycznych asercji.
•	Budować golden set zamiast jednego expected outputu.
•	Sprawdzać kategoriami (accuracy, safety, compliance), a nie pojedynczym wynikiem.
•	Pamiętać, że model może zmienić zachowanie z wersji na wersję.
•	Stosować ocenę jakości zamiast oceny binarnej.
Niedeterministyczność to nie wada to właściwość. A zadaniem QA jest zrozumieć, jak poprawnie przetestować.

### Mini podsumowanie: jak o tym myśleć w codziennej pracy QA
•	Nie oceniasz, czy LLM jest „poprawny” - oceniasz, czy jego odpowiedź na dany prompt jest poprawna.
•	Zamiast jednego testu, testujesz kryteria jakości.
•	Zamiast oczekiwać identyczności, oczekujesz stabilności w określonych granicach.
•	Weryfikujesz nie tylko output, ale ryzyko, jakie generuje odpowiedź.
•	Sprawdzasz jako człowiek, nie jako bot.

### Checklista do tego wpisu
•	LLM nigdy nie jest w 100% powtarzalny - to normalne.
•	Testowanie musi uwzględniać zmiany między odpowiedziami.
•	Output oceniamy jakościowo, a nie porównaniem 1:1.
•	Niedeterministyczność nie jest błędem, błędem jest ignorowanie jej w procesie testowym.

W kolejnych częściach wyjaśnię, czym są evals, golden set, guardrails i inne LLM’owe smaczki ;) 
