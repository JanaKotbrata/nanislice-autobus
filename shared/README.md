# Shared - Sdílené komponenty a kód

Tato složka obsahuje **sdílené součásti**, které jsou používány napříč celým projektem **nanislice-autobus**. Obsahuje kód, který je sdílen mezi **frontendem** (klientem) a **backendem** (serverem), a to tak, že není závislý na konkrétní části aplikace.

## Obsah složky

- **utils/** - Sada pomocných funkcí a utilit, které jsou použitelné na obou stranách aplikace.
- **models/** - Sdílené modely a struktury dat, které jsou použity jak na klientské, tak na serverové straně (např. definice objektů pro karty).
- **constants/** - Konstanta a definice, které jsou použitelné všude v aplikaci, například kódy stavů, konfigurace.
## Jak používat

Tato složka by měla obsahovat kód, který je **nezávislý na konkrétní části aplikace**. Všechny soubory, které jsou zde obsažené, jsou navrženy tak, aby byly **re-usable** a **importovatelné** do **frontendových** i **backendových** částí aplikace.

Pokud potřebujete nějakou funkcionalitu, která by měla být použita na obou stranách aplikace, přidejte ji do této složky.

### Příklad použití: