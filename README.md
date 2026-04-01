# README – použití knihoven

Tento projekt používá čtyři malé JavaScriptové knihovny, které jsou navržené tak, aby fungovaly společně:

- `skin-engine.js` – přepínání vzhledu a fontů
- `markup-engine.js` – render jednoduchého značkování do HTML
- `ascii-chart.js` – generování ASCII grafů
- `app.js` – hlavní aplikační logika, která knihovny propojuje

Níže je praktický přehled, jak je používat.

---

## 1. Základní zapojení do HTML

Knihovny je potřeba načíst v tomto pořadí:

```html
<link id="skin-font-link" rel="stylesheet" href="">

<script src="skin-engine.js"></script>
<script src="markup-engine.js"></script>
<script src="ascii-chart.js"></script>
<script src="app.js"></script>
```

Důvod:

- `app.js` používá globální objekty `SkinEngine`, `MarkupEngine` a `AsciiChart`
- proto musí být všechny tři pomocné knihovny načtené dřív než `app.js`
- element `<link id="skin-font-link">` je nutný pro dynamické přepínání fontů ve skinech

Pokud používáš jQuery, musí být načtené ještě před `app.js`, protože `app.js` běží jako jQuery wrapper:

```html
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
```

---

## 2. `SkinEngine` – přepínání vzhledu

Soubor: `skin-engine.js`

### Co dělá

`SkinEngine` mění CSS proměnné na `:root`, přepíná fonty a ukládá aktivní skin do `document.body.dataset.skin`.

### Veřejné API

K dispozici jsou dvě věci:

- `SkinEngine.applySkin(skinName)`
- `SkinEngine.skinLibrary`

### Použití

```js
SkinEngine.applySkin('msdos');
```

Tím se:

- nastaví barvy a fonty daného skinu
- přepíše `href` u `<link id="skin-font-link">`
- nastaví `data-skin="msdos"` na `<body>`

### Dostupné skiny

Podle aktuální knihovny jsou dostupné například tyto názvy:

- `msdos`
- `amber`
- `green-terminal`
- `classic-mac`
- `win95`
- `atari`
- `amiga`
- `dot-matrix`
- `arcade`

### Získání seznamu skinů

```js
const skins = Object.keys(SkinEngine.skinLibrary);
console.log(skins);
```

### Napojení na `<select>`

```html
<select id="skin-select">
  <option value="msdos">MS-DOS</option>
  <option value="classic-mac">Classic Mac</option>
  <option value="atari">Atari</option>
</select>
```

```js
document.getElementById('skin-select').addEventListener('change', (e) => {
  SkinEngine.applySkin(e.target.value);
});
```

### Jak přidat nový skin

Do objektu `skinLibrary` přidej další položku:

```js
newskin: {
  fontUrl: 'https://fonts.googleapis.com/css2?family=VT323&display=swap',
  vars: {
    '--bg': '#000000',
    '--surface': '#111111',
    '--surface-alt': '#1a1a1a',
    '--text': '#ffffff',
    '--muted': '#aaaaaa',
    '--accent': '#39ff14',
    '--line': '#444444',
    '--focus': '#ffff00',
    '--font-main': "'VT323', monospace",
    '--font-heading': "'VT323', monospace"
  }
}
```

Poznámka: fallback je `msdos`, takže pokud zadáš neexistující skin, použije se právě ten.

---

## 3. `MarkupEngine` – jednoduché renderování textu

Soubor: `markup-engine.js`

### Co dělá

`MarkupEngine` převádí jednoduchý textový zápis do HTML. Hodí se pro obsah sekcí, krátké texty, popisy a interní obsahové bloky.

### Veřejné API

- `MarkupEngine.render(markup)`

### Použití

```js
const html = MarkupEngine.render(`# Nadpis

Tohle je **tučné** a tohle je *kurzíva*.`);
document.getElementById('content').innerHTML = html;
```

### Podporovaná syntaxe

#### Nadpisy

```text
# Nadpis úrovně 2
## Nadpis úrovně 3
### Nadpis úrovně 4
```

Renderuje se jako:

- `#` → `<h2>`
- `##` → `<h3>`
- `###` → `<h4>`

#### Odstavce

Každý neprázdný řádek, který nezačíná `#`, se převede na `<p>`.

#### Tučné a kurzíva

```text
**tučné**
*kurzíva*
```

#### Odkazy

```text
[Text odkazu](https://example.com)
```

Renderuje se jako externí odkaz s:

- `target="_blank"`
- `rel="noopener noreferrer"`

#### Obrázky

```text
![Alt text](obrazek.jpg)
```

Pozor: knihovna umí renderovat i `<img>`, takže je vhodné používat jen důvěryhodný obsah.

#### Interní inline tlačítka / subsekce

```text
&Popisek tlačítka|subsekce-id&
```

Renderuje se jako:

```html
<button class="inline-link" data-subsection="subsekce-id">Popisek tlačítka</button>
```

To je užitečné, když chceš mít uvnitř textu klikací prvky pro zobrazení detailu, sidebaru nebo podsekce.

### Bezpečnost

Knihovna nejdřív escapuje HTML znaky (`& < > " '`), takže běžný HTML kód vložený do textu se nevykreslí jako HTML. Teprve potom aplikuje vlastní značkování.

---

## 4. `AsciiChart` – ASCII grafy

Soubor: `ascii-chart.js`

### Co dělá

`AsciiChart` generuje textové grafy, které se dají vložit například do elementu `<pre>`.

### Veřejné API

- `AsciiChart.barChart(items, options)`
- `AsciiChart.plot(points, options)`

---

### 4.1 Sloupcový graf: `barChart()`

#### Vodorovná varianta

```js
const chart = AsciiChart.barChart([
  { label: 'A', value: 10 },
  { label: 'B', value: 6 },
  { label: 'C', value: 3 }
], { width: 20 });

console.log(chart);
```

Výstup bude přibližně takto:

```text
A              | ████████████████████ 10
B              | ████████████ 6
C              | ██████ 3
```

#### Svislá varianta

```js
const chart = AsciiChart.barChart([
  { label: 'A', value: 10 },
  { label: 'B', value: 6 },
  { label: 'C', value: 3 }
], {
  orientation: 'vertical',
  height: 8
});
```

### Volby

- `orientation`: `'horizontal'` nebo `'vertical'`
- `width`: šířka vodorovného grafu
- `height`: výška svislého grafu

---

### 4.2 Bodový graf: `plot()`

```js
const plot = AsciiChart.plot([
  { x: 0, y: 1 },
  { x: 1, y: 3 },
  { x: 2, y: 2 },
  { x: 3, y: 5 }
], {
  width: 30,
  height: 10
});

console.log(plot);
```

### Volby

- `width`: šířka pole
- `height`: výška pole

Poznámka: `plot()` v aktuální verzi kreslí pouze body (`●`), nespojuje je čarou.

---

## 5. `app.js` – hlavní aplikační vrstva

Soubor: `app.js`

### Co dělá

`app.js` propojuje všechny předchozí knihovny a řídí celé rozhraní aplikace.

Podle aktuálního kódu zajišťuje hlavně:

- načtení jazykových dat z `./data/${lang}.json`
- práci se stavem aplikace (`state`)
- render kruhového navigačního prvku („wheel“)
- render hero textu
- render obsahových sekcí
- napojení `MarkupEngine.render()` pro obsah sekcí
- napojení `AsciiChart.barChart()` a `AsciiChart.plot()` pro ASCII grafy
- přepínání aktivní sekce

### Interní stav

V horní části je objekt:

```js
const state = {
  lang: 'cs',
  skin: 'amiga',
  data: null,
  activeIndex: 0
};
```

To znamená:

- `lang` – aktuální jazyk
- `skin` – aktuální skin
- `data` – načtená data aplikace
- `activeIndex` – aktivní sekce ve wheel navigaci

### Očekávaná struktura dat

Z kódu je vidět, že `app.js` očekává JSON s přibližně touto strukturou:

```json
{
  "ui": {
    "more": "Více"
  },
  "sections": [
    {
      "id": "social-actors",
      "title": "Social Actors",
      "short": "Krátký popis do hero bloku.",
      "content": "# Nadpis\n\nObsah sekce",
      "chart": {
        "type": "bar",
        "items": [
          { "label": "A", "value": 10 },
          { "label": "B", "value": 7 }
        ],
        "options": {
          "width": 20
        }
      }
    }
  ]
}
```

### Jak `app.js` používá ostatní knihovny

#### MarkupEngine

V sekcích:

```js
${MarkupEngine.render(s.content)}
```

Takže pole `content` v JSONu má být text ve formátu podporovaném `MarkupEngine`.

#### AsciiChart

V helperu `makeChart(block)`:

- `type: 'bar'` → `AsciiChart.barChart(...)`
- `type: 'plot'` → `AsciiChart.plot(...)`

Graf je potom vložen jako:

```html
<pre class="ascii-chart">...</pre>
```

#### SkinEngine

V ukázce `app.js` není ve zobrazené části přímé volání, ale podle struktury aplikace se `SkinEngine` používá pro změnu vzhledu celé stránky.

---

## 6. Doporučený minimální příklad použití

```html
<!doctype html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <title>Test knihoven</title>
  <link id="skin-font-link" rel="stylesheet" href="">
  <style>
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-main);
    }
    pre {
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <select id="skin-select">
    <option value="msdos">MS-DOS</option>
    <option value="amiga">Amiga</option>
    <option value="classic-mac">Classic Mac</option>
  </select>

  <div id="content"></div>
  <pre id="chart"></pre>

  <script src="skin-engine.js"></script>
  <script src="markup-engine.js"></script>
  <script src="ascii-chart.js"></script>
  <script>
    SkinEngine.applySkin('msdos');

    document.getElementById('skin-select').addEventListener('change', (e) => {
      SkinEngine.applySkin(e.target.value);
    });

    document.getElementById('content').innerHTML = MarkupEngine.render(`
# Ukázka
Tohle je **tučné**.
Klikni na [odkaz](https://example.com).
`);

    document.getElementById('chart').textContent = AsciiChart.barChart([
      { label: 'Ethics', value: 10 },
      { label: 'Care', value: 8 },
      { label: 'Power', value: 4 }
    ], { width: 24 });
  </script>
</body>
</html>
```

---

## 7. Omezení aktuální verze

### `MarkupEngine`

- neumí seznamy
- neumí blockquote
- neumí tabulky
- neumí vnořené struktury
- obrázky renderuje přímo jako `<img>`

### `AsciiChart`

- `plot()` kreslí jen body, ne čáry
- neřeší popisky os
- normalizace je vždy relativní vůči maximu v datech

### `SkinEngine`

- neukládá skin automaticky do `localStorage`
- předpokládá existenci `<link id="skin-font-link">`

### `app.js`

- předpokládá konkrétní HTML strukturu a konkrétní JSON data
- používá jQuery
- spoléhá na existenci konkrétních SVG a DOM uzlů jako `#wheel-connectors`, `#wheel-label-nodes`, `#hero-description`, `#content-root` a segmentů typu `#seg-social-actors`

---

## 8. Praktické doporučení

Pokud chceš knihovny používat samostatně:

- `skin-engine.js` může fungovat úplně samostatně
- `markup-engine.js` může fungovat úplně samostatně
- `ascii-chart.js` může fungovat úplně samostatně
- `app.js` už je aplikační vrstva a potřebuje konkrétní HTML strukturu, data a pomocné knihovny

Jinými slovy:

- první tři soubory jsou skutečné znovupoužitelné utility
- `app.js` je spíš konkrétní implementace nad nimi

---

## 9. Rychlý přehled API

### SkinEngine

```js
SkinEngine.applySkin(name)
SkinEngine.skinLibrary
```

### MarkupEngine

```js
MarkupEngine.render(markup)
```

### AsciiChart

```js
AsciiChart.barChart(items, options)
AsciiChart.plot(points, options)
```

---

## 10. Doporučené další rozšíření

Pro další vývoj bych doporučil doplnit:

1. u `SkinEngine` ukládání zvoleného skinu do `localStorage`
2. u `MarkupEngine` seznamy, blockquote a bezpečnostní omezení pro obrázky
3. u `AsciiChart` osy, legendu a spojnice v plotu
4. u `app.js` oddělení aplikační logiky od renderu, aby šel wheel a sekce používat modulárněji

