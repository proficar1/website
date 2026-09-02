# ProfiCar1 — Website

Zweisprachige (DE/IT) Website für **ProfiCar1**, gebaut mit
[Jekyll](https://jekyllrb.com) und ausgeliefert über GitHub Pages.

## Was drin ist

| Seite | Deutsch | Italienisch |
|---|---|---|
| Start | `/` | `/it/` |
| Produkte | `/produkte/` | `/it/prodotti/` |
| Kontakt | `/kontakt/` | `/it/contatti/` |

- **61 Produkte** in 5 Bereichen (Karosserie, Detailing, Reinigung, Werkstatt,
  Reinigungsmaschinen), durchsuchbar und filterbar, mit Detailansicht je Produkt
- **WhatsApp** als Hauptkanal: schwebender Button, Buttons in der Navigation und
  pro Produkt eine vorausgefüllte Nachricht mit Artikelnummer
- **Kontaktformular** mit WhatsApp-Fallback (baut aus den Formularfeldern eine
  fertige WhatsApp-Nachricht)
- **Logo** als SVG: `assets/img/logo/proficar1.svg` (Lockup),
  `proficar1-mark.svg` (nur Bildmarke), `favicon.svg`
- **Helles und dunkles Farbschema.** Die Seite startet dunkel; über das
  Sonne-/Mond-Symbol in der Navigation lässt sich auf hell umschalten, die Wahl
  bleibt im Browser gespeichert.

## Lokal entwickeln

Benötigt Ruby ≥ 3.0 (das macOS-System-Ruby 2.6 ist zu alt — bei Bedarf
`brew install ruby` und `/opt/homebrew/opt/ruby/bin` in den `PATH` aufnehmen):

```sh
bundle install
bundle exec jekyll serve      # → http://localhost:4000
```

## Inhalte pflegen

Alles Redaktionelle liegt in Daten- und Konfigurationsdateien — kein HTML nötig:

| Ort | Inhalt |
|---|---|
| `_products/` | **Eine Datei pro Produkt** — siehe unten |
| `_data/categories.yml` | Die fünf Produktbereiche mit Beschreibungstexten |
| `_data/i18n.yml` | Sämtliche Oberflächentexte in DE und IT |
| `_config.yml` | Firmendaten, Ansprechpartner, WhatsApp-Nummer, Formspree-Endpunkt |

### Ein Produkt anlegen

Neue Datei in `_products/` anlegen, fertig — die Seite nimmt sie beim nächsten
Build automatisch auf. Der Dateiname bestimmt die Reihenfolge im Katalog:

```
_products/
  010-t1100.md
  020-t1102.md
  …
  610-maschine-polster.md
```

Zwischen zwei Produkte schiebt man eines mit einer Zahl dazwischen (`015-…`),
ans Ende hängt man die nächste freie Nummer. Der Inhalt einer Datei:

```yaml
---
ref: t1163                        # Anker in der URL, z. B. /produkte/#t1163
code: T1163                       # Artikelnummer auf der Karte
cat: karosserie                   # siehe _data/categories.yml
img: t1163                        # → assets/img/products/t1163.jpg
featured: true                    # optional: erscheint auf der Startseite
color_de: Schwarz                 # optional
color_it: Nero                    # optional
amount: "5 Lt."                   # optional, amount_it nur wenn abweichend
de:
  name: 2K-Autoklarlack UHS, schnell
  sub: Lufttrocknend, polierbar in 2 Stunden
  desc: >-
    Längerer Beschreibungstext …
it:
  name: Trasparente acrilico UHS ultrarapido
  sub: Asciugatura all'aria, lucidabile in 2 ore
  desc: >-
    Testo descrittivo più lungo …
---
```

Alles steht im Front Matter zwischen den `---`; unterhalb davon bleibt die Datei
leer. Zwei Feldnamen sind bewusst gewählt: `ref` statt `id` und `amount` statt
`size`, weil Jekyll bzw. Liquid beide Begriffe schon selbst belegen und sonst
eigene Werte einsetzen.

Passendes Produktbild als quadratisches JPEG unter
`assets/img/products/<img>.jpg` ablegen (700 × 700, weißer Hintergrund).

### Farben ändern

Beide Farbschemata sind in `assets/css/main.scss` ganz oben als CSS-Variablen
definiert: das helle unter `:root`, das dunkle im Mixin `theme-dark`. Wer die
Markenfarben anpassen will, ändert `--red`, `--cyan` und `--accent` — der Rest
der Seite zieht automatisch nach.

## Deployment

Jeder Push auf `main` baut die Seite über GitHub Actions
(`.github/workflows/pages.yml`) und veröffentlicht sie auf GitHub Pages.
Einmalig unter *Settings → Pages* als Quelle **GitHub Actions** wählen.

Der Workflow setzt `--baseurl` automatisch auf den passenden Wert: leer bei
eigener Domain, `/website` bei der `github.io`-Adresse. Alle Links im Template
nutzen `relative_url` und ziehen entsprechend mit.

### Eigene Domain verbinden

Datei `CNAME` mit dem Domainnamen ins Repository legen und beim DNS-Anbieter
setzen:

- `A` für `@` auf `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
  `185.199.111.153`
- `CNAME` für `www` auf `<benutzername>.github.io`

Danach in den Pages-Einstellungen *Enforce HTTPS* aktivieren.

### Kontaktformular scharf schalten

Auf [formspree.io](https://formspree.io) ein Formular anlegen und die ID in
`_config.yml` unter `formspree` eintragen. Solange dort der Platzhalter steht,
leitet das Formular auf WhatsApp um.

## Noch offen

- **Impressum und Datenschutzerklärung** — in Italien und Deutschland Pflicht,
  bisher nicht enthalten.
