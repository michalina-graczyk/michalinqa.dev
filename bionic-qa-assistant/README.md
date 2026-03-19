# Bionic QA Assistant 🤖

Twój prywatny system asystenta AI dla inżynierów testów, skonstruowany na bazie technik Guardrails & Golden Set.

## Co to jest?

Ten projekt to zbiór wytycznych, promptów i reguł dla Twojego edytora kodu (takiego jak [Cursor](https://cursor.sh/) lub Windsurf). Eliminuje on problem "głupiego AI", które generuje testy oparte na XPathach, używa `sleepów` i pomija techniki Page Object Model.

## Jak to zainstalować?

Udało Ci się odblokować dostęp do tego repozytorium po zakupie! Gratulacje!
Ponieważ jest to repozytorium prywatne, a Twoja codzienna praca odbywa się najprawdopodobniej w innym, zamkniętym firmowym repozytorium, skorzystaj z poniższych dwóch metod dystrybucji wiedzy:

### Metoda 1: Aplikacja do istniejącego projektu (Rekomendowane)

Jeśli pracujesz w firmowym projekcie:

1. Skopiuj folder `.cursor` bezpośrednio do głównego katalogu Twojego aktualnego projektu.
2. Zrestartuj edytor.
3. Gdy poprosisz asystenta o wygenerowanie kodu (CTRL+L w Cursorze), automatycznie zastosuje on twarde techniki QA ukryte w `.cursor/rules/`.

> **Wskazówka:** Jeśli chcesz, żeby AI dodatkowo uczyło się na poprawnych wzorcach strukturalnych, dorzuć do swojego projektu również pliki zawarte w naszym katalogu `examples/`. W ten sposób asystent będzie kopiował perfekcyjny szkielet.

### Metoda 2: Użycie "z palca" (Web ChatGPT / Claude)

Jeśli wolisz korzystać z czatu w przeglądarce przed pójściem do kodu:

1. Otwórz folder `prompts/`.
2. Skopiuj system prompt dla wybranego zadania (np. Test Planningu).
3. Wklej go do czatu wraz z treścią zadania (np. Jiry). Zobaczysz, jak model zwraca analityczny "Golden Set" gotowy do dyskusji z produktem!

---

## Jak sprzedawać dostęp do Prywatnego Repozytorium GitHub? (Notatka dla Michaliny)

Skoro Twoje główne metody dzielenia się wiedzą są publiczne, to w jaki sposób spieniężysz dystrybucję TEGO kodu jako repozytorium _Prywatnego_?
To banalnie proste dzięki narzędziu **Polar.sh** (lub alternatywie jak **Lemon Squeezy** z API):

1. W opcjach GitHub ustawiasz to repozytorium jako **Prywatne** (Private). Od teraz nikt go nie widzi.
2. Zakładasz konto na platformie ułatwiającej monetyzację dev-toolsów, np. [Polar](https://polar.sh) lub [LemonSqueezy](https://www.lemonsqueezy.com/).
3. Platformy te posiadają natywne wtyczki do GitHuba. W ustawieniach produktu (np. "Bionic QA - Dożywotni Dostęp za $49") zaznaczasz opcję: **"Po zakupie: Wymuś autoryzację GitHub i dodaj kupującego do wybranego, prywatnego repozytorium"**.
4. W efekcie Twoja praca polega na zapłaceniu faktury przez użytkownika. Platforma sama obsługuje VAT i podatki, sama sprawdza konto GitHub klienta i sama klika przycisk "Invite to repository". Jeśli klient anuluje np. subskrypcję VIP, platforma automatycznie odbierze mu dostęp do repozytorium.
5. Użytkownik, do którego leci mail z platformy płatności, odbiera również zaproszenie na GitHuba, wchodzi, klonuje prywatny kod i zostawia u siebie na dysku na wieki (dla opcji Lifetime).

**Brak infrastruktury, brak serwerów - czysty pasywny przychód na sprawdzonym GitHubie!**
