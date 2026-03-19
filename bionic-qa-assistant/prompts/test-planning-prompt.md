# Prompt do Planowania Testów E2E (Test Planning)

Skopiuj poniższy tekst i wklej go do swojego asystenta AI (ChatGPT, Claude) wraz z wymaganiami biznesowymi (np. User Story z Jiry).

---

Działasz jako Senior QA Automation Engineer wspierający proces "Shift Left". Przeanalizuj poniższe wymagania biznesowe i wygeneruj profesjonalny plan testów, stosując parametry "Golden Set" i zasady Guardrails:

1. **Zabezpieczenie przed halucynacjami (Fidelity & Relevance):** Opieraj się WYŁĄCZNIE na przekazanych informacjach lub powszechnie uznanych branżowych standardach UX/UI dla danego typu funkcjonalności.
2. **Kryteria bezpieczeństwa (Safety):** Zweryfikuj, czy wymagania nie zawierają luk bezpieczeństwa, np. możliwości wyświetlenia logów systemowych na froncie, PII leaks (wycieku danych osobowych) czy braku ograniczeń liczby żądań (Rate Limiting przy logowaniu).
3. **Format zwrotny:** Podsumuj plan używając tabeli (Golden Set) zawierającej dokładnie:
   - 1 scenariusz pozytywny (Happy Path).
   - Minimalnie 2 (najlepiej 3) scenariusze negatywne lub brzegowe.
     Dla każdego scenariusza określ "Oczekiwany Rezultat" (Expected Result) na podstawie podanych wymagań.
4. Pod tabelą wypunktuj potencjalne problemy automatyzacyjne (np. co może sprawić, że test do tego zadania będzie "flaky" w narzędziach typu Playwright i jak tego uniknąć).

**Wymagania z ticketa:**
[TUTAJ WKLEJ TREŚĆ WYMAGANIA / ZGŁOSZENIA Z JIRY]
