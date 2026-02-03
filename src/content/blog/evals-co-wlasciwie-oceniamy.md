---
title: "Kategorie evals: co właściwie oceniamy?"
date: 2026-02-11
excerpt: "Jak zdefiniować kategorie oceny (fidelity, relevance, safety, tone, context), by testować LLM-y wielowymiarowo i skalowalnie."
tags: ["llm", "evals", "testing", "quality-assurance", "ai"]
lang: pl
draft: false
---

Jeśli pierwsza lekcja z testowania LLM-ów brzmi:

> „Expected output często nie istnieje”,

To druga brzmi:

> „Musisz wiedzieć, co konkretnie oceniasz, zanim zaczniesz oceniać cokolwiek”.

W klasycznym QA mamy funkcjonalność, wymagania i oczekiwany rezultat. W LLM-ach potrzebujemy czegoś innego: kategorii evals - jasno zdefiniowanych wymiarów jakości, które pozwalają ocenić odpowiedź „krok po kroku”. Kategorie zamieniają chaos w proces.

- QA klasyczne: binarne pass/fail,
- QA LLM-y: wielowymiarowa ocena - zwykle skale 1-5 lub 1-10, czasem binarna (np. safety) albo oparta o rubryki opisowe,

## Dlaczego evals są kluczowe?

Kategorie evals to niezależne wymiary jakości oceniające treść, formę, bezpieczeństwo, dopasowanie do kontekstu i wpływ na użytkownika. W testowaniu LLM-ów:

- wynik rzadko jest binarny,
- poprawnych odpowiedzi może być wiele,
- model może „brzmieć mądrze”, a jednak się mylić,
